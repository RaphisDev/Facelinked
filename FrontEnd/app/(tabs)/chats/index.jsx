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
import { BlurView } from "expo-blur";

const MOBILE_WIDTH_THRESHOLD = 768;

export default function Chats() {
    const [chats, setChats] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const segments = useSegments();
    const insets = useSafeAreaInsets();
    const windowWidth = Dimensions.get('window').width;
    const isDesktop = windowWidth > MOBILE_WIDTH_THRESHOLD;
    const searchInputRef = useRef(null);
    
    const navigation = useNavigation("../");
    const stateManager = new StateManager();
    const ws = new WebSocketProvider();

    // Filter chats based on search query
    const filteredChats = chats.filter(chat => {
        if (!searchQuery) return true;
        return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else { 
                if (SecureStore.getItemAsync("token") === null) {router.replace("/")}
            }
        });

        navigation.setOptions({
            headerShown: false,
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

        return() => {
            ws.messageReceived.removeAllListeners("newMessageReceived");
        }
    }, [segments]);

    // Toggle search mode and focus input when activated
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

    const renderHeader = () => (
        <View className="px-4 pt-2 pb-4 z-10">
            <View className={`flex-row items-center ${isSearching ? 'justify-between' : 'justify-between'}`}>
                {!isSearching ? (
                    <>
                        <Text className="text-2xl font-bold text-text dark:text-dark-text">
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
                            className="flex-1 py-2 px-2 text-gray-700"
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
                className="px-5 py-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 shadow-md flex-row items-center"
            >
                <Ionicons name="people" size={20} color="white" className="mr-2" />
                <Text className="text-white font-medium">Find Friends</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View 
            className="flex-1 bg-blue-50/50 dark:bg-dark-primary"
            style={{
                paddingTop: Platform.OS !== 'web' ? insets.top : 0,
                paddingBottom: isDesktop ? 0 : 100, // Add padding for mobile tab bar
                marginLeft: isDesktop ? 220 : 0, // Add margin for sidebar on desktop
            }}
        >
            {renderHeader()}
            
            {chats.length > 0 ? (
                <View className="flex-1 px-4">
                    <FlatList
                        contentContainerStyle={{ paddingVertical: 10 }}
                        data={filteredChats}
                        renderItem={({ item }) => <Chat {...item} />}
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
