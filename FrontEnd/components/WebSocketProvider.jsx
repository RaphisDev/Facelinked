import {createContext, useContext, useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform} from "react-native";
import {EventEmitter} from "expo";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

let webSocketInstance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

//Todo: global.textencoding???

class WebsocketController{

    //Todo: add chats and unread symbol here also make the color of (1) to accent color

    stompClient = null;
    messageReceived = new EventEmitter();

    constructor() {
        if(!webSocketInstance){
            this.stompClient = new StompJs.Client({
                brokerURL: `ws://${ip}:8080/ws`,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                heartbeatOutgoing: 10000,
                heartbeatIncoming: 10000,
                webSocketFactory: () => {
                    return new WebSocket(`ws://${ip}:8080/ws`, [], {
                        headers: {
                            "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                        }
                    });
                },
                onDisconnect: async () => {
                    await asyncStorage.setItem("lastTimeDisconnected", new Date().getTime().toString());

                    console.log("Is this also called when the app is closed?");
                },
                onConnect: async () => {
                    const lastTimeDisconnected = await asyncStorage.getItem("lastTimeDisconnected");
                    if (lastTimeDisconnected !== null) {
                        const messages = await fetch(`http://${ip}:8080/messages/afterDate`, {
                            method: "GET",
                            body: lastTimeDisconnected,
                            headers: {
                                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();
                            parsedMessages.forEach((message) => {
                                this.messageReceived.emit("messageReceived", { detail: { isSender: false, content: message.content, sender: message.senderId, timestamp: message.timestamp } });
                            });
                        }
                    }
                    else {
                        const messages = await fetch(`http://${ip}:8080/messages/all`, {
                            method: "GET",
                            headers: {
                                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();
                            parsedMessages.forEach((message) => {
                                this.messageReceived.emit("messageReceived", { detail: { isSender: false, content: message.content, sender: message.senderId, timestamp: message.timestamp } });
                            });
                        }
                    }

                    this.stompClient.subscribe(`/user/${SecureStorage.getItem("username")}/queue/messages`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messageReceived.emit("messageReceived", { detail: { isSender: false, content: parsedMessage.content, sender: parsedMessage.senderId, timestamp: parsedMessage.timestamp } });

                        let loadedMessages = await asyncStorage.getItem(`messages/${parsedMessage.senderId}`) || [];
                        if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
                        await asyncStorage.setItem(`messages/${parsedMessage.senderId}`, JSON.stringify([...loadedMessages, { isSender: false, content: parsedMessage.content, timestamp: parsedMessage.timestamp }]));

                        let loadedChats = await asyncStorage.getItem("chats") || [];
                        if (loadedChats.length !== 0) {loadedChats = JSON.parse(loadedChats);}
                        if (loadedChats.find((chat) => chat.username !== e.detail.sender) || loadedChats.length === 0) {

                            const profile = await fetch(`http://${ip}:8080/profile/${parsedMessage.senderId}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                                }
                            });
                            if (!profile.ok) {
                                return;
                            }
                            const profileJson = await profile.json();
                            if (loadedChats.find((chat) => chat.username === profileJson.username)) {
                                return;
                            }

                            await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }]));
                            this.messageReceived.emit("newMessageReceived");
                        }
                        else {
                            //logic for adding unread symbol, dont forget to remove it when chat is opened
                        }
                    });
                },
            });
            this.stompClient.activate();

            webSocketInstance = this;
        }
        return webSocketInstance;
    }
}

export default WebsocketController;