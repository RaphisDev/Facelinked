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
    ScrollView, RefreshControl
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
import {GestureHandlerRootView, PanGestureHandler, State} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import asyncStorage from "@react-native-async-storage/async-storage";
import {showAlert} from "../../../components/PopUpModalView";
import {useTranslation} from "react-i18next";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function Networks() {
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);
    const [friendNetworks, setFriendNetworks] = useState([]);
    const segments = useSegments();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > MOBILE_WIDTH_THRESHOLD);

    // Animation value for tab sliding
    const tabSlideAnimation = useRef(new Animated.Value(0)).current;

    const stateManager = new StateManager();

    const [allFriendNetworksFetched, setAllFriendNetworksFetched] = useState(false);
    const [allMeetNewPeopleFetched, setAllMeetNewPeopleFetched] = useState(false);

    const {t} = useTranslation();

    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [refreshingFriends, setRefreshingFriend] = useState(false);

    // Create Network Modal State
    const [isCreateModalVisible, setCreateModalVisible] = useState(false);
    const [networkName, setNetworkName] = useState("");
    const [networkDescription, setNetworkDescription] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [members, setMembers] = useState([]);
    const [friendsSearch, setFriendsSearch] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Friends list for network invitation
    const [friendsList, setFriendsList] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [loadingFriends, setLoadingFriends] = useState(false);

    const [showFriends, setShowFriends] = useState(false);
    const [friends, setSelectedFriendsMeetNewPeople] = useState([]);
    const [friendsSearchResults, setFriendsSearchResults] = useState([]);

    const router = useRouter();
    const token = useRef(null);
    const username = useRef(null);

    // For the "Meet new People" page
    const translateX = useRef(new Animated.Value(0)).current;
    const [currentPage, setCurrentPage] = useState(0);
    const [currentPersonIndex, setCurrentPersonIndex] = useState(0);
    const peopleListRef = useRef(null);
    const [people, setPeople] = useState([]);

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
                fetchFavoriteNetworks()
            }
            loadNetworks();
        } else if (selected === 1) {
            const loadFriends = async () => {
                setLoadingFriends(true);
                fetchFriendNetworks();
            }
            loadFriends();
        }
    }, [segments, selected]);

    useEffect(() => {
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        } else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }
        setTimeout(() => {
            if (token.current === null) {
                router.replace("/")
            }
        })
        loadPeople()

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

    const loadPeople = async () => {
        if (allMeetNewPeopleFetched) {
            return;
        }

        try {
            const response = await fetch(`${ip}/networks/meetnewpeople`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`},
            });
            if (response.ok) {
                const data = await response.json();
                setPeople(prevState => {
                    const existingPeople = new Set(prevState.map(people => people.username));
                    const uniquePeople = data.filter(people => !existingPeople.has(people.username));
                    if (uniquePeople.length === 0) {
                        setAllMeetNewPeopleFetched(true);
                    }
                    return prevState.concat(uniquePeople.map(person => {
                        return {
                            ...person,
                            profilePicturePath: person.profilePicturePath.split(",")[0] ,
                            age: calculateAge(new Date(person.dateOfBirth)),
                            relationshipStatus: person.inRelationship ? t("in.relationship") : t("single"),
                            isFriend: false,
                        }
                    }));
                });
            }
        } catch (error) {
            console.error("Error fetching people:", error);
        }
    }

    function calculateAge(birthDate) {
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

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
                    favoriteMembers: [username.current],
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
            //Doch fetchFavoriteNetworks()?

        } catch (error) {
            console.error("Error creating network:", error);
            setCreateError("An error occurred. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchFavoriteNetworks();
    };

    const onRefreshFriends = () => {
        setRefreshingFriend(true);
        setAllFriendNetworksFetched(false);
        fetchFriendNetworks();
    }

    async function fetchFavoriteNetworks() {
        try {
            const response = await fetch(`${ip}/networks/favoriteNetworks`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`
                }
            });
            if (response.ok) {
                let data = await response.json();
                data.forEach(network => {
                    network.networkId = network.id;
                })
                setNetworks(data);
                await asyncStorage.setItem("networks", JSON.stringify(data));
            } else {
                let networks = await AsyncStorage.getItem("networks") || [];
                if (networks.length !== 0) {
                    setNetworks(JSON.parse(networks));
                }
            }
        } catch (error) {
            let networks = await AsyncStorage.getItem("networks") || [];
            if (networks.length !== 0) {
                setNetworks(JSON.parse(networks));
            }
        } finally {
            setRefreshing(false);
        }
    }

    const resetCreateForm = () => {
        setNetworkName("");
        setNetworkDescription("");
        setIsPrivate(false);
        setMembers([]);
        setFriendsSearch("");
        setSelectedImage(null);
        setCreateError("");
        setIsCreating(false);
        setSelectedFriends([]);
    };

    const fetchFriendNetworks = async () => {
        if (allFriendNetworksFetched) {
            setLoadingFriends(false);
            setRefreshingFriend(false);
            return;
        }

        try {
            const response = await fetch(`${ip}/networks/friendsNetworks`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Content-Type": "application/json"
                }
            });
            if (response.ok) {
                const data = await response.json();
                setFriendNetworks(prevState => {
                    const existingNetworkIds = new Set(prevState.map(network => network.networkId));
                    const uniqueNewNetworks = data.filter(network => !existingNetworkIds.has(network.networkId));
                    if (uniqueNewNetworks.length === 0) {
                        setAllFriendNetworksFetched(true);
                    }
                    return prevState.concat(uniqueNewNetworks);
                });
            }
        } catch (error) {
            console.error("Error fetching friends networks:", error);
        } finally {
            setLoadingFriends(false);
            setRefreshingFriend(false);
        }
    }

    // Fetch user's friends list
    const fetchFriendsList = async () => {
        try {
            let profile;
            if (Platform.OS === "web") {
                profile = JSON.parse(localStorage.getItem("profile"));
            }
            else {
                profile = JSON.parse(await asyncStorage.getItem("profile"));
            }
            setFriendsList(profile.friends);
        } catch (error) {
            console.error("Error fetching friends list:", error);
            setFriendsList([]);
        }
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
    const isSwipeInProgress = useRef(false);

    const handlePersonSwipe = (event) => {
        if (isSwipeInProgress.current) {
            return;
        }

        if (Math.abs(event.nativeEvent.translationX) > 50) {
            isSwipeInProgress.current = true;

            if (event.nativeEvent.translationX < 0 && currentPersonIndex < people.length - 1) {
                const nextIndex = currentPersonIndex + 1;
                setCurrentPersonIndex(nextIndex);

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
            } else if (event.nativeEvent.translationX > 0 && currentPersonIndex > 0) {
                const prevIndex = currentPersonIndex - 1;
                setCurrentPersonIndex(prevIndex);

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
            }

            setTimeout(() => {
                isSwipeInProgress.current = false;
            }, 500);
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
                    <Text style={styles.pageTitle}>{t("networks")}</Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity 
                            style={styles.headerActionButton}
                            onPress={() => {
                                resetCreateForm();
                                setCreateModalVisible(true);
                                fetchFriendsList();
                            }}
                        >
                            <Ionicons name="add-outline" size={23} color="#3B82F6" />
                        </TouchableOpacity>

                        {isDesktop ? (
                            <TouchableOpacity 
                                style={[styles.headerActionButton, styles.desktopActionButton]}
                                onPress={navigateToMeetPeople}
                            >
                                <Ionicons name="people-outline" size={24} color="#3B82F6" />
                                <Text style={styles.desktopActionButtonText}>{t("meet.people")}</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                style={styles.headerActionButton}
                                onPress={navigateToMeetPeople}
                            >
                                <Ionicons name="people-outline" size={23} color="#3B82F6" />
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
                        placeholder={t("search.networks")}
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
                                    ]}>{t("no.results")}</Text>
                                    <Text style={[
                                        styles.emptySearchSubtext,
                                        isDesktop && styles.desktopEmptySearchSubtext
                                    ]}>{t("no.results.subline")}</Text>
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
                            style={styles.tabContainer}
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
                                    <Text style={[styles.tabText, selected === 0 && styles.activeTabText]}>{t("favorites")}</Text>
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
                                        name="compass"
                                        size={20} 
                                        color={selected === 1 ? "#3B82F6" : "#64748B"} 
                                        style={styles.tabIcon} 
                                    />
                                    <Text style={[styles.tabText, selected === 1 && styles.activeTabText]}>{t("explore")}</Text>
                                </Animated.View>
                            </TouchableOpacity>
                        </Animated.View>

                        <Animated.View style={{
                            flexDirection: 'row',
                            width: windowWidth * 2,
                            height: '100%',
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
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshing}
                                            onRefresh={onRefresh}
                                            colors={["#3B82F6"]}
                                            tintColor="#3B82F6"
                                        />
                                    }
                                    keyExtractor={(item) => item.networkId?.toString()}
                                    renderItem={(items) => (
                                        <Network 
                                            id={items.item.networkId} 
                                            network={items.item.name} 
                                            networkPicturePath={items.item.networkPicturePath} 
                                            description={items.item.description}
                                            members={items.item.members}
                                            favoriteMembers={items.item.favoriteMembers}
                                            isPrivate={items.item.private}
                                            isDesktop={isDesktop}
                                        />
                                    )}
                                    ListEmptyComponent={() => (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="heart-outline" size={60} color="#CBD5E1" style={styles.emptyIcon} />
                                            <Text style={styles.emptyText}>{t("no.favorite.networks")}</Text>
                                            <Text style={styles.emptySubtext}>{t("no.favorite.networks.subline")}</Text>
                                        </View>
                                    )}
                                    contentContainerStyle={styles.networksList}
                                    showsVerticalScrollIndicator={false}
                                />
                            </View>

                            {/* Friends Tab Content */}
                            <View style={{ width: windowWidth }}>
                                <FlatList 
                                    data={friendNetworks}
                                    keyExtractor={(item) => item.id.toString()}
                                    renderItem={(items) => (
                                        <Network 
                                            id={items.item.id}
                                            network={items.item.name} 
                                            networkPicturePath={items.item.networkPicturePath} 
                                            description={items.item.description} 
                                            creator={items.item.creatorId}
                                            member={items.item.members}
                                            favoriteMembers={items.item.favoriteMembers}
                                            isPrivate={items.item.private}
                                            isDesktop={isDesktop}
                                        />
                                    )}
                                    onEndReached={() => fetchFriendNetworks()}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={refreshingFriends}
                                            onRefresh={onRefreshFriends}
                                            colors={["#3B82F6"]}
                                            tintColor="#3B82F6"
                                        />
                                    }                                    ListEmptyComponent={() => (
                                        <View style={styles.emptyContainer}>
                                            <Ionicons name="people-outline" size={60} color="#CBD5E1" style={styles.emptyIcon} />
                                            <Text style={styles.emptyText}>{t("no.networks.friends")}</Text>
                                            <Text style={styles.emptySubtext}>{t("no.networks.friends.subline")}</Text>
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

    async function AddFriend(username) {
        const response = await fetch(`${ip}/profile/friend/${username}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token.current}`
            }
        });

        if (response.ok) {
            setPeople(prevState => prevState.map(person => {
                if (person.username === username) {
                    return {
                        ...person,
                        isFriend: true
                    };
                }
                return person;
            }));
        }
    }

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
                        {isDesktop && <Text style={styles.desktopBackButtonText}>{t("back.networks")}</Text>}
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
                                onEndReached={() => {
                                    loadPeople()
                                }}
                                showsHorizontalScrollIndicator={false}
                                keyExtractor={(item) => item.username.toString()}
                                onMomentumScrollEnd={(e) => {
                                    const cardWidth = isDesktop ? Math.min(windowWidth, 1024) : windowWidth;
                                    const newIndex = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
                                    setCurrentPersonIndex(newIndex);
                                }}
                                ListEmptyComponent={() => (
                                    <View style={{width: isDesktop ? Math.min(windowWidth, 1024) : windowWidth}}
                                          className="flex flex-col items-center justify-center h-full px-4">
                                        <Ionicons name="people-outline" size={70} color="#CBD5E1" className="mb-4" />
                                        <Text className="text-xl font-semibold text-gray-500 mb-2">{t("no.people")}</Text>
                                        <Text className="text-gray-400 text-center">{t("try.later.network")}</Text>
                                    </View>
                                )}
                                renderItem={({item}) => (
                                    <View style={[
                                        styles.personCard, 
                                        {width: isDesktop ? Math.min(windowWidth, 1024) : windowWidth},
                                    ]}>
                                        <View style={styles.personImageContainer}>
                                            <Image 
                                                source={{uri: item.profilePicturePath}}
                                                style={styles.personImage}
                                                contentFit="cover"
                                                transition={200}
                                            />
                                        </View>
                                        <Text style={styles.personName}>{item.name}</Text>
                                        <Text style={styles.personUsername}>@{item.username}</Text>

                                        <View style={styles.personInfoBox}>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="calendar" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>{item.age} {t("years.old")}</Text>
                                            </View>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="heart" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>{item.relationshipStatus}</Text>
                                            </View>
                                            <View style={styles.personInfoRow}>
                                                <Ionicons name="book" size={16} color="#64748B" style={styles.infoIcon} />
                                                <Text style={styles.personInfoText}>{item.hobbies}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.personActions}>
                                            <TouchableOpacity activeOpacity={0.7} onPress={() => {setShowFriends(true); setSelectedFriendsMeetNewPeople(item.friends); setFriendsSearchResults(item.friends)}} style={styles.messageButton}>
                                                <Ionicons name="people" size={20} color="white" style={styles.actionButtonIcon} />
                                                <Text style={styles.actionButtonText}>{t("friends")}</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity activeOpacity={0.55} disabled={item.isFriend} onPress={() => {if(!item.isFriend) {AddFriend(item.username)}}} style={[styles.addFriendButton, {backgroundColor: item.isFriend ? "#10B981" : '#059669'}]}>
                                                <Ionicons name={item.isFriend ? "checkmark" : "person-add"} size={20} color="white" style={styles.actionButtonIcon} />
                                                <Text style={styles.actionButtonText}>{item.isFriend ? t("request.sent") : t("add.friend")}</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity 
                                            style={styles.viewProfileButton}
                                            activeOpacity={0.7}
                                            onPress={() => router.navigate(`/${item.username}`)}
                                        >
                                            <Text style={styles.viewProfileText}>{t("view.profile")}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        </Animated.View>
                    </PanGestureHandler>
                </View>


                <View style={styles.swipeHintContainer}>
                    <Ionicons name="swap-horizontal" size={20} color="#94A3B8" />
                    <Text style={styles.swipeHintText}>{t("swipe.to.more")}</Text>
                </View>

                {isDesktop && <View style={styles.navigationButtonsContainer}>
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
                        ]}>{t("previous")}</Text>
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
                        ]}>{t("next")}</Text>
                        <Ionicons name="chevron-forward" size={24} color={currentPersonIndex === people.length - 1 ? "#CBD5E1" : "#3B82F6"} />
                    </TouchableOpacity>
                </View>}
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
                            <Text style={styles.modalTitle}>{t("create.network")}</Text>
                            <TouchableOpacity 
                                onPress={() => setCreateModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView nestedScrollEnabled={true} style={styles.createFormContainer}>
                            <Pressable>
                            {createError ? (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>{createError}</Text>
                                </View>
                            ) : null}

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>{t("network.name")}</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder={t("network.name.placeholder")}
                                    placeholderTextColor="#9CA3AF"
                                    value={networkName}
                                    onChangeText={setNetworkName}
                                    className="outline-none"
                                    autoFocus
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>{t("description")}</Text>
                                <TextInput
                                    style={[styles.formInput, styles.textArea]}
                                    placeholder={t("network.description.placeholder")}
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
                                    <Text style={styles.formLabel}>{t("private.network")}</Text>
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
                                        ? t("network.private.description")
                                        : t("network.public.description")}
                                </Text>
                            </View>

                            {isPrivate && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>{t("add.members")}</Text>

                                    {/* Friends List Selection */}
                                    <View style={styles.friendsSelectionContainer}>
                                        {/* Select All Button */}
                                        <TouchableOpacity 
                                            style={styles.selectAllButton}
                                            onPress={() => {
                                                if (selectedFriends.length === friendsList.length) {
                                                    // Deselect all
                                                    setSelectedFriends([]);
                                                    setMembers([]);
                                                } else {
                                                    // Select all
                                                    const allFriends = friendsList.map(friend => friend.memberId);
                                                    setSelectedFriends(allFriends);
                                                    setMembers(friendsList.map(friend => ({ memberId: friend.memberId })));
                                                }
                                            }}
                                        >
                                            <Text style={styles.selectAllButtonText}>
                                                {selectedFriends.length === friendsList.length ? t("deselect.all") : t("select.all.friends")}
                                            </Text>
                                        </TouchableOpacity>

                                        {/* Manual Input Option */}
                                        <View style={styles.addMemberContainer}>
                                            <TextInput
                                                style={styles.memberInput}
                                                placeholder={t("network.add.member.placeholder")}
                                                placeholderTextColor="#9CA3AF"
                                                value={friendsSearch}
                                                onChangeText={(text) => setFriendsSearch(text)}
                                                autoCapitalize="none"
                                                className="outline-none"
                                            />
                                        </View>

                                        {/* Friends List */}
                                        {loadingFriends ? (
                                            <View style={styles.loadingContainer}>
                                                <ActivityIndicator size="small" color="#3B82F6" />
                                                <Text style={styles.loadingText}>{t("friends.loading")}</Text>
                                            </View>
                                        ) : friendsList.length > 0 ? (
                                            <ScrollView style={styles.friendsListScrollView}>
                                                {friendsList.filter(item => friendsSearch === "" ? true : item.memberName?.toLowerCase().includes(friendsSearch.toLowerCase())).map((friend, index) => (
                                                    <TouchableOpacity 
                                                        key={index} 
                                                        style={styles.friendItem}
                                                        onPress={() => {
                                                            const isSelected = selectedFriends.includes(friend.memberId);
                                                            if (isSelected) {
                                                                // Remove from selected
                                                                setSelectedFriends(selectedFriends.filter(id => id !== friend.memberId));
                                                                setMembers(members.filter(m => m.memberId !== friend.memberId));
                                                            } else {
                                                                // Add to selected
                                                                setSelectedFriends([...selectedFriends, friend.memberId]);
                                                                setMembers([...members, { memberId: friend.memberId }]);
                                                            }
                                                        }}
                                                    >
                                                        <View style={styles.friendItemContent}>
                                                            {friend.memberProfilePicturePath ? (
                                                                <Image 
                                                                    source={{ uri: friend.memberProfilePicturePath }} 
                                                                    style={styles.friendAvatar}
                                                                    contentFit="cover"
                                                                />
                                                            ) : (
                                                                <View style={styles.friendAvatarPlaceholder}>
                                                                    <Ionicons name="person" size={16} color="#94A3B8" />
                                                                </View>
                                                            )}
                                                            <Text style={styles.friendName}>
                                                                {friend.memberName || friend.memberId}
                                                            </Text>
                                                        </View>
                                                        <View style={[
                                                            styles.checkboxContainer,
                                                            selectedFriends.includes(friend.memberId) && styles.checkboxSelected
                                                        ]}>
                                                            {selectedFriends.includes(friend.memberId) && (
                                                                <Ionicons name="checkmark" size={16} color="white" />
                                                            )}
                                                        </View>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        ) : (
                                            <View style={styles.emptyFriendsContainer}>
                                                <Text style={styles.emptyFriendsText}>{t("no.friends.yet")}</Text>
                                                <Text style={styles.emptyFriendsSubtext}>{t("no.friends.yet.subline")}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Selected Members List */}
                                    {members.length > 0 && (
                                        <View style={styles.membersListContainer}>
                                            <Text style={styles.membersListTitle}>{t("selected.members")}: {members.length}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>{t("network.image")}</Text>
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
                                            <Text style={styles.imagePickerText}>{t("upload.image")}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>
                            </Pressable>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                style={styles.cancelButton}
                                onPress={() => setCreateModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
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
                                    <Text style={styles.createButtonText}>{t("create.network")}</Text>
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

            <Modal animationType="slide" visible={showFriends} presentationStyle={isDesktop ? "formSheet" : "pageSheet"} onRequestClose={() => {setShowFriends(false);}}>
                <View className="bg-white dark:bg-dark-primary h-full w-full" style={isDesktop ? {maxWidth: 800, marginHorizontal: 'auto'} : {}}>
                    {/* Header */}
                    <View className="flex-row justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100">
                        <View className="flex-row items-center">
                            <Text className="text-2xl text-gray-800 dark:text-dark-text font-bold">{t("friends")}</Text>
                            <View className="ml-2 px-2 py-1 bg-blue-100 rounded-full">
                                <Text className="text-blue-600 font-medium text-sm">{friends?.length || 0}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View className="px-6 pt-4 pb-4">
                        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                            <Ionicons name="search" size={18} color="#64748B" />
                            <TextInput
                                onChangeText={(text) => {
                                    if (text.length >= 1) {
                                        setFriendsSearchResults(friends?.filter((friend) =>
                                            friend.memberName.toLowerCase().includes(text.toLowerCase()) ||
                                            friend.memberId.toLowerCase().includes(text.toLowerCase())
                                        ));
                                    } else if (text.length === 0) {
                                        setFriendsSearchResults(friends);
                                    }
                                }}
                                className="flex-1 ml-2 text-gray-700 outline-none"
                                placeholder={t("search.friends")}
                                placeholderTextColor="#94A3B8"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>

                    {/* Friends List */}
                    <FlatList
                        className="px-4"
                        data={friendsSearchResults}
                        contentContainerStyle={{paddingBottom: 100}}
                        ListEmptyComponent={() => (
                            <View className="flex-1 items-center justify-center py-16">
                                <View className="w-20 h-20 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                                    <Ionicons name="people" size={30} color="#3B82F6" />
                                </View>
                                <Text className="text-center text-xl font-semibold text-gray-800">{t("no.friends.found")}</Text>
                            </View>
                        )}
                        renderItem={(item) => (
                            <View className="mb-2">
                                <TouchableOpacity
                                    onPress={() => {
                                        setShowFriends(false);
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
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f4f9',
        paddingTop: 0, // Remove extra padding, use insets instead
    },
    container: {
        flex: 1,
        backgroundColor: '#f1f4f9',
    },
    // Desktop styles
    desktopContainer: {
        flex: 1,
        backgroundColor: '#f1f4f9',
        alignItems: 'center',
    },
    desktopContent: {
        width: '100%',
        maxWidth: 1024, // Similar to max-w-7xl in Tailwind
        backgroundColor: '#f1f4f9',
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

    // Friends List Selection Styles
    friendsSelectionContainer: {
        marginTop: 12,
    },
    selectAllButton: {
        backgroundColor: '#EBF5FF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#BFDBFE',
    },
    selectAllButtonText: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '500',
    },
    friendsListScrollView: {
        maxHeight: 400,
        marginTop: 12,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F1F5F9',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    friendItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    friendAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    friendAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    friendName: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    checkboxContainer: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#64748B',
    },
    emptyFriendsContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyFriendsText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#64748B',
        textAlign: 'center',
    },
    emptyFriendsSubtext: {
        marginTop: 4,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
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
        borderWidth: 0
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
        marginBottom: 32,
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
