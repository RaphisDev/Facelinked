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

    const flatListRef = useRef(null);
    const inputRef = useRef(null);
    const ws = new WebSocketProvider();
    const router = useRouter();

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
                    const bucketResponse = await fetch(`${ip}/profile/upload`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`,
                        }
                    });
                    if (bucketResponse.ok) {
                        const url = await bucketResponse.text();

                        const response = await fetch(image);
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
              })
            : Keyboard.addListener('keyboardDidShow', (e) => {
                setKeyboardVisible(true);
                setKeyboardHeight(e.endCoordinates.height);
              });
              
        const keyboardHideListener = Platform.OS === 'ios'
            ? Keyboard.addListener('keyboardWillHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
              })
            : Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardVisible(false);
                setKeyboardHeight(0);
              });

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    useEffect(() => {
        if (messages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 200);
        }
    }, [messages, keyboardVisible]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImages(result.assets.map(asset => asset.uri));
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const renderSelectedImages = () => {
        if (!selectedImages || selectedImages.length === 0) return null;
        if (selectedImages?.length === 0) return null;
        
        return (
            <View style={{ padding: 10, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
                <FlatList
                    horizontal
                    data={selectedImages}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={{ marginRight: 10, position: 'relative' }}>
                            <Image
                                source={{ uri: item }}
                                style={{ width: 70, height: 70, borderRadius: 8 }}
                                contentFit="cover"
                            />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    borderRadius: 12,
                                    width: 24,
                                    height: 24,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
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
            <View className="flex-1 justify-center items-center bg-white">
                <Text className="text-gray-600 font-medium">Loading conversation...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View
                className="flex-1 bg-gray-50"
                style={{
                    paddingTop: Platform.OS !== 'web' ? insets.top : 0,
                }}
            >
                {/* Chat header - enhanced styling */}
                <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center shadow-sm">
                    {(!isEmbedded || !isDesktop) && (
                        <TouchableOpacity
                            onPress={handleBackNavigation}
                            className="mr-3 p-1"
                            style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: 20,
                            }}
                        >
                            <Ionicons name="arrow-back" size={22} color="#3B82F6" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={() => router.push(`/${username}`)}
                        className="flex-row items-center flex-1"
                    >
                        <Image
                            source={{ uri: userData.image }}
                            style={{ width: 40, height: 40, borderRadius: 22 }}
                            className="bg-gray-200"
                            cachePolicy="memory"
                        />
                        <View className="ml-3">
                            <Text className="font-bold text-gray-800 text-base">{userData.name}</Text>
                            {isTyping ? (
                                <Text className="text-xs text-blue-500">typing...</Text>
                            ) : (
                                <Text className="text-xs text-gray-500">Tap to view profile</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                            backgroundColor: 'rgba(100, 116, 139, 0.1)',
                        }}
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
                    contentContainerStyle={{
                        paddingHorizontal: 16,
                        paddingTop: 16,
                        paddingBottom: keyboardVisible ? keyboardHeight + 80 : 100,
                    }}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    onLayout={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    showsVerticalScrollIndicator={false}
                />

                <View
                    className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200"
                    style={{
                        paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10,
                        marginLeft: isDesktop && isEmbedded ? 0 : 0,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -3 },
                        shadowOpacity: 0.05,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    {renderSelectedImages()}
                    
                    <View className="flex-row items-center bg-gray-100 rounded-full px-3 mx-3 my-2">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="pr-2 py-2"
                        >
                            <Ionicons name="image-outline" size={24} color="#64748B" />
                        </TouchableOpacity>

                        <TextInput
                            ref={inputRef}
                            className="flex-1 py-2 px-2 text-gray-700 max-h-24 outline-none"
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={input}
                            onChangeText={setInput}
                            multiline
                            style={{ fontSize: 16 }}
                            onSubmitEditing={sendMessage}
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={input.trim() === '' && selectedImages.length === 0}
                            className={`ml-2 h-10 w-10 rounded-full items-center justify-center ${
                                input.trim() === '' && selectedImages.length === 0 ? 'bg-gray-300' : 'bg-blue-500'
                            }`}
                        >
                            <Ionicons name="send" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

