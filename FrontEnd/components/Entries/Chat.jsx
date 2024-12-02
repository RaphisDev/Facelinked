import {Platform, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect} from "react";

export default function Chat(props) {
    const router = useRouter();

    //Text oben, Bild darunter - oder andersrum?
    //navigate instead of push more often
    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.navigate(`/chat/${props.username}`)}>
            <View className="rounded-xl" style={{backgroundColor: "#6C757D", width: 120, height: 150}}>
                <View className="p-7 h-full">
                    <Image source={{uri: props.image}}
                           style={{width: 75,
                               aspectRatio: 16 / 19,
                               objectFit: "cover",
                               overflow: "hidden", borderRadius: 12, alignSelf: "center"}}/>
                    <View className={"justify-center flex-1 " + props.name.split(" ")[0].size > 7 ? "pb-2" : "p-2"}>
                        <Text className="text-center text-dark-text font-bold" numberOfLines={2}>{props.name.split(" ")[0]}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    )
}