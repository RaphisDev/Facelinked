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

    //Todo: chats start left not middle
    //Todo: is there a way to display the last message in the chat?
    //Todo: new messages on top of chat list?
    //Todo: add chats from new sender and unread symbol in websocket provider, not here
    const [chats, setChats] = useState([]);
    const input = useRef(null);

    async function addChat(username) {
        input.current.clear();

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
        if (chats.find((chat) => chat.username === profileJson.username)) {
            return;
        }

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
        <View className="h-full w-full bg-primary dark:bg-dark-primary mt-4">
            <TextInput ref={input} placeholder="Add chat" autoCapitalize="none" className="rounded-xl p-2 w-3/4 mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                addChat(e.nativeEvent.text);
            }}/>
            <FlatList columnWrapperStyle={{flex: 1, justifyContent: "space-around"}} numColumns={3} data={chats} renderItem={({ item }) => <Chat {...item} />}/>
        </View>
    )
}