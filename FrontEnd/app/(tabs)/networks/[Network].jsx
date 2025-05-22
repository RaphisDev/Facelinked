import "../../../global.css"
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {
    Animated,
    Easing,
    FlatList,
    Keyboard, Modal,
    Platform,
    Pressable, StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Text, Share, Alert,
    KeyboardAvoidingView
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import WebSocketProvider from "../../../components/WebSocketProvider";
import NetworkMessage from "../../../components/Entries/NetworkMessage";
import * as SecureStorage from "expo-secure-store";
import {Image} from "expo-image";
import asyncStorage from "@react-native-async-storage/async-storage";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";
import {showAlert} from "../../../components/PopUpModalView";
import * as ImagePicker from "expo-image-picker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {ImageManipulator, SaveFormat} from "expo-image-manipulator";

export default function Network() {
    const {Network} = useLocalSearchParams();
    const insets = useSafeAreaInsets();

    const navigator = useNavigation("../");
    const router = useRouter();
    const ws = new WebSocketProvider();
    const stateManager = new StateManager();

    const [messages, addMessage] = useState([]);
    const messageList = useRef(null);
    const input = useRef(null);
    const [inputText, setInputText] = useState("");
    const [DataCollapse, setDataCollapse] = useState(true);

    // UI state variables
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [inputHeight, setInputHeight] = useState(40);
    const [inputContainerHeight, setInputContainerHeight] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const initializedMessages = useRef(false);
    const loadingAdditionalMessages = useRef(false);
    const oldestMessageId = useRef(null);
    const hasMoreMessages = useRef(true);

    const token = useRef("");
    const username = useRef("");

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

        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => {
                if (stateManager.networkOpened) {
                    router.back();
                }
                else {
                    router.replace("/networks");
                }
            }}><Ionicons
                name="arrow-back" size={24} color="black"/></TouchableOpacity>,
            headerRight: () => <TouchableOpacity className="mr-2" onPress={() => setModalVisible(true)}><Ionicons
                name="people" size={24} color="black"/></TouchableOpacity>,
        });

            const loadNetwork = async () => {
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
                currentNetwork.current = {networkId: data.id, name: data.name, description: data.description, creatorId: data.creatorId, private: data.private, memberCount: data.memberCount, networkPicturePath: data.networkPicturePath};

                navigator.setOptions({
                    headerTitle: currentNetwork.current?.name,
                });

                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
                if(loadedNetworks.some((network) =>network.networkId === Network)) {
                    setIsFavorite(true);
                    await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.map((network) => {
                        if (network.networkId === Network) {
                            return {networkId: data.id, name: data.name, description: data.description, creatorId: data.creatorId, private: data.private, members: member.current, memberCount: data.memberCount, networkPicturePath: data.networkPicturePath};
                        }
                        return network;
                    })));
                }
            }
            else {
                showAlert({
                    title: 'Not Found',
                    message: 'Network not found/You have no access',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {

                            }
                        },
                    ],
                });
                router.back();
            }
        }
        loadNetwork();

        const loadMessages = async () => {
            setIsLoading(true);
            const loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || null;
            if (loadedMessages !== null) {
                const parsedMessages = JSON.parse(loadedMessages);
                addMessage(parsedMessages);

                // Set oldest message ID for pagination
                if (parsedMessages.length > 0) {
                    const sortedMessages = [...parsedMessages].sort((a, b) => a.millis - b.millis);
                    oldestMessageId.current = sortedMessages[0].millis;
                }

                setTimeout(() => {
                    initializedMessages.current = true;
                    setIsLoading(false);
                }, 500);
            } else {
                setIsLoading(false);
            }
        };

        const receiveNetworkMessages = async () => {
            let parsedNetworks = await asyncStorage.getItem("networks") || [];
            if (parsedNetworks.length !== 0) {
                parsedNetworks = JSON.parse(parsedNetworks);
            }

            if (!parsedNetworks.some((network) => network.networkId === Network)) {
                if (ws.stompClient.connected) {
                    // Subscribe to new messages
                    ws.stompClient.subscribe(`/networks/${Network}`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        if (parsedMessage.senderId.memberId === username.current) {return;}

                        // Add new message to state
                        addMessage((prevMessages) => [...prevMessages, {
                            sender: parsedMessage.senderId.memberId, 
                            senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath.split(",")[0], 
                            content: parsedMessage.content, 
                            millis: parsedMessage.millis,
                            images: parsedMessage.images || []
                        }]);
                    });

                    // Fetch initial messages
                    const receivedMessages = await fetch(`${ip}/networks/${Network}/messages`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token.current}`,
                            "Content-Type": "application/json"
                        }
                    });

                    if (receivedMessages.ok) {
                        const data = await receivedMessages.json();

                        // Set oldest message ID for pagination
                        if (data.length > 0) {
                            const sortedMessages = [...data].sort((a, b) => a.millis - b.millis);
                            oldestMessageId.current = sortedMessages[0].millis;
                        }

                        // Add messages to state
                        addMessage(prevState => [...prevState, ...data.map((message) => {
                            return {
                                senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0], 
                                sender: message.senderId.memberId, 
                                content: message.content, 
                                millis: message.millis,
                                images: message.images || []
                            };
                        })]);

                        setTimeout(() => {
                            initializedMessages.current = true;
                            setIsLoading(false);
                        }, 500);
                    }
                }
            } else {
                // For favorited networks, fetch new messages since last visit
                if (await asyncStorage.getItem(`lastNetworkMessageId/${Network}`)) {
                    const receivedMessages = await fetch(`${ip}/networks/${Network}/afterId?id=${encodeURIComponent(await asyncStorage.getItem(`lastNetworkMessageId/${Network}`))}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token.current}`,
                            "Application-Type": "application/json"
                        }
                    });

                    if (receivedMessages.ok) {
                        const data = await receivedMessages.json();

                        if (data.length > 0) {
                            // Add new messages to state
                            addMessage(prevState => [...prevState, ...data.map((message) => {
                                return {
                                    senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                    sender: message.senderId.memberId,
                                    content: message.content,
                                    millis: message.millis,
                                    images: message.images || []
                                };
                            })]);

                            // Update last message ID
                            await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, data[data.length - 1].millis.toString());

                            // Update stored messages
                            let messages = await asyncStorage.getItem(`networks/${Network}`) || [];
                            if (messages.length !== 0) {
                                messages = JSON.parse(messages);
                            }
                            await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...messages, ...data.map((message) => {
                                return {
                                    senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                    sender: message.senderId.memberId,
                                    content: message.content,
                                    millis: message.millis,
                                    images: message.images || []
                                };
                            })]));
                        }
                    }
                }

                setIsLoading(false);
            }
        };

        loadMessages();
        receiveNetworkMessages();

        ws.messageReceived.addListener("networkMessageReceived", async (e) => {
            if (e.detail.networkId !== Network) {
                return;
            }

            addMessage((prevMessages) => [...prevMessages, e.detail]);
        });

        return () => {
            navigator.setOptions({
                headerLeft: () => <TouchableOpacity className="ml-2 mb-1" onPress={() => router.navigate("/networks/create")}>
                    <Ionicons name="add" size={25}/>
                </TouchableOpacity>,
                headerTitle: "Networks",
            });
            ws.messageReceived.removeAllListeners("messageReceived");
        }
    }, []);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "images",
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImages(prevState => [...prevState, ...result.assets.map(asset => asset.uri)]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const renderSelectedImages = () => {
        if (!selectedImages || selectedImages.length === 0) return null;

        return (
            <View style={styles.selectedImagesContainer}>
                <FlatList
                    horizontal
                    data={selectedImages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.selectedImageWrapper}>
                            <Image
                                source={{ uri: item }}
                                style={styles.selectedImage}
                                contentFit="cover"
                                transition={200}
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => {
                                    const newImages = [...selectedImages];
                                    newImages.splice(index, 1);
                                    setSelectedImages(newImages);
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

    async function sendMessage() {
        if (inputText.trim() === '' && selectedImages.length === 0) return;

        try {
            if (ws.stompClient === null) {
                console.error("Connect to Websocket manually");
                return;
            }

            const messageContent = inputText.trim();

            // Optimistically add message to UI
            addMessage((prevMessages) => [...prevMessages, {
                sender: username.current, 
                senderProfilePicturePath: Platform.OS === "web" 
                    ? localStorage.getItem("profilePicture")?.split(",")[0] 
                    : SecureStore.getItem("profilePicture")?.split(",")[0], 
                content: messageContent, 
                millis: Date.now(),
                isOptimistic: true,
                images: selectedImages
            }]);

            setInputText("");
            setSelectedImages([]);
            setInputHeight(40);

            // Upload images if any
            let imageURls = [];
            if (selectedImages.length > 0) {
                for (const image of selectedImages) {
                    let tempImage;
                    const manipResult = await ImageManipulator.manipulate(
                        image).resize({width: 500});
                    const renderedImage = await manipResult.renderAsync();
                    const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                    tempImage = savedImage.uri;

                    const bucketResponse = await fetch(`${ip}/networks/upload`, {
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
                        imageURls.push(url.split("?")[0]);
                    }
                }
            }

            // Send message via WebSocket
            ws.stompClient.publish({
                destination: `/app/networks/send`,
                body: JSON.stringify({
                    receiver: Network,
                    content: messageContent,
                    images: imageURls
                })
            });

            // Update local storage
            if (JSON.parse(await asyncStorage.getItem("networks"))?.some((network) => network.networkId === Network)) {
                let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
                if (loadedMessages.length !== 0) {
                    loadedMessages = JSON.parse(loadedMessages);
                }
                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...loadedMessages, {
                    sender: username.current,
                    content: messageContent,
                    millis: Date.now(),
                    images: imageURls
                }]));

                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
                await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks.filter(network => network.networkId === Network), ...loadedNetworks.filter(network => network.networkId !== Network)]));
            }

            // Update optimistic message with actual image URLs
            addMessage(prevState => prevState.map(message => {
                if (message.isOptimistic) {
                    return {
                        ...message,
                        isOptimistic: false,
                        images: imageURls
                    };
                }
                return message;
            }));
        }
        catch (e) {
            console.error(e);
        }
    }

    const translateY = useRef(new Animated.Value(0)).current;
    const translateY2 = useRef(new Animated.Value(230)).current;
    const translateY3 = useRef(new Animated.Value(150)).current;
    const inputBarAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const offset = Platform.OS === "ios" ? event.endCoordinates.height - 83 : 10;
                Animated.timing(translateY, {
                    toValue: -offset,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.poly(1.5)),
                }).start();
                
                Animated.timing(inputBarAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.poly(1.5)),
                }).start();
                
                setKeyboardVisible(true);
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.poly(4)),
                }).start();
                
                Animated.timing(inputBarAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                    easing: Easing.out(Easing.poly(4)),
                }).start();
                
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Message date formatting and grouping functions
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

    const groupMessagesByDate = (messages) => {
        if (!messages || messages.length === 0) return [];

        const groups = [];
        let currentDate = null;

        messages.forEach(message => {
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

    const DateHeader = ({ date }) => {
        return (
            <View style={headerStyles.container}>
                <View style={headerStyles.line} />
                <Text style={headerStyles.dateText}>{date}</Text>
                <View style={headerStyles.line} />
            </View>
        );
    };

    const headerStyles = StyleSheet.create({
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

    const styles = StyleSheet.create({
        container: {
            flex: 1,
        },
        contentContainer: {
            flex: 1,
            backgroundColor: '#F8FAFC',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
        },
        loadingIndicator: {
            padding: 16,
            borderRadius: 12,
            backgroundColor: 'white',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 3,
        },
        loadingText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#64748B',
        },
        header: {
            backgroundColor: 'white',
            borderBottomWidth: 1,
            borderBottomColor: '#E2E8F0',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 1,
            },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
            zIndex: 10,
        },
        messagesContent: {
            paddingHorizontal: 16,
            paddingTop: 16,
        },
        messagesList: {
            flex: 1,
        },
        emptyChat: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginTop: 100,
        },
        emptyChatText: {
            fontSize: 16,
            fontWeight: '500',
            color: '#64748B',
        },
        emptyChatSubtext: {
            fontSize: 14,
            color: '#94A3B8',
            marginTop: 8,
        },
        inputContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#E2E8F0',
            paddingTop: 10,
            paddingHorizontal: 12,
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
        attachButton: {
            paddingVertical: 10,
            paddingHorizontal: 4,
            justifyContent: 'center',
            alignItems: 'center',
        },
        textInput: {
            flex: 1,
            paddingHorizontal: 10,
            paddingVertical: 10,
            fontSize: 16,
            maxHeight: 120,
            color: '#334155',
        },
        sendButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#3B82F6',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 8,
            marginBottom: 4,
        },
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
    });

    const [isModalVisible, setModalVisible] = useState(false);
    const [member, setMember] = useState([]);
    const currentNetwork = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);

    async function setFavorite(shouldFavorite) {
        let loadedNetworks = await asyncStorage.getItem("networks") || [];
        if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
        if (!shouldFavorite) {
            await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.filter((network) => {
                return network.networkId !== Network;
            })));
            await asyncStorage.removeItem(`networks/${Network}`);
            await asyncStorage.removeItem(`lastNetworkMessageId/${Network}`);
        }
        else {
            await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks, {networkId: currentNetwork.current.networkId, name: currentNetwork.current.name, description: currentNetwork.current.description, creatorId: currentNetwork.current.creatorId, memberCount: currentNetwork.current.memberCount + 1, networkPicturePath: currentNetwork.current.networkPicturePath, private: currentNetwork.current.private, members: member}]));
            if (messages.length !== 0) {
                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(messages));
            }
            await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, Date.now().toString());
        }
        await fetch(`${ip}/networks/${Network}/favorite?b=${encodeURIComponent(shouldFavorite)}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token.current}`,
            }
        });
    }
    async function removeUser(user) {
        const response = await fetch(`${ip}/networks/${Network}/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.current}`
            },
            body: JSON.stringify(
                [{
                    memberId: user
                }]
            ),
        });
        if (response.ok) {
            setMember(member.filter((member) => member.memberId !== user));

            showAlert({
                title: 'User removed',
                message: '',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {}
                    },
                ],
            });
        }
        else {
            showAlert({
                title: 'Failed to remove user',
                message: '',
                buttons: [
                    {
                        text: 'Cancel',
                        onPress: () => {}
                    },
                ],
            });
        }
    }

    return(
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View className="h-full">
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingIndicator}>
                            <Text style={styles.loadingText}>Loading conversation...</Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        ref={messageList}
                        data={groupMessagesByDate(messages)}
                        keyExtractor={(item) => item.id || `${item.millis}-${item.sender}`}
                        renderItem={({ item }) => {
                            if (item.type === 'date-header') {
                                return <DateHeader date={item.date} />;
                            } else {
                                return (
                                    <NetworkMessage 
                                        content={item.content} 
                                        sender={item.sender} 
                                        senderProfilePicturePath={item.senderProfilePicturePath} 
                                        timestamp={new Date(item.millis).toLocaleString()}
                                        images={item.images}
                                    />
                                );
                            }
                        }}
                        contentContainerStyle={styles.messagesContent}
                        style={[styles.messagesList, {marginBottom: inputContainerHeight}]}
                        onContentSizeChange={() => {
                            if (!loadingAdditionalMessages.current) {
                                setTimeout(() => {
                                    messageList.current?.scrollToEnd({animated: true});
                                }, 50);
                            }
                        }}
                        showsVerticalScrollIndicator={false}
                        maintainVisibleContentPosition={{
                            minIndexForVisible: 0,
                        }}
                        onEndReached={() => {
                            // This would be used if we wanted to load newer messages when scrolling down
                            // Not needed for this implementation
                        }}
                        onStartReached={async () => {
                            // Load older messages when scrolling to the top
                            if (initializedMessages.current && !loadingAdditionalMessages.current && hasMoreMessages.current && oldestMessageId.current) {
                                loadingAdditionalMessages.current = true;

                                try {
                                    const receivedMessages = await fetch(`${ip}/networks/${Network}/beforeId?id=${encodeURIComponent(oldestMessageId.current)}`, {
                                        method: "GET",
                                        headers: {
                                            "Authorization": `Bearer ${token.current}`,
                                            "Content-Type": "application/json"
                                        }
                                    });

                                    if (receivedMessages.ok) {
                                        const data = await receivedMessages.json();

                                        if (data.length > 0) {
                                            // Update oldest message ID for next pagination
                                            const sortedMessages = [...data].sort((a, b) => a.millis - b.millis);
                                            oldestMessageId.current = sortedMessages[0].millis;

                                            // Prepend older messages to the state
                                            addMessage(prevState => [
                                                ...data.map((message) => ({
                                                    senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                                    sender: message.senderId.memberId,
                                                    content: message.content,
                                                    millis: message.millis,
                                                    images: message.images || []
                                                })),
                                                ...prevState
                                            ]);

                                            // Update local storage with older messages
                                            let storedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
                                            if (storedMessages.length !== 0) {
                                                storedMessages = JSON.parse(storedMessages);
                                            }

                                            await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([
                                                ...data.map((message) => ({
                                                    senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                                    sender: message.senderId.memberId,
                                                    content: message.content,
                                                    millis: message.millis,
                                                    images: message.images || []
                                                })),
                                                ...storedMessages
                                            ]));
                                        } else {
                                            // No more messages to load
                                            hasMoreMessages.current = false;
                                        }
                                    }
                                } catch (error) {
                                    console.error('Error loading older messages:', error);
                                } finally {
                                    // Reset loading state after a short delay
                                    setTimeout(() => {
                                        loadingAdditionalMessages.current = false;
                                    }, 500);
                                }
                            }
                        }}
                        onStartReachedThreshold={0.1}
                        ListEmptyComponent={
                            <View style={styles.emptyChat}>
                                <Text style={styles.emptyChatText}>No messages yet.</Text>
                                <Text style={styles.emptyChatSubtext}>Start the conversation!</Text>
                            </View>
                        }
                    />
                )}
            </View>
            <Animated.View
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setInputContainerHeight(height);
                }}
                style={[
                    styles.inputContainer,
                    {
                        paddingBottom: Platform.OS === 'ios'
                            ? keyboardVisible ? 10 : Math.max(insets.bottom, 16)
                            : 16,
                        backgroundColor: inputBarAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['rgba(255, 255, 255, 0.98)', 'rgba(255, 255, 255, 1)']
                        }),
                        shadowOpacity: inputBarAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.05, 0.1]
                        }),
                    }
                ]}
            >
                {renderSelectedImages()}

                <View style={styles.inputWrapper}>
                    <TouchableOpacity
                        onPress={pickImage}
                        style={styles.attachButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="image-outline" size={24} color="#64748B" />
                    </TouchableOpacity>

                    <TextInput
                        ref={input}
                        style={[styles.textInput, {height: Math.min(Math.max(40, inputHeight), 120)}]}
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        value={inputText}
                        className="outline-none"
                        onChangeText={setInputText}
                        multiline
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
                        onPress={sendMessage}
                        disabled={inputText.trim() === '' && selectedImages.length === 0}
                        style={[
                            styles.sendButton,
                            { backgroundColor: inputText.trim() === '' && selectedImages.length === 0 ? '#CBD5E1' : '#3B82F6' }
                        ]}
                        activeOpacity={inputText.trim() === '' && selectedImages.length === 0 ? 1 : 0.7}
                    >
                        <Ionicons name="send" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
            <Modal animationType="slide" presentationStyle="formSheet" visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="h-full w-full dark:bg-dark-primary">
                    {Platform.OS === "web" && <TouchableOpacity className="p-4 bg-gray-700 rounded-xl self-end mr-4 mt-4" onPress={() => setModalVisible(false)}><Ionicons size={23} color="white" name="close"/></TouchableOpacity>}
                    {currentNetwork.current?.creatorId === username.current &&
                        <TouchableOpacity activeOpacity={0.6} onPress={() => {
                            setModalVisible(false);
                            showAlert({
                                title: 'Update Network',
                                message: 'Enter a new name for the network\nLeave empty for no change',
                                hasInput: true,
                                inputConfig: {
                                    placeholder: 'New network name',
                                    defaultValue: currentNetwork.current.name
                                },
                                buttons: [
                                {
                                        text: 'Cancel',
                                        onPress: () => {}
                                    },
                                    {
                                        text: 'Update',
                                        onPress: (text) => {
                                        if (text.trim().length === 0) {
                                            text = currentNetwork.current.name;
                                        } else if (text.length <= 3) {
                                            setTimeout(() => {
                                                showAlert({
                                                    title: 'Error',
                                                    message: 'Name too short',
                                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                                });
                                            }, 300)
                                            return;
                                        }

                                            // Use setTimeout to ensure the next alert shows properly
                                            setTimeout(() => {
                                            showAlert({
                                                title: 'Update Network',
                                                message: 'Enter a new description\nLeave empty for no change',
                                                hasInput: true,
                                                inputConfig: {
                                                    placeholder: 'New description',
                                                    defaultValue: currentNetwork.current.description
                                                },
                                                buttons: [
                                            {
                                                        text: 'Cancel',
                                                        onPress: () => {}
                                                    },
                                                    {
                                                        text: 'Update',
                                                        onPress: async (description) => {
                                                    if (description.trim().length === 0) {
                                                        if (text === currentNetwork.current.name) {
                                                            setTimeout(() => {
                                                                showAlert({
                                                                    title: 'No Change',
                                                                    message: 'No change applied',
                                                                    buttons: [{
                                                                        text: 'OK', onPress: () => {
                                                                        }
                                                                    }]
                                                                });
                                                            }, 300);
                                                            return;
                                                        }
                                                        description = currentNetwork.current.description;
                                                    } else if (description.length <= 3) {
                                                        setTimeout(() => {
                                                            showAlert({
                                                                title: 'Error',
                                                                message: 'Description too short',
                                                                buttons: [{
                                                                    text: 'OK', onPress: () => {
                                                                    }
                                                                }]
                                                            });
                                                        }, 300);
                                                        return;
                                                    }

                                                    const response = await fetch(`${ip}/networks/${Network}/update`, {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                            "Authorization": `Bearer ${token.current}`
                                                        },
                                                        body: JSON.stringify({name: text, description: description})
                                                    });

                                                    if (response.ok) {
                                                        navigator.setOptions({
                                                            headerTitle: text
                                                        });
                                                        currentNetwork.current = {
                                                            networkId: currentNetwork.current.networkId,
                                                            name: text,
                                                            description: description,
                                                            creatorId: currentNetwork.current.creatorId,
                                                            private: currentNetwork.current.private,
                                                            memberCount: currentNetwork.current.memberCount,
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
                                                                    memberCount: currentNetwork.current.memberCount,
                                                                    networkPicturePath: currentNetwork.current.networkPicturePath
                                                                };
                                                            }
                                                            return network;
                                                        })));
                                                        setTimeout(() => {
                                                                showAlert({
                                                                    title: 'Success',
                                                                    message: 'Change approved!',
                                                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                                                });
                                                        }, 300);
                                                    }
                                                }
                                                    }
                                                ]
                                            });
                                            }, 300); // Small delay to ensure previous alert is properly dismissed
                                    }
                                    }
                                ]
                            })
                        }

                        } className="self-center mt-5">
                            <View className="flex-row items-center">
                                <Text className="text-center text-text dark:text-dark-text font-bold text-2xl mr-1">{currentNetwork.current?.name}</Text>
                                <Ionicons name={"create-outline"} size={22} color={"#285FF5"}></Ionicons>
                            </View>
                        </TouchableOpacity>}
                    {currentNetwork.current?.creatorId !== username.current &&
                        <Text className="text-center text-text dark:text-dark-text font-bold text-2xl mt-5">{currentNetwork.current?.name}</Text>
                    }
                    <View className="flex-row justify-center items-center mt-7 mb-6">
                        <TouchableOpacity onPress={() => {
                            setIsFavorite(prevState => {setFavorite(!prevState); return !prevState;});
                        }} activeOpacity={0.65} className="rounded-full bg-accent p-5">
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.65} onPress={() => {
                            Share.share({
                                message: "Check out this network!",
                                title: "Check out this network!",
                                text: "Check out this network!",
                                url: `https://facelinked.com/networks/${Network}`,
                                dialogTitle: "Check out this network!"
                            });
                        }} className="rounded-full ml-11 mr-11 bg-accent p-5">
                            <Ionicons name={"share-outline"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.65} className="p-5 bg-accent rounded-full">
                            <Ionicons name={"search"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                    </View>
                    {(currentNetwork.current?.private && currentNetwork.current.creatorId === username.current) &&
                        <View className="flex-row justify-between">
                            <Text className="text-center text-text dark:text-dark-text self-start font-bold text-xl ml-2 mt-3">Member</Text>
                            <View className="self-end flex-row">
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(false);
                                    showAlert({
                                        title: 'Add User',
                                        message: 'Enter the username of the user you want to add to the network',
                                        hasInput: true,
                                        inputConfig: {
                                            placeholder: 'Username'
                                        },
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                onPress: () => {}
                                            },
                                            {
                                                text: 'Add',
                                                onPress: async (text) => {
                                                if (text.length <= 3) {
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Error',
                                                            message: 'User not found',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300)
                                                    return;
                                                }
                                                const response = await fetch(`${ip}/networks/${Network}/add`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${token.current}`
                                                    },
                                                    body: JSON.stringify([{memberId: text}])
                                                });

                                                if (response.ok) {
                                                    const receivedData = await fetch(`${ip}/networks/${Network}`, {
                                                        method: "GET",
                                                        headers: {
                                                            "Authorization": `Bearer ${token.current}`,
                                                            "Application-Type": "application/json"
                                                        }
                                                    });
                                                    const data = await receivedData.json();
                                                    setMember(data.members);
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Success',
                                                            message: 'User added',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300);
                                                }
                                                else {
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Error',
                                                            message: 'User not found',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300)
                                                }
                                                }
                                            },
                                        ],
                                    });
                                }} activeOpacity={0.65} className="rounded-full bg-accent p-2 mr-2 w-20">
                                    <Ionicons name={"add"} size={24} className="text-center" color={"#FFFFFF"}></Ionicons>
                                </TouchableOpacity>
                            </View>
                        </View>}
                    <FlatList data={member} renderItem={(item) =>
                        <View>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                router.navigate(`/${item.item.memberId}`);
                            }} activeOpacity={0.4} className="flex-row justify-between items-center p-3">
                                <View className="flex-row items-center">
                                    <Image source={{uri: item.item.memberProfilePicturePath.split(",")[0]}} style={{width: 42, height: 42, borderRadius: 21}}></Image>
                                    <View className="flex-col ml-3">
                                        <Text className="text-text dark:text-dark-text font-bold text-lg">{item.item.memberName}</Text>
                                        <Text className="text-text dark:text-dark-text text-sm">@{item.item.memberId}</Text>
                                    </View>
                                </View>
                                {(currentNetwork.current.private && currentNetwork.current.creatorId === username.current && item.item.memberId !== username.current) && <TouchableOpacity onPress={async() => {
                                    setModalVisible(false);
                                    showAlert({
                                        title: `Remove User`,
                                        message: `Are you sure you want to remove ${item.item.memberId}? This action cannot be undone.`,
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                onPress: () => {}
                                            },
                                            {
                                                text: 'Remove',
                                                onPress: async () => {
                                                await removeUser(item.item.memberId);
                                                }
                                            }
                                        ],
                                    });
                                }} activeOpacity={0.65} className="rounded-full bg-accent p-2">
                                    <Ionicons name={"trash"} size={16} color={"#FFFFFF"}></Ionicons>
                                </TouchableOpacity>}
                            </TouchableOpacity>
                            <View className="w-11/12 self-center">
                                <View className="border-b border-gray-700/80"></View>
                            </View>
                        </View>
                    }/>
                    <View className="w-[95%] self-center mb-24">
                        <Animated.View style={{ transform: [{translateY: translateY3 }]}}>
                            <TouchableOpacity onPress={() => {
                                setDataCollapse(prevState => {
                                    Animated.timing(translateY2, {
                                        toValue: prevState ? 0 : 230,
                                        duration: 800,
                                        useNativeDriver: true,
                                        easing: Easing.out(Easing.poly(4)),
                                    }).start();
                                    Animated.timing(translateY3, {
                                        toValue: prevState ? 0 : 150,
                                        duration: 800,
                                        useNativeDriver: true,
                                        easing: Easing.out(Easing.poly(4)),
                                    }).start();
                                    return !prevState;
                                })
                            }} activeOpacity={0.65} className="rounded-full bg-accent p-1.5 self-center">
                                <Ionicons name={DataCollapse ? "chevron-down" : "chevron-up"} size={23} color={"#FFFFFF"}></Ionicons>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{ transform: [{translateY: translateY2 }]}}>
                            <View className="mt-4">
                                <Text className="text-center text-text dark:text-dark-text font-semibold text-lg mt-3">Description</Text>
                                <Text className="text-center text-text dark:text-dark-text mt-0.5">{currentNetwork.current?.description}</Text>
                                <View className="flex-row justify-center items-center mt-3.5">
                                    <Ionicons name={"heart"} size={20} color={"black"}/>
                                    <Text className="text-text dark:text-dark-text ml-0.5 font-bold">{currentNetwork.current?.memberCount}</Text>
                                </View>
                                <Text className="text-center text-text dark:text-dark-text font-bold text-lg mt-6">created by {currentNetwork.current?.creatorId}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}
