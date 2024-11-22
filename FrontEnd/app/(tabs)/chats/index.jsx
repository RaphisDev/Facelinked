import "../../../global.css"
import {Platform, TextInput, View} from "react-native";
import {useEffect, useRef} from "react";
import * as SecureStorage from "expo-secure-store";
import * as StompJs from "@stomp/stompjs";
import {TextEncoder} from 'text-encoding';

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

    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View>
                <TextInput onSubmitEditing={
                    (e) => {
                        sendMessage(e.nativeEvent.text);
                    }
                } className="h-10 w-full bg-white dark:bg-dark-secondary" placeholder="Type a message" style={{borderBottomWidth: 1}
                }></TextInput>
            </View>
        </View>
    )
}