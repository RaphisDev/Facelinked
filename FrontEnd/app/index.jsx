import {Appearance, Platform, Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../components/WebSocketProvider";
import {Image} from "expo-image";
import * as Device from "expo-device";
import * as Notification from "expo-notifications";
import ip from "../components/AppManager";

export default function Index() {

    async function requestPermission() {
            if (Device.isDevice) {
                const { status: existingStatus } = await Notification.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notification.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    alert('You have to grant permission for notifications');
                    return;
                }
                await Notification.getDevicePushTokenAsync().then((token) => {
                    return token;
                });
            }
    }

    async function signedIn() {
        if (Platform.OS === "web") {
            return localStorage.getItem("token") != null;
        }
        const token = await SecureStore.getItemAsync("token");

        if (Notification.PermissionStatus.UNDETERMINED && token != null && Platform.OS === "ios" && Device.isDevice && localStorage.getItem("deviceToken") === null) {
            const token = await requestPermission();
            await fetch(`${ip}/messages/setDeviceToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SecureStore.getItem("token")}`
                },
                body: JSON.stringify({
                    token: token
                })
            }).then(status => {
                if (status.ok) {
                    localStorage.setItem("deviceToken", "true");
                }
            });
        }
        else if (Notification.PermissionStatus.GRANTED && token != null && Device.isDevice && localStorage.getItem("deviceToken") === null) {
            const token = await Notification.getDevicePushTokenAsync();
            await fetch(`${ip}/messages/setDeviceToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SecureStore.getItem("token")}`
                },
                body: JSON.stringify({
                    token: token
                })
            }).then(status => {
                if (status.ok) {
                    localStorage.setItem("deviceToken", "true");
                }
            });
        }
        return token != null;
    }

    useEffect(() => {
        if (Platform.OS !== "web") {
            Appearance.setColorScheme("light");
        }

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