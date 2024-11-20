import "../../../global.css"
import {View} from "react-native";
import {useEffect} from "react";

export default function Chats() {

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8080/app");
        ws.addEventListener("open", () => {
            console.log("Connected to server");
            ws.send(JSON.stringify({ type: "subscribe", topic: "/topic/chat" }));
        });
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("Received data:", data);
        };
    }, []);

    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View>

            </View>
        </View>
    )
}