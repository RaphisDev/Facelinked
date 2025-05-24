import "../../../global.css"
import {
    Animated,
    BackHandler,
    Dimensions,
    FlatList,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    StatusBar,
    SafeAreaView,
    Switch,
    ActivityIndicator,
    ScrollView
} from "react-native";
import Network from "../../../components/Entries/Network";
import {useEffect, useRef, useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useRouter, useSegments} from "expo-router";
import ip from "../../../components/AppManager";
import {Image} from "expo-image";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function Networks() {
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);
    const segments = useSegments();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > MOBILE_WIDTH_THRESHOLD);

    // Animation value for tab sliding
    const tabSlideAnimation = useRef(new Animated.Value(0)).current;

    const stateManager = new StateManager();

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState("");

    // Create Network Modal State
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [networkName, setNetworkName] = useState("");
    const [networkDescription, setNetworkDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [members, setMembers] = useState([]);
    const [memberInput, setMemberInput] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    const router = useRouter();
    const token = useRef(null);
    const username = useRef(null);

    // For the "Meet new People" page
    const translateX = useRef(new Animated.Value(0)).current;
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
    const peopleListRef = useRef(null);
    const [people, setPeople] = useState([
        { 
            id: 1, 
            name: 'John Doe', 
            username: 'johndoe', 
            profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
            age: 28,
            relationshipStatus: 'Single',
            hobbies: ['Photography', 'Hiking', 'Cooking']
        },
        { 
            id: 2, 
            name: 'Jane Smith', 
            username: 'janesmith', 
            profilePicture: 'https://randomuser.me/api/portraits/women/1.jpg',
            age: 24,
            relationshipStatus: 'In a relationship',
            hobbies: ['Reading', 'Yoga', 'Traveling']
        },
        { 
            id: 3, 
            name: 'Alex Johnson', 
            username: 'alexj', 
            profilePicture: 'https://randomuser.me/api/portraits/men/2.jpg',
            age: 32,
            relationshipStatus: 'Married',
            hobbies: ['Gaming', 'Cycling', 'Music']
        },
        { 
            id: 4, 
            name: 'Sarah Williams', 
            username: 'sarahw', 
            profilePicture: 'https://randomuser.me/api/portraits/women/2.jpg',
            age: 26,
            relationshipStatus: 'Single',
            hobbies: ['Dancing', 'Painting', 'Swimming']
        },
        { 
            id: 5, 
            name: 'Michael Brown', 
            username: 'michaelb', 
            profilePicture: 'https://randomuser.me/api/portraits/men/3.jpg',
            age: 30,
            relationshipStatus: 'Divorced',
            hobbies: ['Running', 'Cooking', 'Photography']
        },
    ]);

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            setWindowWidth(newWidth);
            setIsDesktop(newWidth > MOBILE_WIDTH_THRESHOLD);
        };

        // Initialize window width and desktop state immediately
        const initialWidth = Dimensions.get('window').width;
        setWindowWidth(initialWidth);
        setIsDesktop(initialWidth > MOBILE_WIDTH_THRESHOLD);

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
        if (selected === 0) {
            const loadNetworks = async () => {
                let networks = await AsyncStorage.getItem("networks") || [];
                if (networks.length !== 0) {
                    setNetworks(JSON.parse(networks));
                }
            }
            loadNetworks();
        }
    }, [segments, selected]);

    useEffect(() => {
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        }
        else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }
        setTimeout(() => {
            if (token.current === null) {router.replace("/")}
        })

        stateManager.setNetworkState(true);
    }, []);

    // Handle Android back button
    useEffect(() => {
        if (Platform.OS === 'android') {
            const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                if (currentPage === 1) {
                    // If in Meet People page, go back to Networks page
                    navigateToNetworks();
                    return true; // Prevent default back behavior
                }
                return false; // Let default back behavior happen
            });

            return () => backHandler.remove();
        }
    }, [currentPage]);

    // Create Network Functions
    const togglePrivate = () => {
        setIsPrivate(prev => !prev);
        if (!isPrivate) {
            setMembers([]);
        }
    };

    const addMember = () => {
        if (!memberInput.trim()) return;

        if (memberInput === username.current) {
            setCreateError("You cannot add yourself to a network.");
            return;
        }

        if (members.some(m => m.memberId === memberInput)) {
            setCreateError("This member is already in the network.");
            return;
        }

        setMembers([...members, { memberId: memberInput }]);
        setMemberInput("");
        setCreateError("");
    };

    const removeMember = (index) => {
        const newMembers = [...members];
        newMembers.splice(index, 1);
        setMembers(newMembers);
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.2,
                mediaTypes: "images"
            });

            if (!result.canceled) {
                setSelectedImage(result);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const createNetwork = async () => {
        if (!networkName.trim() || !networkDescription.trim()) {
            setCreateError("Please fill out all fields.");
            return;
        }

        if (isPrivate && members.length === 0) {
            setCreateError("Please add at least one member to a private network.");
            return;
        }

        setIsCreating(true);
        setCreateError("");

        try {
            let imageUrl = "";

            if (selectedImage !== null) {
                const bucketUrl = await fetch(`${ip}/networks/upload`, {
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + token.current
                    }
                });

                if (!bucketUrl.ok) {
                    setCreateError("Failed to upload image. Please try again later.");
                    setIsCreating(false);
                    return;
                }

                imageUrl = await bucketUrl.text();

                let tempImage;
                const manipResult = await ImageManipulator.manipulate(
                    selectedImage.assets[0].uri).resize({width: 500});
                const renderedImage = await manipResult.renderAsync();
                const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                tempImage = savedImage.uri;

                const response = await fetch(tempImage);
                const blob = await response.blob();

                await fetch(imageUrl, {
                    method: "PUT",
                    headers: {
                        "Content-Type": blob.type
                    },
                    body: blob,
                });
            }

            let currentMembers = [...members];
            currentMembers.push({ memberId: username.current });

            const response = await fetch(`${ip}/networks/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token.current
                },
                body: JSON.stringify({
                    name: networkName,
                    description: networkDescription,
                    private: isPrivate,
                    members: isPrivate ? currentMembers : [],
                    networkPicturePath: imageUrl ? imageUrl.split('?')[0] : ""
                })
            });

            if (!response.ok) {
                setCreateError("Failed to create network. Please try again later.");
                setIsCreating(false);
                return;
            }

            const data = await response.json();

            let networks = await AsyncStorage.getItem("networks") || [];
            if (networks.length !== 0) {
                networks = JSON.parse(networks);
            }

            await AsyncStorage.setItem("networks", JSON.stringify([
                ...networks, 
                {
                    networkId: data.id, 
                    name: networkName, 
                    description: networkDescription, 
                    creator: data.creatorId, 
                    private: isPrivate, 
                    memberCount: 1, 
                    members: data.members, 
                    networkPicturePath: imageUrl ? imageUrl.split('?')[0] : ""
                }
            ]));

            // Reset form and close modal
            setNetworkName("");
            setNetworkDescription("");
            setIsPrivate(false);
            setMembers([]);
            setSelectedImage(null);
            setCreateModalVisible(false);

            // Refresh networks list
            const loadedNetworks = await AsyncStorage.getItem("networks") || [];
            if (loadedNetworks.length !== 0) {
                setNetworks(JSON.parse(loadedNetworks));
            }

        } catch (error) {
            console.error("Error creating network:", error);
            setCreateError("An error occurred. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const resetCreateForm = () => {
        setNetworkName("");
        setNetworkDescription("");
        setIsPrivate(false);
        setMembers([]);
        setMemberInput("");
        setSelectedImage(null);
        setCreateError("");
        setIsCreating(false);
    };

    const handleSearch = (text) => {
        setSearchText(text);

        if (text.trim().length > 0) {
            setIsSearching(true);
        } else {
            setIsSearching(false);
        }

        if (text.length >= 2) {
            fetch(`${ip}/networks/search?searchName=${encodeURIComponent(text)}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token.current}`
                }
            }).then(async (res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    return [];
                }
            }).then((data) => {
                setSearchResults(data);
            })
        } else if (text.length < 2) {
            setSearchResults([]);
        }
    };

    const handleGesture = (event) => {
        if (event.nativeEvent.translationX < -50 && currentPage === 0) {
            // Swipe left to Friends tab instead of Meet People page
            // Animate the tab transition
            Animated.timing(tabSlideAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: false // We need to use false for layout animations
            }).start(() => {
                setSelected(1); // Switch to Friends tab after animation completes
            });
        } else if (event.nativeEvent.translationX > 50 && currentPage === 1) {
            // Swipe right to Networks page
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true
            }).start(() => {
                setCurrentPage(0);
            });
        } else if (event.nativeEvent.translationX > 50 && selected === 1) {
            // Swipe right from Friends tab to Favorites tab
            Animated.timing(tabSlideAnimation, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false
            }).start(() => {
                setSelected(0); // Switch to Favorites tab after animation completes
            });
        }
    };

    // Navigation functions for the people list
    const goToNextPerson = () => {
        if (currentPersonIndex < people.length - 1) {
            const nextIndex = currentPersonIndex + 1;

            // For desktop mode, we need to ensure the FlatList scrolls correctly
            if (isDesktop) {
                const cardWidth = Math.min(windowWidth, 1024);
                peopleListRef.current?.scrollToOffset({
                    offset: nextIndex * cardWidth,
                    animated: true
                });
            } else {
                peopleListRef.current?.scrollToIndex({
                    index: nextIndex,
                    animated: true
                });
            }

            setCurrentPersonIndex(nextIndex);
        }
    };

    const goToPreviousPerson = () => {
        if (currentPersonIndex > 0) {
            const prevIndex = currentPersonIndex - 1;

            // For desktop mode, we need to ensure the FlatList scrolls correctly
            if (isDesktop) {
                const cardWidth = Math.min(windowWidth, 1024);
                peopleListRef.current?.scrollToOffset({
                    offset: prevIndex * cardWidth,
                    animated: true
                });
            } else {
                peopleListRef.current?.scrollToIndex({
                    index: prevIndex,
                    animated: true
                });
            }

            setCurrentPersonIndex(prevIndex);
        }
    };

    // This function handles swipe gestures for the people list
    const handlePersonSwipe = (event) => {
        // Check if the swipe is significant enough
        if (Math.abs(event.nativeEvent.translationX) > 50) {
            // Determine swipe direction
            if (event.nativeEvent.translationX < 0 && currentPersonIndex < people.length - 1) {
                // Swipe left to next person
                const nextIndex = currentPersonIndex + 1;

                // For desktop mode, we need to ensure the FlatList scrolls correctly
                if (isDesktop) {
                    const cardWidth = Math.min(windowWidth, 1024);
                    peopleListRef.current?.scrollToOffset({
                        offset: nextIndex * cardWidth,
                        animated: true
                    });
                } else {
                    peopleListRef.current?.scrollToIndex({
                        index: nextIndex,
                        animated: true
                    });
                }

                setCurrentPersonIndex(nextIndex);
            } else if (event.nativeEvent.translationX > 0 && currentPersonIndex > 0) {
                // Swipe right to previous person
                const prevIndex = currentPersonIndex - 1;

                // For desktop mode, we need to ensure the FlatList scrolls correctly
                if (isDesktop) {
                    const cardWidth = Math.min(windowWidth, 1024);
                    peopleListRef.current?.scrollToOffset({
                        offset: prevIndex * cardWidth,
                        animated: true
                    });
                } else {
                    peopleListRef.current?.scrollToIndex({
                        index: prevIndex,
                        animated: true
                    });
                }

                setCurrentPersonIndex(prevIndex);
            }
        }
    };

    const navigateToMeetPeople = () => {
        Animated.timing(translateX, {
            toValue: -windowWidth,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setCurrentPage(1);
        });
    };

    const navigateToNetworks = () => {
        Animated.timing(translateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setCurrentPage(0);
        });
    };

    const renderNetworksContent = () => {
        return (
            <View style={styles.contentContainer}>
                {/* Page Header */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>Networks</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.headerActionButton}
                            onPress={() => {
                                resetCreateForm();
                                setCreateModalVisible(true);
                            }}
                        >
                            <Ionicons name="add-outline" size={24} color="#3B82F6" />
                        </TouchableOpacity>

                        {isDesktop ? (
                            <TouchableOpacity 
                                style={[styles.headerActionButton, styles.desktopActionButton]}
                                onPress={navigateToMeetPeople}
                            >
                                <Ionicons name="people-outline" size={24} color="#3B82F6" />
                                <Text style={styles.desktopActionButtonText}>Meet People</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={navigateToMeetPeople}
                            >
                                <Ionicons name="people-outline" size={24} color="#3B82F6" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Search Bar */}
                <View style={[
                    styles.searchContainer,
                    isDesktop && styles.desktopSearchContainer
                ]}>
                    <Ionicons name="search" size={isDesktop ? 24 : 20} color="#64748B" style={styles.searchIcon} />
                    <TextInput
                        style={[
                            styles.searchInput,
                            isDesktop && styles.desktopSearchInput
                        ]}
                        placeholder="Search networks..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={handleSearch}
                        className="outline-none"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity 
                            onPress={() => {
                                setSearchText("");
                                setIsSearching(false);
                                Keyboard.dismiss();
                            }}
                            style={styles.clearButton}
                        >
                            <Ionicons name="close-circle" size={isDesktop ? 22 : 18} color="#64748B" />
                        </TouchableOpacity>
                    )}
                </View>

                {isSearching ? (
                    <View style={[
                        styles.searchResultsContainer,
                        isDesktop && styles.desktopSearchResultsContainer
                    ]}>
                        <FlatList 
                            data={searchResults} 
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={() => (
                                <View style={styles.emptySearchContainer}>
                                    <Text style={[
                                        styles.emptySearchText,
                                        isDesktop && styles.desktopEmptySearchText
                                    ]}>No results found</Text>
                                    <Text style={[
                                        styles.emptySearchSubtext,
                                        isDesktop && styles.desktopEmptySearchSubtext
                                    ]}>Try a different search term</Text>
                                </View>
                            )}
                            renderItem={({item}) => (
                                <TouchableOpacity 
                                    onPress={() => {
                                        router.navigate(`/networks/${item.id}`);
                                        setSearchText("");
                                        setIsSearching(false);
                                        Keyboard.dismiss();
                                    }} 
                                    style={[
                                        styles.searchResultItem,
                                        isDesktop && styles.desktopSearchResultItem
                                    ]}
                                >
                                    <View style={[
                                        styles.searchResultImageContainer,
                                        isDesktop && styles.desktopSearchResultImageContainer
                                    ]}>
                                        {item.networkPicturePath ? (
                                            <Image 
                                                source={{uri: item.networkPicturePath}} 
                                                style={styles.searchResultImage}
                                                contentFit="cover"
                                                transition={150}
                                            />
                                        ) : (
                                            <View style={styles.searchResultImagePlaceholder}>
                                                <Ionicons name="people" size={isDesktop ? 24 : 20} color="#94A3B8" />
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.searchResultTextContainer}>
                                        <Text style={[
                                            styles.searchResultTitle,
                                            isDesktop && styles.desktopSearchResultTitle
                                        ]}>{item.name}</Text>
                                        <Text style={[
                                            styles.searchResultDescription,
                                            isDesktop && styles.desktopSearchResultDescription
                                        ]} numberOfLines={1}>{item.description}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={isDesktop ? 22 : 18} color="#64748B" />
                                </TouchableOpacity>
                            )}
                            ItemSeparatorComponent={() => <View style={[
                                styles.separator,
                                isDesktop && styles.desktopSeparator
                            ]} />}
                            contentContainerStyle={[
                                styles.searchResultsList,
                                isDesktop && styles.desktopSearchResultsList
                            ]}
                        />
                    </View>
                ) : (
                    <>
                        <Animated.View 
                            style={[
                                styles.tabContainer,
                                {
                                    transform: [
                                        {
                                            translateX: tabSlideAnimation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, -20] // Slide left when going to Friends tab
                                            })
                                        }
                                    ]
                                }
                            ]}
                        >
                            <TouchableOpacity 
                                style={[styles.tabButton, selected === 0 && styles.activeTabButton]} 
                                onPress={() => {
                                    // Animate back to Favorites tab
                                    Animated.timing(tabSlideAnimation, {
                                        toValue: 0,
                                        duration: 300,
                                        useNativeDriver: false
                                    }).start();
                                    setSelected(0);
                                }}
                            >
                                <Animated.View style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    opacity: tabSlideAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 0.6] // Fade out when going to Friends tab
                                    })
                                }}>
                                    <Ionicons 
                                        name="heart" 
                                        size={20} 
                                        color={selected === 0 ? "#3B82F6" : "#64748B"} 
                                        style={styles.tabIcon} 
                                    />
                                    <Text style={[styles.tabText, selected === 0 && styles.activeTabText]}>Favorites</Text>
                                </Animated.View>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[styles.tabButton, selected === 1 && styles.activeTabButton]} 
                                onPress={() => {
                                    // Animate to Friends tab
                                    Animated.timing(tabSlideAnimation, {
                                        toValue: 1,
                                        duration: 300,
                                        useNativeDriver: false
                                    }).start();
                                    setSelected(1);
                                }}
                            >
                                <Animated.View style={{ 
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    opacity: tabSlideAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.6, 1] // Fade in when going to Friends tab
                                    })
                                }}>
                                    <Ionicons 
                                        name="people" 
                                        size={20} 
                                        color={selected === 1 ? "#3B82F6" : "#64748B"} 
                                        style={styles.tabIcon} 
                                    />
                                    <Text style={[styles.tabText, selected === 1 && styles.activeTabText]}>Friends</Text>
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{
                            flexDirection: 'row',
                            width: windowWidth * 2,
                            transform: [
                                {
                                    translateX: tabSlideAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, -windowWidth] // Slide content left when going to Friends tab
                                    })
                                }
                            ]
                        }}>
                            {/* Favorites Tab Content */}
                            <View style={{ width: windowWidth, marginLeft: -16 }}>
                                <FlatList 
                                    data={favoriteNetworks}
                                    keyExtractor={(item) => item.networkId.toString()}
                                    renderItem={(items) => (
                                        <Network 
                                            id={items.item.networkId} 
                                            network={items.item.name} 
                                            networkPicturePath={items.item.networkPicturePath} 
                                            description={items.item.description} 
                                            member={items.item.memberCount} 
                                            isPrivate={items.item.private}
                                            isDesktop={isDesktop}
                                        />
                                    )}
                                    ListEmptyComponent={() => (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="heart-outline" size={60} color="#CBD5E1" style={styles.emptyIcon} />
                                            <Text style={styles.emptyText}>No favorite networks</Text>
                                            <Text style={styles.emptySubtext}>Networks you favorite will appear here</Text>
                                        </View>
                                    )}
                                    contentContainerStyle={styles.networksList}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>

                            {/* Friends Tab Content */}
                            <View style={{ width: windowWidth }}>
                                <FlatList 
                                    data={[]} // Replace with actual friends networks data
                                    keyExtractor={(item) => item.networkId.toString()}
                                    renderItem={(items) => (
                                        <Network 
                                            id={items.item.networkId} 
                                            network={items.item.name} 
                                            networkPicturePath={items.item.networkPicturePath} 
                                            description={items.item.description} 
                                            creator={items.item.creatorId} 
                                            isPrivate={items.item.private}
                                            isDesktop={isDesktop}
                                        />
                                    )}
                                    ListEmptyComponent={() => (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="people-outline" size={60} color="#CBD5E1" style={styles.emptyIcon} />
                                            <Text style={styles.emptyText}>No friend networks</Text>
                                            <Text style={styles.emptySubtext}>Networks created by your friends will appear here</Text>
                                        </View>
                                    )}
                                    contentContainerStyle={styles.networksList}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>
                        </Animated.View>
                    </>
                )}
            </View>
        );
    };

    const renderMeetPeopleContent = () => {
        return (
            <View style={styles.meetPeopleContainer}>
                <View style={styles.meetPeopleHeader}>
                    <TouchableOpacity 
                        style={[
                            styles.backButton,
                            isDesktop && { width: 'auto', paddingHorizontal: 16 }
                        ]}
                        onPress={navigateToNetworks}
                    >
                        <Ionicons name="arrow-back" size={24} color="#3B82F6" />
                        {isDesktop && <Text style={styles.desktopBackButtonText}>Back to Networks</Text>}
                    </TouchableOpacity>
                    <Text style={styles.meetPeopleTitle}>Meet New People</Text>
                </View>

                <View style={{flex: 1}}>
                    <PanGestureHandler onGestureEvent={handlePersonSwipe}>
                        <Animated.View style={{flex: 1}}>
                            <FlatList
                                ref={peopleListRef}
                                data={people}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.id.toString()}
                                onMomentumScrollEnd={(e) => {
                                    const cardWidth = isDesktop ? Math.min(windowWidth, 1024) : windowWidth;
                                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
                                    setCurrentPersonIndex(newIndex);
                                }}
                                renderItem={({item}) => (
                                    <View style={[
                                        styles.personCard, 
                                        {width: isDesktop ? Math.min(windowWidth, 1024) : windowWidth}
                                    ]}>
                                        <View style={styles.personImageContainer}>
                                            <Image 
                                                source={{uri: item.profilePicture}} 
                                                style={styles.personImage}
                                                contentFit="cover"
                                                transition={200}
                                            />
                                        </View>
                                        <Text style={styles.personName}>{item.name}</Text>
                                        <Text style={styles.personUsername}>@{item.username}</Text>

                                        <View style={styles.personInfoBox}>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>{item.age} years old</Text>
                                            </View>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="heart-outline" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>{item.relationshipStatus}</Text>
                                            </View>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="star-outline" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>Hobbies: {item.hobbies.join(', ')}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.personActions}>
                                            <TouchableOpacity style={styles.messageButton}>
                                                <Ionicons name="chatbubble" size={20} color="white" style={styles.actionButtonIcon} />
                                                <Text style={styles.actionButtonText}>Message</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={styles.addFriendButton}>
                                                <Ionicons name="person-add" size={20} color="white" style={styles.actionButtonIcon} />
                                                <Text style={styles.actionButtonText}>Add Friend</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity 
                                            style={styles.viewProfileButton}
                                            onPress={() => router.navigate(`/${item.username}`)}
                                        >
                                            <Text style={styles.viewProfileText}>View Profile</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </Animated.View>
                    </PanGestureHandler>
                </View>


                <View style={styles.swipeHintContainer}>
                    <Ionicons name="swap-horizontal" size={20} color="#94A3B8" />
                    <Text style={styles.swipeHintText}>Swipe to see more people</Text>
                </View>

                <View style={styles.navigationButtonsContainer}>
                    <TouchableOpacity 
                        style={[
                            styles.navigationButton, 
                            currentPersonIndex === 0 && styles.disabledButton
                        ]}
                        onPress={goToPreviousPerson}
                        disabled={currentPersonIndex === 0}
                    >
                        <Ionicons name="chevron-back" size={24} color={currentPersonIndex === 0 ? "#CBD5E1" : "#3B82F6"} />
                        <Text style={[
                            styles.navigationButtonText,
                            currentPersonIndex === 0 && styles.disabledButtonText
                        ]}>Previous</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[
                            styles.navigationButton, 
                            currentPersonIndex === people.length - 1 && styles.disabledButton
                        ]}
                        onPress={goToNextPerson}
                        disabled={currentPersonIndex === people.length - 1}
                    >
                        <Text style={[
                            styles.navigationButtonText,
                            currentPersonIndex === people.length - 1 && styles.disabledButtonText
                        ]}>Next</Text>
                        <Ionicons name="chevron-forward" size={24} color={currentPersonIndex === people.length - 1 ? "#CBD5E1" : "#3B82F6"} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Create Network Modal
    const renderCreateNetworkModal = () => (
        <Modal
            visible={isCreateModalVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setCreateModalVisible(false)}
        >
            <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={styles.modalOverlay}>
                <View
                    style={styles.modalOverlay} 
                >
                    <View 
                        style={styles.createModalContent}
                        onStartShouldSetResponder={() => true}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Network</Text>
                            <TouchableOpacity 
                                onPress={() => setCreateModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.createFormContainer}>
                            {createError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{createError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Network Name</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder="Enter network name"
                                    placeholderTextColor="#9CA3AF"
                                    value={networkName}
                                    onChangeText={setNetworkName}
                                    className="outline-none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Description</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    placeholder="Enter network description"
                                    placeholderTextColor="#9CA3AF"
                                    value={networkDescription}
                                    onChangeText={setNetworkDescription}
                                    multiline
                                    numberOfLines={3}
                                    className="outline-none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <View style={styles.switchContainer}>
                                    <Text style={styles.formLabel}>Private Network</Text>
                                    <Switch
                                        trackColor={{false: '#CBD5E1', true: '#93C5FD'}}
                                        thumbColor={isPrivate ? '#3B82F6' : '#f4f3f4'}
                                        ios_backgroundColor="#CBD5E1"
                                        onValueChange={togglePrivate}
                                        value={isPrivate}
                                    />
                                </View>
                                <Text style={styles.helperText}>
                                    {isPrivate 
                                        ? "Only invited members can join this network" 
                                        : "Anyone can find and join this network"}
                                </Text>
                            </View>

                            {isPrivate && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>Add Members</Text>
                                    <View style={styles.addMemberContainer}>
                                        <TextInput
                                            style={styles.memberInput}
                                            placeholder="Enter username"
                                            placeholderTextColor="#9CA3AF"
                                            value={memberInput}
                                            onChangeText={setMemberInput}
                                            autoCapitalize="none"
                                            className="outline-none"
                                        />
                                        <TouchableOpacity 
                                            style={styles.addMemberButton}
                                            onPress={addMember}
                                        >
                                            <Ionicons name="add" size={24} color="white" />
                                        </TouchableOpacity>
                                    </View>

                                    {members.length > 0 && (
                                        <View style={styles.membersListContainer}>
                                            <Text style={styles.membersListTitle}>Members to invite:</Text>
                                            {members.map((member, index) => (
                                                <View key={index} style={styles.memberItem}>
                                                    <Text style={styles.memberName}>{member.memberId}</Text>
                                                    <TouchableOpacity 
                                                        style={styles.removeMemberButton}
                                                        onPress={() => removeMember(index)}
                                                    >
                                                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Network Image</Text>
                                <TouchableOpacity 
                                    style={styles.imagePickerButton}
                                    onPress={pickImage}
                                >
                                    {selectedImage ? (
                                        <Image 
                                            source={{ uri: selectedImage.assets[0].uri}}
                                            style={styles.selectedNetworkImage}
                                            aspectRatio={1}
                                            contentFit="cover"
                                            transition={200}
                                        />
                                    ) : (
                                        <View style={styles.imagePickerPlaceholder}>
                                            <Ionicons name="image-outline" size={40} color="#94A3B8" />
                                            <Text style={styles.imagePickerText}>Upload Image</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setCreateModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                style={[
                                    styles.createButton,
                                    (isCreating || !networkName.trim() || !networkDescription.trim()) && styles.disabledButton
                                ]}
                                onPress={createNetwork}
                                disabled={isCreating || !networkName.trim() || !networkDescription.trim()}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={styles.createButtonText}>Create Network</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </BlurView>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <GestureHandlerRootView style={{flex: 1}}>
                {isDesktop ? (
                    // Desktop layout - centered content with max width
                    <View style={styles.desktopContainer}>
                        <View style={styles.desktopContent}>
                            {currentPage === 0 ? renderNetworksContent() : renderMeetPeopleContent()}
                        </View>
                    </View>
                ) : (
                    // Mobile layout - swipeable view
                    <PanGestureHandler onGestureEvent={handleGesture}>
                        <Animated.View 
                            style={[
                                styles.container,
                                {
                                    flexDirection: 'row',
                                    width: windowWidth * 2,
                                    transform: [{ translateX }]
                                }
                            ]}
                        >
                            <View style={{width: windowWidth}}>
                                {renderNetworksContent()}
                            </View>
                            <View style={{width: windowWidth}}>
                                {renderMeetPeopleContent()}
                            </View>
                        </Animated.View>
                    </PanGestureHandler>
                )}
            </GestureHandlerRootView>

            {renderCreateNetworkModal()}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 0, // Remove extra padding, use insets instead
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    // Desktop styles
    desktopContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
    },
    desktopContent: {
        width: '100%',
        maxWidth: 1024, // Similar to max-w-7xl in Tailwind
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 20,
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    pageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    pageTitle: {
        fontSize: 20, // Smaller font size to match chats and profiles
        fontWeight: '600',
        color: '#1E293B',
    },
    headerActions: {
        flexDirection: 'row',
    },
    headerActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    desktopActionButton: {
        width: 'auto',
        paddingHorizontal: 16,
        flexDirection: 'row',
    },
    desktopActionButtonText: {
        color: '#3B82F6',
        fontWeight: '500',
        marginLeft: 8,
    },

    // Create Network Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
    },
    createModalContent: {
        width: '95%', // Wider to fill more of the screen
        maxWidth: 600, // Larger maximum width
        maxHeight: '95%', // Taller to fill more of the screen
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
    },
    closeButton: {
        padding: 4,
    },
    createFormContainer: {
        padding: 16,
        maxHeight: 500,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    errorText: {
        color: '#B91C1C',
        fontSize: 14,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 8,
    },
    formInput: {
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#334155',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    helperText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    addMemberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberInput: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#334155',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginRight: 8,
    },
    addMemberButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    membersListContainer: {
        marginTop: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    membersListTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#64748B',
        marginBottom: 8,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    memberName: {
        fontSize: 14,
        color: '#334155',
    },
    removeMemberButton: {
        padding: 4,
    },
    imagePickerButton: {
        width: '100%',
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
    },
    imagePickerPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerText: {
        fontSize: 16,
        color: '#64748B',
        marginTop: 8,
    },
    selectedNetworkImage: {
        width: '100%',
        height: '100%',
        alignSelf: "center",
        borderRadius: 12,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginRight: 8,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    createButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        alignItems: 'center',
    },
    createButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    disabledButton: {
        backgroundColor: '#93C5FD',
        opacity: 0.7,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    desktopSearchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        marginBottom: 24,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        padding: 0,
    },
    desktopSearchInput: {
        fontSize: 18,
        paddingVertical: 2,
    },
    clearButton: {
        padding: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    activeTabButton: {
        backgroundColor: '#EFF6FF',
    },
    tabIcon: {
        marginRight: 6,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
    },
    activeTabText: {
        color: '#3B82F6',
        fontWeight: '600',
    },
    networksList: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 150,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    searchResultsContainer: {
        flex: 1,
    },
    desktopSearchResultsContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    searchResultsList: {
        paddingTop: 8,
    },
    desktopSearchResultsList: {
        paddingTop: 12,
        paddingHorizontal: 8,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    desktopSearchResultItem: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        marginVertical: 4,
    },
    searchResultImageContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    desktopSearchResultImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        marginRight: 16,
    },
    searchResultImage: {
        width: '100%',
        height: '100%',
    },
    searchResultImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchResultTextContainer: {
        flex: 1,
    },
    searchResultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    desktopSearchResultTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchResultDescription: {
        fontSize: 14,
        color: '#64748B',
    },
    desktopSearchResultDescription: {
        fontSize: 15,
    },
    separator: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 4,
    },
    desktopSeparator: {
        marginVertical: 8,
    },
    emptySearchContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptySearchText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
        marginBottom: 8,
    },
    desktopEmptySearchText: {
        fontSize: 22,
    },
    emptySearchSubtext: {
        fontSize: 14,
        color: '#94A3B8',
    },
    desktopEmptySearchSubtext: {
        fontSize: 16,
    },

    // Meet People styles
    meetPeopleContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    meetPeopleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexDirection: 'row',
    },
    desktopBackButtonText: {
        color: '#3B82F6',
        fontWeight: '500',
        marginLeft: 8,
    },
    meetPeopleTitle: {
        fontSize: 20, // Smaller font size to match chats and profiles
        fontWeight: '600',
        color: '#1E293B',
    },
    personCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    personImageContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        borderWidth: 3,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    personImage: {
        width: '100%',
        height: '100%',
    },
    personName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    personUsername: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 16,
    },
    personInfoBox: {
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        padding: 16,
        width: '90%',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    personInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoIcon: {
        marginRight: 8,
    },
    personInfoText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    personActions: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        marginBottom: 20,
    },
    messageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    addFriendButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonIcon: {
        marginRight: 8,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    viewProfileButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: '#3B82F6',
        borderRadius: 12,
    },
    viewProfileText: {
        color: '#3B82F6',
        fontWeight: '600',
        fontSize: 16,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#CBD5E1',
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: '#3B82F6',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    swipeHintText: {
        fontSize: 14,
        color: '#94A3B8',
        marginLeft: 6,
    },
    navigationButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginBottom: 20,
    },
    navigationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    navigationButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#3B82F6',
        marginHorizontal: 4,
    },
    disabledButtonText: {
        color: '#CBD5E1',
    }
});
