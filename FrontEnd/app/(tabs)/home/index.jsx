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
    ActivityIndicator
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

export default function Index() {
    const [selected, setSelected] = useState(0);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > 768);
    const [searchText, setSearchText] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const searchInput = useRef(null);

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
        // Navigate to post detail or open comment modal
        router.push(`/${post.username}?post=${post.id.millis}`);
    };

    const handleImagePress = (post, image) => {
        // Navigate to post detail or open image viewer
        if (post.content.length > 1) {
            // Open image gallery
            router.push(`/${post.username}?post=${post.id.millis}`);
        } else {
            // Open post detail
            router.push(`/${post.username}?post=${post.id.millis}`);
        }
    };

    const handleProfilePress = (username) => {
        router.push(`/${username}`);
    };

    const renderPostItem = ({ item }) => (
        <View className={`w-full ${isDesktop ? "px-8" : "px-4"} mt-4`}>
            <View className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                {/* Post Header with Profile Info */}
                <View className="flex-row items-center p-4">
                    <TouchableOpacity 
                        onPress={() => handleProfilePress(item.username)}
                        activeOpacity={0.7}
                    >
                        <Image 
                            source={{ uri: item.profilePicture }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            contentFit="cover"
                        />
                    </TouchableOpacity>
                    <View className="ml-3">
                        <TouchableOpacity onPress={() => handleProfilePress(item.username)}>
                            <Text className="text-gray-800 font-bold">{item.name}</Text>
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

    const renderContent = () => {
        switch (selected) {
            case 0: // Friends tab
                return (
                    <FlatList
                        data={posts}
                        renderItem={renderPostItem}
                        keyExtractor={item => item.id.millis}
                        contentContainerStyle={{
                            paddingBottom: 40,
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
            case 1: // Explore tab
                return (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-xl font-semibold text-gray-800 mb-2">Explore Coming Soon</Text>
                        <Text className="text-gray-500 text-center px-10">
                            We're working on bringing you exciting content to explore.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
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
                    <Text className="text-2xl font-bold text-blue-600">FaceLinked</Text>
                </View>

                <View className="flex-row">
                    <TouchableOpacity
                        onPress={toggleSearch}
                        className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center mr-2"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={22} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person" size={22} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            {showSearch && (
                <View className="px-4 pt-2 pb-2">
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

            {/* Tabs */}
            <View className="flex-row justify-around items-center border-b border-gray-200 bg-white">
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setSelected(0)}
                    className={`py-3 px-6 ${selected === 0 ? 'border-b-2 border-blue-500' : ''}`}
                >
                    <Text 
                        style={{
                            color: selected === 0 ? "#3B82F6" : "#64748B",
                            fontWeight: selected === 0 ? "700" : "500"
                        }}
                        className="text-base"
                    >
                        Friends
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => setSelected(1)}
                    className={`py-3 px-6 ${selected === 1 ? 'border-b-2 border-blue-500' : ''}`}
                >
                    <Text 
                        style={{
                            color: selected === 1 ? "#3B82F6" : "#64748B",
                            fontWeight: selected === 1 ? "700" : "500"
                        }}
                        className="text-base"
                    >
                        Explore
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Loading Indicator */}
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                    <Text className="text-gray-500 mt-4">Loading posts...</Text>
                </View>
            ) : (
                renderContent()
            )}
        </SafeAreaView>
    );
}
