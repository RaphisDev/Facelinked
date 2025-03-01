import {createContext, useContext, useEffect, useRef, useState, useCallback} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform, AppState} from "react-native";
import {EventEmitter} from "expo";
import asyncStorage from "@react-native-async-storage/async-storage";
import {webSocketIp} from "./AppManager";
import ip from "./AppManager";
import * as SecureStore from "expo-secure-store";

let webSocketInstance = null;

//Todo: global.textencoding???

class WebsocketController{

    stompClient = null;
    messageReceived = new EventEmitter();

    reset ()  {
        this.stompClient.deactivate();
        webSocketInstance = null;
    }

    constructor() {
        let token;
        if (Platform.OS === "web") {
            token = localStorage.getItem("token");
        }
        else {
            token = SecureStore.getItem("token");
        }

        if(!webSocketInstance) {
            this.stompClient = new StompJs.Client({
                brokerURL: `${webSocketIp}/ws`,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                heartbeatOutgoing: 10000,
                heartbeatIncoming: 10000,
                webSocketFactory: () => {
                    return new WebSocket(`${webSocketIp}/ws`, [], {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                },
                onWebSocketError: () => {
                    //alert("Network error. Please check your internet connection.");
                    if (!this.stompClient.connected) {
                        this.stompClient.deactivate();
                        webSocketInstance = null;
                    }
                },
                onConnect: async () => {
                    const lastMessageId = Number.parseInt(await asyncStorage.getItem("lastMessageId")) || null;
                    let username;
                    if (Platform.OS === "web") {
                        username = localStorage.getItem("username");
                    }
                    else {
                        username = SecureStore.getItem("username");
                    }

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

                    const saveChats = async (senderId, loadedChats, oldMessage) => {

                        if (senderId === username) {
                            return;
                        }

                        if (!loadedChats.find((chat) => chat.username === senderId) || loadedChats.length === 0) {

                            const profile = await fetch(`${ip}/profile/${senderId}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${token}`
                                }
                            });
                            if (profile.ok) {
                                const profileJson = await profile.json();

                                await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, {
                                    name: profileJson.name,
                                    username: profileJson.username,
                                    image: profileJson.profilePicturePath,
                                    unread: !oldMessage
                                }]));
                                this.messageReceived.emit("newMessageReceived");
                            }
                        } else {
                            await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                                if (chat.username === senderId) {
                                    return {
                                        ...chat,
                                        unread: oldMessage ? chat.unread : true
                                    }
                                }

                                return chat;
                            })));
                            this.messageReceived.emit("newMessageReceived");
                        }
                    }
                    const saveMessages = async (message) => {
                        const loadedMessages = await getMessages(message.senderId);

                        await asyncStorage.setItem(`messages/${message.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: username === message.senderId,
                            content: message.content,
                            millis: message.millis,
                        }]));
                    }
                    const processMessage = async (parsedMessage) => {
                        const loadedChats = await getChats();

                        await saveChats(parsedMessage.senderId, loadedChats, false);
                        await saveMessages(parsedMessage);
                        await asyncStorage.setItem("lastMessageId", parsedMessage.millis.toString());
                    }
                    const processOldMessages = async (parsedMessage) => {
                        const loadedChats = await getChats();

                        await saveChats(parsedMessage.senderId, loadedChats, true);

                        const messageUserName = parsedMessage.senderId === username ? parsedMessage.receiverId : parsedMessage.senderId;

                        const loadedMessages = await getMessages(messageUserName);
                        await asyncStorage.setItem(`messages/${messageUserName}`, JSON.stringify([...loadedMessages, {
                            isSender: username === parsedMessage.senderId,
                            content: parsedMessage.content,
                            millis: parsedMessage.millis
                        }]));
                        await asyncStorage.setItem("lastMessageId", parsedMessage.millis.toString());
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
                                        millis: parsedMessage.millis
                                    }
                                });
                                let loadedMessages = await asyncStorage.getItem(`networks/${id}`) || [];
                                if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
                                await asyncStorage.setItem(`networks/${id}`, JSON.stringify([...loadedMessages, {networkId: id, content: parsedMessage.content, sender: parsedMessage.senderId.memberId, senderProfileName: parsedMessage.senderId.memberName,
                                    senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath, millis: parsedMessage.millis}]));
                                await asyncStorage.setItem(`lastNetworkMessageId/${id}`, parsedMessage.millis.toString());
                            });
                        }
                    }

                    if (lastMessageId) {
                        const messages = await fetch(`${ip}/messages/afterId?id=${encodeURIComponent(lastMessageId)}`, {
                            method: "GET",
                            headers: {
                                "Application-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();

                            for (const message of parsedMessages) {
                                await processMessage(message);
                            }
                        }
                        else {
                            alert("Network error. Please check your internet connection.");
                        }
                    } else {
                        const messages = await fetch(`${ip}/messages/all`, {
                            method: "GET",
                            headers: {
                                "Application-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            }
                        });

                        if (messages.ok) {
                            const parsedMessages = await messages.json();

                            for (const message of parsedMessages) {
                                await processOldMessages(message);
                            }
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
                                millis: parsedMessage.millis
                            }
                        });

                        const loadedMessages = await getMessages(parsedMessage.senderId);
                        await asyncStorage.setItem(`messages/${parsedMessage.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: false,
                            content: parsedMessage.content,
                            millis: parsedMessage.millis
                        }]));

                        const loadedChats = await getChats();
                        await saveChats(parsedMessage.senderId, loadedChats, false);
                        await asyncStorage.setItem("lastMessageId", parsedMessage.millis.toString());
                    });
                    receiveNetworkMessages();
                },
            });
            this.stompClient.activate();

            webSocketInstance = this;
        }
        return webSocketInstance;
    }
}

export default WebsocketController;