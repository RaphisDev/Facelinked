import {createContext, useContext, useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform} from "react-native";

let instance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

class WebsocketController{
    constructor() {
        this.stompClient = null;
        this.messsages = [];
        if(!instance){
            this.stompClient = new StompJs.Client({
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
                    this.stompClient.subscribe(`/user/${SecureStorage.getItem("username")}/queue/messages`, (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        this.messages = [...this.messsages, {content: parsedMessage.content, timestamp: parsedMessage.timestamp}];
                    });
                },
            });
            this.stompClient.activate();
            instance = this;
        }
        return instance;
    }
}

export default WebsocketController;