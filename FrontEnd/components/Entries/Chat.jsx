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
            <View className="rounded-xl" style={{backgroundColor: "#6C757D", width: 120, marginBottom: 20, height: 150}}>
                <View className="p-7">
                    <Image source={{uri: props.image}} className="overflow-hidden rounded-lg" style={{width: '80%', height: '80%'}} />
                    <Text className="text-center text-dark-text font-bold">{props.name}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}