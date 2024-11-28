import {Platform, Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router, useRouter} from "expo-router";
import React, {useEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../components/WebSocketProvider";

export default function Index() {

    async function signedIn() {
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
    })}, []);

    return (
        <>
            <Text>FaceLinked (Logo)</Text>
        </>
    );
}