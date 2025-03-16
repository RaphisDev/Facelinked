import {Alert, Platform, Text, TouchableOpacity, View} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../../../../components/WebSocketProvider";
import {useRouter} from "expo-router";
import {useEffect} from "react";

export default function AccountSettings() {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });
    }, []);

    return (
        <View className="w-full h-full bg-primary dark:bg-black items-center">
            <View className="w-5/6 mt-7 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl overflow-hidden items-center">
                <Text className="text-2xl dark:text-dark-text font-semibold mb-7">Account</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                if (Platform.OS === "web") {
                    await asyncStorage.clear();
                    localStorage.clear();
                    new WebSocketProvider().reset();
                    router.replace("/");
                }
                Alert.alert("Are you sure you want to log out?", "You will be logged out of your account", [
                    {
                        text: "Cancel",
                        onPress: () => {}
                    },
                    {
                        text: "Log out",
                        onPress: async () => {
                            await asyncStorage.clear();
                            localStorage.clear();
                            if (Platform.OS !== "web") {
                                await SecureStore.deleteItemAsync("token");
                                await SecureStore.deleteItemAsync("username");
                                await SecureStore.deleteItemAsync("profilePicture");
                                await SecureStore.deleteItemAsync("profile");
                            }
                            new WebSocketProvider().reset();
                            router.replace("/");
                        }
                    }
                ]);
            }} className="bg-accent p-0.5 w-28 rounded-lg">
                <Text className="text-center text-xl font-semibold text-dark-text">Log out</Text>
            </TouchableOpacity>
            </View>
        </View>
    )
}