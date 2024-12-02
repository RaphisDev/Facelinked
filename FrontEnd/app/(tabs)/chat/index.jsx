import "../../../global.css"
import {FlatList, Platform, TextInput, View} from "react-native";
import {useEffect, useRef, useState} from "react";
import * as SecureStorage from "expo-secure-store";
import * as StompJs from "@stomp/stompjs";
import {TextEncoder} from 'text-encoding';
import Chat from "../../../components/Entries/Chat";
import WebSocketProvider from "../../../components/WebSocketProvider";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

global.TextEncoder = TextEncoder;

Object.assign(global, { WebSocket });

export default function Chats() {

    //Todo: do i need to display the last message?
    //Todo: new messages on top of chat list?
    const [chats, setChats] = useState([]);
    const input = useRef(null);

    async function addChat(username) {
        input.current.clear();

        if (chats.find((chat) => chat.username === username)) {
            return;
        }

        const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";
        const profile = await fetch(`http://${ip}:8080/profile/${username}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
            }
        });
        if (!profile.ok) {
            return;
        }
        const profileJson = await profile.json();

        setChats([...chats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }]);
        await asyncStorage.setItem("chats", JSON.stringify([...chats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }]));
    }

    const ws = new WebSocketProvider();

    useEffect(() => {

        const loadChats = async () => {
            let loadedChats = await asyncStorage.getItem("chats");
            if (loadedChats !== null) {
                loadedChats = JSON.parse(loadedChats);
                if (chats.length !== loadedChats.length) {
                    setChats(loadedChats);
                }
            }
        }
        loadChats();

        ws.messageReceived.addListener("newMessageReceived", () => {
            loadChats();
        });

        return() => {
            ws.messageReceived.removeAllListeners("newMessageReceived");
        }
    }, []);

    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <TextInput ref={input} placeholder="Enter username to add a chat" autoCapitalize="none" className="rounded-xl mt-4 p-2 w-3/4 bg-primary dark:bg-dark-primary dark:text-dark-text text-text mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                addChat(e.nativeEvent.text);
            }}/>
            <FlatList columnWrapperStyle={{ justifyContent: 'flex-start', gap: 8, marginLeft: 8 }}
                      contentContainerStyle={{ gap: 10 }}
                       numColumns={3} data={chats} renderItem={({ item }) => <Chat {...item} />}/>
        </View>
    )
}