                import {
                    Alert, Animated, Dimensions,
                    FlatList,
                    Keyboard, KeyboardAvoidingView, Modal,
                    Platform,
                    Pressable,
                    ScrollView,
                    StyleSheet,
                    Text,
                    TextInput,
                    TouchableOpacity,
                    View
                } from "react-native";
                import "../../../global.css"
                import {router, useGlobalSearchParams, useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
                import {Image} from "expo-image";
                import {useEffect, useLayoutEffect, useRef, useState} from "react";
                import * as SecureStore from "expo-secure-store";
                import * as ImagePicker from "expo-image-picker";
                import Ionicons from "@expo/vector-icons/Ionicons";
                import ip from "../../../components/AppManager";
                import Post from "../../../components/Entries/Post";
                import {showAlert} from "../../../components/PopUpModalView";
                import {SafeAreaProvider, SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
                import {ImageManipulator, SaveFormat} from "expo-image-manipulator";
                import {useSearchParams} from "expo-router/build/hooks";

                export default function Profile() {

                    let {profile, post} = useLocalSearchParams();
                    const router = useRouter();
                    const insets = useSafeAreaInsets();

                    // State for badge notification
                    const [hasFriendRequests, setHasFriendRequests] = useState(false);

                    // State for responsive layout
                    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
                    const [isDesktop, setIsDesktop] = useState(windowWidth > 768);
                    const [cachedProfileName, setCachedProfileName] = useState([]);

                    const [showInput, setShowInput] = useState(false);
                    const input = useRef(null);
                    const [isSearching, setIsSearching] = useState(false);
                    const [searchResults, setSearchResults] = useState([]);

                    const scrollView = useRef(null);
                    const [posts, setPosts] = useState([]);
                    const newPostInput = useRef(null);
                    const [postInputText, setPostInputText] = useState("");
                    const cachedPosts = useRef([]);

                    const token = useRef("");
                    const username = useRef("");
                    const profileName = useRef("");

                    const [showModal, setShowModal] = useState(false);
                    const [isAdded, setIsAdded] = useState(false);
                    const [isFriendRequestSent, setIsFriendRequestSent] = useState(false);
                    const [isFriendRequestReceived, setIsFriendRequestReceived] = useState(false);
                    const [friendsSearchResults, setFriendsSearchResults] = useState([]);
                    const fadeAnim = useRef(new Animated.Value(1)).current;

                    // New states for additional features
                    const [showPostModal, setShowPostModal] = useState(false);
                    const [selectedPost, setSelectedPost] = useState(null);
                    const [showPostImageGallery, setShowPostImageGallery] = useState(false);
                    const [currentPostImage, setCurrentPostImage] = useState(null);
                    const [postImageGallery, setPostImageGallery] = useState([]);
                    const [cachedPost, setCachedPost] = useState(null);
                    const [comments, setComments] = useState([]);
                    const [commentText, setCommentText] = useState("");
                    const [showImageGallery, setShowImageGallery] = useState(false);
                    const [profileImages, setProfileImages] = useState([]);
                    const [selectedImage, setSelectedImage] = useState(null);
                    const [friendRequests, setFriendRequests] = useState([]);
                    const [showFriendRequests, setShowFriendRequests] = useState(false);

                    // State for post image upload
                    const [selectedPostImages, setSelectedPostImages] = useState([]);

                    // State for profile editing
                    const [showEditProfile, setShowEditProfile] = useState(false);
                    const [editName, setEditName] = useState("");
                    const [editLocation, setEditLocation] = useState("");
                    const [editHobbies, setEditHobbies] = useState("");
                    const [editRelationship, setEditRelationship] = useState(false);

                    const [profileInfos, setProfileInfos] = useState({
                        name: "Loading...",
                        location: "Loading...",
                        hobbies: "Loading...",
                        inRelationship: false,
                        profilePicturePath: "",
                        dateOfBirth: new Date()
                    });

                    async function fetchData() {
                        try {
                            if (username.current === profileName.current) {
                                let profile;
                                if (Platform.OS === "web") {
                                    profile = JSON.parse(localStorage.getItem('profile'));
                                }
                                else {
                                    profile = JSON.parse(SecureStore.getItem('profile'));
                                }
                                setProfileInfos(profile);
                            }

                            const data = await fetch(`${ip}/profile/${profileName.current}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + token.current,
                                    'Content-Type': 'application/json'
                                }
                            });
                            if (data.ok) {
                                let profileInfos = await data.json();
                                setProfileImages(profileInfos.profilePicturePath.split(','));
                                profileInfos.profilePicturePath = profileInfos.profilePicturePath.split(',')[0];
                                setProfileInfos(profileInfos);
                                setFriendsSearchResults(profileInfos.friends ? profileInfos.friends : []);
                                if (!profileInfos.friendRequests) {
                                    setIsFriendRequestSent(false);
                                } else {
                                    setIsFriendRequestSent(profileInfos.friendRequests.some((friend) => friend.memberId === username.current));
                                }
                                if (Platform.OS === "web") {
                                    const profile = JSON.parse(localStorage.getItem('profile'));
                                    if (!profile.friends) {
                                        setIsAdded(false);
                                    } else {
                                        setIsAdded(profile.friends.some((friend) => friend.memberId === profileName.current));
                                    }
                                    if (!profile.friendRequests) {
                                        setIsFriendRequestReceived(false);
                                    } else {
                                        setIsFriendRequestReceived(profile.friendRequests.some((friend) => friend.memberId === profileName.current));
                                    }
                                } else {
                                    const profile = JSON.parse(SecureStore.getItem('profile'));
                                    if (!profile.friends) {
                                        setIsAdded(false);
                                    } else {
                                        setIsAdded(profile.friends.some((friend) => friend.memberId === profileName.current));
                                    }
                                    if (!profile.friendRequests) {
                                        setIsFriendRequestReceived(false);
                                    } else {
                                        setIsFriendRequestReceived(profile.friendRequests.some((friend) => friend.memberId === profileName.current));
                                    }
                                }
                                if (profileName.current === username.current) {
                                    if (Platform.OS === "web") {
                                        localStorage.setItem('profile', JSON.stringify(profileInfos));
                                    } else {
                                        SecureStore.setItem('profile', JSON.stringify(profileInfos));
                                    }
                                }

                                if (profileName.current === username.current) {
                                    setFriendRequests(profileInfos.friendRequests);
                                    setHasFriendRequests(profileInfos.friendRequests.length > 0);
                                }
                            }
                        }
                        catch (error) {
                            console.error('Error fetching data:', error);
                        }

                        try {
                            const data = await fetch(`${ip}/profile/posts/last5/${profileName.current}`, {
                                method: 'GET',
                                headers: {
                                    "Authorization": `Bearer ${token.current}`
                                }
                            });
                            if (data.ok) {
                                const posts = await data.json();
                                setPosts(posts);

                                if (post !== undefined) {
                                    const postId = posts.find((postItem) => Number.parseInt(postItem.id.millis) === Number.parseInt(post));
                                    if (postId) {
                                        setSelectedPost(postId);
                                        setShowPostModal(true);
                                    }
                                }
                            }
                        }
                        catch (error) {
                            console.error('Error fetching data:', error);
                        }
                    }

                    function calculateAge(birthDate) {
                        const ageDiff = Date.now() - birthDate.getTime();
                        const ageDate = new Date(ageDiff);
                        return Math.abs(ageDate.getUTCFullYear() - 1970);
                    }

                    async function newMainProfilePicture(path) {
                        let profilePictures = [...profileImages];
                        const lastMain = profilePictures.at(0);
                        const indexOfPath = profilePictures.indexOf(path);
                        profilePictures.splice(indexOfPath, 1);
                        profilePictures[0] = path;
                        profilePictures.push(lastMain);

                        const response = await fetch(`${ip}/profile/update/profilePicture`, {
                            method: 'PUT',
                            headers: {
                                "Authorization": `Bearer ${token.current}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify([
                                ...profilePictures
                            ])
                        })

                        if (response.ok) {
                            setProfileImages(profilePictures)
                            setProfileInfos(prevState => ({...prevState, profilePicturePath: profilePictures[0]}))
                        }
                    }

                    async function addProfilePicture() {
                        let image;
                        try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: "images",
                                allowsMultipleSelection: true,
                                quality: 0.8,
                                selectionLimit: 6 - profileImages.length,
                            });

                            if (!result.canceled) {
                                image = result.assets.map(asset => asset.uri)
                            } else {
                                return;
                            }
                        } catch (error) {
                            console.error('Error picking image:', error);
                            return;
                        }
                        let newProfileImages = [...profileImages];

                        for (const singleImage of image) {
                            let tempImage;
                            const manipResult = await ImageManipulator.manipulate(
                                singleImage).resize({width: 500});
                            const renderedImage = await manipResult.renderAsync();
                            const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                            tempImage = savedImage.uri;

                            const bucketResponse = await fetch(`${ip}/profile/upload`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${token.current}`,
                                }
                            });
                            if (bucketResponse.ok) {
                                const url = await bucketResponse.text();

                                const response = await fetch(tempImage);
                                const blob = await response.blob();

                                await fetch(url, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": blob.type
                                    },
                                    body: blob,
                                });
                                newProfileImages.push(url.split("?")[0]);
                            } else {
                                showAlert({
                                    title: 'Error',
                                    message: 'An error occurred while uploading your image. Please try again later.',
                                    buttons: [
                                        {
                                            text: 'OK',
                                            onPress: () => {}
                                        },
                                    ],
                                })
                                return;
                            }
                        }

                        const response = await fetch(`${ip}/profile/update/profilePicture`, {
                            method: 'PUT',
                            headers: {
                                "Authorization": `Bearer ${token.current}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify([
                                ...newProfileImages
                            ])
                        })

                        if (response.ok) {
                            setProfileImages(newProfileImages);
                            setProfileInfos(prevState => ({...prevState, profilePicturePath: newProfileImages[0]}))
                        }
                    }

                    async function removeProfilePicture(path) {
                        let newProfileImages = [...profileImages];

                        if (path === profileImages[0]) {
                            if (profileImages.length === 1) {
                                return;
                            }
                            newProfileImages.splice(0,1);
                        } else {
                            newProfileImages = newProfileImages.filter(image => image !== path);
                        }

                        const response = await fetch(`${ip}/profile/update/profilePicture`, {
                            method: 'PUT',
                            headers: {
                                "Authorization": `Bearer ${token.current}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify([
                                ...newProfileImages
                            ])
                        })

                        if(response.ok) {
                            setProfileImages(newProfileImages);
                            setProfileInfos(prevState => ({...prevState, profilePicturePath: newProfileImages[0]}));
                        }
                    }

                    async function LikePost(post) {
                        const response = await fetch(`${ip}/profile/posts/like/${profileName.current}/${post.id.millis}`, {
                            method: 'POST',
                            headers: {
                                "Authorization": `Bearer ${token.current}`
                            }
                        })

                        if (response.ok) {
                            setPosts(prevState => {
                                const newPosts = [...prevState];
                                const index = newPosts.findIndex(post => post.id.millis === post.id.millis);
                                if (newPosts[index].likes.some((item) => item === username.current)) {
                                    newPosts[index].likes = newPosts[index].likes.filter(like => like !== username.current);
                                } else {
                                    newPosts[index].likes.push(username.current);
                                }
                                return newPosts;
                            });
                        }
                    }

                    function handleAddBar() {
                        setShowInput(shown => {
                            if (shown) {
                                Keyboard.dismiss();
                                setIsSearching(false);
                            }
                            else {
                                setTimeout(() => {
                                    input.current.focus();
                                }, 100);
                                setSearchResults([]);
                            }
                            return !shown
                        });
                    }

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

                    useEffect( () => {
                        profileName.current = profile;
                        if (Platform.OS === "web") {
                            token.current = localStorage.getItem("token");
                            username.current = localStorage.getItem("username");
                        }
                        else {
                            token.current = SecureStore.getItem("token");
                            username.current = SecureStore.getItem("username");
                        }
                        if(!profile || profile === "profile"){ profileName.current = username.current;}
                        setTimeout(() => {
                            if (token.current === null) {router.replace("/")}
                        })

                        if (cachedProfileName.at(-1) !== profileName.current) {
                            setCachedProfileName(prevState => [...prevState, profileName.current]);
                        }
                        fetchData();
                    }, [profile]);

                    function createPost() {
                        if (newPostInput.current) {
                            setPosts([...cachedPosts.current]);
                            return;
                        }
                        setPosts(prevState => {cachedPosts.current = prevState ;return [{new: true, millis: Date.now()}]});

                        setTimeout(() => {
                            scrollView.current.scrollToEnd();
                            newPostInput.current.focus();
                        })
                    }

                    async function sendPost() {
                        // Create a temporary post with optimistic UI update
                        setPosts([{
                            title: postInputText,
                            content: selectedPostImages,
                            likes: 0,
                            millis: Date.now()
                        }, ...cachedPosts.current]);

                        const title = postInputText;
                        setPostInputText("");
                        // Upload images if any
                        let imageUrls = [];
                        try {
                            if (selectedPostImages.length > 0) {
                                for (const image of selectedPostImages) {
                                    let tempImage;
                                    const manipResult = await ImageManipulator.manipulate(
                                        image).resize({width: 500});
                                    const renderedImage = await manipResult.renderAsync();
                                    const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                                    tempImage = savedImage.uri;

                                    // Get upload URL from server
                                    const uploadResponse = await fetch(`${ip}/profile/upload`, {
                                        method: 'GET',
                                        headers: {
                                            "Authorization": `Bearer ${token.current}`
                                        }
                                    });

                                    if (uploadResponse.ok) {
                                        const uploadUrl = await uploadResponse.text();

                                        // Upload image to the URL
                                        const response = await fetch(tempImage);
                                        const blob = await response.blob();

                                        await fetch(uploadUrl, {
                                            method: 'PUT',
                                            headers: {
                                                "Content-Type": blob.type
                                            },
                                            body: blob
                                        });

                                        // Add the image URL to the array (without query parameters)
                                        imageUrls.push(uploadUrl.split('?')[0]);
                                    }
                                }
                            }

                            // Create the post with image URLs
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

                            // Clear selected images
                            setSelectedPostImages([]);

                            if (!data.ok) {
                                showAlert({
                                    title: 'Error',
                                    message: 'An error occurred while sending your post. Please try again later.',
                                    buttons: [
                                        {
                                            text: 'OK',
                                            onPress: () => {}
                                        },
                                    ],
                                });
                                setPosts(prevState => prevState.slice(1));
                            }
                            else {
                                // Refresh posts
                                const postData = await fetch(`${ip}/profile/posts/all/${profileName.current}`, {
                                    method: 'GET',
                                    headers: {
                                        "Authorization": `Bearer ${token.current}`
                                    }
                                });
                                if (postData.ok) {
                                    const posts = await postData.json();
                                    setPosts(posts);
                                }
                            }
                        } catch (error) {
                            console.error('Error sending post:', error);
                            showAlert({
                                title: 'Error',
                                message: 'An error occurred while sending your post. Please try again later.',
                                buttons: [
                                    {
                                        text: 'OK',
                                        onPress: () => {}
                                    },
                                ],
                            });
                            setPosts(prevState => prevState.slice(1));
                        }
                    }

                    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
                        const paddingToBottom = 20;
                        return layoutMeasurement.height + contentOffset.y >=
                            contentSize.height - paddingToBottom;
                    };

                    async function removeFriend(memberId) {
                        setProfileInfos(prevState => ({...prevState, friends: prevState.friends.filter((friend) => friend.memberId !== memberId)}));
                        setFriendsSearchResults(() => profileInfos.friends.filter((friend) => friend.memberId !== memberId));

                        await fetch(`${ip}/profile/friend/${memberId}`, {
                            method: 'DELETE',
                            headers: {
                                "Authorization": `Bearer ${token.current}`
                            }
                        });
                    }

                    async function AddFriend() {
                        if(isAdded) {
                            showAlert({
                                title: `Unfriend ${profileName.current}'?`,
                                message: 'Are you sure you want to remove this user as a friend?',
                                buttons: [
                                    {
                                        text: 'Cancel',
                                        onPress: () => console.log('Cancelled')
                                    },
                                    {
                                        text: 'Submit',
                                        onPress: () => async () => {
                                            setIsAdded(false);
                                            await fetch(`${ip}/profile/friend/${profileName.current}`, {
                                                method: 'DELETE',
                                                headers: {
                                                    "Authorization": `Bearer ${token.current}`
                                                }
                                            });
                                        }
                                    }
                                ],
                            });
                            return
                        }
                        setIsFriendRequestSent(true);

                        await fetch(`${ip}/profile/friend/${profileName.current}`, {
                            method: 'POST',
                            headers: {
                                "Authorization": `Bearer ${token.current}`
                            }
                        });

                        Animated.sequence([
                            Animated.timing(fadeAnim, {
                                toValue: 0,
                                duration: 0,
                                useNativeDriver: true
                            }),
                            Animated.timing(fadeAnim, {
                                toValue: 1,
                                duration: 200,
                                useNativeDriver: true
                            })
                        ]).start();
                    }

                    // Function to open post details and comments
                    const openPostDetails = (post) => {
                        setSelectedPost(post);
                        setComments(
                            post.comments.length > 0 ? post.comments.map((comment) => {let newComment = {};
                            newComment.id = comments.findIndex((_comment) => _comment === comment);
                            newComment.author = comment.split('Ð')[0];
                            newComment.profilePicturePath = comment.split('Ð')[1];
                            newComment.text = JSON.parse(comment.split('Ð')[2]).comment;
                            return newComment;
                            }) : []
                        );
                        setShowPostModal(true);
                    };

                    // Function to add a comment
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

                        const status = await fetch(`${ip}/profile/posts/${profileName.current}/${selectedPost.id.millis}`, {
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
                                title: 'Error',
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

                    const formatTimestamp = (timestamp) => {
                        const date = new Date(timestamp);
                        return date.toLocaleString();
                    };

                    // Function to handle friend request response
                    const handleFriendRequest = async (id, accept) => {
                        if (accept) {
                            const status = await fetch(`${ip}/profile/friend/${id}`, {
                                method: "POST",
                                headers: {
                                    "Authorization": `Bearer ${token.current}`
                                }
                            })

                            if (status.ok) {
                                setFriendRequests(friendRequests.filter(request => request.memberId !== id));
                                setHasFriendRequests(friendRequests.length > 1);
                                let newFriends = profileInfos.friends;
                                const friend = await fetch(`${ip}/profile/${id}`, {
                                    method: 'GET',
                                    headers: {
                                        "Authorization": `Bearer ${token.current}`}
                                })
                                if (!friend.ok) {
                                    return;
                                }
                                const profile = await friend.json();
                                newFriends.push({memberId: id, memberProfilePicturePath: profile.profilePicturePath.split(",")[0], memberName: profile.name});
                                setProfileInfos(prevState => ({...prevState, friends: newFriends}))
                            }
                        } else {
                            const status = await fetch(`${ip}/profile/friend/request/${id}`, {
                                method: "DELETE",
                                headers: {
                                    "Authorization": `Bearer ${token.current}`
                                }
                            })

                            if (status.ok) {
                                setFriendRequests(friendRequests.filter(request => request.memberId !== id));
                                setHasFriendRequests(friendRequests.length > 1);
                            }
                        }
                    };

                    const initEditProfile = () => {
                        setEditName(profileInfos.name || "");
                        setEditLocation(profileInfos.location || "");
                        setEditHobbies(profileInfos.hobbies || "");
                        setEditRelationship(profileInfos.inRelationship || false);
                        setShowEditProfile(true);
                    };

                    // Function to save edited profile
                    const saveProfile = async () => {
                        try {
                            const updatedProfile = {
                                name: editName,
                                location: editLocation,
                                hobbies: editHobbies,
                                inRelationship: editRelationship
                            };

                            const response = await fetch(`${ip}/profile/update`, {
                                method: 'PUT',
                                headers: {
                                    "Authorization": `Bearer ${token.current}`,
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(updatedProfile)
                            });

                            if (response.ok) {
                                setProfileInfos({...profileInfos, ...updatedProfile});
                                setShowEditProfile(false);

                                // Update local storage
                                if (Platform.OS === "web") {
                                    localStorage.setItem('profile', JSON.stringify({...profileInfos, ...updatedProfile}));
                                } else {
                                    SecureStore.setItem('profile', JSON.stringify({...profileInfos, ...updatedProfile}));
                                }

                                showAlert({
                                    title: 'Success',
                                    message: 'Your profile has been updated.',
                                    buttons: [{ text: 'OK', onPress: () => {} }],
                                });
                            } else {
                                showAlert({
                                    title: 'Error',
                                    message: 'Failed to update profile. Please try again.',
                                    buttons: [{ text: 'OK', onPress: () => {} }],
                                });
                            }
                        } catch (error) {
                            console.error('Error updating profile:', error);
                            showAlert({
                                title: 'Error',
                                message: 'An error occurred while updating your profile.',
                                buttons: [{ text: 'OK', onPress: () => {} }],
                            });
                        }
                    };

                    // Function to pick images for post
                    const pickPostImage = async () => {
                        try {
                            const result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes: "images",
                                allowsMultipleSelection: true,
                                quality: 0.8,
                            });

                            if (!result.canceled) {
                                setSelectedPostImages(prevState => [...prevState, ...result.assets.map(asset => asset.uri)]);
                            }
                        } catch (error) {
                            console.error('Error picking image:', error);
                        }
                    };

                    // Function to render selected post images
                    const renderSelectedPostImages = () => {
                        if (!selectedPostImages || selectedPostImages.length === 0) return null;

                        return (
                            <View style={postStyles.selectedImagesContainer}>
                                <FlatList
                                    horizontal
                                    data={selectedPostImages}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={({ item, index }) => (
                                        <View style={postStyles.selectedImageWrapper}>
                                            <Image
                                                source={{ uri: item }}
                                                style={postStyles.selectedImage}
                                                contentFit="cover"
                                                transition={200}
                                            />
                                            <TouchableOpacity
                                                style={postStyles.removeImageButton}
                                                onPress={() => {
                                                    const newImages = [...selectedPostImages];
                                                    newImages.splice(index, 1);
                                                    setSelectedPostImages(newImages);
                                                }}
                                            >
                                                <Ionicons name="close" size={16} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    showsHorizontalScrollIndicator={false}
                                />
                            </View>
                        );
                    };

                    // Styles for post image upload
                    const postStyles = StyleSheet.create({
                        selectedImagesContainer: {
                            padding: 10,
                            backgroundColor: '#F8FAFC',
                            borderTopWidth: 1,
                            borderTopColor: '#E2E8F0',
                            marginBottom: 8,
                            borderRadius: 12,
                        },
                        selectedImageWrapper: {
                            marginRight: 10,
                            position: 'relative',
                        },
                        selectedImage: {
                            width: 70,
                            height: 70,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: 'rgba(203, 213, 225, 0.5)',
                        },
                        removeImageButton: {
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: 12,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1.5,
                            borderColor: 'white',
                        },
                        inputWrapper: {
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: '#F1F5F9',
                            borderRadius: 24,
                            paddingHorizontal: 12,
                            marginTop: 8,
                        },
                        attachButton: {
                            paddingVertical: 10,
                            paddingHorizontal: 4,
                            justifyContent: 'center',
                            alignItems: 'center',
                        },
                    });

                    return (
                        <>
                            <SafeAreaView className="bg-blue-50/50 dark:bg-dark-primary w-full h-full">
                                {/* Header with settings and search buttons */}
                                <View className="flex-row justify-between items-center px-4 pt-2 pb-2">
                                    <TouchableOpacity
                                        onPress={() => router.push('/settings')}
                                        className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="settings-outline" size={22} color="#3B82F6" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleAddBar}
                                        className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center"
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="search" size={22} color="#3B82F6" />
                                    </TouchableOpacity>
                                </View>
                                {showInput && (
                                    <View className="px-4 pt-2 pb-2 z-10">
                                        <View className="flex-row items-center bg-white/90 rounded-full px-4 py-2 border border-gray-200 shadow-sm">
                                            <Ionicons name="search" size={18} color="#64748B" />
                                            <TextInput
                                                onEndEditing={(t) => {
                                                    if (t.nativeEvent.text.trim().length === 0 && showInput) {
                                                        handleAddBar();
                                                    }
                                                }}
                                                autoCorrect={false}
                                                ref={input}
                                                onChangeText={(text) => {
                                                    if (text.trim().length > 0) {
                                                        setIsSearching(true);
                                                    }
                                                    else {
                                                        setIsSearching(false);
                                                    }

                                                    if (text.length >= 2 && text.length % 2 === 0) {
                                                        fetch(`${ip}/profile/search/${text}`, {
                                                            method: 'GET',
                                                            headers: {
                                                                "Authorization": `Bearer ${token.current}`
                                                            }
                                                        }).then(async (res) => {
                                                            if (res.ok) {
                                                                return res.json();
                                                            }
                                                            else {
                                                                return [];
                                                            }
                                                        }).then((data) => {
                                                            setSearchResults(data.filter((item) => item.username !== username.current));
                                                        })
                                                    }
                                                    else if (text.length < 2) {
                                                        setSearchResults([]);
                                                    }
                                                }}
                                                placeholder="Search for users..."
                                                placeholderTextColor="#94A3B8"
                                                autoCapitalize="none"
                                                className="flex-1 ml-2 text-gray-700 outline-none py-2"
                                                onSubmitEditing={(e) => {
                                                    if (e.nativeEvent.text.trim().length > 0 && searchResults.length > 0 && isSearching) {
                                                        input.current.focus();
                                                    }
                                                }}
                                            />
                                            <TouchableOpacity onPress={handleAddBar}>
                                                <Ionicons name="close" size={18} color="#64748B" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                                <View style={{display: isSearching ? "flex" : "none"}} className="h-full w-full bg-white dark:bg-dark-primary">
                                    <FlatList
                                        data={searchResults}
                                        ListEmptyComponent={() => (
                                            <View className="flex-1 items-center justify-center mt-10">
                                                <View className="w-20 h-20 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                                                    <Ionicons name="search" size={30} color="#3B82F6" />
                                                </View>
                                                <Text className="text-center text-xl font-semibold text-gray-800">No results</Text>
                                                <Text className="text-center text-gray-500 mt-2">Try a different search term</Text>
                                            </View>
                                        )}
                                        renderItem={(item) =>
                                        <View>
                                            <TouchableOpacity onPress={() => {
                                                router.navigate(`/${item.item.username}`);
                                                input.current.clear();
                                                handleAddBar();
                                            }} activeOpacity={0.6} className="flex-row justify-between items-center p-4 hover:bg-blue-50">
                                                <View className="flex-row items-center">
                                                    <Image source={{uri: item.item.profilePicturePath.split(",")[0]}} style={{width: 48, height: 48, borderRadius: 24}} className="bg-gray-200"></Image>
                                                    <View className="flex-col ml-3">
                                                        <Text className="text-gray-800 dark:text-dark-text font-bold text-lg">{item.item.name}</Text>
                                                        <Text className="text-gray-500 dark:text-dark-text text-sm">@{item.item.username}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            <View className="w-11/12 self-center">
                                                <View className="border-b border-gray-200"></View>
                                            </View>
                                        </View>
                                    }
                                    contentContainerStyle={{ paddingVertical: 10 }}
                                    />
                                </View>
                                <ScrollView
                                    scrollEventThrottle={400}
                                    ref={scrollView}
                                    contentContainerStyle={{
                                        paddingBottom: 40,
                                        maxWidth: isDesktop ? '1200px' : '100%',
                                        alignSelf: 'center',
                                        width: '100%'
                                    }}
                                    onScroll={async ({nativeEvent}) => {
                                        if (isCloseToBottom(nativeEvent)) {
                                            if (posts.length === 5) {
                                                const data = await fetch(`${ip}/profile/posts/all/${profileName.current}`, {
                                                    method: 'GET',
                                                    headers: {
                                                        "Authorization": `Bearer ${token.current}`
                                                    }
                                                });
                                                if (data.ok) {
                                                    const posts = await data.json();
                                                    setPosts(posts);
                                                }
                                            }
                                        }
                                    }}
                                >
                                    {/* Back button for navigation */}
                                    {profileName.current !== username.current && (
                                        <View className={`${isDesktop ? 'mx-auto max-w-4xl' : 'mx-4'} mt-4`}>
                                            <TouchableOpacity
                                                onPress={() => {

                                                    if(cachedProfileName.length === 0)
                                                    {
                                                        router.navigate("/profile")
                                                    } else {
                                                        router.navigate(`/${cachedProfileName.at(-2)}`);
                                                        setCachedProfileName(prevState => prevState.slice(0, -1));
                                                    }
                                                }}
                                                className="flex-row items-center"
                                                activeOpacity={0.7}
                                            >
                                                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                    <Ionicons name="arrow-back" size={18} color="#3B82F6" />
                                                </View>
                                                <Text className="text-blue-600 font-medium">Back</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    {/* Profile Header Card - Desktop Layout */}
                                    {isDesktop ? (
                                        <View className="flex-row mx-auto max-w-6xl mt-6">
                                            {/* Left column - Profile picture and gallery */}
                                            <View className="w-1/3 px-4">
                                                <View className="bg-white rounded-xl shadow-sm p-4">
                                                    <View className="w-full aspect-square rounded-xl mb-4 relative bg-transparent">
                                                        <TouchableOpacity
                                                            onPress={() => {setShowImageGallery(true); if (isDesktop) {setSelectedImage(profileInfos.profilePicturePath.split(",")[0]);}} }
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                backgroundColor: 'transparent',
                                                                position: 'relative'
                                                            }}
                                                        >
                                                            <Image
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    backgroundColor: 'transparent',
                                                                    borderRadius: 12,
                                                                }}
                                                                contentFit="cover"
                                                                alt="Profile picture"
                                                                source={{uri: profileInfos.profilePicturePath.split(",")[0]}}
                                                            />

                                                            {/* Icon positioned inside the TouchableOpacity */}
                                                            <View className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1">
                                                                <Ionicons name="images" size={18} color="white" />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>

                                                    {/* Action Buttons */}
                                                    <View className="py-3">
                                                        {profileName.current !== username.current ? (
                                                            <View className="space-y-2">
                                                                <TouchableOpacity
                                                                    onPress={() => router.navigate(`/chats/${profile}`)}
                                                                    activeOpacity={0.7}
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg py-3 px-4 shadow-sm"
                                                                >
                                                                    <View className="flex-row items-center justify-center">
                                                                        <Ionicons name="chatbubble" color="white" size={18} />
                                                                        <Text className="text-white font-medium ml-2">Message</Text>
                                                                    </View>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    onPress={() => setShowModal(true)}
                                                                    activeOpacity={0.7}
                                                                    className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-sm"
                                                                    style={{ position: 'relative' }}
                                                                >
                                                                    <View className="flex-row items-center justify-center">
                                                                        <Ionicons name="people" color="#3B82F6" size={18} />
                                                                        <Text className="text-gray-700 font-medium ml-2">Friends</Text>
                                                                    </View>
                                                                    {hasFriendRequests && profileName.current === username.current && (
                                                                        <View
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: -5,
                                                                                right: -5,
                                                                                backgroundColor: '#EF4444',
                                                                                width: 16,
                                                                                height: 16,
                                                                                borderRadius: 8,
                                                                                borderWidth: 2,
                                                                                borderColor: 'white',
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TouchableOpacity>
                                                            </View>
                                                        ) : (
                                                            <View className="space-y-2">
                                                                <TouchableOpacity
                                                                    onPress={initEditProfile}
                                                                    activeOpacity={0.7}
                                                                    className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg py-3 px-4 shadow-sm"
                                                                >
                                                                    <View className="flex-row items-center justify-center">
                                                                        <Ionicons name="pencil" color="white" size={18} />
                                                                        <Text className="text-white font-medium ml-2">Edit Profile</Text>
                                                                    </View>
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    onPress={() => setShowModal(true)}
                                                                    activeOpacity={0.7}
                                                                    className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-sm"
                                                                    style={{ position: 'relative' }}
                                                                >
                                                                    <View className="flex-row items-center justify-center">
                                                                        <Ionicons name="people" color="#3B82F6" size={18} />
                                                                        <Text className="text-gray-700 font-medium ml-2">Friends</Text>
                                                                    </View>
                                                                    {hasFriendRequests && profileName.current === username.current && (
                                                                        <View
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: -5,
                                                                                right: -5,
                                                                                backgroundColor: '#EF4444',
                                                                                width: 16,
                                                                                height: 16,
                                                                                borderRadius: 8,
                                                                                borderWidth: 2,
                                                                                borderColor: 'white',
                                                                            }}
                                                                        />
                                                                    )}
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Right column - Profile info */}
                                            <View className="w-2/3 px-4">
                                                <View className="bg-white rounded-xl shadow-sm overflow-hidden p-6">
                                                    <View className="flex-row items-center mb-4">
                                                        <Text className="text-gray-800 dark:text-dark-text font-bold text-3xl">{profileInfos.name}</Text>
                                                        <Text className="text-gray-500 ml-3 text-lg">@{profileName.current}</Text>
                                                    </View>

                                                    <View className="flex-row flex-wrap">
                                                        <View className="flex-row items-center mr-6 mb-3">
                                                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                                <Ionicons name="calendar" size={16} color="#3B82F6" />
                                                            </View>
                                                            <Text className="text-base font-medium text-gray-700 dark:text-dark-text">
                                                                {calculateAge(new Date(profileInfos?.dateOfBirth))} years old
                                                            </Text>
                                                        </View>

                                                        <View className="flex-row items-center mr-6 mb-3">
                                                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                                <Ionicons name="location" size={16} color="#3B82F6" />
                                                            </View>
                                                            <Text className="text-base font-medium text-gray-700 dark:text-dark-text">
                                                                {profileInfos.location}
                                                            </Text>
                                                        </View>

                                                        <View className="flex-row items-center mr-6 mb-3">
                                                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                                <Ionicons name="heart" size={16} color="#3B82F6" />
                                                            </View>
                                                            <Text className="text-base font-medium text-gray-700 dark:text-dark-text">
                                                                {profileInfos.hobbies}
                                                            </Text>
                                                        </View>

                                                        <View className="flex-row items-center mb-3">
                                                            <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                                <Ionicons name="people" size={16} color="#3B82F6" />
                                                            </View>
                                                            <Text className="text-base font-medium text-gray-700 dark:text-dark-text">
                                                                {profileInfos.inRelationship ? "In a relationship" : "Single"}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ) : (
                                        /* Mobile Layout */
                                        <View className="bg-white rounded-xl mx-4 mt-6 shadow-sm overflow-hidden">
                                            <View className="px-5 pt-6 pb-5">
                                                <View className="flex-row items-center justify-center mb-2">
                                                    <Text className="text-gray-800 dark:text-dark-text font-bold text-2xl">{profileInfos.name}</Text>
                                                    <Text className="text-gray-500 ml-2 text-sm">@{profileName.current}</Text>
                                                </View>

                                                <View className="flex-row justify-between mt-4">
                                                    <View className="flex-1 pr-4">
                                                        <FlatList
                                                            scrollEnabled={false}
                                                            data={[
                                                                {id: "age", icon: "calendar", value: `${calculateAge(new Date(profileInfos?.dateOfBirth))} years old`},
                                                                {id: "location", icon: "location", value: profileInfos.location},
                                                                {id: "hobbies", icon: "heart", value: profileInfos.hobbies},
                                                                {id: "relationshipStatus", icon: "people", value: profileInfos.inRelationship ? "In a relationship" : "Single"},
                                                            ]}
                                                            renderItem={({item}) => (
                                                                <View className="flex-row items-center mb-3">
                                                                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                                                                        <Ionicons name={item.icon} size={16} color="#3B82F6" />
                                                                    </View>
                                                                    <Text className="text-base font-medium text-gray-700 dark:text-dark-text" id={item.id}>{item.value}</Text>
                                                                </View>
                                                            )}
                                                        />
                                                    </View>

                                                    <View className="h-40 w-40 rounded-3xl overflow-hidden shadow-sm">
                                                        <TouchableOpacity
                                                            onPress={() => setShowImageGallery(true)}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                position: 'relative',
                                                                backgroundColor: 'transparent'
                                                            }}
                                                        >
                                                            <Image
                                                                style={{
                                                                    width: '100%',
                                                                    height: '100%',
                                                                    objectFit: "cover",
                                                                    backgroundColor: 'transparent'
                                                                }}
                                                                alt="Profile picture"
                                                                source={{uri: profileInfos.profilePicturePath.split(",")[0]}}
                                                            />
                                                            <View
                                                                className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1"
                                                                style={{ zIndex: 5 }}
                                                            >
                                                                <Ionicons name="images" size={18} color="white" />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Action Buttons */}
                                            <View className="px-4 py-4 bg-gray-50 border-t border-gray-100">
                                                {profileName.current !== username.current ? (
                                                    <View className={isDesktop ? 'space-y-2' : 'flex-row justify-between'}>
                                                        <TouchableOpacity
                                                            onPress={() => router.navigate(`/chats/${profile}`)}
                                                            activeOpacity={0.7}
                                                            className={`bg-blue-500 ${isDesktop ? 'mb-3' : 'flex-1 mr-2'} ${isDesktop ? 'rounded-lg' : 'rounded-full'} py-3 shadow-sm`}
                                                        >
                                                            <View className="flex-row items-center justify-center">
                                                                <Ionicons name="chatbubble" color="white" size={18} />
                                                                <Text className="text-white font-medium ml-2">Message</Text>
                                                            </View>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() => setShowModal(true)}
                                                            activeOpacity={0.7}
                                                            className={`bg-white border border-gray-200 ${isDesktop ? '' : 'flex-1 ml-2'} ${isDesktop ? 'rounded-lg' : 'rounded-full'} py-3 shadow-sm`}
                                                            style={{ position: 'relative' }}
                                                        >
                                                            <View className="flex-row items-center justify-center">
                                                                <Ionicons name="people" color="#3B82F6" size={18} />
                                                                <Text className="text-gray-700 font-medium ml-2">Friends</Text>
                                                            </View>
                                                            {hasFriendRequests && profileName.current === username.current && (
                                                                <View
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: -5,
                                                                        right: 10,
                                                                        backgroundColor: '#EF4444',
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: 8,
                                                                        borderWidth: 2,
                                                                        borderColor: 'white',
                                                                    }}
                                                                />
                                                            )}
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <View className={isDesktop ? 'space-y-2' : 'flex-row justify-between'}>
                                                        <TouchableOpacity
                                                            onPress={initEditProfile}
                                                            activeOpacity={0.7}
                                                            className={`bg-blue-500 ${isDesktop ? 'mb-3' : 'flex-1 mr-2'} ${isDesktop ? 'rounded-lg' : 'rounded-full'} py-3 shadow-sm`}
                                                        >
                                                            <View className="flex-row items-center justify-center">
                                                                <Ionicons name="pencil" color="white" size={18} />
                                                                <Text className="text-white font-medium ml-2">Edit Profile</Text>
                                                            </View>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            onPress={() => setShowModal(true)}
                                                            activeOpacity={0.7}
                                                            className={`bg-white border border-gray-200 ${isDesktop ? '' : 'flex-1 ml-2'} ${isDesktop ? 'rounded-lg' : 'rounded-full'} py-3 shadow-sm`}
                                                            style={{ position: 'relative' }}
                                                        >
                                                            <View className="flex-row items-center justify-center">
                                                                <Ionicons name="people" color="#3B82F6" size={18} />
                                                                <Text className="text-gray-700 font-medium ml-2">Friends</Text>
                                                            </View>
                                                            {hasFriendRequests && profileName.current === username.current && (
                                                                <View
                                                                    style={{
                                                                        position: 'absolute',
                                                                        top: -5,
                                                                        right: 10,
                                                                        backgroundColor: '#EF4444',
                                                                        width: 16,
                                                                        height: 16,
                                                                        borderRadius: 8,
                                                                        borderWidth: 2,
                                                                        borderColor: 'white',
                                                                    }}
                                                                />
                                                            )}
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                    <View className={`bg-white rounded-xl ${isDesktop ? 'mx-auto max-w-4xl' : 'mx-4'} mt-6 shadow-sm overflow-hidden`}>
                                        <View className={`flex-row justify-between ${isDesktop ? "space-x-20" : ""} items-center px-5 py-4 border-b border-gray-100`}>
                                            <Text className="text-gray-800 dark:text-dark-text font-bold text-xl">Posts</Text>
                                            {profileName.current === username.current &&
                                                <TouchableOpacity
                                                    onPress={createPost}
                                                    activeOpacity={0.7}
                                                    className="rounded-3xl px-6 bg-blue-500 p-2 shadow-sm"
                                                >
                                                    <Ionicons name="add" size={22} className="text-center" color="white" />
                                                </TouchableOpacity>
                                            }
                                        </View>
                                    </View>
                                    <FlatList
                                        keyExtractor={(items) => items.millis}
                                        scrollEnabled={false}
                                        ListEmptyComponent={
                                            <View className={`items-center justify-center mt-4 py-16 ${isDesktop ? 'mx-auto w-3/4 mt-7' : 'mx-4'} bg-white rounded-xl shadow-sm`}>
                                                <View className="w-16 h-16 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                                                    <Ionicons name="document-text-outline" size={28} color="#3B82F6" />
                                                </View>
                                                <Text className="text-gray-800 dark:text-dark-text text-center font-semibold text-lg">No posts yet</Text>
                                                <Text className="text-gray-500 text-center mt-1">Posts will appear here</Text>
                                            </View>
                                        }
                                        data={posts}
                                        style={{width: "100%"}}
                                        contentContainerStyle={{
                                            paddingBottom: 60,
                                            maxWidth: isDesktop ? '1200px' : '100%',
                                            alignSelf: 'center',
                                            width: '100%'
                                        }}
                                        renderItem={(items) => {
                                                  if(items.item.new) {
                                                      return (
                                                          <KeyboardAvoidingView
                                                              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                                              keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
                                                              className="w-full mx-4 mt-4"
                                                          >
                                                              <View className="bg-white border border-gray-200 min-h-20 p-4 rounded-xl shadow-sm">
                                                                  {renderSelectedPostImages()}

                                                                  <View style={postStyles.inputWrapper}>
                                                                      <TouchableOpacity
                                                                          onPress={pickPostImage}
                                                                          style={postStyles.attachButton}
                                                                          activeOpacity={0.7}
                                                                      >
                                                                          <Ionicons name="image-outline" size={24} color="#64748B" />
                                                                      </TouchableOpacity>

                                                                      <TextInput
                                                                          onChangeText={(text) => {
                                                                              scrollView.current.scrollToEnd();
                                                                              setPostInputText(text)
                                                                          }}
                                                                          onKeyPress={(key) => {
                                                                              if (key.nativeEvent.key === "Enter" && postInputText.trim().length > 0) {
                                                                                  sendPost();
                                                                              }
                                                                              else if (postInputText.trim().length === 0 && key.nativeEvent.key === "Enter") {
                                                                                  setPosts(cachedPosts.current);
                                                                              }
                                                                          }}
                                                                          ref={newPostInput}
                                                                          //onEndEditing={() => setPosts(cachedPosts.current)}
                                                                          multiline={true}
                                                                          placeholderTextColor="#9CA3AF"
                                                                          placeholder="What's on your mind?"
                                                                          className="flex-1 text-gray-800 outline-none p-2"
                                                                      />

                                                                      <TouchableOpacity
                                                                          activeOpacity={0.7}
                                                                          onPress={() => {
                                                                              if (postInputText.trim().length > 0 || selectedPostImages.length > 0) {
                                                                                  sendPost();
                                                                              }
                                                                          }}
                                                                          disabled={postInputText === '' && selectedPostImages.length === 0}
                                                                          style={{
                                                                              width: 36,
                                                                              height: 36,
                                                                              borderRadius: 18,
                                                                              backgroundColor: '#3B82F6',
                                                                              justifyContent: 'center',
                                                                              alignItems: 'center',
                                                                              marginLeft: 8,
                                                                          }}
                                                                          className="disabled:opacity-50"
                                                                      >
                                                                          <Ionicons name="send" size={18} color="white" />
                                                                      </TouchableOpacity>
                                                                  </View>
                                                              </View>

                                                              {/* Invisible view to ensure proper scrolling with keyboard */}
                                                              <View style={{ height: 200 }} />
                                                          </KeyboardAvoidingView>)
                                                  } else {
                                                      return (
                                                          <TouchableOpacity
                                                              onPress={() => openPostDetails(items.item)}
                                                              className={`w-full ${isDesktop ? "px-8" : "px-4"} mt-4`}
                                                              activeOpacity={0.8}
                                                          >
                                                              <View className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                                                                  <Post {...items.item} username={profileName.current} onLikePress={() => LikePost(items.item)} onCommentPress={() => openPostDetails(items.item)} onImagePress={(image) => {if(items.item.content.length > 1) {setShowPostImageGallery(true); setCurrentPostImage(image); setPostImageGallery(items.item.content)} else {openPostDetails(items.item)}}} />
                                                              </View>
                                                          </TouchableOpacity>
                                                      )
                                                  }
                                              }}/>
                                </ScrollView>
                            </SafeAreaView>
                            <Modal animationType="slide" visible={showModal} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowModal(false);}}>
                                <View className="bg-white dark:bg-dark-primary h-full w-full" style={isDesktop ? {maxWidth: 800, marginHorizontal: 'auto'} : {}}>
                                    {/* Header */}
                                    <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
                                        <View className="flex-row items-center">
                                            <Text className="text-2xl text-gray-800 dark:text-dark-text font-bold">Friends</Text>
                                            <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                                <Text className="text-blue-600 font-medium text-sm">{profileInfos.friends?.length || 0}</Text>
                                            </View>
                                        </View>

                                        <View className="flex-row">
                                            {profileName.current === username.current && (
                                                <TouchableOpacity
                                                    onPress={() => {setShowModal(false);setShowFriendRequests(true)}}
                                                    className="bg-blue-100 rounded-full p-2 mr-2 relative"
                                                >
                                                    <Ionicons name="person-add" size={22} color="#3B82F6" />
                                                    {hasFriendRequests && profileName.current === username.current && (
                                                        <View
                                                            style={{
                                                                position: 'absolute',
                                                                top: -5,
                                                                right: -5,
                                                                backgroundColor: '#EF4444',
                                                                width: 16,
                                                                height: 16,
                                                                borderRadius: 8,
                                                                borderWidth: 2,
                                                                borderColor: 'white',
                                                            }}
                                                        />
                                                    )}
                                                </TouchableOpacity>
                                            )}

                                            <TouchableOpacity
                                                onPress={() => setShowModal(false)}
                                                className="bg-gray-100 rounded-full p-2"
                                            >
                                                <Ionicons name="close" size={22} color="#64748B" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* Search Bar */}
                                    <View className="px-6 pt-4 pb-2">
                                        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                                            <Ionicons name="search" size={18} color="#64748B" />
                                            <TextInput
                                                onChangeText={(text) => {
                                                    if (text.length >= 1) {
                                                        setFriendsSearchResults(profileInfos.friends?.filter((friend) =>
                                                            friend.memberName.toLowerCase().includes(text.toLowerCase()) ||
                                                            friend.memberId.toLowerCase().includes(text.toLowerCase())
                                                        ));
                                                    } else if (text.length === 0) {
                                                        setFriendsSearchResults(profileInfos.friends ? profileInfos.friends : []);
                                                    }
                                                }}
                                                className="flex-1 ml-2 text-gray-700 outline-none"
                                                placeholder="Search friends..."
                                                placeholderTextColor="#94A3B8"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    {/* Friends List */}
                                    <FlatList
                                        className="px-4"
                                        data={friendsSearchResults}
                                        ListEmptyComponent={() => (
                                            <View className="flex-1 items-center justify-center py-16">
                                                <View className="w-20 h-20 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                                                    <Ionicons name="people" size={30} color="#3B82F6" />
                                                </View>
                                                <Text className="text-center text-xl font-semibold text-gray-800">No friends found</Text>
                                                <Text className="text-center text-gray-500 mt-2 max-w-xs">
                                                    {profileName.current === username.current
                                                        ? "Connect with others to build your network"
                                                        : `${profileInfos.name} hasn't added any friends yet`}
                                                </Text>
                                            </View>
                                        )}
                                        renderItem={(item) => (
                                            <View className="mb-2">
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setShowModal(false);
                                                        router.navigate(`/${item.item.memberId}`);
                                                    }}
                                                    activeOpacity={0.7}
                                                    className="flex-row justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                                                >
                                                    <View className="flex-row items-center">
                                                        <Image
                                                            source={{uri: item.item.memberProfilePicturePath.split(",")[0]}}
                                                            style={{width: 50, height: 50, borderRadius: 25}}
                                                            className="bg-gray-200"
                                                        />
                                                        <View className="flex-col ml-3">
                                                            <Text className="text-gray-800 dark:text-dark-text font-bold text-lg">{item.item.memberName}</Text>
                                                            <Text className="text-gray-500 dark:text-dark-text text-sm">@{item.item.memberId}</Text>
                                                        </View>
                                                    </View>

                                                    <View className="flex-row">
                                                        {item.item.memberId !== username.current && <TouchableOpacity
                                                            onPress={() => {setShowModal(false);router.navigate(`/chats/${item.item.memberId}`)}}
                                                            className="mr-2 w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
                                                        >
                                                            <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" />
                                                        </TouchableOpacity>}

                                                        {profileName.current === username.current && (
                                                            <TouchableOpacity
                                                                onPress={async() => {
                                                                    setShowModal(false)
                                                                    showAlert({
                                                                        title: `Remove Friend`,
                                                                        message: `Are you sure you want to remove ${item.item.memberName} from your friends?`,
                                                                        buttons: [
                                                                            {
                                                                                text: 'Cancel',
                                                                                onPress: () => console.log('Cancelled')
                                                                            },
                                                                            {
                                                                                text: 'Remove',
                                                                                onPress: async () => {
                                                                                    await removeFriend(item.item.memberId);
                                                                                }
                                                                            }
                                                                        ],
                                                                    });
                                                                }}
                                                                activeOpacity={0.7}
                                                                className="w-10 h-10 rounded-full bg-red-100 items-center justify-center"
                                                            >
                                                                <Ionicons name="person-remove-outline" size={18} color="#EF4444" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    />

                                    {/* Add Friend Button */}
                                    {profileName.current !== username.current && (
                                        <View className="px-6 bottom-safe border-t border-gray-100">
                                            <TouchableOpacity
                                                onPress={() => isFriendRequestReceived ? handleFriendRequest(profileName.current, true) : isFriendRequestSent ? null : AddFriend()}
                                                className="bg-blue-500 rounded-lg py-3 shadow-sm"
                                                activeOpacity={0.8}
                                            >
                                                <View className="flex-row items-center justify-center">
                                                    <Ionicons
                                                        name={isAdded ? "checkmark-circle" : isFriendRequestReceived ? "checkmark-sharp" : isFriendRequestSent ? "time" : "person-add-outline"}
                                                        size={20}
                                                        color="white"
                                                    />
                                                    <Animated.Text style={[{opacity: fadeAnim}, {color: 'white', fontWeight: '600', marginLeft: 8}]}>
                                                        {isAdded ? "Friend Added" : isFriendRequestSent ? "Request sent" : isFriendRequestReceived ? "Accept Request" : "Add Friend"}
                                                    </Animated.Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </Modal>

                            {/* Post Detail Modal */}
                            <Modal animationType="slide" visible={showPostModal} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowPostModal(false)}}>
                                <KeyboardAvoidingView
                                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                    style={{ flex: 1 }}
                                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                                >
                                    <View className="bg-white dark:bg-dark-primary h-full w-full" style={isDesktop ? {maxWidth: 800, marginHorizontal: 'auto'} : {}}>
                                        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-200">
                                            <TouchableOpacity
                                                onPress={() => setShowPostModal(false)}
                                                className="p-2 rounded-full"
                                            >
                                                <Ionicons name="arrow-back" size={24} color="#3B82F6" />
                                            </TouchableOpacity>
                                            <Text className="text-lg font-bold text-gray-800">Post</Text>
                                            <View style={{ width: 40 }} />
                                        </View>

                                        {selectedPost && (
                                            <>
                                                <FlatList
                                                    data={comments}
                                                    keyExtractor={(item) => item.id.toString()}
                                                    ListHeaderComponent={() => (
                                                        <View className="px-4">
                                                            <View className="bg-white rounded-xl shadow-sm overflow-hidden mt-4 mb-6">
                                                                <View className="p-4">
                                                                    <Text className="text-gray-800 font-medium text-lg mb-3">{selectedPost.title}</Text>

                                                                    {/* Post Images */}
                                                                    {selectedPost.content && selectedPost.content.length > 0 && (
                                                                        <View className="mb-4">
                                                                            {selectedPost.content.length === 1 ? (
                                                                                <Image
                                                                                    source={{uri: selectedPost.content[0]}}
                                                                                    style={{width: '100%', aspectRatio: 1, borderRadius: 10}}
                                                                                    contentFit="cover"
                                                                                />
                                                                            ) : (
                                                                                <FlatList
                                                                                    data={selectedPost.content}
                                                                                    numColumns={selectedPost.content.length === 2 ? 2 : selectedPost.content.length >= 4 ? 2 : 3}
                                                                                    scrollEnabled={false}
                                                                                    keyExtractor={(item, index) => index.toString()}
                                                                                    renderItem={({item, index}) => (
                                                                                        <TouchableOpacity activeOpacity={0.8} onPress={() => {if(selectedPost.content.length > 1) {setShowPostModal(false); setCachedPost(selectedPost); setShowPostImageGallery(true); setCurrentPostImage(item); setPostImageGallery(selectedPost.content)}}}
                                                                                            className="p-1"
                                                                                            style={{
                                                                                                width: selectedPost.content.length === 2 ? '50%' :
                                                                                                    selectedPost.content.length >= 4 ? '50%' : '33.33%',
                                                                                            }}
                                                                                        >
                                                                                            <View className="rounded-lg overflow-hidden" style={{aspectRatio: 1}}>
                                                                                                <Image
                                                                                                    source={{uri: item}}
                                                                                                    style={{width: '100%', height: '100%'}}
                                                                                                    contentFit="cover"
                                                                                                />
                                                                                            </View>
                                                                                        </TouchableOpacity>
                                                                                    )}
                                                                                />
                                                                            )}
                                                                        </View>
                                                                    )}

                                                                    <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                                                                        <View className="flex-row items-center">
                                                                            <Ionicons name="heart-outline" size={18} color="#6B7280" />
                                                                            <Text className="text-gray-500 ml-1">{selectedPost.likes || 0} likes</Text>
                                                                        </View>
                                                                        <Text className="text-gray-500 text-sm">{comments.length} comments</Text>
                                                                    </View>
                                                                </View>
                                                            </View>

                                                            <Text className="text-lg font-bold text-gray-800 mb-4">Comments</Text>

                                                            {comments.length === 0 && (
                                                                <View className="items-center py-8 bg-gray-50 rounded-lg mb-4">
                                                                    <Ionicons name="chatbubble-outline" size={40} color="#CBD5E1" />
                                                                    <Text className="text-gray-500 mt-2">No comments yet</Text>
                                                                    <Text className="text-gray-400 text-sm">Be the first to comment</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}
                                                    renderItem={({item}) => (
                                                        <View className="bg-gray-50 rounded-lg p-4 mx-4 mb-3">
                                                            <View className="flex-row justify-between items-center mb-2">
                                                                <TouchableOpacity activeOpacity={0.8} onPress={() => {setShowPostModal(false); router.navigate(`/${item.author}`)}} className="flex-row items-center">
                                                                    <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                                                                        <Image source={{uri: item.profilePicturePath.split(",")[0]}} style={{width: 30, height: 30, borderRadius: 15}}/>
                                                                    </View>
                                                                    <Text className="font-bold text-gray-800">{item.author}</Text>
                                                                </TouchableOpacity>
                                                            </View>
                                                            <Text className="text-gray-700">{item.text}</Text>
                                                        </View>
                                                    )}
                                                    contentContainerStyle={{ paddingBottom: 100 }}
                                                />

                                                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
                                                    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                                                        <TextInput
                                                            className="flex-1 text-gray-700 outline-none py-2"
                                                            placeholder="Add a comment..."
                                                            value={commentText}
                                                            onChangeText={setCommentText}
                                                            multiline
                                                            maxLength={500}
                                                        />
                                                        <TouchableOpacity
                                                            onPress={addComment}
                                                            disabled={commentText.trim() === ''}
                                                            className={`ml-2 p-2 rounded-full ${commentText.trim() === '' ? 'bg-gray-300' : 'bg-blue-500'}`}
                                                        >
                                                            <Ionicons name="send" size={18} color="white" />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </>
                                        )}
                                    </View>
                                </KeyboardAvoidingView>
                            </Modal>

                            <Modal visible={showPostImageGallery} transparent={true} onRequestClose={() => {setShowImageGallery(false);  if (cachedPost){setShowPostModal(true); setSelectedPost(cachedPost); setCachedPost(false)}}}>
                                <SafeAreaProvider>
                                    <SafeAreaView className="flex-1 bg-black">
                                        <Animated.View
                                            className="flex-row justify-between items-center px-6 py-4"
                                            style={{
                                                opacity: 1,
                                                transform: [{ translateY: 0 }]
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {setShowPostImageGallery(false);  if (cachedPost){setShowPostModal(true); setSelectedPost(cachedPost); setCachedPost(false)}}}
                                                className="w-10 h-10 rounded-full bg-gray-800/50 items-center justify-center"
                                            >
                                                <Ionicons name="arrow-back" size={22} color="white" />
                                            </TouchableOpacity>

                                            <View className="flex-row items-center">
                                                <Text className="text-white mr-4">
                                                    {postImageGallery.findIndex(img => img === currentPostImage) + 1}/{postImageGallery.length}
                                                </Text>
                                            </View>
                                        </Animated.View>

                                        <View className="flex-1 justify-center">
                                            <View className="absolute left-4 top-1/2 z-10">
                                                {postImageGallery.findIndex(img => img === currentPostImage) > 0 && (
                                                    <TouchableOpacity
                                                        className="w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                                                        onPress={() => {
                                                            const currentIndex = postImageGallery.findIndex(img => img === currentPostImage);
                                                            if (currentIndex > 0) {
                                                                setCurrentPostImage(postImageGallery[currentIndex - 1]);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons name="chevron-back" size={28} color="white" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>

                                            <Image
                                                source={{uri: currentPostImage}}
                                                style={{width: '100%', height: '80%'}}
                                                contentFit="contain"
                                                transition={300}
                                            />

                                            <View className="absolute right-4 top-1/2 z-10">
                                                {postImageGallery.findIndex(img => img === currentPostImage) < postImageGallery.length - 1 && (
                                                    <TouchableOpacity
                                                        className="w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                                                        onPress={() => {
                                                            const currentIndex = postImageGallery.findIndex(img => img === currentPostImage);
                                                            if (currentIndex < postImageGallery.length - 1) {
                                                                setCurrentPostImage(postImageGallery[currentIndex + 1]);
                                                            }
                                                        }}
                                                    >
                                                        <Ionicons name="chevron-forward" size={28} color="white" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>

                                        {/* Image pagination dots */}
                                        <View className="flex-row justify-center items-center py-2">
                                            {postImageGallery.map((image, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => setCurrentPostImage(image)}
                                                    className="mx-1"
                                                >
                                                    <View
                                                        style={{
                                                            width: image === currentPostImage ? 10 : 8,
                                                            height: image === currentPostImage ? 10 : 8,
                                                            borderRadius: 5,
                                                            backgroundColor: image === currentPostImage ? '#3B82F6' : 'rgba(255,255,255,0.5)',
                                                            transform: [{ scale: image === currentPostImage ? 1 : 0.8 }]
                                                        }}
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        {/* Image navigation */}
                                        <View className="px-6 py-4">
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                contentContainerStyle={{paddingHorizontal: 8}}
                                            >
                                                {postImageGallery.map((image, index) => (
                                                    <TouchableOpacity
                                                        key={index}
                                                        onPress={() => setCurrentPostImage(image)}
                                                        className="mr-3"
                                                        style={{
                                                            transform: [{ scale: image === currentPostImage ? 1.1 : 1 }]
                                                        }}
                                                    >
                                                        <Image
                                                            source={{uri: image}}
                                                            style={{
                                                                width: 60,
                                                                height: 60,
                                                                borderRadius: 8,
                                                                borderWidth: image === currentPostImage ? 3 : 0,
                                                                borderColor: '#3B82F6',
                                                                opacity: image === currentPostImage ? 1 : 0.6
                                                            }}
                                                            contentFit="cover"
                                                            transition={200}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </SafeAreaView>
                                </SafeAreaProvider>
                            </Modal>

                            {/* Image Gallery Modal */}
                            <Modal animationType="slide" visible={showImageGallery} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowImageGallery(false);}}>
                                <SafeAreaView className="bg-white h-full w-full" style={isDesktop ? {maxWidth: 1200, marginHorizontal: 'auto'} : {}}>
                                    {/* Header with controls */}
                                    <View className="flex-row justify-between items-center px-6 py-4">
                                        <TouchableOpacity
                                            onPress={() => setShowImageGallery(false)}
                                            className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center"
                                        >
                                            <Ionicons name="arrow-back" size={22} color="#3B82F6" />
                                        </TouchableOpacity>

                                        <Text className="text-gray-800 text-xl font-bold">Photo Gallery</Text>

                                        {profileName.current === username.current && (
                                            <TouchableOpacity
                                                className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center"
                                                onPress={() => addProfilePicture()}
                                            >
                                                <Ionicons name="add" size={22} color="#3B82F6" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Main content area */}
                                    <View className="flex-1">
                                        {/* Featured image - large display */}
                                        <View className="w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-sm">
                                            <Image
                                                source={{uri: profileImages[0]}}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                }}
                                                contentFit="cover"
                                            />

                                            <TouchableOpacity
                                                className="absolute inset-0 bg-black/10 items-center justify-center"
                                                onPress={() => setSelectedImage(profileImages[0])}
                                                activeOpacity={0.9}
                                            >
                                                <View className="bg-white/70 rounded-full p-4 shadow-md">
                                                    <Ionicons name="expand-outline" size={30} color="#3B82F6" />
                                                </View>
                                            </TouchableOpacity>

                                            {profileName.current === username.current && (
                                                <View className="absolute bottom-4 left-4 bg-blue-500 px-3 py-1 rounded-full shadow-sm">
                                                    <Text className="text-white font-medium">Profile Picture</Text>
                                                </View>
                                            )}
                                        </View>

                                        {/* Image carousel */}
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={{paddingHorizontal: 16}}
                                            className="mb-6"
                                        >
                                            {profileImages.map((image, index) => (
                                                <View key={index} className="mr-4 relative">
                                                    <TouchableOpacity
                                                        onPress={() => setSelectedImage(image)}
                                                        activeOpacity={0.9}
                                                    >
                                                        <Image
                                                            source={{uri: image}}
                                                            style={{
                                                                width: 120,
                                                                height: 120,
                                                                borderRadius: 12,
                                                                borderWidth: index === 0 ? 3 : 0,
                                                                borderColor: '#3B82F6',
                                                            }}
                                                            contentFit="cover"
                                                            className="shadow-sm"
                                                        />
                                                    </TouchableOpacity>

                                                    {profileName.current === username.current && (
                                                        <View className="absolute top-2 right-2 flex-row">
                                                            {index !== 0 && (
                                                                <TouchableOpacity
                                                                    className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 shadow-sm"
                                                                    onPress={() => {
                                                                        newMainProfilePicture(profileImages[index])
                                                                    }}
                                                                >
                                                                    <Ionicons name="star" size={16} color="#3B82F6" />
                                                                </TouchableOpacity>
                                                            )}

                                                            <TouchableOpacity
                                                                className="w-8 h-8 rounded-full bg-red-100 items-center justify-center shadow-sm"
                                                                onPress={() => {
                                                                    removeProfilePicture(profileImages[index])
                                                                }}
                                                            >
                                                                <Ionicons name="trash" size={16} color="#EF4444" />
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}

                                            {profileName.current === username.current && profileImages.length < 6 && (
                                                <TouchableOpacity
                                                    className="w-120 h-120 items-center justify-center bg-gray-100 rounded-xl border-2 border-dashed border-gray-300"
                                                    style={{width: 120, height: 120}}
                                                    onPress={() => addProfilePicture()}
                                                >
                                                    <Ionicons name="add" size={40} color="#3B82F6" />
                                                    <Text className="text-gray-600 mt-2">Add Photo</Text>
                                                </TouchableOpacity>
                                            )}
                                        </ScrollView>
                                    </View>

                                    {/* Fullscreen image modal */}
                                    {(selectedImage || isDesktop) && (
                                        <Modal visible={!!selectedImage || isDesktop} transparent={true} onRequestClose={() => setSelectedImage(null)}>
                                            <SafeAreaProvider>
                                            <SafeAreaView className="flex-1 bg-black">
                                                <Animated.View
                                                    className="flex-row justify-between items-center px-6 py-4"
                                                    style={{
                                                        opacity: 1,
                                                        transform: [{ translateY: 0 }]
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        onPress={() => isDesktop ? setShowImageGallery(false) : setSelectedImage(null)}
                                                        className="w-10 h-10 rounded-full bg-gray-800/50 items-center justify-center"
                                                    >
                                                        <Ionicons name="arrow-back" size={22} color="white" />
                                                    </TouchableOpacity>

                                                    <View className="flex-row items-center">
                                                        <Text className="text-white mr-4">
                                                            {profileImages.findIndex(img => img === selectedImage) + 1}/{profileImages.length}
                                                        </Text>

                                                        {profileName.current === username.current && (
                                                            <>
                                                                <TouchableOpacity
                                                                    className="w-10 h-10 rounded-full bg-blue-500/50 items-center justify-center mr-3"
                                                                    onPress={() => {
                                                                        // Set as profile picture
                                                                        const currentIndex = profileImages.findIndex(img => img === selectedImage);
                                                                        if (currentIndex !== 0 && currentIndex !== -1) {
                                                                            newMainProfilePicture(profileImages[currentIndex])
                                                                        }
                                                                    }}
                                                                >
                                                                    <Ionicons name="star" size={20} color="white" />
                                                                </TouchableOpacity>

                                                                <TouchableOpacity
                                                                    className="w-10 h-10 rounded-full bg-red-500/50 items-center justify-center"
                                                                    onPress={() => {
                                                                        // Remove image
                                                                        const currentIndex = profileImages.findIndex(img => img === selectedImage);
                                                                        if (currentIndex !== -1) {
                                                                            removeProfilePicture(profileImages[currentIndex])
                                                                        }
                                                                    }}
                                                                >
                                                                    <Ionicons name="trash" size={20} color="white" />
                                                                </TouchableOpacity>
                                                            </>
                                                        )}
                                                    </View>
                                                </Animated.View>

                                                <View className="flex-1 justify-center">
                                                    <View className="absolute left-4 top-1/2 z-10">
                                                        {profileImages.findIndex(img => img === selectedImage) > 0 && (
                                                            <TouchableOpacity
                                                                className="w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                                                                onPress={() => {
                                                                    const currentIndex = profileImages.findIndex(img => img === selectedImage);
                                                                    if (currentIndex > 0) {
                                                                        setSelectedImage(profileImages[currentIndex - 1]);
                                                                    }
                                                                }}
                                                            >
                                                                <Ionicons name="chevron-back" size={28} color="white" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>

                                                    <Image
                                                        source={{uri: selectedImage}}
                                                        style={{width: '100%', height: '80%'}}
                                                        contentFit="contain"
                                                        transition={300}
                                                    />

                                                    <View className="absolute right-4 top-1/2 z-10">
                                                        {profileImages.findIndex(img => img === selectedImage) < profileImages.length - 1 && (
                                                            <TouchableOpacity
                                                                className="w-12 h-12 rounded-full bg-black/30 items-center justify-center"
                                                                onPress={() => {
                                                                    const currentIndex = profileImages.findIndex(img => img === selectedImage);
                                                                    if (currentIndex < profileImages.length - 1) {
                                                                        setSelectedImage(profileImages[currentIndex + 1]);
                                                                    }
                                                                }}
                                                            >
                                                                <Ionicons name="chevron-forward" size={28} color="white" />
                                                            </TouchableOpacity>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Image pagination dots */}
                                                <View className="flex-row justify-center items-center py-2">
                                                    {profileImages.map((image, index) => (
                                                        <TouchableOpacity
                                                            key={index}
                                                            onPress={() => setSelectedImage(image)}
                                                            className="mx-1"
                                                        >
                                                            <View
                                                                style={{
                                                                    width: image === selectedImage ? 10 : 8,
                                                                    height: image === selectedImage ? 10 : 8,
                                                                    borderRadius: 5,
                                                                    backgroundColor: image === selectedImage ? '#3B82F6' : 'rgba(255,255,255,0.5)',
                                                                    transform: [{ scale: image === selectedImage ? 1 : 0.8 }]
                                                                }}
                                                            />
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>

                                                {/* Image navigation */}
                                                <View className="px-6 py-4">
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        contentContainerStyle={{paddingHorizontal: 8}}
                                                    >
                                                        {profileImages.map((image, index) => (
                                                            <TouchableOpacity
                                                                key={index}
                                                                onPress={() => setSelectedImage(image)}
                                                                className="mr-3"
                                                                style={{
                                                                    transform: [{ scale: image === selectedImage ? 1.1 : 1 }]
                                                                }}
                                                            >
                                                                <Image
                                                                    source={{uri: image}}
                                                                    style={{
                                                                        width: 60,
                                                                        height: 60,
                                                                        borderRadius: 8,
                                                                        borderWidth: image === selectedImage ? 3 : 0,
                                                                        borderColor: '#3B82F6',
                                                                        opacity: image === selectedImage ? 1 : 0.6
                                                                    }}
                                                                    contentFit="cover"
                                                                    transition={200}
                                                                />
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                </View>
                                            </SafeAreaView>
                                            </SafeAreaProvider>
                                        </Modal>
                                    )}
                                </SafeAreaView>
                            </Modal>

                            {/* Friend Requests Modal */}
                            <Modal animationType="slide" visible={showFriendRequests} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowFriendRequests(false);}}>
                                <View className="bg-white dark:bg-dark-primary h-full w-full" style={isDesktop ? {maxWidth: 800, marginHorizontal: 'auto'} : {}}>
                                    {Platform.OS === "web" && <TouchableOpacity className="p-3 bg-gray-100 rounded-full self-end mr-4 mt-4" onPress={() => setShowFriendRequests(false)}><Ionicons size={20} color="#3B82F6" name="close"/></TouchableOpacity>}

                                    <Text className="text-2xl text-gray-800 dark:text-dark-text text-center mt-6 font-bold">Friend Requests</Text>

                                    <FlatList
                                        data={friendRequests}
                                        keyExtractor={(item) => item.memberId}
                                        contentContainerStyle={{padding: 16}}
                                        renderItem={({item}) => (
                                            <View className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
                                                <TouchableOpacity onPress={() => {setShowFriendRequests(false); router.navigate(`/${item.memberId}`)}} className="flex-row items-center">
                                                    <Image
                                                        source={{uri: item.memberProfilePicturePath.split(',')[0]}}
                                                        style={{width: 50, height: 50, borderRadius: 25}}
                                                    />
                                                    <View className="ml-3 flex-1">
                                                        <Text className="font-bold text-gray-800">{item.memberName}</Text>
                                                        <Text className="text-gray-500">Wants to be your friend</Text>
                                                    </View>
                                                </TouchableOpacity>

                                                <View className="flex-row justify-end mt-4">
                                                    <TouchableOpacity
                                                        onPress={() => handleFriendRequest(item.memberId, false)}
                                                        className="bg-gray-200 rounded-full px-4 py-2 mr-3"
                                                    >
                                                        <Text className="text-gray-800 font-medium">Decline</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity
                                                        onPress={() => handleFriendRequest(item.memberId, true)}
                                                        className="bg-blue-500 rounded-full px-4 py-2"
                                                    >
                                                        <Text className="text-white font-medium">Accept</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                        ListEmptyComponent={
                                            <View className="items-center justify-center py-16">
                                                <View className="w-16 h-16 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                                                    <Ionicons name="person-outline" size={28} color="#3B82F6" />
                                                </View>
                                                <Text className="text-gray-800 text-center font-semibold text-lg">No friend requests</Text>
                                                <Text className="text-gray-500 text-center mt-1">You'll see requests here</Text>
                                            </View>
                                        }
                                    />
                                </View>
                            </Modal>

                            {/* Edit Profile Modal */}
                            <Modal animationType="slide" visible={showEditProfile} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowEditProfile(false);}}>
                                <View className="bg-white dark:bg-dark-primary h-full w-full" style={isDesktop ? {maxWidth: 800, marginHorizontal: 'auto'} : {}}>
                                    {Platform.OS === "web" && <TouchableOpacity className="p-3 bg-gray-100 rounded-full self-end mr-4 mt-4" onPress={() => setShowEditProfile(false)}><Ionicons size={20} color="#3B82F6" name="close"/></TouchableOpacity>}

                                    <Text className="text-2xl text-gray-800 dark:text-dark-text text-center mt-6 font-bold">Edit Profile</Text>

                                    <ScrollView className="flex-1 px-6 mt-6">
                                        <View className="mb-6">
                                            <Text className="text-gray-700 font-medium mb-2">Name</Text>
                                            <TextInput
                                                value={editName}
                                                onChangeText={setEditName}
                                                className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
                                                placeholder="Your name"
                                            />
                                        </View>

                                        <View className="mb-6">
                                            <Text className="text-gray-700 font-medium mb-2">Location</Text>
                                            <TextInput
                                                value={editLocation}
                                                onChangeText={setEditLocation}
                                                className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
                                                placeholder="Your location"
                                            />
                                        </View>

                                        <View className="mb-6">
                                            <Text className="text-gray-700 font-medium mb-2">Hobbies</Text>
                                            <TextInput
                                                value={editHobbies}
                                                onChangeText={setEditHobbies}
                                                className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-gray-800"
                                                placeholder="Your hobbies"
                                                multiline
                                                numberOfLines={3}
                                                style={{ textAlignVertical: 'top' }}
                                            />
                                        </View>

                                        <View className="mb-6 flex-row items-center">
                                            <Text className="text-gray-700 font-medium mr-4">In a relationship</Text>
                                            <TouchableOpacity
                                                onPress={() => setEditRelationship(!editRelationship)}
                                                className={`w-6 h-6 rounded-md border ${editRelationship ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'} justify-center items-center`}
                                            >
                                                {editRelationship && <Ionicons name="checkmark" size={16} color="white" />}
                                            </TouchableOpacity>
                                        </View>

                                        <View className="flex-row justify-end mt-8 mb-12">
                                            <TouchableOpacity
                                                onPress={() => setShowEditProfile(false)}
                                                className="bg-gray-200 rounded-full px-6 py-3 mr-4"
                                            >
                                                <Text className="text-gray-800 font-medium">Cancel</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={saveProfile}
                                                className="bg-blue-500 rounded-full px-6 py-3"
                                            >
                                                <Text className="text-white font-medium">Save</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </ScrollView>
                                </View>
                            </Modal>
                        </>
                    );
                }
