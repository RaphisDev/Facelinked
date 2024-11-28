import {createContext, useContext, useEffect, useRef, useState} from "react";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {Platform} from "react-native";

let webSocketInstance = null;

const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";

//global.textencoding???

class WebsocketController{

    stompClient = null;

    constructor() {

        if(!webSocketInstance){

            this.stompClient = new StompJs.Client({
                brokerURL: `ws://${ip}:8080/ws`,
                forceBinaryWSFrames: true,
                appendMissingNULLonIncoming: true,
                webSocketFactory: () => {
                    return new WebSocket(`ws://${ip}:8080/ws`, [], {
                        headers: {
                            "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                        }
                    });
                },
                onConnect: () => {
                    this.stompClient.subscribe(`/user/${SecureStorage.getItem("username")}/queue/messages`, (message) => {
                        console.log('Received: ' + JSON.parse(message.body).content);
                        alert('Received: ' + JSON.parse(message.body).content);
                    });
                },
            })
            this.stompClient.activate();

            webSocketInstance = this;
        }
        return webSocketInstance;
    }
}

export default WebsocketController;