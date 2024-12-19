import {createContext, useContext, useEffect, useRef, useState, useCallback} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform, AppState} from "react-native";
import {EventEmitter} from "expo";
import asyncStorage from "@react-native-async-storage/async-storage";

let webSocketInstance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

//Todo: global.textencoding???

class WebsocketController{

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
                    if (!this.stompClient.connected) {
                        this.stompClient.deactivate();
                        webSocketInstance = null;
                    }
                },
                onConnect: async () => {
                    const lastTimeDisconnected = await asyncStorage.getItem("lastTimeDisconnected");
                    const username = SecureStorage.getItem("username");

                    const getMessages = async (sender) => {
                        let loadedMessages = await asyncStorage.getItem(`messages/${sender}`) || [];
                        if (loadedMessages.length !== 0) {
                            loadedMessages = JSON.parse(loadedMessages);
                        }
                        return loadedMessages;
                    }
                    const getChats = async () => {
                        let loadedChats = await asyncStorage.getItem("chats") || [];
                        if (loadedChats.length !== 0) {
                            loadedChats = JSON.parse(loadedChats);
                        }
                        return loadedChats;
                    }

                    const saveChats = async (senderId, loadedChats) => {

                        if (senderId === username) {
                            return;
                        }

                        if (loadedChats.find((chat) => chat.username !== senderId) || loadedChats.length === 0) {

                            const profile = await fetch(`http://${ip}:8080/profile/${senderId}`, {
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
                                    image: profileJson.profilePicturePath,
                                    unread: true
                                }]));
                                this.messageReceived.emit("newMessageReceived");
                            }
                        } else {
                            await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                                if (chat.username === senderId) {
                                    return {
                                        ...chat,
                                        unread: true
                                    }
                                }

                                return chat;
                            })));
                            this.messageReceived.emit("newMessageReceived");
                        }
                    }
                    const saveMessages = async (message) => {
                        const loadedMessages = await getMessages(message.senderId);

                        if (loadedMessages.find((msg) => msg.timestamp === message.timestamp)) {
                            return;
                        }
                        await asyncStorage.setItem(`messages/${message.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: username === message.senderId,
                            content: message.content,
                            timestamp: message.timestamp
                        }]));
                    }
                    const validateMessage = async (parsedMessage) => {
                        const loadedMessages = await getMessages(parsedMessage.senderId);

                        if (loadedMessages.find((msg) => msg.timestamp === parsedMessage.timestamp)) {
                            return;
                        }
                        const loadedChats = await getChats();

                        await saveChats(parsedMessage.senderId, loadedChats);
                        await saveMessages(parsedMessage);
                    }

                    const receiveNetworkMessages = async () => {
                        let networks = await asyncStorage.getItem("networks") || [];
                        if (networks.length !== 0) {
                            networks = JSON.parse(networks);
                        }
                        for (const network in networks) {
                            const id = networks[network].networkId
                            this.stompClient.subscribe(`/networks/${id}`, async (message) => {
                                const parsedMessage = JSON.parse(message.body);
                                if (parsedMessage.senderId.memberId === username) {
                                    return;
                                }
                                this.messageReceived.emit("networkMessageReceived", {
                                    detail: {
                                        networkId: id,
                                        content: parsedMessage.content,
                                        sender: parsedMessage.senderId.memberId,
                                        senderProfileName: parsedMessage.senderId.memberName,
                                        senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath,
                                        timestamp: parsedMessage.timestamp
                                    }
                                });
                                let loadedMessages = await asyncStorage.getItem(`networks/${id}`) || [];
                                if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
                                await asyncStorage.setItem(`networks/${id}`, JSON.stringify([...loadedMessages, {networkId: id, content: parsedMessage.content, sender: parsedMessage.senderId.memberId, senderProfileName: parsedMessage.senderId.memberName, senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath, timestamp: parsedMessage.timestamp}]));
                            });
                        }
                    }

                    if (lastTimeDisconnected) {
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

                                validateMessage(message);
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
                            const loadedChats = await getChats();

                            parsedMessages.forEach((message) => {
                                saveMessages(message)
                                saveChats(message.senderId, loadedChats);
                            });
                        }
                        else {
                            alert("Network error. Please check your internet connection.");
                        }
                    }

                    this.stompClient.subscribe(`/user/${username}/queue/messages`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messageReceived.emit("messageReceived", {
                            detail: {
                                isSender: false,
                                content: parsedMessage.content,
                                sender: parsedMessage.senderId,
                                timestamp: parsedMessage.timestamp
                            }
                        });

                        const loadedMessages = await getMessages(parsedMessage.senderId);
                        await asyncStorage.setItem(`messages/${parsedMessage.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: false,
                            content: parsedMessage.content,
                            timestamp: parsedMessage.timestamp
                        }]));

                        const loadedChats = await getChats();
                        await saveChats(parsedMessage.senderId, loadedChats);
                    });
                    receiveNetworkMessages();
                    await asyncStorage.setItem("lastTimeDisconnected", new Date().toString());
                },
            });
            this.stompClient.activate();

            webSocketInstance = this;
        }
        return webSocketInstance;
    }
}

export default WebsocketController;