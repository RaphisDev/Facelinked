import {Platform, Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../components/WebSocketProvider";
import {Image} from "expo-image";

export default function Index() {

    async function signedIn() {
        if (Platform.OS === "web") {
            return localStorage.getItem("token") != null;
        }
        const token = await SecureStore.getItemAsync("token");
        return token != null;
    }

    useEffect(() => {
       setTimeout(async () => {
            if (await signedIn()) {
                new WebSocketProvider();
                router.replace("/home");
            } else {
                router.replace("/register");
            }
       }, 1000)
    }, []);

    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary justify-center">
            <Image source={require("../assets/images/icon.png")} style={{width: 140, height: 140, alignSelf: "center", borderRadius: 40}}/>
            <Text className="text-2xl font-semibold text-center text-text dark:text-dark-text mt-48">Made by Orion</Text>
        </View>
    );
}