import "../../../global.css"
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    Keyboard,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Text,
    Share,
    Alert,
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
    KeyboardAvoidingView
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import WebSocketProvider from "../../../components/WebSocketProvider";
import NetworkMessage from "../../../components/Entries/NetworkMessage";
import * as SecureStorage from "expo-secure-store";
import { Image } from "expo-image";
import asyncStorage from "@react-native-async-storage/async-storage";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";
import { showAlert } from "../../../components/PopUpModalView";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import {useTranslation} from "react-i18next";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function Network() {
    const { Network } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > MOBILE_WIDTH_THRESHOLD);

    const navigator = useNavigation();
    const router = useRouter();
    const ws = new WebSocketProvider();
    const stateManager = new StateManager();

    const [messages, setMessages] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const [inputText, setInputText] = useState("");
    const [isModalVisible, setModalVisible] = useState(false);
    const [member, setMember] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [inputHeight, setInputHeight] = useState(40);
    const [keyboardVisible, setKeyboardVisible] = useState(false);

    const flatListRefDesk = useRef(null);
    const flatListRef = useRef(null);
    const inputRef = useRef(null);
    const token = useRef("");
    const username = useRef("");
    const currentNetwork = useRef(null);
    const oldestMessageTimestamp = useRef(null);
    const isInitialLoad = useRef(true);
    const inputBarAnimation = useRef(new Animated.Value(0)).current;

    const {t} = useTranslation();

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
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        }
        else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }
        setTimeout(() => {
            if (token.current === null) { router.replace("/") }
        });

        // Set up header
        navigator.setOptions({
            headerShown: false
        });

        // Load network data
        loadNetwork();

        // Load messages
        loadInitialMessages();

        // Set up WebSocket listener
        ws.messageReceived.addListener("networkMessageReceived", handleNewMessage);

        return () => {
            ws.messageReceived.removeAllListeners("networkMessageReceived");
        }
    }, []);

    useEffect(() => {
        const keyboardShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', (e) => {
                setKeyboardVisible(true);
                const offset = e.endCoordinates.height - (Platform.OS === "ios" ? insets.bottom : 0);
                Animated.timing(inputBarAnimation, {
                    toValue: -offset,
                    duration: 250,
                    useNativeDriver: true,
                }).start();
            })
            : Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardVisible(true);
                const offset = e.endCoordinates.height;
                Animated.timing(inputBarAnimation, {
                    toValue: -offset,
                    duration: 150,
                    useNativeDriver: true,
                }).start();
            });

        const keyboardHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardVisible(false);
                Animated.timing(inputBarAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start();
            })
            : Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardVisible(false);
                Animated.timing(inputBarAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }).start();
            });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    // Format message date for grouping
    const formatMessageDate = (timestamp) => {
        const messageDate = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

        if (messageDay.getTime() === todayDay.getTime()) {
            return "Today";
        } else if (messageDay.getTime() === yesterdayDay.getTime()) {
            return "Yesterday";
        } else {
            const options = { weekday: 'long', month: 'short', day: 'numeric' };

            if (messageDay.getFullYear() !== today.getFullYear()) {
                options.year = 'numeric';
            }

            return messageDate.toLocaleDateString(undefined, options);
        }
    };

    // Group messages by date
    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return [];

        const groups = [];
        let currentDate = null;

        messages.sort((a, b) => {
            // Handle date headers which don't have millis property
            const millisA = a.millis || 0;
            const millisB = b.millis || 0;
            return millisA - millisB; // Ascending order (older first, newer last)
        }).forEach(message => {
            const timestamp = message.millis;
            const dateString = formatMessageDate(timestamp);

            if (dateString !== currentDate) {
                currentDate = dateString;
                groups.push({
                    type: 'date-header',
                    date: dateString,
                    id: `date-${timestamp}`
                });
            }

            groups.push({...message, id: `message-${timestamp}`});
        });

        return groups;
    };

    const loadNetwork = async () => {
        try {
            const receivedData = await fetch(`${ip}/networks/${Network}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Application-Type": "application/json"
                }
            });

            if (receivedData.ok) {
                const data = await receivedData.json();
                setMember(data.members);
                currentNetwork.current = {
                    networkId: data.id,
                    name: data.name,
                    description: data.description,
                    creatorId: data.creatorId,
                    private: data.private,
                    favoriteMembers: data.favoriteMembers,
                    networkPicturePath: data.networkPicturePath
                };

                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {
                    loadedNetworks = JSON.parse(loadedNetworks);
                }

                if (loadedNetworks.some((network) => network.networkId === Network)) {
                    setIsFavorite(true);
                    await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.map((network) => {
                        if (network.networkId === Network) {
                            return {
                                networkId: data.id,
                                name: data.name,
                                description: data.description,
                                creatorId: data.creatorId,
                                private: data.private,
                                members: member,
                                favoriteMembers: data.favoriteMembers,
                                networkPicturePath: data.networkPicturePath
                            };
                        }
                        return network;
                    })));
                }
            } else {
                showAlert({
                    title: t("not.found"),
                    message: t("network.not.found.no.access"),
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.back();
                            }
                        },
                    ],
                });
            }
        } catch (error) {
            console.error("Error loading network:", error);
            showAlert({
                title: t("error"),
                message: 'Failed to load network information',
                buttons: [{ text: 'OK', onPress: () => {} }],
            });
        }
    };

    const loadInitialMessages = async () => {
        setIsLoading(true);
        try {
            // First try to load from local storage
            const loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || null;
            if (loadedMessages !== null) {
                const parsedMessages = JSON.parse(loadedMessages);
                setMessages(parsedMessages);

                if (parsedMessages.length > 0) {
                    oldestMessageTimestamp.current = Math.min(...parsedMessages.map(msg => msg.millis));
                }
            }

            // Then fetch from server
            const receivedMessages = await fetch(`${ip}/networks/${Network}/messages`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Content-Type": "application/json"
                }
            });

            if (receivedMessages.ok) {
                const data = await receivedMessages.json();
                const formattedMessages = data.map((message) => ({
                    senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                    sender: message.senderId.memberId,
                    content: message.content,
                    millis: message.millis
                }));

                if (formattedMessages.length > 0) {
                    setMessages(formattedMessages);
                    oldestMessageTimestamp.current = Math.min(...formattedMessages.map(msg => msg.millis));

                    // Save to local storage
                    await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(formattedMessages));
                    await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, formattedMessages[formattedMessages.length - 1].millis.toString());
                }

                setHasMoreMessages(data.length >= 20);
            }
        } catch (error) {
            console.error("Error loading messages:", error);
        } finally {
            setIsLoading(false);
            isInitialLoad.current = false;
        }
    };

    const loadMoreMessages = async () => {
        if (isLoadingMore || !hasMoreMessages || isInitialLoad.current) return;

        setIsLoadingMore(true);
        try {
            const receivedMessages = await fetch(`${ip}/networks/${Network}/beforeId?id=${oldestMessageTimestamp.current}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Content-Type": "application/json"
                }
            });

            if (receivedMessages.ok) {
                const data = await receivedMessages.json();

                if (data.length > 0) {
                    const formattedMessages = data.map((message) => ({
                        senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                        sender: message.senderId.memberId,
                        content: message.content,
                        millis: message.millis
                    }));

                    // Update oldest timestamp
                    oldestMessageTimestamp.current = Math.min(...formattedMessages.map(msg => msg.millis));

                    // Add messages to the beginning of the list
                    setMessages(prevMessages => [...formattedMessages, ...prevMessages]);

                    // Update local storage
                    const allMessages = [...formattedMessages, ...messages];
                    await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(allMessages));
                }

                setHasMoreMessages(data.length >= 20);
            }
        } catch (error) {
            console.error("Error loading more messages:", error);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleNewMessage = async (e) => {
        if (e.detail.networkId !== Network) {
            return;
        }

        setMessages(prevMessages => [...prevMessages, e.detail]);

        // Update local storage
        const updatedMessages = [...messages, e.detail];
        await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(updatedMessages));
    };

    const sendMessage = async () => {
        if (inputText.trim() === "") return;

        const messageText = inputText.trim();
        setInputText("");
        inputRef.current?.clear();
        Keyboard.dismiss();

        try {
            // Add optimistic message
            const optimisticMessage = {
                sender: username.current,
                senderProfilePicturePath: Platform.OS === "web" 
                    ? localStorage.getItem("profilePicture")?.split(",")[0] 
                    : SecureStore.getItem("profilePicture")?.split(",")[0],
                content: messageText,
                millis: Date.now(),
                isOptimistic: true
            };

            setMessages(prevMessages => [...prevMessages, optimisticMessage]);

            // Send message via WebSocket
            ws.stompClient.publish({
                destination: `/app/networks/send`,
                body: JSON.stringify({
                    receiver: Network,
                    content: messageText,
                })
            });

            // Update local storage
            if (JSON.parse(await asyncStorage.getItem("networks"))?.some((network) => network.networkId === Network)) {
                let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
                if (loadedMessages.length !== 0) {
                    loadedMessages = JSON.parse(loadedMessages);
                }

                const updatedMessages = [...loadedMessages, {
                    sender: username.current,
                    content: messageText,
                    millis: Date.now()
                }];

                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(updatedMessages));

                // Update networks list order
                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {
                    loadedNetworks = JSON.parse(loadedNetworks);
                }

                await asyncStorage.setItem("networks", JSON.stringify([
                    ...loadedNetworks.filter(network => network.networkId === Network), 
                    ...loadedNetworks.filter(network => network.networkId !== Network)
                ]));
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Remove optimistic message on error
            setMessages(prevMessages => prevMessages.filter(msg => !msg.isOptimistic));
        }
    };

    const setFavorite = async (shouldFavorite) => {
        try {
            let loadedNetworks = await asyncStorage.getItem("networks") || [];
            if (loadedNetworks.length !== 0) {
                loadedNetworks = JSON.parse(loadedNetworks);
            }

            if (!shouldFavorite) {
                await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.filter((network) => {
                    return network.networkId !== Network;
                })));
                await asyncStorage.removeItem(`networks/${Network}`);
                await asyncStorage.removeItem(`lastNetworkMessageId/${Network}`);
            } else {
                await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks, {
                    networkId: currentNetwork.current.networkId,
                    name: currentNetwork.current.name,
                    description: currentNetwork.current.description,
                    creatorId: currentNetwork.current.creatorId,
                    favoriteMembers: currentNetwork.current.favoriteMembers,
                    networkPicturePath: currentNetwork.current.networkPicturePath,
                    private: currentNetwork.current.private,
                    members: member
                }]));

                if (messages.length !== 0) {
                    await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(messages));
                }

                await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, Date.now().toString());
            }

            await fetch(`${ip}/networks/${Network}/favorite`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                }
            });
        } catch (error) {
            console.error("Error setting favorite:", error);
            showAlert({
                title: t("error"),
                message: 'Failed to update favorite status',
                buttons: [{ text: 'OK', onPress: () => {} }],
            });
        }
    };

    const removeUser = async (user) => {
        try {
            const response = await fetch(`${ip}/networks/${Network}/remove`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token.current}`
                },
                body: JSON.stringify([{ memberId: user }]),
            });

            if (response.ok) {
                setMember(member.filter((m) => m.memberId !== user));
                showAlert({
                    title: t("user.removed"),
                    message: '',
                    buttons: [{ text: 'OK', onPress: () => {} }],
                });
            } else {
                showAlert({
                    title: t("error"),
                    message: '',
                    buttons: [{ text: 'Cancel', onPress: () => {} }],
                });
            }
        } catch (error) {
            console.error("Error removing user:", error);
            showAlert({
                title: t("error"),
                message: 'Failed to remove user',
                buttons: [{ text: 'OK', onPress: () => {} }],
            });
        }
    };

    const updateNetwork = () => {
        setModalVisible(false);
        showAlert({
            title: t("update.network"),
            message: t("new.name.network"),
            hasInput: true,
            inputConfig: {
                placeholder: t("new.network.name.placeholder"),
                defaultValue: currentNetwork.current.name
            },
            buttons: [
                {
                    text: t("cancel"),
                    onPress: () => {}
                },
                {
                    text: t("update"),
                    onPress: (text) => {
                        if (text.trim().length === 0) {
                            text = currentNetwork.current.name;
                        } else if (text.length <= 3) {
                            setTimeout(() => {
                                showAlert({
                                    title: t("error"),
                                    message: t("name.too.short"),
                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                });
                            }, 300)
                            return;
                        }

                        // Use setTimeout to ensure the next alert shows properly
                        setTimeout(() => {
                            showAlert({
                                title: t("update.network"),
                                message: t("new.description.network"),
                                hasInput: true,
                                inputConfig: {
                                    placeholder: t("new.network.description.placeholder"),
                                    defaultValue: currentNetwork.current.description
                                },
                                buttons: [
                                    {
                                        text: t("cancel"),
                                        onPress: () => {}
                                    },
                                    {
                                        text: t("update"),
                                        onPress: async (description) => {
                                            if (description.trim().length === 0) {
                                                if (text === currentNetwork.current.name) {
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: t("no.change"),
                                                            message: t("no.change.made"),
                                                            buttons: [{
                                                                text: 'OK', onPress: () => {}
                                                            }]
                                                        });
                                                    }, 300);
                                                    return;
                                                }
                                                description = currentNetwork.current.description;
                                            } else if (description.length <= 3) {
                                                setTimeout(() => {
                                                    showAlert({
                                                        title: t("error"),
                                                        message: t("description.too.shorttoo.short"),
                                                        buttons: [{
                                                            text: 'OK', onPress: () => {}
                                                        }]
                                                    });
                                                }, 300);
                                                return;
                                            }

                                            try {
                                                const response = await fetch(`${ip}/networks/${Network}/update`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${token.current}`
                                                    },
                                                    body: JSON.stringify({name: text, description: description})
                                                });

                                                if (response.ok) {
                                                    currentNetwork.current = {
                                                        networkId: currentNetwork.current.networkId,
                                                        name: text,
                                                        description: description,
                                                        creatorId: currentNetwork.current.creatorId,
                                                        private: currentNetwork.current.private,
                                                        favoriteMembers: currentNetwork.current.favoriteMembers,
                                                        networkPicturePath: currentNetwork.current.networkPicturePath
                                                    };

                                                    await asyncStorage.setItem("networks", JSON.stringify(JSON.parse(await asyncStorage.getItem("networks")).map((network) => {
                                                        if (network.networkId === Network) {
                                                            return {
                                                                networkId: currentNetwork.current.networkId,
                                                                name: text,
                                                                description: description,
                                                                creatorId: currentNetwork.current.creatorId,
                                                                private: currentNetwork.current.private,
                                                                members: member,
                                                                favoriteMembers: currentNetwork.current.favoriteMembers,
                                                                networkPicturePath: currentNetwork.current.networkPicturePath
                                                            };
                                                        }
                                                        return network;
                                                    })));

                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: t("success"),
                                                            message: 'Change approved!',
                                                            buttons: [{ text: 'OK', onPress: () => {} }]
                                                        });
                                                    }, 300);
                                                }
                                            } catch (error) {
                                                console.error("Error updating network:", error);
                                                showAlert({
                                                    title: t("error"),
                                                    message: 'Failed to update network',
                                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                                });
                                            }
                                        }
                                    }
                                ]
                            });
                        }, 300);
                    }
                }
            ]
        });
    };
    const [modalVisible, setFriendsModalVisible] = useState(false);

    const addUser = () => {
        setModalVisible(false);
    setFriendsModalVisible(true);
    }

    const handleAddFriends = async (selectedFriendIds) => {
        try {
            const response = await fetch(`${ip}/networks/${Network}/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token.current}`
                },
                body: JSON.stringify(selectedFriendIds.map(id => ({ memberId: id })))
            });

            if (response.ok) {
                // Refresh member list
                const receivedData = await fetch(`${ip}/networks/${Network}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token.current}`,
                        "Application-Type": "application/json"
                    }
                });

                const data = await receivedData.json();
                setMember(data.members);

                showAlert({
                    title: t("success"),
                    message: `${selectedFriendIds.length} ${selectedFriendIds.length === 1 ? t("friend") : t("friends")} ${t("added.to.network")}`,
                    buttons: [{ text: 'OK', onPress: () => {} }]
                });
            } else {
                showAlert({
                    title: t("error"),
                    message: 'Failed to add selected friends',
                    buttons: [{ text: 'OK', onPress: () => {} }]
                });
            }
        } catch (error) {
            console.error("Error adding users:", error);
            showAlert({
                title: t("error"),
                message: 'Failed to add friends to network',
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
        }
        setFriendsModalVisible(false);
    };

    const renderMemberItem = ({ item }) => (
        <Pressable style={styles.memberItem}>
            <TouchableOpacity 
                onPress={() => {
                    setModalVisible(false);
                    router.navigate(`/${item.memberId}`);
                }} 
                activeOpacity={0.7} 
                style={styles.memberInfo}
            >
                <Image 
                    source={{uri: item.memberProfilePicturePath.split(",")[0]}} 
                    style={styles.memberAvatar}
                    contentFit="cover"
                    transition={150}
                />
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.memberName}</Text>
                    <Text style={styles.memberUsername}>@{item.memberId}</Text>
                </View>
            </TouchableOpacity>

            {(currentNetwork.current?.private && 
              currentNetwork.current?.creatorId === username.current && 
              item.memberId !== username.current) && (
                <TouchableOpacity 
                    onPress={() => {
                        setModalVisible(false);
                        showAlert({
                            title: t("remove.user"),
                            message: `Are you sure you want to remove ${item.memberId}? This action cannot be undone.`,
                            buttons: [
                                {
                                    text: t("cancel"),
                                    onPress: () => {}
                                },
                                {
                                    text: t("remove"),
                                    onPress: async () => {
                                        await removeUser(item.memberId);
                                    }
                                }
                            ],
                        });
                    }} 
                    style={styles.removeButton}
                >
                    <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
            )}
        </Pressable>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={22} color="#3B82F6" />
            </TouchableOpacity>

            <View style={styles.headerContent}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                    {currentNetwork.current?.name || t("network.loading")}
                </Text>
                {currentNetwork.current?.private && (
                    <Ionicons name="lock-closed" size={16} color="#64748B" style={styles.lockIcon} />
                )}
            </View>

            <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>
        </View>
    );

    const renderFooter = () => (
        <KeyboardAvoidingView>
        <Animated.View 
            style={[
                styles.inputContainer,
                { 
                    transform: [{ translateY: inputBarAnimation }],
                    paddingBottom: keyboardVisible ? 10 : 0,
                }
            ]}
        >
            <View style={styles.inputWrapper}>
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        { height: Math.min(Math.max(40, inputHeight), 120) }
                    ]}
                    placeholder={t("type.message")}
                    placeholderTextColor="#9CA3AF"
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    className="outline-none"
                    onContentSizeChange={(e) => {
                        const height = e.nativeEvent.contentSize.height;
                        setInputHeight(inputText.length <= 1 ? 40 : Math.min(Math.max(40, height), 120));
                    }}
                    onKeyPress={(e) => {
                        if (Platform.OS === "web" && e.nativeEvent.key === "Enter" && !e.nativeEvent.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                        }
                    }}
                />

                <TouchableOpacity 
                    style={[
                        styles.sendButton,
                        { backgroundColor: inputText.trim() === '' ? '#CBD5E1' : '#3B82F6' }
                    ]}
                    onPress={sendMessage}
                    disabled={inputText.trim() === ''}
                    activeOpacity={inputText.trim() === '' ? 1 : 0.7}
                >
                    <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
            </View>
        </Animated.View>
        </KeyboardAvoidingView>
    );

    const DateHeader = ({ date }) => {
        return (
            <View style={dateHeaderStyles.container}>
                <View style={dateHeaderStyles.line} />
                <Text style={dateHeaderStyles.dateText}>{date}</Text>
                <View style={dateHeaderStyles.line} />
            </View>
        );
    };

    const dateHeaderStyles = StyleSheet.create({
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            marginVertical: 16,
            paddingHorizontal: 10,
        },
        line: {
            flex: 1,
            height: 1,
            backgroundColor: '#E2E8F0',
        },
        friendsLoadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        friendsList: {
            paddingVertical: 12,
        },
        friendsModalContent: {
            width: '90%',
            maxWidth: 500,
            maxHeight: '80%',
            backgroundColor: 'white',
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
        },
        selectedFriendItem: {
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: '#3B82F6',
            borderWidth: 1,
        },
        friendsModalFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            backgroundColor: '#FFFFFF',
        },
        cancelButton: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: '#F1F5F9',
        },
        cancelButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#64748B',
        },
        addButton: {
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            backgroundColor: '#3B82F6',
        },
        disabledAddButton: {
            backgroundColor: '#93C5FD',
            opacity: 0.7,
        },
        addButtonText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#FFFFFF',
        },
        dateText: {
            fontSize: 12,
            fontWeight: '500',
            color: '#64748B',
            marginHorizontal: 10,
            paddingHorizontal: 12,
            paddingVertical: 4,
            backgroundColor: '#F1F5F9',
            borderRadius: 12,
            overflow: 'hidden',
        },
    });

    const renderLoadingIndicator = () => (
        isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text style={styles.loadingMoreText}>{t("loading.more.messages")}</Text>
            </View>
        )
    );

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>{t("no.messages.yet")}</Text>
            <Text style={styles.emptySubtext}>{t('first.to.conversation')}</Text>
        </View>
    );

    const renderListItem = ({ item }) => {
        if (item.type === 'date-header') {
            return <DateHeader date={item.date} />;
        } else {
            return (
                <NetworkMessage 
                    content={item.content} 
                    sender={item.sender} 
                    senderProfilePicturePath={item.senderProfilePicturePath} 
                    timestamp={item.millis}
                    isDesktop={isDesktop}
                />
            );
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>{t("network.loading")}</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            {isDesktop ? (
                // Desktop layout
                <View style={styles.desktopContainer}>
                    {/* Network info sidebar */}
                    <View style={styles.desktopSidebar}>
                        <View style={styles.desktopHeader}>
                            <TouchableOpacity 
                                style={styles.backButton}
                                onPress={() => router.back()}
                            >
                                <Ionicons name="arrow-back" size={22} color="#3B82F6" />
                            </TouchableOpacity>

                            <View style={styles.headerContent}>
                                <Text style={styles.headerTitle} numberOfLines={1}>
                                    {currentNetwork.current?.name || t("network.loading")}
                                </Text>
                                {currentNetwork.current?.private && (
                                    <Ionicons name="lock-closed" size={16} color="#64748B" style={styles.lockIcon} />
                                )}
                            </View>
                        </View>

                        {/* Network info */}
                        <View style={styles.desktopNetworkInfo}>
                            {currentNetwork.current?.networkPicturePath ? (
                                <Image 
                                    source={{uri: currentNetwork.current.networkPicturePath}} 
                                    style={styles.desktopNetworkImage}
                                    contentFit="cover"
                                    transition={150}
                                />
                            ) : (
                                <View style={styles.desktopNetworkImagePlaceholder}>
                                    <Ionicons name="people" size={40} color="#94A3B8" />
                                </View>
                            )}

                            <Text style={styles.desktopNetworkName}>{currentNetwork.current?.name}</Text>
                            <Text style={styles.desktopNetworkDescription}>{currentNetwork.current?.description}</Text>

                            <View style={styles.desktopNetworkStats}>
                                <View style={styles.statItem}>
                                    <Ionicons name="people" size={16} color="#64748B" />
                                    <Text style={styles.statText}>{currentNetwork.current?.favoriteMembers.length} {t("members")}</Text>
                                </View>

                                <View style={styles.statItem}>
                                    <Ionicons name="person" size={16} color="#64748B" />
                                    <Text style={styles.statText}>{t("created.by")} {currentNetwork.current?.creatorId}</Text>
                                </View>
                            </View>

                            <View style={styles.desktopActionButtons}>
                                <TouchableOpacity 
                                    style={styles.desktopActionButton}
                                    onPress={() => {
                                        setIsFavorite(prev => {
                                            setFavorite(!prev);
                                            return !prev;
                                        });
                                    }}
                                >
                                    <Ionicons 
                                        name={isFavorite ? "heart" : "heart-outline"} 
                                        size={22} 
                                        color={isFavorite ? "#F43F5E" : "#64748B"} 
                                    />
                                    <Text style={styles.desktopActionButtonText}>
                                        {isFavorite ? t("favorited") : t("favorite")}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.desktopActionButton}
                                    onPress={() => setModalVisible(true)}
                                >
                                    <Ionicons name="information-circle-outline" size={22} color="#64748B" />
                                    <Text style={styles.desktopActionButtonText}>{t("network.info")}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Messages content */}
                    <View style={styles.desktopContent}>
                        <FlatList
                            ref={flatListRefDesk}
                            data={groupMessagesByDate(messages)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderListItem}
                            contentContainerStyle={[
                                styles.messagesList,
                                { paddingBottom: keyboardVisible ? 80 : 100 }
                            ]}
                            inverted={false}
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.3}
                            ListHeaderComponent={renderLoadingIndicator}
                            ListEmptyComponent={renderEmptyComponent}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => {
                                if (isInitialLoad.current) {
                                    flatListRefDesk.current?.scrollToEnd({ animated: false });
                                }
                            }}
                            initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0}
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                            }}
                            getItemLayout={(data, index) => {
                                const height = 80;
                                const dateHeaderHeight = 60;

                                const item = data[index];
                                const itemHeight = item?.type === 'date-header' ? dateHeaderHeight : height;

                                return {
                                    length: itemHeight,
                                    offset: height * index,
                                    index,
                                };
                            }}
                        />

                        {renderFooter()}
                    </View>
                </View>
            ) : (
                // Mobile layout
                <>
                    {renderHeader()}
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                          style={{ flex: 1 }}>
                        <FlatList
                            ref={flatListRef}
                            data={groupMessagesByDate(messages)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderListItem}
                            contentContainerStyle={[
                                styles.messagesList,
                            ]}
                            inverted={false}
                            onEndReached={loadMoreMessages}
                            onEndReachedThreshold={0.3}
                            ListHeaderComponent={renderLoadingIndicator}
                            ListEmptyComponent={renderEmptyComponent}
                            showsVerticalScrollIndicator={false}
                            onContentSizeChange={() => {
                                if (isInitialLoad.current) {
                                    flatListRef.current?.scrollToEnd({ animated: false });
                                }
                            }}
                            initialScrollIndex={messages.length > 0 ? messages.length - 1 : 0}
                            maintainVisibleContentPosition={{
                                minIndexForVisible: 0,
                            }}
                            getItemLayout={(data, index) => {
                                const height = 100;
                                const dateHeaderHeight = 60;

                                const item = data[index];
                                const itemHeight = item?.type === 'date-header' ? dateHeaderHeight : height;

                                return {
                                    length: itemHeight,
                                    offset: height * index,
                                    index,
                                };
                            }}
                        />
                    </KeyboardAvoidingView>

                    {renderFooter()}
                </>
            )}

            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={styles.modalOverlay}>
                    <Pressable 
                        style={styles.modalOverlay} 
                        onPress={() => setModalVisible(false)}
                    >
                        <View 
                            style={styles.modalContent}
                            onStartShouldSetResponder={() => true}
                            onTouchEnd={(e) => e.stopPropagation()}
                        >
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t("network.details")}</Text>
                                <TouchableOpacity 
                                    onPress={() => setModalVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.networkInfoSection}>
                                {currentNetwork.current?.networkPicturePath ? (
                                    <Image 
                                        source={{uri: currentNetwork.current.networkPicturePath}} 
                                        style={styles.networkImage}
                                        contentFit="cover"
                                        transition={150}
                                    />
                                ) : (
                                    <View style={styles.networkImagePlaceholder}>
                                        <Ionicons name="people" size={40} color="#94A3B8" />
                                    </View>
                                )}

                                <View style={styles.networkDetails}>
                                    <View style={styles.networkNameContainer}>
                                        <Text style={styles.networkName}>{currentNetwork.current?.name}</Text>
                                        {currentNetwork.current?.creatorId === username.current && (
                                            <TouchableOpacity 
                                                onPress={updateNetwork}
                                                style={styles.editButton}
                                            >
                                                <Ionicons name="create-outline" size={20} color="#3B82F6" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <Text style={styles.networkDescription}>{currentNetwork.current?.description}</Text>

                                    <View style={styles.networkStats}>
                                        <View style={styles.statItem}>
                                            <Ionicons name="heart" size={16} color="#64748B" />
                                            <Text style={styles.statText}>{currentNetwork.current?.favoriteMembers.length} {t("favorites")}</Text>
                                        </View>

                                        <View style={styles.statItem}>
                                            <Ionicons name="person" size={16} color="#64748B" />
                                            <Text style={styles.statText}>{t("created.by")} {currentNetwork.current?.creatorId}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.actionButtonsContainer}>
                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => {
                                        setIsFavorite(prev => {
                                            setFavorite(!prev);
                                            return !prev;
                                        });
                                    }}
                                >
                                    <Ionicons 
                                        name={isFavorite ? "heart" : "heart-outline"} 
                                        size={22} 
                                        color={isFavorite ? "#F43F5E" : "#64748B"} 
                                    />
                                    <Text style={styles.actionButtonText}>
                                        {isFavorite ? t("favorited") : t("favorite")}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.actionButton}
                                    onPress={() => {
                                        Share.share({
                                            message: "Check out this network!",
                                            title: "Check out this network!",
                                            text: "Check out this network!",
                                            url: `https://facelinked.com/networks/${Network}`,
                                            dialogTitle: "Check out this network!"
                                        });
                                    }}
                                >
                                    <Ionicons name="share-outline" size={22} color="#64748B" />
                                    <Text style={styles.actionButtonText}>{t("share")}</Text>
                                </TouchableOpacity>
                            </View>

                            {currentNetwork.current?.private && (
                            <View style={styles.membersSection}>
                                <View style={styles.membersSectionHeader}>
                                    <Text style={styles.sectionTitle}>{t("members")} ({member?.length})</Text>

                                    {(currentNetwork.current?.private && currentNetwork.current?.creatorId === username.current) && (
                                        <TouchableOpacity 
                                            style={styles.addMemberButton}
                                            onPress={addUser}
                                        >
                                            <Ionicons name="person-add" size={18} color="#3B82F6" />
                                            <Text style={styles.addMemberText}>{t("add")}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {member && member.length > 0 ? (
                                <FlatList
                                    data={member}
                                    keyExtractor={(item) => item.memberId}
                                    renderItem={renderMemberItem}
                                    ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
                                    style={styles.membersList}
                                        contentContainerStyle={{ paddingBottom: 20 }}
                                    showsVerticalScrollIndicator={false}
                                />
                                ) : (
                                    <View style={styles.emptyMembersContainer}>
                                        <Text style={styles.emptyMembersText}>{t("no.members.found")}</Text>
                            </View>
                                )}
                            </View>)}
                        </View>
                    </Pressable>
                </BlurView>
            </Modal>
            <FriendsSelectionModal
                visible={modalVisible}
                onClose={() => setFriendsModalVisible(false)}
                onSubmit={handleAddFriends}
                username={username.current}
                token={token.current}
                member={member}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    memberSeparator: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginLeft: 68,
    },
    emptyMembersContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyMembersText: {
        fontSize: 14,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
    // Desktop styles
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
    },
    desktopSidebar: {
        width: '30%',
        maxWidth: 400,
        borderRightWidth: 1,
        borderRightColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
    },
    desktopHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    desktopNetworkInfo: {
        padding: 20,
        alignItems: 'center',
    },
    desktopNetworkImage: {
        width: 120,
        height: 120,
        borderRadius: 20,
        marginBottom: 16,
    },
    desktopNetworkImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    desktopNetworkName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
        textAlign: 'center',
    },
    desktopNetworkDescription: {
        fontSize: 16,
        color: '#64748B',
        marginBottom: 20,
        textAlign: 'center',
        paddingHorizontal: 10,
    },
    desktopNetworkStats: {
        width: '100%',
        marginBottom: 24,
    },
    desktopActionButtons: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    desktopActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    desktopActionButtonText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginLeft: 8,
    },
    desktopContent: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748B',
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        zIndex: 10,
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
    },
    headerTitle: {
        fontSize: 20, // Consistent with other headers
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    lockIcon: {
        marginLeft: 6,
    },
    infoButton: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    messagesList: {
        paddingTop: 8,
        paddingBottom: 80,
    },
    loadingMoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    loadingMoreText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#64748B',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
        paddingBottom: 100,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#64748B',
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        color: '#94A3B8',
        textAlign: 'center',
    },
    inputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingHorizontal: 12,
        paddingTop: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 100,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#F1F5F9',
        borderRadius: 24,
        paddingHorizontal: 12,
        marginHorizontal: 2,
    },
    input: {
        flex: 1,
        paddingHorizontal: 10,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 120,
        color: '#334155',
    },
    friendsModalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748B',
    },
    addButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        backgroundColor: '#3B82F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    disabledAddButton: {
        backgroundColor: '#93C5FD',
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 2,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
        height: '100%',
    },
    modalContent: {
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
        color: '#FFFFFF',
    },
    closeButton: {
        padding: 4,
    },
    networkInfoSection: {
        padding: 16,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    networkImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    networkImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    networkDetails: {
        flex: 1,
    },
    networkNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    networkName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    editButton: {
        padding: 4,
    },
    networkDescription: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 12,
    },
    networkStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
        marginBottom: 4,
    },
    statText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 24,
    },
    actionButtonText: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 6,
    },
    membersSection: {
        maxHeight: "50%"
    },
    membersSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    addMemberButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    addMemberText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
        marginLeft: 4,
    },
    membersList: {
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    memberTextContainer: {
        flex: 1,
    },
    memberName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#cfcfcf',
    },
    memberUsername: {
        fontSize: 14,
        color: '#808c9e',
    },
    removeButton: {
        backgroundColor: '#EF4444',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

const FriendsSelectionModal = ({ visible, onClose, onSubmit, username, token, member }) => {
    const [friendsList, setFriendsList] = useState([]);
    const [isLoadingFriends, setIsLoadingFriends] = useState(true);
    const [selectedFriends, setSelectedFriends] = useState([]);

    const {t} = useTranslation();

    useEffect(() => {
        const loadFriends = async () => {
            setIsLoadingFriends(true);
            try {
                const response = await fetch(`${ip}/profile/${username}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    let selectableFriends = data.friends.filter(friend => !member.some(m => m.memberId === friend.memberId));
                    setFriendsList(selectableFriends);
                } else {
                    console.error("Failed to fetch friends");
                }
            } catch (error) {
                console.error("Error loading friends:", error);
            } finally {
                setIsLoadingFriends(false);
            }
        };

        if (visible) {
            loadFriends();
        }
    }, [visible]);

    const toggleFriendSelection = (friendId) => {
        if (selectedFriends.includes(friendId)) {
            setSelectedFriends(selectedFriends.filter(id => id !== friendId));
        } else {
            setSelectedFriends([...selectedFriends, friendId]);
        }
    };

    const handleSubmit = async () => {
        if (selectedFriends.length === 0) {
            showAlert({
                title: t("no.selection"),
                message: t("select.at.least.one.friend"),
                buttons: [{ text: 'OK', onPress: () => {} }]
            });
            return;
        }

        onSubmit(selectedFriends);
    };

    const renderFriendItem = ({ item }) => (
        <TouchableOpacity
            style={[
                styles.friendItem,
                selectedFriends.includes(item.memberId) && styles.selectedFriendItem,
                {flexDirection: "row", justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12}
            ]}
            onPress={() => toggleFriendSelection(item.memberId)}
        >
            <View style={styles.memberInfo}>
                {item.memberProfilePicturePath ? (
                    <Image
                        source={{ uri: item.memberProfilePicturePath.split(',')[0] }}
                        style={styles.memberAvatar}
                        contentFit="cover"
                    />
                ) : (
                    <View style={[styles.memberAvatar, { backgroundColor: '#E2E8F0' }]}>
                        <Ionicons name="person" size={20} color="#94A3B8" />
                    </View>
                )}
                <View style={styles.memberTextContainer}>
                    <Text style={styles.memberName}>{item.memberName || item.memberId}</Text>
                    <Text style={styles.memberUsername}>@{item.memberId}</Text>
                </View>
            </View>
            <Ionicons
                name={selectedFriends.includes(item.memberId) ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={selectedFriends.includes(item.memberId) ? "#3B82F6" : "#CBD5E1"}
            />
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaProvider>
                <SafeAreaView style={{flex: 1}}>
                    <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={styles.modalOverlay}>
                        <Pressable style={styles.modalOverlay} onPress={onClose}>
                            <View
                                style={styles.friendsModalContent}
                                onStartShouldSetResponder={() => true}
                                onTouchEnd={(e) => e.stopPropagation()}
                            >
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>{t("add.friends.to.network")}</Text>
                                    <TouchableOpacity
                                        onPress={onClose}
                                        style={styles.closeButton}
                                    >
                                        <Ionicons name="close" size={24} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                {isLoadingFriends ? (
                                    <View style={styles.friendsLoadingContainer}>
                                        <ActivityIndicator size="large" color="#3B82F6" />
                                        <Text style={styles.loadingText}>{t("friends.loading")}</Text>
                                    </View>
                                ) : friendsList.length > 0 ? (
                                    <FlatList
                                        data={friendsList}
                                        renderItem={renderFriendItem}
                                        keyExtractor={item => item.memberId}
                                        contentContainerStyle={styles.friendsList}
                                        ItemSeparatorComponent={() => <View style={styles.memberSeparator} />}
                                        showsVerticalScrollIndicator={false}
                                    />
                                ) : (
                                    <View style={styles.emptyFriendsContainer}>
                                        <Text style={styles.emptyFriendsText}>{t("no.friends.found")}</Text>
                                        <Text style={styles.emptyFriendsSubtext}>{t("add.friends.to.invite")}</Text>
                                    </View>
                                )}

                                <View style={styles.friendsModalFooter}>
                                    <TouchableOpacity
                                        style={styles.cancelButton}
                                        onPress={onClose}
                                    >
                                        <Text style={styles.cancelButtonText}>{t("cancel")}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.addButton,
                                            selectedFriends.length === 0 && styles.disabledAddButton
                                        ]}
                                        onPress={handleSubmit}
                                        disabled={selectedFriends.length === 0}
                                    >
                                        <Text style={styles.addButtonText}>
                                            {t("add")} {selectedFriends.length > 0 ? `(${selectedFriends.length})` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Pressable>
                    </BlurView>
                </SafeAreaView>
            </SafeAreaProvider>
        </Modal>
    );
};