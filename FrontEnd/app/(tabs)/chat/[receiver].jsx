import "../../../global.css"
import {FlatList, Platform, Pressable, TextInput, TouchableOpacity, View} from "react-native";
import {useLocalSearchParams} from "expo-router";
import Message from "../../../components/Entries/Message";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect, useRef, useState} from "react";

export default function ChatRoom(props) {

    const {username} = useLocalSearchParams();
    const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";
    const message = useRef("");
    const input = useRef(null);
    const [messages, addMessage] = useState([]);
    const connected = useRef(false);

    const stompClient = useRef(null);

    if (!connected.current) {
        stompClient.current = new StompJs.Client({
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
                stompClient.current.subscribe('/topic/messages', (message) => {
                    const parsedMessage = JSON.parse(message.body);
                    addMessage((prevMessages) => [...prevMessages, {content: parsedMessage.content, timestamp: parsedMessage.timestamp}]);
                });
            }
        });
    }

    useEffect(() => {
        if (connected.current) {
            return;
        }
        stompClient.current.activate();
        connected.current = true;

        return () => {
            handleDisconnect();
        }
    }, []);

    function handleDisconnect() {
        stompClient.current.deactivate();
    }

    //bug where messages are not sent sometimes -> fix
    function sendMessage(message) {

        input.current.clear();
        input.current.blur();

        try {
            /*if(!stompClient.current.connected) {
                stompClient.current.activate();
            }*/
            stompClient.current.publish({
                destination: '/app/chat',
                body: JSON.stringify({
                    content: message,
                    timestamp: new Date().toString()
                })
            })
        }
        catch (e) {
            console.error(e);
        }
    }

    //Save messages only in localStorage???
    //Change header to show name instead of Chats and change when navigating to different chat or back to all chats
    return(
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View>
                <FlatList data={messages} renderItem={(item) =>
                    <Message content={item.item.content} timestamp={item.item.timestamp}/>}
                          keyExtractor={(item, index) => index.toString()}></FlatList>
            </View>
            <View className="bottom-0 absolute m-3.5 w-full">
                <TextInput ref={input} onSubmitEditing={
                    (e) => {
                        sendMessage(e.nativeEvent.text);
                    }
                } className="bg-white dark:bg-dark-primary/50 w-fit mr-16 dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg border-4 font-medium text-lg p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                <TouchableOpacity activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                    <Ionicons name={"send"} size={24} className="absolute right-0 bottom-0 m-2.5 mr-6"></Ionicons>
                </TouchableOpacity>
            </View>
        </View>
    )
}