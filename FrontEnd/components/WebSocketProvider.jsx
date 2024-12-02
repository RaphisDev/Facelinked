import {createContext, useContext, useEffect, useRef, useState, useCallback} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform, AppState} from "react-native";
import {EventEmitter} from "expo";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

let webSocketInstance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

//Todo: global.textencoding???

class WebsocketController{

    //Todo: add chats and unread symbol here also make the color of (1) to accent color
    //Todo: when completely closing the app, the last time disconnected is not set, but maybe the old time is enough, but add duplicate filter

    stompClient = null;
    messageReceived = new EventEmitter();

    constructor() {
        if(!webSocketInstance) {
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
                onWebSocketError: () => {
                    alert("Network error. Please check your internet connection.");
                },
                onConnect: async () => {
                    AppState.addEventListener("change", this.handleAppStateChange);
                    const lastTimeDisconnected = await asyncStorage.getItem("lastTimeDisconnected");

                    let chats = await asyncStorage.getItem("chats") || [];
                    if (chats.length !== 0) {
                        chats = JSON.parse(chats);
                    }
                    const displayChats = async (parsedMessage, loadedChats) => {

                        if (loadedChats.find((chat) => chat.username !== parsedMessage.senderId) || loadedChats.length === 0) {

                            const profile = await fetch(`http://${ip}:8080/profile/${parsedMessage.senderId}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                                }
                            });
                            if (profile.ok) {
                                const profileJson = await profile.json();

                                await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, {
                                    name: profileJson.name,
                                    username: profileJson.username,
                                    image: profileJson.profilePicturePath
                                }]));
                                this.messageReceived.emit("newMessageReceived");
                            }
                        } else {
                            //logic for adding unread symbol, dont forget to remove it when chat is opened
                        }
                    }
                    const saveChats = async (message) => {
                        let loadedMessages = await asyncStorage.getItem(`messages/${message.senderId}`) || [];
                        if (loadedMessages.length !== 0) {
                            loadedMessages = JSON.parse(loadedMessages);
                        }

                        if (loadedMessages.find((msg) => msg.timestamp === message.timestamp)) {
                            return;
                        }
                        await asyncStorage.setItem(`messages/${message.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: false,
                            content: message.content,
                            timestamp: message.timestamp
                        }]));
                    }
                    await asyncStorage.setItem("lastTimeDisconnected", new Date().toString());

                    if (lastTimeDisconnected !== null) {
                        const messages = await fetch(`http://${ip}:8080/messages/afterDate?date=${encodeURIComponent(lastTimeDisconnected)}`, {
                            method: "GET",
                            headers: {
                                "Application-Type": "application/json",
                                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();
                            parsedMessages.forEach((message) => {
                                saveChats(message)
                                displayChats(message, chats);
                            });
                        }
                        else {
                            alert("Network error. Please check your internet connection.");
                        }
                    } else {
                        const messages = await fetch(`http://${ip}:8080/messages/all`, {
                            method: "GET",
                            headers: {
                                "Application-Type": "application/json",
                                "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();
                            parsedMessages.forEach((message) => {
                                saveChats(message)
                                displayChats(message, chats);
                            });
                        }
                        else {
                            alert("Network error. Please check your internet connection.");
                        }
                    }

                    this.stompClient.subscribe(`/user/${SecureStorage.getItem("username")}/queue/messages`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messageReceived.emit("messageReceived", {
                            detail: {
                                isSender: false,
                                content: parsedMessage.content,
                                sender: parsedMessage.senderId,
                                timestamp: parsedMessage.timestamp
                            }
                        });

                        let loadedMessages = await asyncStorage.getItem(`messages/${parsedMessage.senderId}`) || [];
                        if (loadedMessages.length !== 0) {
                            loadedMessages = JSON.parse(loadedMessages);
                        }
                        await asyncStorage.setItem(`messages/${parsedMessage.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: false,
                            content: parsedMessage.content,
                            timestamp: parsedMessage.timestamp
                        }]));

                        let loadedChats = await asyncStorage.getItem("chats") || [];
                        if (loadedChats.length !== 0) {
                            loadedChats = JSON.parse(loadedChats);
                        }
                        displayChats(parsedMessage, loadedChats);
                    });
                },
            });
            this.stompClient.activate();

            webSocketInstance = this;
        }
        return webSocketInstance;
    }

    async handleAppStateChange() {
        if (AppState.currentState === "background") {
            await asyncStorage.setItem("lastTimeDisconnected", new Date().toString());
        }
    }
}

export default WebsocketController;