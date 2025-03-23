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
    Dimensions
} from "react-native";
import React, {useContext, useEffect, useRef, useState} from "react";
import {useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../../../components/WebSocketProvider";
import StateManager from "../../../components/StateManager";
import asyncStorage from "@react-native-async-storage/async-storage";
import {Image} from "expo-image";
import MessageEntry from "../../../components/Entries/Message.jsx";
import Ionicons from "@expo/vector-icons/Ionicons";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function ChatRoom() {
    const { username } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const segments = useSegments();
    const windowWidth = Dimensions.get('window').width;
    const isDesktop = windowWidth > MOBILE_WIDTH_THRESHOLD;

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [userData, setUserData] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    const flatListRef = useRef(null);
    const navigation = useNavigation();
    const stateManager = new StateManager();
    const ws = new WebSocketProvider();
    const router = useRouter();

    const keyboardWillShow = (e) => {
        if (Platform.OS !== 'web') {
            setKeyboardHeight(e.endCoordinates.height);
        }
    };

    const keyboardWillHide = () => {
        setKeyboardHeight(0);
    };

    useEffect(() => {
        const keyboardWillShowSub = Keyboard.addListener(
            'keyboardWillShow',
            keyboardWillShow
        );
        const keyboardWillHideSub = Keyboard.addListener(
            'keyboardWillHide',
            keyboardWillHide
        );

        navigation.setOptions({headerShown: false});
        return () => {
            keyboardWillShowSub.remove();
            keyboardWillHideSub.remove();
        };
    }, []);

    useEffect(() => {
        stateManager.setChatState(false);
        return () => {
            stateManager.setChatState(true);
        };
    }, []);

    useEffect(() => {
        navigation.setOptions({
            title: userData.name,
        });
    }, [userData]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                let token = '';
                if (Platform.OS === 'web') {
                    token = localStorage.getItem('token');
                } else {
                    token = await SecureStore.getItemAsync('token');
                }

                if (!token) {
                    router.replace('/');
                    return;
                }

                // Fetch user data
                const userResponse = await fetch(`${ip}/profile/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserData(userData);
                }

                // Fetch messages
                const messagesResponse = await fetch(`${ip}/messages/${username}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (messagesResponse.ok) {
                    let messages = await messagesResponse.json();
                    setMessages(messages);

                    // Update chats storage to mark as read
                    let chats = await asyncStorage.getItem('chats');
                    if (chats) {
                        chats = JSON.parse(chats);
                        const updatedChats = chats.map(chat => {
                            if (chat.username === username) {
                                return { ...chat, unread: false };
                            }
                            return chat;
                        });
                        await asyncStorage.setItem('chats', JSON.stringify(updatedChats));
                    }
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error loading messages:', error);
                setIsLoading(false);
            }
        };

        loadMessages();

        // Listen for new messages
        ws.messageReceived.addListener('newMessage', (message) => {
            if (message.sender === username || message.receiver === username) {
                setMessages(prevMessages => [...prevMessages, message]);
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            }
        });

        return () => {
            ws.messageReceived.removeAllListeners('newMessage');
        };
    }, [username, segments]);

    const sendMessage = async () => {
        if (input.trim() === '') return;

        try {
            let token = '';
            if (Platform.OS === 'web') {
                token = localStorage.getItem('token');
            } else {
                token = await SecureStore.getItemAsync('token');
            }

            if (!token) {
                router.replace('/');
                return;
            }

            const response = await fetch(`${ip}/messages/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: username,
                    content: input
                })
            });

            if (response.ok) {
                setInput('');
                Keyboard.dismiss();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                // Handle image sending logic here
                console.log('Image selected:', result.assets[0].uri);
                // sendImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View
                className="flex-1 bg-gray-100"
                style={{
                    paddingTop: Platform.OS !== 'web' ? insets.top : 0,
                    marginLeft: isDesktop ? 220 : 0, // Add margin for sidebar on desktop
                }}
            >
                {/* Chat header */}
                <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color="#3B82F6" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push(`/${username}`)}
                        className="flex-row items-center flex-1"
                    >
                        <Image
                            source={{ uri: userData.profilePicturePath }}
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            className="bg-gray-200"
                        />
                        <View className="ml-3">
                            <Text className="font-bold text-gray-800">{userData.name}</Text>
                            {isTyping ? (
                                <Text className="text-xs text-blue-500">typing...</Text>
                            ) : (
                                <Text className="text-xs text-gray-500">Tap to view profile</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
                        <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* Messages list */}
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
                        paddingBottom: 16,
                    }}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                    onLayout={() => {
                        flatListRef.current?.scrollToEnd({ animated: false });
                    }}
                />

                {/* Input area with safe area */}
                <View
                    className="bg-white border-t border-gray-200 p-2"
                    style={{
                        marginBottom: Platform.OS !== 'web' && !isDesktop ? (
                            Platform.OS === 'ios' ? Math.max(insets.bottom, 20) + 70 : 90
                        ) : 0
                    }}
                >
                    <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
                        <TouchableOpacity
                            onPress={pickImage}
                            className="pr-2"
                        >
                            <Ionicons name="image-outline" size={24} color="#64748B" />
                        </TouchableOpacity>

                        <TextInput
                            className="flex-1 py-2 px-2 text-gray-700"
                            placeholder="Type a message..."
                            placeholderTextColor="#9CA3AF"
                            value={input}
                            onChangeText={setInput}
                            multiline
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={input.trim() === ''}
                            className={`ml-2 h-9 w-9 rounded-full items-center justify-center ${
                                input.trim() === '' ? 'bg-gray-300' : 'bg-blue-500'
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
