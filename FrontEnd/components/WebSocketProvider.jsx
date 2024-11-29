import {createContext, useContext, useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform} from "react-native";
import {EventEmitter} from "expo";

let webSocketInstance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

//global.textencoding???

class WebsocketController{

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
                onConnect: () => {
                    this.stompClient.subscribe(`/user/${SecureStorage.getItem("username")}/queue/messages`, (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messageReceived.emit("messageReceived", { detail: { isSender: false, content: parsedMessage.content, sender: parsedMessage.sender, timestamp: parsedMessage.timestamp } });
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