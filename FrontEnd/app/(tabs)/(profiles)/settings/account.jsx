import {Alert, Platform, Text, TouchableOpacity, View} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../../../../components/WebSocketProvider";
import {useRouter} from "expo-router";
import {useEffect} from "react";
import {showAlert} from "../../../../components/PopUpModalView";

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
                showAlert({
                    title: "Are you sure?",
                    message: "Do you want to log out?",
                    buttons: [
                        {text: "Cancel", onPress: () => {}},
                        {
                            text: "Continue", onPress: async () => {
                                await asyncStorage.clear();
                                if (Platform.OS === "web") {
                                    localStorage.clear();
                                } else {
                                    await SecureStore.deleteItemAsync("token");
                                    await SecureStore.deleteItemAsync("username");
                                    await SecureStore.deleteItemAsync("profilePicture");
                                    await SecureStore.deleteItemAsync("profile");
                                }
                                new WebSocketProvider().reset();
                                router.replace("/");
                            }
                        }
                    ]
                })
            }} className="bg-accent p-0.5 w-28 rounded-lg">
                <Text className="text-center text-xl font-semibold text-dark-text">Log out</Text>
            </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7} onPress={() => {
                    showAlert({
                        title: "Are you sure you want to delete your account?",
                        message: "This action cannot be undone.",
                        buttons: [
                            {text: "Cancel", onPress: () => {}},
                            {
                                text: "Continue", onPress: async () => {
                                    const response = await fetch(`${ip}/profile/delete`, {
                                        method: "DELETE",
                                        headers: {
                                            "Content-Type": "application/json",
                                            "Authorization": `Bearer ${await SecureStore.getItemAsync("token")}`
                                        }
                                    })
                                    if (response.ok) {
                                        await asyncStorage.clear();
                                        if (Platform.OS === "web") {
                                            localStorage.clear();
                                        } else {
                                            await SecureStore.deleteItemAsync("token");
                                            await SecureStore.deleteItemAsync("username");
                                            await SecureStore.deleteItemAsync("profilePicture");
                                            await SecureStore.deleteItemAsync("profile");
                                        }
                                        new WebSocketProvider().reset();

                                        showAlert({
                                            title: "Account deleted",
                                            message: "Your account has been deleted successfully.",
                                            buttons: [
                                                {text: "Okay", onPress: () => router.replace("/")}
                                            ]
                                        })
                                    } else {
                                        showAlert({
                                            title: "Error. Try again later.",
                                            message: "An error occurred while deleting your account.",
                                            buttons: [
                                                {text: "Okay", onPress: () => {}}
                                            ]
                                        })
                                        console.error(await response.json())
                                        console.error(await response.text())
                                        console.error(response.status)
                                    }
                                }
                            }
                        ]
                    })
                }} className="bg-accent p-0.5 w-28 rounded-lg mt-5">
                    <Text className="text-center text-xl font-semibold text-dark-text">Delete Account</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}