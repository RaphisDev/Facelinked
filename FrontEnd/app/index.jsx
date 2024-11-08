import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router, useRouter} from "expo-router";
import React, {useEffect} from "react";

export default function Index() {

    function signedIn() {

        return false;
    }

    useEffect(() => {
       setTimeout(() => {
            if (signedIn) {
                router.push("/home");
            } else {
                router.push("/login");
            }
    })}, []);

    return (
        <>
            <Text>FaceLinked (Logo)</Text>
        </>
    );
}