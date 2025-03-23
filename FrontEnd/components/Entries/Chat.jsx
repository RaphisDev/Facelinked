import {Platform, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect} from "react";
import "../../global.css";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Chat(props) {
    const router = useRouter();
    
    // Format the latest message timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            onLongPress={() => router.navigate(`/${props.username}`)} 
            onPress={async () => {
                router.navigate(`/chats/${props.username}`);
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
            }}
            className={`flex-row items-center p-4 rounded-xl ${props.unread ? 'bg-blue-50' : 'bg-white'} shadow-sm border border-gray-100`}
        >
            <View className="relative">
                <Image 
                    source={{uri: props.image}}
                    style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                    }}
                    className="bg-gray-200"
                />
                {props.online && (
                    <View className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full" />
                )}
            </View>
            
            <View className="flex-1 ml-3">
                <View className="flex-row justify-between items-center">
                    <Text className="font-bold text-gray-800">{props.name}</Text>
                    <Text className="text-xs text-gray-500">{formatTime(props.timestamp)}</Text>
                </View>
                
                <View className="flex-row items-center justify-between mt-1">
                    <Text 
                        numberOfLines={1} 
                        className={`text-sm ${props.unread ? 'font-medium text-gray-800' : 'text-gray-500'} flex-1 mr-1`}
                    >
                        {props.lastMessage || "Start a conversation"}
                    </Text>
                    
                    {props.unread && (
                        <View className="bg-blue-500 rounded-full h-5 w-5 items-center justify-center">
                            <Text className="text-xs text-white font-bold">
                                {typeof props.unread === 'number' ? props.unread : '•'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
