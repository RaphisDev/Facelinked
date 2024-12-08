import {Platform, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect} from "react";
import "../../global.css";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

export default function Chat(props) {
    const router = useRouter();

    //navigate instead of push more often
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={async () => {
            router.navigate(`/chat/${props.username}`);
            let chats = await asyncStorage.getItem("chats") || [];
            if (chats.length !== 0) {
                chats = JSON.parse(chats);
            }
            await asyncStorage.setItem("chats", JSON.stringify(chats.map((chat) => {
                if (chat.username === props.username) {
                    return {...chat, unread: false};
                }
                return chat;
            })));
        }}>
            <View className={props.unread ? "border-accent border-4 rounded-xl" : "rounded-xl"} style={{backgroundColor: "#6C757D", width: 120, height: 150}}>
                <View className="p-7 h-full">
                    <Image source={{uri: props.image}}
                           style={{width: 75,
                               aspectRatio: 16 / 19,
                               objectFit: "cover",
                               overflow: "hidden", borderRadius: 12, alignSelf: "center"}}/>
                    <View className={"justify-center flex-1 " + props.name.split(" ")[0].size > 7 ? props.unread ? "pb-1" : "pb-2" : props.unread ? "p-1" : "p-2"}>
                        <Text className="text-center text-dark-text font-bold" numberOfLines={2}>{props.name.split(" ")[0]}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}