import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router, useRouter} from "expo-router";
import React, {useEffect} from "react";
import * as SecureStore from "expo-secure-store";

export default function Index() {

    async function signedIn() {
        const token = await SecureStore.getItemAsync("token");
        return token != null;
    }

    useEffect(() => {
       setTimeout(async () => {
            if (await signedIn()) {
                router.push("/home");
            } else {
                router.push("/register");
            }
    })}, []);

    return (
        <>
            <Text>FaceLinked (Logo)</Text>
        </>
    );
}