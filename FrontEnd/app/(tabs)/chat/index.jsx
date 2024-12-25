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

global.TextEncoder = TextEncoder;

Object.assign(global, { WebSocket });

export default function Chats() {

    //Todo: new messages on top of chat list?
    const [chats, setChats] = useState([]);
    const [showInput, setShowInput] = useState(false);
    const input = useRef(null);
    const segments = useSegments();

    const navigation = useNavigation("../../");

    const stateManager = new StateManager();

    async function addChat(username) {
        input.current.clear();
        handleAddBar();

        if (chats.find((chat) => chat.username === username)) {
            return;
        }

        const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";
        const profile = await fetch(`${ip}/profile/${username}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
            }
        });
        if (!profile.ok) {
            return;
        }
        const profileJson = await profile.json();

        setChats(previousChats => [...previousChats, { name: profileJson.name, unread: false, username: profileJson.username, image: profileJson.profilePicturePath }]);
        await asyncStorage.setItem("chats", JSON.stringify([...chats, { name: profileJson.name, unread: false, username: profileJson.username, image: profileJson.profilePicturePath }]));
    }

    const ws = new WebSocketProvider();

    function handleAddBar() {
        setShowInput(shown => {
            if (shown) {
                Keyboard.dismiss();
            }
            else {
                input.current.focus();
            }
            return !shown
        });
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={() => handleAddBar()} className="mr-3"><Ionicons name="add" size={25}/></TouchableOpacity>,
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
        stateManager.setState(true);

        return() => {
            ws.messageReceived.removeAllListeners("newMessageReceived");
        }
    }, [segments]);


    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <TextInput ref={input} style={{display: !showInput ? "none" : "flex"}} placeholder="Enter username to add a chat" autoCapitalize="none" className="rounded-xl mt-4 p-2 w-3/4 hidden bg-primary dark:bg-dark-primary dark:text-dark-text text-text mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                if (e.nativeEvent.text.trim().length === 0) {
                    handleAddBar()
                    return;
                }
                addChat(e.nativeEvent.text);
            }}/>
            <FlatList columnWrapperStyle={{ justifyContent: 'flex-start', gap: 8, marginLeft: 8 }}
                      contentContainerStyle={{ gap: 10 }} style={{ marginTop: 20}}
                      ListEmptyComponent={<Text className="text-text dark:text-dark-text text-center mt-5">No chats found</Text>}
                      numColumns={3} data={chats} renderItem={({ item }) => <Chat {...item} />}/>
        </View>
    )
}