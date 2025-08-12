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

class WebsocketController{

    stompClient = null;
    messageReceived = new EventEmitter();
    appState = null;

    restart () {
        this.reset();
        setTimeout(() => webSocketInstance = new WebsocketController(), 100);
    }

    reset ()  {
        this.stompClient?.deactivate();
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

        AppState.addEventListener('change', nextAppState => {
            if (this.appState?.match(/inactive|background/) &&
                nextAppState === 'active') {
                if (this.stompClient) {
                    if (!this.stompClient.connected) {
                        this.restart();
                    }
                } else {
                    this.restart();
                }
            }

            this.appState = nextAppState;
        });

        if(!webSocketInstance) {
            this.stompClient = new StompJs.Client({
                brokerURL: `${webSocketIp}/ws`,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                heartbeatOutgoing: 10000,
                heartbeatIncoming: 10000,
                reconnectDelay: 5000,
                connectionTimeout: 10000,
                webSocketFactory: () => {
                    if (Platform.OS === "web") {
                        return new WebSocket(`${webSocketIp}/ws?token=${token}`)
                    } else {
                        return new WebSocket(`${webSocketIp}/ws`, [], {
                            headers: {
                                "Authorization": `Bearer ${token}`,
                            }
                        })
                    }
                },
                onWebSocketError: (error) => {
                    //alert("Network error. Please check your internet connection."); Todo: Rather display a toast notification or a permanent banner
                    if (!this.stompClient.connected) {
                        this.stompClient?.deactivate();
                        webSocketInstance = null;
                        setTimeout(() => {
                            this.stompClient.activate();
                        }, 5000);
                    }
                },
                onConnect: async () => {
                    const lastMessageId = Number.parseInt(await asyncStorage.getItem("lastMessageId")) || null;
                    let username;
                    if (Platform.OS === "web") {
                        username = localStorage.getItem("username");
                    } else {
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

                    const saveChats = async (senderId, loadedChats, oldMessage, message, receiverId) => {
                        if (senderId === username) {
                            await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                                if (chat.username === receiverId) {
                                    return {
                                        ...chat,
                                        lastMessage: "You: " + message
                                    }
                                }
                                return chat;
                            })))
                            return;
                        }

                        if (!loadedChats.some((chat) => chat.username === senderId)) {
                            let apiToken;
                            if (Platform.OS === "web") {
                                apiToken = localStorage.getItem("token");
                            }
                            else {
                                apiToken = SecureStore.getItem("token");
                            }

                            const profile = await fetch(`${ip}/profile/${senderId}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${apiToken}`
                                }
                            });
                            if (profile.ok) {
                                const profileJson = await profile.json();

                                await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, {
                                    name: profileJson.name,
                                    username: profileJson.username,
                                    image: profileJson.profilePicturePath,
                                    unread: !oldMessage,
                                    lastMessage: senderId + ": " + message
                                }]));
                                this.messageReceived.emit("newMessageReceived");
                            }
                        } else {
                            await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                                if (chat.username === senderId) {
                                    return {
                                        ...chat,
                                        unread: !oldMessage,
                                        lastMessage: senderId + ": " + message
                                    }
                                }

                                return chat;
                            })));
                            this.messageReceived.emit("newMessageReceived");
                        }
                    }
                    const processMessage = async (message, isNewMessage = false) => {
                        try {
                            const loadedChats = await getChats();
                            const { senderId, receiverId, content, millis, images } = message;

                            const messageUserName = senderId === username ? receiverId : senderId;

                            await saveChats(senderId, loadedChats, !isNewMessage, content, receiverId);

                            const loadedMessages = await getMessages(messageUserName);
                            await asyncStorage.setItem(`messages/${messageUserName}`, JSON.stringify([
                                ...loadedMessages,
                                {
                                    isSender: username === senderId,
                                    content,
                                    millis,
                                    images,
                                }
                            ]));

                            await asyncStorage.setItem("lastMessageId", millis.toString());

                            if (isNewMessage && senderId !== username) {
                                this.messageReceived.emit("newMessageReceived");
                            }

                            return true;
                        } catch (error) {
                            console.error("Error processing message:", error);
                            return false;
                        }
                    };

                    const processBatchMessages = async (messages, isNewMessages = false) => {
                        try {
                            const batchSize = 20;
                            let processedCount = 0;

                            for (let i = 0; i < messages.length; i += batchSize) {
                                const batch = messages.slice(i, i + batchSize);
                                const results = await Promise.allSettled(
                                    batch.map(message => processMessage(message, isNewMessages))
                                );

                                processedCount += results.filter(r => r.status === 'fulfilled' && r.value).length;
                            }

                            console.log(`Processed ${processedCount}/${messages.length} messages`);
                            return processedCount === messages.length;
                        } catch (error) {
                            console.error("Error processing message batch:", error);
                            return false;
                        }
                    };

                    const fetchAndProcessMessages = async (url, isNewMessages = false) => {
                        const maxRetries = 4;
                        let retries = 0;

                        let apiToken;
                        if (Platform.OS === "web") {
                            apiToken = localStorage.getItem("token");
                        }
                        else {
                            apiToken = SecureStore.getItem("token");
                        }

                        while (retries < maxRetries) {
                            try {
                                const response = await fetch(url, {
                                    method: "GET",
                                    headers: {
                                        "Application-Type": "application/json",
                                        "Authorization": `Bearer ${apiToken}`
                                    }
                                });

                                if (!response.ok) {
                                    throw new Error(`Network response error: ${response.status}`);
                                }

                                const parsedMessages = await response.json();
                                const success = await processBatchMessages(parsedMessages, isNewMessages);

                                if (success) {
                                    return true;
                                } else {
                                    throw new Error("Failed to process some messages");
                                }
                            } catch (error) {
                                retries++;
                                console.error(`Fetch attempt ${retries} failed:`, error);
                                if (retries >= maxRetries) {
                                    alert("Failed to load messages. Please check your connection and try again.");
                                    return false;
                                }
                                await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retries)));
                            }
                        }
                    };

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
                                if (loadedMessages.length !== 0) {
                                    loadedMessages = JSON.parse(loadedMessages);
                                }
                                await asyncStorage.setItem(`networks/${id}`, JSON.stringify([...loadedMessages, {
                                    networkId: id,
                                    content: parsedMessage.content,
                                    sender: parsedMessage.senderId.memberId,
                                    senderProfileName: parsedMessage.senderId.memberName,
                                    senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath,
                                    millis: parsedMessage.millis
                                }]));
                                await asyncStorage.setItem(`lastNetworkMessageId/${id}`, parsedMessage.millis.toString());

                                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                                if (loadedNetworks.length !== 0) {
                                    loadedNetworks = JSON.parse(loadedNetworks);
                                }
                                await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks.filter(network => network.networkId === id), ...loadedNetworks.filter(network => network.networkId !== id)]));
                            });
                        }
                    }

                    if (lastMessageId) {
                        await fetchAndProcessMessages(
                            `${ip}/messages/afterId?id=${encodeURIComponent(lastMessageId)}`,
                            true
                        );
                    } else {
                        await fetchAndProcessMessages(
                            `${ip}/messages/all`,
                            false
                        );
                    }
                    this.stompClient.subscribe(`/user/${username}/queue/messages`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messageReceived.emit("messageReceived", {
                            detail: {
                                isSender: false,
                                content: parsedMessage.content,
                                sender: parsedMessage.senderId,
                                millis: parsedMessage.millis,
                                images: parsedMessage.images,
                            }
                        });

                        const loadedMessages = await getMessages(parsedMessage.senderId);
                        await asyncStorage.setItem(`messages/${parsedMessage.senderId}`, JSON.stringify([...loadedMessages, {
                            isSender: false,
                            content: parsedMessage.content,
                            millis: parsedMessage.millis,
                            images: parsedMessage.images,
                        }]));

                        const loadedChats = await getChats();

                        await saveChats(parsedMessage.senderId, loadedChats, false, parsedMessage.content, parsedMessage.receiverId);
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