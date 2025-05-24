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
    KeyboardAvoidingView, StyleSheet
} from "react-native";
import "../../../global.css"
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState, useRef} from "react";
import * as SecureStore from "expo-secure-store";
import Post from "../../../components/Entries/Post";
import {Image} from "expo-image";
import {SafeAreaView} from "react-native-safe-area-context";
import ip from "../../../components/AppManager";
import {LinearGradient} from "expo-linear-gradient";

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

    const token = useRef("");
    const username = useRef("");

    // Placeholder data for demonstration
    const placeholderPosts = [
        {
            id: { millis: "1" },
            title: "Just had an amazing day at the beach! 🏖️",
            content: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop"],
            likes: ["user1", "user2", "user3"],
            comments: 5,
            username: "sarah_beach",
            profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
            name: "Sarah Johnson"
        },
        {
            id: { millis: "2" },
            title: "Check out my new photography project! What do you think?",
            content: [
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1554080353-a576cf803bda?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?q=80&w=1000&auto=format&fit=crop"
            ],
            likes: ["user1"],
            comments: 12,
            username: "mike_photo",
            profilePicture: "https://randomuser.me/api/portraits/men/32.jpg",
            name: "Mike Peterson"
        },
        {
            id: { millis: "3" },
            title: "Made this delicious pasta for dinner tonight! Recipe in comments 🍝",
            content: ["https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=1000&auto=format&fit=crop"],
            likes: ["user1", "user2", "user3", "user4", "user5"],
            comments: 8,
            username: "chef_julia",
            profilePicture: "https://randomuser.me/api/portraits/women/65.jpg",
            name: "Julia Chen"
        },
        {
            id: { millis: "4" },
            title: "Hiking trip with friends this weekend was incredible!",
            content: [
                "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1527201987695-67c06571957e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1471513671800-b09c87e1497c?q=80&w=1000&auto=format&fit=crop"
            ],
            likes: ["user1", "user2"],
            comments: 3,
            username: "adventure_tom",
            profilePicture: "https://randomuser.me/api/portraits/men/22.jpg",
            name: "Tom Wilson"
        },
        {
            id: { millis: "5" },
            title: "Just finished reading this book. Highly recommend!",
            content: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000&auto=format&fit=crop"],
            likes: ["user1", "user2", "user3"],
            comments: 7,
            username: "bookworm_amy",
            profilePicture: "https://randomuser.me/api/portraits/women/33.jpg",
            name: "Amy Rodriguez"
        }
    ];

    // Handle window resize for responsive layout
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

        // In a real implementation, you would fetch posts from the server
        // For now, we'll use the placeholder data
        setTimeout(() => {
            setPosts(placeholderPosts);
            setLoading(false);
            setRefreshing(false);
        }, 1000);

        // Example of how the actual fetch would look:
        /*
        try {
            const response = await fetch(`${ip}/posts/friends`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token.current}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
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
        */
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchPosts();
    };

    const handleLikePost = (post) => {
        // In a real implementation, you would send a request to the server
        // For now, we'll just update the local state
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
    };

    const handleCommentPress = (post) => {
        // Open comment input for this post
        setCurrentPost(post);
        setShowCommentInput(true);

        // Initialize comments (in a real app, you would fetch comments from the server)
        // For now, we'll just use an empty array
        setComments([]);
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

        // Get user profile picture
        let profilePath = "";
        if (Platform.OS === "web") {
            const profile = localStorage.getItem('profile');
            if (profile) {
                profilePath = JSON.parse(profile).profilePicturePath;
            }
        } else {
            const profile = await SecureStore.getItem('profile');
            if (profile) {
                profilePath = JSON.parse(profile).profilePicturePath;
            }
        }

        // Create a new comment
        const newComment = {
            id: comments.length,
            author: username.current,
            text: commentText,
            profilePicturePath: profilePath ? profilePath.split(',')[0] : "",
        };

        // Add the comment to the local state
        setComments(prevState => [...prevState, newComment]);

        // Update the post's comment count
        setPosts(prevPosts => 
            prevPosts.map(p => {
                if (p.id.millis === currentPost.id.millis) {
                    return {
                        ...p,
                        comments: typeof p.comments === 'number' ? p.comments + 1 : 1
                    };
                }
                return p;
            })
        );

        // Clear the comment text
        setCommentText("");

        // In a real app, you would send the comment to the server
        // For now, we'll just simulate a successful comment
        /*
        try {
            const response = await fetch(`${ip}/profile/posts/${currentPost.username}/${currentPost.id.millis}`, {
                method: 'POST',
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    comment: commentText,
                })
            });

            if (!response.ok) {
                // If the request fails, remove the comment from the local state
                setComments(prevState => prevState.slice(0, -1));

                // And revert the comment count
                setPosts(prevPosts => 
                    prevPosts.map(p => {
                        if (p.id.millis === currentPost.id.millis) {
                            return {
                                ...p,
                                comments: p.comments - 1
                            };
                        }
                        return p;
                    })
                );
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
        */
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
                <Post 
                    {...item} 
                    onLikePress={() => handleLikePost(item)} 
                    onCommentPress={() => handleCommentPress(item)} 
                    onImagePress={(image) => handleImagePress(item, image)} 
                    isDesktop={isDesktop}
                />
            </View>
        </View>
    );

    const renderEmptyList = () => (
        <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="newspaper-outline" size={32} color="#3B82F6" />
            </View>
            <Text className="text-xl font-semibold text-gray-800 mb-2">No posts yet</Text>
            <Text className="text-gray-500 text-center px-10">
                When your friends post updates, they'll appear here.
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

    const toggleSearch = () => {
        setShowSearch(!showSearch);
        if (!showSearch) {
            setTimeout(() => {
                searchInput.current?.focus();
            }, 100);
        } else {
            setSearchText("");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-dark-primary">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-2">
                <View className="flex-row items-center">
                    <LinearGradient style={{borderRadius: 15}} start={{x: 0, y: 0}} end={{x: 1, y: 0}} colors={["#184dbf", "#1030b8", "#042481"]} className="w-48 h-12 items-center justify-center mr-2">
                        <Image source={require("assets/images/icon_wo_bg.png")} size={24} color="white" className="mr-2" />
                        <Text className="text-3xl font-bold text-white">Facelinked</Text>
                    </LinearGradient>
                </View>

                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        className= "rounded-full items-center justify-center"
                        style={{ width: 40, height: 40, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center',
                            alignItems: 'center',}}                        activeOpacity={0.7}
                    >
                        <Ionicons name="person" size={23} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            {showSearch && (
                <View className={`px-4 pt-2 pb-2 ${isDesktop ? "max-w-7xl mx-auto" : ""}`}>
                    <View className="flex-row items-center bg-white/90 rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                        <Ionicons name="search" size={18} color="#64748B" />
                        <TextInput
                            ref={searchInput}
                            value={searchText}
                            onChangeText={setSearchText}
                            placeholder="Search for people or posts..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 ml-2 text-gray-700 outline-none py-2"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <Ionicons name="close" size={18} color="#64748B" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Desktop Layout */}
            {isDesktop ? (
                <View className="flex-row max-w-7xl mx-auto" style={{ height: '100%', overflow: 'auto' }}
                >
                    {/* Main Content */}
                    <View className="w-3/4 p-4">
                        {loading ? (
                            <View className="flex-1 items-center justify-center py-20">
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text className="text-gray-500 mt-4">Loading posts...</Text>
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
                            <Text className="text-gray-500 mt-4">Loading posts...</Text>
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
            </Modal>

            {/* Comment Input Modal */}
            <Modal
                visible={showCommentInput}
                transparent={true}
                onRequestClose={() => setShowCommentInput(false)}
                animationType={isDesktop ? "fade" : "slide"}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <View className={`${isDesktop ? "max-w-2xl w-full mx-auto bg-white rounded-xl shadow-xl" : "bg-white rounded-t-xl w-full mt-auto"}`}>
                            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                                <TouchableOpacity
                                    onPress={() => setShowCommentInput(false)}
                                    className="p-2"
                                >
                                    <Ionicons name="close" size={24} color="#3B82F6" />
                                </TouchableOpacity>
                                <Text className="text-lg font-bold text-gray-800">Add Comment</Text>
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
                                    keyExtractor={(item) => item.id.toString()}
                                    style={{ maxHeight: isDesktop ? 400 : 300 }}
                                    renderItem={({ item }) => (
                                        <View className="bg-gray-50 rounded-lg p-4 mx-4 my-2">
                                            <View className="flex-row items-center mb-2">
                                                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                    <Image
                                                        source={{ uri: item.profilePicturePath }}
                                                        style={{ width: 30, height: 30, borderRadius: 15 }}
                                                    />
                                                </View>
                                                <Text className="font-bold text-gray-800">{item.author}</Text>
                                            </View>
                                            <Text className="text-gray-700">{item.text}</Text>
                                        </View>
                                    )}
                                />
                            ) : (
                                <View className="items-center py-8 bg-gray-50 mx-4 my-4 rounded-lg">
                                    <Ionicons name="chatbubble-outline" size={40} color="#CBD5E1" />
                                    <Text className="text-gray-500 mt-2">No comments yet</Text>
                                    <Text className="text-gray-400 text-sm">Be the first to comment</Text>
                                </View>
                            )}

                            {/* Comment Input */}
                            <View className="px-4 py-3 border-t border-gray-200">
                                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                                    <TextInput
                                        className="flex-1 text-gray-700 outline-none py-2"
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChangeText={setCommentText}
                                        multiline
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
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
