import "../../../global.css"
import {FlatList, Keyboard, Platform, TextInput, TouchableOpacity, View, Text} from "react-native";
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

export default function Chats() {

    const [chats, setChats] = useState([]);
    const segments = useSegments();

    const navigation = useNavigation("../../");

    const stateManager = new StateManager();

    const ws = new WebSocketProvider();

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
            if (localStorage.getItem("token") === null) {router.replace("/")}
        } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });

        navigation.setOptions({
            headerRight: () => <TouchableOpacity className="mr-3"><Ionicons name="search" size={25}/></TouchableOpacity>,
        })

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


    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <FlatList columnWrapperStyle={{ justifyContent: 'flex-start', gap: 8, marginLeft: 8 }}
                      contentContainerStyle={{ gap: 10 }} style={{ marginTop: 20}}
                      ListEmptyComponent={<Text className="text-text dark:text-dark-text text-center mt-5">No chats found</Text>}
                      numColumns={3} data={chats} renderItem={({ item }) => <Chat {...item} />}/>
        </View>
    )
}