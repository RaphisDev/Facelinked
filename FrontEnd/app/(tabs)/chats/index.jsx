import "../../../global.css"
import {FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View, Text, Dimensions} from "react-native";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as SecureStorage from "expo-secure-store";
import {TextEncoder} from 'text-encoding';
import Chat from "../../../components/Entries/Chat";
import WebSocketProvider from "../../../components/WebSocketProvider";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import Ionicons from "@expo/vector-icons/Ionicons";
import {router, useLocalSearchParams, useNavigation, useSegments} from "expo-router";
import StateManager from "../../../components/StateManager";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function Chats() {
    const [chats, setChats] = useState([]);
    const urlParams = useLocalSearchParams();
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const segments = useSegments();
    const insets = useSafeAreaInsets();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > MOBILE_WIDTH_THRESHOLD + 250 && Platform.OS === 'web');
    const searchInputRef = useRef(null);
    const [selectedChat, setSelectedChat] = useState(null);
    
    const stateManager = new StateManager();
    const ws = new WebSocketProvider();

    useEffect(() => {
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            setWindowWidth(newWidth);
            setIsDesktop(newWidth > MOBILE_WIDTH_THRESHOLD + 250 && Platform.OS === 'web');
        };

        if (Platform.OS === 'web') {
            window.addEventListener('resize', handleResize);
        }

        handleResize();

        return () => {
            if (Platform.OS === 'web') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
       const handleSelectedChat = async () => {
           if (isDesktop) {
               const params = new URLSearchParams(window.location.search);
               const username = params.get('username');
               if (username) {
                   if (!chats.some(chat => chat.username === username)) {
                       let token;
                          if (Platform.OS === "web") {
                            token = localStorage.getItem("token");
                          } else {
                            token = await SecureStore.getItemAsync("token");
                          }
                       let user = await fetch(`${ip}/profile/${username}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + token
                            }
                          });
                       if (user.ok) {
                           const profileInfos = await user.json();
                           setChats(chats => [
                               {
                               username: username,
                               name: profileInfos.name,
                               image: profileInfos.image,
                           },
                               ...chats
                           ])
                       }
                   }
                   setSelectedChat(username);
               }
           } else if (selectedChat && !isDesktop) {
               setSelectedChat(null);
           }
       }
       handleSelectedChat();
    }, [isDesktop, selectedChat, urlParams]);

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else { 
                if (SecureStore.getItemAsync("token") === null) {router.replace("/")}
            }
        });

        const loadChats = async () => {
            let loadedChats = await asyncStorage.getItem("chats");
            if (loadedChats !== null) {
                loadedChats = JSON.parse(loadedChats);
                loadedChats.sort((a, b) => a.unread === b.unread ? 0 : a.unread ? -1 : 1);
                setChats(loadedChats);
            }
        }
        loadChats();

        ws.messageReceived.addListener("newMessageReceived", () => {
            loadChats();
        });
        stateManager.setChatState(true);

        if (isDesktop) {
            const params = new URLSearchParams(window.location.search);
            const username = params.get('username');
            if (username) {
                setSelectedChat(username);
            }
        }

        return() => {
            ws.messageReceived.removeAllListeners("newMessageReceived");
        }
    }, [segments, isDesktop]);

    const toggleSearch = () => {
        setIsSearching(!isSearching);
        if (!isSearching) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        } else {
            setSearchQuery('');
        }
    };

    const handleChatSelect = (username) => {
        const makeChatRead = async () => {
            let chats = await asyncStorage.getItem("chats") || [];
            if (chats.length !== 0) {
                chats = JSON.parse(chats);
            }
            await asyncStorage.setItem("chats", JSON.stringify(chats.map((chat) => {
                if (chat.username === username) {
                    return {...chat, unread: false};
                }
                return chat;
            })));
        }
        makeChatRead();
        if (isDesktop) {
            setSelectedChat(username);
            // Update URL with selected chat
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('username', username);
            window.history.pushState({}, '', newUrl);
        } else {
            router.push(`/chats/${username}`);
        }
    };

    const renderHeader = () => (
        <View className="px-4 pt-2 pb-4 z-10">
            <View className={`flex-row items-center ${isSearching ? 'justify-between' : 'justify-between'}`}>
                {!isSearching ? (
                    <>
                        <Text className="text-2xl ml-3 font-bold text-text dark:text-dark-text">
                            Messages
                        </Text>
                        <TouchableOpacity 
                            onPress={toggleSearch}
                            className="h-10 w-10 rounded-full bg-white/90 shadow-sm items-center justify-center"
                        >
                            <Ionicons name="search" size={20} color="#3B82F6" />
                        </TouchableOpacity>
                    </>
                ) : (
                    <View className="flex-row items-center flex-1 bg-white/90 rounded-full px-3 shadow-sm border border-gray-100">
                        <Ionicons name="search" size={18} color="#6B7280" />
                        <TextInput
                            ref={searchInputRef}
                            className="flex-1 py-2 px-2 text-gray-700 outline-none"
                            placeholder="Search conversations..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity onPress={toggleSearch}>
                            <Ionicons name="close" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    const renderEmptyComponent = () => (
        <View className="flex-1 items-center justify-center mt-10 px-6">
            <View className="w-32 h-32 mb-4 items-center justify-center bg-blue-100/70 rounded-full">
                <Ionicons name="chatbubbles-outline" size={60} color="#3B82F6" />
            </View>
            <Text className="text-xl font-bold text-gray-800 mb-2 text-center">No conversations yet</Text>
            <Text className="text-center text-gray-500 mb-6 max-w-xs">
                Connect with friends to start messaging and build meaningful relationships
            </Text>
            <TouchableOpacity 
                onPress={() => router.push('/networks')}
                className="px-5 py-3 rounded-full bg-gradient-to-r bg-blue-600 from-blue-500 to-blue-700 shadow-md flex-row items-center"
            >
                <Ionicons name="people" size={20} color="white" className="mr-2" />
                <Text className="text-white font-medium">Find Friends</Text>
            </TouchableOpacity>
        </View>
    );

    // Desktop split view layout
    if (isDesktop) {
        return (
            <View 
                className="flex-1 flex-row bg-blue-50/50 dark:bg-dark-primary"
                style={{
                    paddingTop: Platform.OS !== 'web' ? insets.top : 0,
                }}
            >
                {/* Left panel - Chat list */}
                <View className="w-1/3 border-r border-gray-200 bg-white">
                    {renderHeader()}
                    
                    {chats.length > 0 ? (
                        <View className="flex-1">
                            <FlatList
                                contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
                                data={filteredChats}
                                renderItem={({ item }) => (
                                    <TouchableOpacity 
                                        onPress={() => handleChatSelect(item.username)}
                                        className={`mb-3 p-3 rounded-lg ${selectedChat === item.username ? 'bg-blue-50' : ''}`}
                                    >
                                        <Chat {...item} />
                                    </TouchableOpacity>
                                )}
                                keyExtractor={(item) => item.id || item.username}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={searchQuery ? (
                                    <View className="flex-1 items-center justify-center py-10">
                                        <Text className="text-gray-500">No matching conversations found</Text>
                                    </View>
                                ) : null}
                            />
                        </View>
                    ) : (
                        renderEmptyComponent()
                    )}
                </View>
                
                {/* Right panel - Selected chat or welcome screen */}
                <View className="flex-1 bg-gray-50">
                    {selectedChat ? (
                        <iframe 
                            src={`/chats/${selectedChat}`} 
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                        />
                    ) : (
                        <View className="flex-1 items-center justify-center p-8">
                            <View className="w-40 h-40 mb-6 items-center justify-center bg-blue-100/70 rounded-full">
                                <Ionicons name="chatbubbles" size={80} color="#3B82F6" />
                            </View>
                            <Text className="text-2xl font-bold text-gray-800 mb-4 text-center">
                                Select a conversation
                            </Text>
                            <Text className="text-center text-gray-500 max-w-md mb-8">
                                Choose a chat from the left sidebar to start messaging or continue a conversation.
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    // Mobile layout
    return (
        <View 
            className="flex-1 bg-blue-50/50 dark:bg-dark-primary"
            style={{
                paddingTop: Platform.OS !== 'web' ? insets.top : 0,
                paddingBottom: 100, // Add padding for mobile tab bar
            }}
        >
            {renderHeader()}
            
            {chats.length > 0 ? (
                <View className="flex-1 px-4">
                    <FlatList
                        contentContainerStyle={{ paddingVertical: 10 }}
                        data={filteredChats}
                        renderItem={({ item }) => (
                            <TouchableOpacity onPress={() => router.push(`/chats/${item.username}`)}>
                                <Chat {...item} />
                            </TouchableOpacity>
                        )}
                        keyExtractor={(item) => item.id || item.username}
                        showsVerticalScrollIndicator={false}
                        ItemSeparatorComponent={() => <View className="h-3" />}
                        ListEmptyComponent={searchQuery ? (
                            <View className="flex-1 items-center justify-center py-10">
                                <Text className="text-gray-500">No matching conversations found</Text>
                            </View>
                        ) : null}
                    />
                </View>
            ) : (
                renderEmptyComponent()
            )}
        </View>
    )
}