import {
    Animated,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Dimensions, Pressable
} from "react-native";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../../../components/WebSocketProvider";
import asyncStorage from "@react-native-async-storage/async-storage";
import {Image} from "expo-image";
import MessageEntry from "../../../components/Entries/Message.jsx";
import Ionicons from "@expo/vector-icons/Ionicons";
import {ImageManipulator, SaveFormat} from "expo-image-manipulator";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function ChatRoom() {
    const { username } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const segments = useSegments();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > MOBILE_WIDTH_THRESHOLD + 250);
    const [isEmbedded, setIsEmbedded] = useState(false);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [inputHeight, setInputHeight] = useState(40);

    const flatListRef = useRef(null);
    const inputRef = useRef(null);
    const ws = new WebSocketProvider();
    const router = useRouter();
    const inputBarAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            setWindowWidth(newWidth);
            setIsDesktop(newWidth > MOBILE_WIDTH_THRESHOLD + 250);
        };

        if (Platform.OS === 'web') {
            setIsEmbedded(window?.frameElement !== null);
            window.addEventListener('resize', handleResize);
        }

        handleResize();

        return () => {
            if (Platform.OS === 'web') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else {
                if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });

        const loadMessages = async () => {
            const loadedMessages = await asyncStorage.getItem(`messages/${username}`);
            if (loadedMessages !== null) {
                setMessages(JSON.parse(loadedMessages));
            }
            setIsLoading(false);

            let loadedChats = await asyncStorage.getItem("chats") || [];
            if (loadedChats.length !== 0) {
                loadedChats = JSON.parse(loadedChats);
            }

            if (loadedChats.filter((chat) => chat.username === username).length === 1) {
                setUserData(loadedChats.filter((chat) => chat.username === username)[0])
            } else {
                let token;
                if (Platform.OS === "web") {
                    token = localStorage.getItem("token");
                }
                else {
                    token = SecureStore.getItem("token");
                }
                const profile = await fetch(`${ip}/profile/${username}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });
                if (profile.ok) {
                    const profileJson = await profile.json();
                    setUserData({ name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath });
                }
            }
        }
        loadMessages();

        ws.messageReceived.addListener("messageReceived", async (e) => {
            let myUsername;
            if (Platform.OS === "web") {
                myUsername = localStorage.getItem("username");
            }
            else {
                myUsername = SecureStore.getItem("username");
            }
            if (e.detail.sender !== username && e.detail.sender !== myUsername) {
                return;
            }

            setMessages((prevMessages) => [...prevMessages, e.detail]);

            setTimeout(async () => {
                let loadedChats = await asyncStorage.getItem("chats") || [];
                if (loadedChats.length !== 0) {
                    loadedChats = JSON.parse(loadedChats);
                }
                await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                    if (chat.username === username) {
                        return {...chat, unread: false};
                    }
                    return chat;
                })));
                let NewLoadedChats = await asyncStorage.getItem("chats") || [];
                if (NewLoadedChats.length !== 0) {
                    NewLoadedChats = JSON.parse(NewLoadedChats);
                }
                ws.messageReceived.emit("unreadMessagesChanged", {unread: NewLoadedChats.filter((chat) => chat.unread).length});
            }, 1000);
        });

        return () => {
            ws.messageReceived.removeAllListeners("messageReceived");
        }
    }, []);

    const handleBackNavigation = () => {
        if (isDesktop && !isEmbedded) {
            router.push('/chats');
        } else if (Platform.OS === 'web' && !isEmbedded) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('username');
            window.history.pushState({}, '', newUrl);
            router.back();
        } else {
            router.back();
        }
    };

    async function sendMessage() {
        if (input.trim() === '' && selectedImages.length === 0) return;

        try {
            if (ws.stompClient === null) {
                console.error("Connect to Websocket manually")
                return;
            }
            const messageContent = input.trim();
            setMessages((prevMessages) => [...prevMessages, {
                isSender: true,
                content: messageContent,
                millis: Date.now(),
                isOptimistic: true,
                images: selectedImages
            }]);
            setInput("");
            setSelectedImages([]);

            let imageURls = [];
            if (selectedImages.length > 0) {
                let token = '';
                if (Platform.OS === "web") {
                    token = localStorage.getItem("token");
                } else {
                    token = await SecureStore.getItemAsync("token");
                }

                for (const image of selectedImages) {
                    let tempImage;
                    const manipResult = await ImageManipulator.manipulate(
                        image).resize({width: 500});
                    const renderedImage = await manipResult.renderAsync();
                    const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                    tempImage = savedImage.uri;

                    const bucketResponse = await fetch(`${ip}/profile/upload`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
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

            ws.stompClient.publish({
                destination: `/app/chat`,
                body: JSON.stringify({
                    receiver: username,
                    content: messageContent,
                    images: imageURls
                })
            });

            let loadedChats = await asyncStorage.getItem("chats") || [];
            if (loadedChats.length !== 0) {loadedChats = JSON.parse(loadedChats);}
            if(!loadedChats.find((chat) => chat.username === username) || loadedChats.length === 0) {
                let token;
                if (Platform.OS === "web") {
                    token = localStorage.getItem("token");
                }
                else {
                    token = SecureStore.getItem("token");
                }
                const profile = await fetch(`${ip}/profile/${username}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (profile.ok) {
                    const profileJson = await profile.json();
                    await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }]));
                    loadedChats = [...loadedChats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }];
                }
            }
            await asyncStorage.setItem("chats", JSON.stringify([...loadedChats.filter(chat => chat.username === username), ...loadedChats.filter(chat => chat.username !== username)]));

            let loadedMessages = await asyncStorage.getItem(`messages/${username}`) || [];
            if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
            await asyncStorage.setItem(`messages/${username}`, JSON.stringify([...loadedMessages, {
                isSender: true,
                content: messageContent,
                millis: Date.now(),
                images: imageURls
            }]));
        }
        catch (e) {
            setMessages(prevState => prevState.filter((chat) => !chat.isOptimistic));
        }
    }

    useEffect(() => {
        const keyboardShowListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillShow', (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
                Animated.timing(inputBarAnimation, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: false
                }).start();
              })
            : Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
                Animated.timing(inputBarAnimation, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: false
                }).start();
              });

        const keyboardHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
                Animated.timing(inputBarAnimation, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false
                }).start();
              })
            : Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
                Animated.timing(inputBarAnimation, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: false
                }).start();
              });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingIndicator}>
                    <Text style={styles.loadingText}>Loading conversation...</Text>
                </View>
            </View>
        );
    }

    const bottomPadding = Platform.OS === 'ios' 
        ? keyboardVisible 
            ? 10  
            : Math.max(insets.bottom, 16)
        : 16;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            style={styles.container}
        >
            <View
                style={[
                    styles.contentContainer, 
                    { paddingTop: Platform.OS !== 'web' ? insets.top : 0 }
                ]}
            >
                {/* Chat header - enhanced styling */}
                <View style={styles.header}>
                    {(!isEmbedded || !isDesktop) && (
                        <TouchableOpacity
                            onPress={handleBackNavigation}
                            style={styles.backButton}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={22} color="#3B82F6" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push(`/${username}`)}
                        style={styles.profileContainer}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={{ uri: userData.image }}
                            style={styles.profileImage}
                            className="bg-gray-200"
                            cachePolicy="memory"
                            transition={150}
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userData.name}</Text>
                            {isTyping ? (
                                <Text style={styles.typingIndicator}>typing...</Text>
                            ) : (
                                <Text style={styles.profileSubtext}>Tap to view profile</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="ellipsis-vertical" size={18} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={(item, index) => item.id || index.toString()}
                    renderItem={({ item }) => (
                        <MessageEntry message={item} />
                    )}
                    contentContainerStyle={styles.messagesContent}
                    style={styles.messagesList}
                    onContentSizeChange={() => {
                        if (flatListRef.current && messages.length > 0) {
                            flatListRef.current.scrollToEnd({ animated: true });
                        }
                    }}
                    onLayout={() => {
                        if (flatListRef.current && messages.length > 0) {
                            setTimeout(() => {
                                flatListRef.current?.scrollToEnd({ animated: true });
                            }, 100);
                        }
                    }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyChat}>
                            <Text style={styles.emptyChatText}>No messages yet.</Text>
                            <Text style={styles.emptyChatSubtext}>Start the conversation!</Text>
                        </View>
                    }
                />

                <Animated.View
                    style={[
                        styles.inputContainer,
                        {
                            paddingBottom: bottomPadding,
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
                            ref={inputRef}
                            style={[styles.textInput, { height: Math.max(40, inputHeight) }]}
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            onContentSizeChange={(e) => {
                                const height = e.nativeEvent.contentSize.height;
                                setInputHeight(Math.min(height, 120));
                            }}
                            onSubmitEditing={() => {if (Platform.OS === "web") {sendMessage()}}}
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={input.trim() === '' && selectedImages.length === 0}
                            style={[
                                styles.sendButton,
                                { backgroundColor: input.trim() === '' && selectedImages.length === 0 ? '#CBD5E1' : '#3B82F6' }
                            ]}
                            activeOpacity={input.trim() === '' && selectedImages.length === 0 ? 1 : 0.7}
                        >
                            <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </KeyboardAvoidingView>
    );
}

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
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    profileInfo: {
        marginLeft: 12,
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    profileSubtext: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 1,
    },
    typingIndicator: {
        fontSize: 12,
        color: '#3B82F6',
        marginTop: 1,
        fontWeight: '500',
    },
    menuButton: {
        width: 38,
        height: 38,
        borderRadius: 20,
        backgroundColor: 'rgba(100, 116, 139, 0.08)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    messagesContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'web' ? 16 : 90,
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
