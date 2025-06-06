import {
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    FlatList,
    RefreshControl,
    ScrollView,
    Dimensions,
    TextInput,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    StyleSheet,
    Alert, Animated
} from "react-native";
import "../../../global.css"
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState, useRef} from "react";
import * as SecureStore from "expo-secure-store";
import Post from "../../../components/Entries/Post";
import {Image} from "expo-image";
import {SafeAreaProvider, SafeAreaView} from "react-native-safe-area-context";
import ip from "../../../components/AppManager";
import {LinearGradient} from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {showAlert} from "../../../components/PopUpModalView";
import {ImageManipulator, SaveFormat} from "expo-image-manipulator";
import {useTranslation} from "react-i18next";

export default function Index() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > 768);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchInput = useRef(null);

    // State for image viewing
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [imageGallery, setImageGallery] = useState([]);

    // State for commenting
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [currentPost, setCurrentPost] = useState(null);
    const [comments, setComments] = useState([]);

    // State for post creation
    const [showPostCreation, setShowPostCreation] = useState(false);
    const [postText, setPostText] = useState("");
    const [selectedImages, setSelectedImages] = useState([]);

    const token = useRef("");
    const username = useRef("");

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const {t} = useTranslation();

    useEffect(() => {
        if (showCommentInput) {
            Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [showCommentInput]);

    useEffect(() => {
        if (showPostCreation) {
            Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [showPostCreation]);

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            setWindowWidth(newWidth);
            setIsDesktop(newWidth > 768);
        };

        if (Platform.OS === 'web') {
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if (Platform.OS === 'web') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    useEffect(() => {
        // Check authentication
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        } else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }

        setTimeout(() => {
            if (token.current === null) {
                router.replace("/");
            } else {
                // Load posts
                fetchPosts();
            }
        });
    }, []);

    const fetchPosts = async () => {
        setLoading(true);

        try {
            const response = await fetch(`${ip}/profile/homefeed`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.current}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                for (const post of data) {
                    post.username = post.userId;
                    const response = await fetch(`${ip}/profile/${post.userId}`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token.current}`,
                            "Content-Type": "application/json"
                        }
                    });
                    if (response.ok) {
                        const profile = await response.json();
                        post.profilePicture = profile.profilePicturePath.split(",")[0];
                        post.name = profile.name;
                    }
                }
                setPosts(data);
            } else {
                console.error('Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleLikePost = async (post, user) => {

        const response = await fetch(`${ip}/profile/posts/like/${user}/${post.id.millis}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token.current}`
            }
        })

        if (response.ok) {
            setPosts(prevPosts =>
                prevPosts.map(p => {
                    if (p.id.millis === post.id.millis) {
                        const userLiked = p.likes.includes(username.current);
                        return {
                            ...p,
                            likes: userLiked
                                ? p.likes.filter(user => user !== username.current)
                                : [...p.likes, username.current]
                        };
                    }
                    return p;
                })
            );
        }
    };

    const handleCommentPress = (post) => {
        // Open comment input for this post
        setCurrentPost(post);
        setShowCommentInput(true);

        setComments(post.comments.map((comment, index) => {
            return {
                id: index,
                profilePicturePath: comment.split('Ð')[1].split(',')[0],
                author: comment.split('Ð')[0],
                text: JSON.parse(comment.split('Ð')[2]).comment
            }
        }));
    };

    const handleImagePress = (post, image) => {
        // Open image viewer directly on the homepage
        setCurrentImage(image);

        if (post.content.length > 1) {
            // Set the image gallery for multiple images
            setImageGallery(post.content);
        } else {
            // Set a single image in the gallery
            setImageGallery([image]);
        }

        setShowImageModal(true);
    };

    const handleProfilePress = (username) => {
        router.push(`/${username}`);
    };

    const addComment = async () => {
        if (commentText.trim() === "") return;

        let profilePath;
        if (Platform.OS === "web") {
            profilePath = JSON.parse(localStorage.getItem('profile')).profilePicturePath;
        } else {
            profilePath = JSON.parse(SecureStore.getItem('profile')).profilePicturePath;
        }

        const newComment = {
            id: comments.length,
            author: username.current,
            text: commentText,
            profilePicturePath: profilePath.split(',')[0],
        };

        setComments(prevState => [...prevState, newComment]);
        setCommentText("");
        setPosts(prevState => {
            return prevState.map(item => {
                if (item.id.millis === currentPost.id.millis) {
                    item.comments = [...item.comments, (`${username.current}Ð${profilePath.split(',')[0]}Ð${JSON.stringify({comment: newComment.text})}`)];
                }
                return item
            })
        })

        const status = await fetch(`${ip}/profile/posts/${currentPost.username}/${currentPost.id.millis}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token.current}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                comment: commentText,
            })
        });

        if (!status.ok) {
            setComments(prevState => prevState.slice(0, -1));

            showAlert({
                title: t("error"),
                message: 'An error occurred while sending your comment. Please try again later.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {}
                    }
                ]
            })
        }
    };

    // Function to pick images from gallery
    const pickImages = async () => {
        // Request permission to access the media library
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        // Launch the image picker
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsMultipleSelection: true,
            quality: 0.8,
            aspect: [4, 3],
        });

        if (!result.canceled && result.assets) {
            // Add the selected images to the state
            // Limit to 5 images total
            const newImages = result.assets.map(asset => asset.uri);
            const updatedImages = [...selectedImages, ...newImages].slice(0, 5);
            setSelectedImages(updatedImages);
        }
    };

    const removeImage = (index) => {
        setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const createPost = async () => {
        if (postText.trim() === "" && selectedImages.length === 0) {
            showAlert({
                title: t("empty.post"),
                message: t("add.text.image"),
                buttons: [
                    {
                        text: "Okay",
                        onPress: () => {}
                    }
                ]}
            );
            return;
        }

        const title = postText;
        let imageUrls = [];
        try {
            if (selectedImages.length > 0) {
                for (const image of selectedImages) {
                    let tempImage;
                    const manipResult = await ImageManipulator.manipulate(
                        image).resize({width: 500});
                    const renderedImage = await manipResult.renderAsync();
                    const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                    tempImage = savedImage.uri;

                    const uploadResponse = await fetch(`${ip}/profile/upload`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token.current}`
                        }
                    });

                    if (uploadResponse.ok) {
                        const uploadUrl = await uploadResponse.text();

                        const response = await fetch(tempImage);
                        const blob = await response.blob();

                        await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: {
                                "Content-Type": blob.type
                            },
                            body: blob
                        });

                        imageUrls.push(uploadUrl.split('?')[0]);
                    }
                }
            }

            const data = await fetch(`${ip}/profile/post`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    content: imageUrls,
                })
            });

            if (!data.ok) {
                setShowPostCreation(false);

                showAlert({
                    title: t("error"),
                    message: 'An error occurred while sending your post. Please try again later.',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {}
                        },
                    ],
                });
            } else {
                setShowPostCreation(false);
                setPostText("");
                setSelectedImages([]);

                showAlert({
                    title: t("success"),
                    message: t("post.created"),
                    buttons: [
                        {
                            text: "Okay",
                            onPress: () => {}
                        }
                    ]}
                );
            }
        } catch (error) {
            console.error('Error sending post:', error);
            showAlert({
                title: t("error"),
                message: 'An error occurred while sending your post. Please try again later.',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {}
                    },
                ],
            });
        }
    };

    const renderPostItem = ({ item }) => (
        <View className={`w-full ${isDesktop ? "mb-6" : "px-4 mt-4"}`}>
            <View style={{
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2}} className="bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow overflow-hidden duration-200">
                {/* Post Header with Profile Info */}
                <View className="flex-row items-center p-4">
                    <TouchableOpacity 
                        onPress={() => handleProfilePress(item.username)}
                        activeOpacity={0.7}
                    >
                        <Image 
                            source={{ uri: item.profilePicture }}
                            style={{ width: isDesktop ? 48 : 40, height: isDesktop ? 48 : 40, borderRadius: isDesktop ? 24 : 20 }}
                            contentFit="cover"
                        />
                    </TouchableOpacity>
                    <View className="ml-3">
                        <TouchableOpacity onPress={() => handleProfilePress(item.username)}>
                            <Text className={`text-gray-800 font-bold ${isDesktop ? "text-lg" : ""}`}>{item.name}</Text>
                        </TouchableOpacity>
                        <Text className="text-gray-500 text-xs">@{item.username}</Text>
                    </View>
                </View>

                {/* Post Content */}
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.navigate(`/${item.username}?post=` + item.id.millis)}>
                    <Post
                        {...item}
                        onLikePress={() => handleLikePost(item, item.username)}
                        onCommentPress={() => handleCommentPress(item)}
                        onImagePress={(image) => handleImagePress(item, image)}
                        isDesktop={isDesktop}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="newspaper-outline" size={32} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2">{t("no.posts.yet")}</Text>
            <Text className="text-gray-500 text-center px-10">
                {t("start.follow.friends")}
            </Text>
        </View>
    );

    // Render friends' posts
    const renderFriendsPosts = () => {
        return (
            <FlatList
                data={posts}
                renderItem={renderPostItem}
                keyExtractor={item => item.id.millis}
                contentContainerStyle={{
                    paddingBottom: 120,
                    maxWidth: isDesktop ? '1200px' : '100%',
                    alignSelf: 'center',
                    width: '100%'
                }}
                ListEmptyComponent={!loading && renderEmptyList()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#3B82F6"]}
                        tintColor="#3B82F6"
                    />
                }
            />
        );
    };

    return (
        <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-dark-primary">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-2">
                <View className="flex-row items-center">
                    <Text className="text-3xl font-bold text-blue-600">Face</Text>
                    <Text className="text-3xl font-light text-gray-700">linked</Text>
                </View>
                    <TouchableOpacity
                        onPress={() => setShowPostCreation(true)}
                        className= "rounded-full items-center justify-center"
                        style={{ width: 40, height: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center',
                            alignItems: 'center',}}                                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={23} color="#3B82F6" />
                    </TouchableOpacity>
            </View>

            {/* Desktop Layout */}
            {isDesktop ? (
                <View className="flex-row w-3/4 mx-auto" style={{ height: '100%', overflow: 'auto' }}
                >
                    {/* Main Content */}
                    <View className="p-4 w-full item-center">
                        {loading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text className="text-gray-500 mt-4">{t("loading.posts")}</Text>
                            </View>
                        ) : (
                            renderFriendsPosts()
                        )}
                    </View>
                </View>
            ) : (
                /* Mobile Layout */
                <>
                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#3B82F6" />
                            <Text className="text-gray-500 mt-4">{t("loading.posts")}</Text>
                        </View>
                    ) : (
                        renderFriendsPosts()
                    )}
                </>
            )}

            {/* Image Viewing Modal */}
            <Modal
                visible={showImageModal}
                transparent={true}
                onRequestClose={() => setShowImageModal(false)}
                animationType="fade"
            >
                <SafeAreaProvider>
                <SafeAreaView className="flex-1">
                <View className="flex-1 bg-black/90 justify-center items-center">
                    <View className={`absolute top-0 left-0 right-0 flex-row justify-between items-center p-4 z-10 ${isDesktop ? "max-w-6xl mx-auto" : ""}`}>
                        <TouchableOpacity
                            onPress={() => setShowImageModal(false)}
                            className="w-10 h-10 rounded-full bg-black/50 items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>

                        {imageGallery.length > 1 && (
                            <Text className="text-white font-medium">
                                {imageGallery.indexOf(currentImage) + 1} / {imageGallery.length}
                            </Text>
                        )}

                        <View style={{ width: 40 }} />
                    </View>

                    {isDesktop ? (
                        <View className="max-w-6xl w-full mx-auto flex-row justify-center items-center">
                            {imageGallery.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const currentIndex = imageGallery.indexOf(currentImage);
                                        if (currentIndex > 0) {
                                            setCurrentImage(imageGallery[currentIndex - 1]);
                                        }
                                    }}
                                    className="w-12 h-12 rounded-full bg-black/50 items-center justify-center mr-4"
                                    disabled={imageGallery.indexOf(currentImage) === 0}
                                    style={{ opacity: imageGallery.indexOf(currentImage) === 0 ? 0.5 : 1 }}
                                >
                                    <Ionicons name="chevron-back" size={28} color="white" />
                                </TouchableOpacity>
                            )}

                            <Image
                                source={{ uri: currentImage }}
                                style={{ width: '80%', height: '80%', maxHeight: 800 }}
                                contentFit="contain"
                            />

                            {imageGallery.length > 1 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const currentIndex = imageGallery.indexOf(currentImage);
                                        if (currentIndex < imageGallery.length - 1) {
                                            setCurrentImage(imageGallery[currentIndex + 1]);
                                        }
                                    }}
                                    className="w-12 h-12 rounded-full bg-black/50 items-center justify-center ml-4"
                                    disabled={imageGallery.indexOf(currentImage) === imageGallery.length - 1}
                                    style={{ opacity: imageGallery.indexOf(currentImage) === imageGallery.length - 1 ? 0.5 : 1 }}
                                >
                                    <Ionicons name="chevron-forward" size={28} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <FlatList
                            data={imageGallery}
                            horizontal
                            pagingEnabled
                            initialScrollIndex={imageGallery.indexOf(currentImage)}
                            getItemLayout={(data, index) => ({
                                length: windowWidth,
                                offset: windowWidth * index,
                                index,
                            })}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={{ width: windowWidth, height: '100%' }} className="items-center justify-center">
                                    <Image
                                        source={{ uri: item }}
                                        style={{ width: '90%', height: '80%' }}
                                        contentFit="contain"
                                    />
                                </View>
                            )}
                            onMomentumScrollEnd={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
                                setCurrentImage(imageGallery[index]);
                            }}
                        />
                    )}
                </View>
                </SafeAreaView>
                </SafeAreaProvider>
            </Modal>

            {/* Comment Input Modal */}
            <Modal
                visible={showCommentInput}
                transparent={true}
                onRequestClose={() => setShowCommentInput(false)}
                animationType={isDesktop ? "fade" : "slide"}
            >
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: fadeAnim.interpolate({
                                inputRange: [0, 0.5],
                                outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
                            })
                        }}
                    >
                        <SafeAreaProvider>
                            <SafeAreaView style={{ flex: 1 }}>
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    style={{ flex: 1 }}
                                >
                    <Pressable
                        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                        onPress={(e) => {
                        if (e.currentTarget === e.target) {
                            setShowCommentInput(false);
                        }
                        }}>
                        <View className={`${isDesktop ? "max-w-2xl w-full mx-auto bg-white rounded-xl shadow-xl" : "bg-white rounded-t-xl w-full mt-auto"}`}>
                                <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                                    <TouchableOpacity
                                        onPress={() => setShowCommentInput(false)}
                                        className="p-2"
                                    >
                                        <Ionicons name="close" size={24} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <Text className="text-lg font-bold text-gray-800">{t("add.comment.text")}</Text>
                                    <View style={{ width: 40 }} />
                                </View>

                                {currentPost && (
                                    <View className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                        <View className="flex-row items-center">
                                            <Image
                                                source={{ uri: currentPost.profilePicture }}
                                                style={{ width: 36, height: 36, borderRadius: 18 }}
                                                contentFit="cover"
                                            />
                                            <View className="ml-2">
                                                <Text className="font-bold text-gray-800">{currentPost.name}</Text>
                                                <Text className="text-gray-500 text-xs">@{currentPost.username}</Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-700 mt-2" numberOfLines={2}>{currentPost.title}</Text>
                                    </View>
                                )}

                                {/* Comments List */}
                                {comments.length > 0 ? (
                                    <FlatList
                                        data={comments}
                                        scrollEnabled={true}
                                        keyExtractor={(item) => item.id.toString()}
                                        style={{ maxHeight: isDesktop ? 400 : 250 }}
                                        renderItem={({ item }) => (
                                            <Pressable className="bg-gray-50 rounded-lg p-4 mx-4 my-2">
                                                <TouchableOpacity activeOpacity={0.7} onPress={() => {
                                                    router.navigate(`/${item.author}`);
                                                    setShowCommentInput(false);
                                                }} className="flex-row items-center mb-2">
                                                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                        <Image
                                                            source={{ uri: item.profilePicturePath }}
                                                            style={{ width: 30, height: 30, borderRadius: 15 }}
                                                        />
                                                    </View>
                                                    <Text className="font-bold text-gray-800">{item.author}</Text>
                                                </TouchableOpacity>
                                                <Text className="text-gray-700">{item.text}</Text>
                                            </Pressable>
                                        )}
                                    />
                                ) : (
                                    <View className="items-center py-8 bg-gray-50 mx-4 my-4 rounded-lg">
                                        <Ionicons name="chatbubble-outline" size={40} color="#CBD5E1" />
                                        <Text className="text-gray-500 mt-2">{t("no.comments.yet")}</Text>
                                        <Text className="text-gray-400 text-sm">{t("comment.first")}</Text>
                                    </View>
                                )}

                                {/* Comment Input */}
                                <View className="px-4 py-3 border-t border-gray-200">
                                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                                        <TextInput
                                            className="flex-1 text-gray-700 outline-none py-2"
                                            placeholder={t("add.comment")}
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            onSubmitEditing={() => {
                                                if (commentText.trim() !== "") {
                                                    addComment();
                                                }
                                            }}
                                        />
                                        <TouchableOpacity
                                            onPress={addComment}
                                            disabled={commentText.trim() === ""}
                                            className={`ml-2 p-2 rounded-full ${commentText.trim() === "" ? "bg-gray-300" : "bg-blue-500"}`}
                                        >
                                            <Ionicons name="send" size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Pressable>
                                </KeyboardAvoidingView>
                            </SafeAreaView>
                        </SafeAreaProvider>
                    </Animated.View>

        </Modal>

            {/* Post Creation Modal */}
            <Modal
                visible={showPostCreation}
                transparent={true}
                onRequestClose={() => setShowPostCreation(false)}
                animationType={isDesktop ? "fade" : "slide"}
            >
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: fadeAnim.interpolate({
                            inputRange: [0, 0.5],
                            outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)']
                        })
                    }}
                >
                    <SafeAreaProvider>
                        <SafeAreaView style={{ flex: 1 }}>
                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={{ flex: 1 }}
                            >
                                <Pressable
                                    style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}
                                    onPress={(e) => {
                                        if (e.currentTarget === e.target) {
                                            setShowPostCreation(false);
                                        }
                                    }}>
                        <View className={`${isDesktop ? "max-w-2xl w-full mx-auto bg-white rounded-xl shadow-xl" : "bg-white rounded-t-xl w-full mt-auto"}`}>
                            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowPostCreation(false);
                                        setPostText("");
                                        setSelectedImages([]);
                                    }}
                                    className="p-2"
                                >
                                    <Ionicons name="close" size={24} color="#3B82F6" />
                                </TouchableOpacity>
                                <Text className="text-lg font-bold text-gray-800">{t("create.post")}</Text>
                                <TouchableOpacity
                                    onPress={createPost}
                                    disabled={postText.trim() === "" && selectedImages.length === 0}
                                    className={`p-2 ${postText.trim() === "" && selectedImages.length === 0 ? "opacity-50" : ""}`}
                                >
                                    <Text className="text-blue-500 font-bold">{t("to.post")}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Post Content Input */}
                            <View className="p-4">
                                <TextInput
                                    className="text-gray-800 min-h-[100px] text-base outline-none"
                                    placeholder={t("whats.on.your.mind")}
                                    placeholderTextColor="#94A3B8"
                                    value={postText}
                                    onChangeText={setPostText}
                                    multiline
                                    autoFocus
                                />
                            </View>

                            {/* Selected Images Preview */}
                            {selectedImages.length > 0 && (
                                <View className="px-4 pb-4">
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {selectedImages.map((image, index) => (
                                            <View key={index} className="relative mr-2">
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: 100, height: 100, borderRadius: 8 }}
                                                    contentFit="cover"
                                                />
                                                <TouchableOpacity
                                                    onPress={() => removeImage(index)}
                                                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                                                >
                                                    <Ionicons name="close" size={16} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Action Buttons */}
                            <View className="flex-row px-4 py-3 border-t border-gray-200">
                                <TouchableOpacity
                                    onPress={pickImages}
                                    className="flex-row items-center p-2 rounded-lg bg-gray-100"
                                    disabled={selectedImages.length >= 5}
                                >
                                    <Ionicons name="image" size={22} color={selectedImages.length >= 5 ? "#94A3B8" : "#3B82F6"} />
                                    <Text className={`ml-2 ${selectedImages.length >= 5 ? "text-gray-400" : "text-blue-500"}`}>
                                        {selectedImages.length >= 5 ? t("max.5.images") : t("add.photos")}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Pressable>
                </KeyboardAvoidingView>
                </SafeAreaView>
                </SafeAreaProvider>
                </Animated.View>
            </Modal>
        </SafeAreaView>
        </SafeAreaProvider>
    );
}
