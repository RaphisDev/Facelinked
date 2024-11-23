import "../../../global.css"
import {FlatList, Platform, TextInput, View} from "react-native";
import {useEffect, useRef} from "react";
import * as SecureStorage from "expo-secure-store";
import * as StompJs from "@stomp/stompjs";
import {TextEncoder} from 'text-encoding';
import Chat from "../../../components/Entries/Chat";

global.TextEncoder = TextEncoder;

Object.assign(global, { WebSocket });

export default function Chats() {

    const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

    const stompClient = new StompJs.Client({
        brokerURL: `ws://${ip}:8080/ws`,
        webSocketFactory: () => {
            return new WebSocket(`ws://${ip}:8080/ws`, [], {
                headers: {
                    "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                }
            });
        },
        forceBinaryWSFrames: true,
        appendMissingNULLonIncoming: true,
        onConnect: () => {
            stompClient.subscribe('/topic/messages', (message) => {
                alert(JSON.parse(message.body).content);
            });
        }
    });

    useEffect(() => {
        stompClient.activate();
        return () => {
            handleDisconnect();
        }
    }, []);

    function handleDisconnect() {

    }

    function sendMessage(message) {
        stompClient.publish({
            destination: '/app/chat',
            body: message
        })
    }

    //Chats sind Kacheln; 3 in einer Reihe; Profilbild und Name darunter
    //change color of background maybe
    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary mt-4">
            <FlatList columnWrapperStyle={{flex: 1, justifyContent: "space-around"}} numColumns={3} data={[{ name: "Sample Chat", username: "asd", image: "sadasd" },
                {name: "Raphi", username: "asd", image: "sadasd"}, {name: "Ferdi", username: "asd", image: "sadasd"},
                {name: "Jizzy", username: "asd", image: "sadasd"}]} renderItem={({ item }) => <Chat {...item} />}/>
        </View>
    )
}