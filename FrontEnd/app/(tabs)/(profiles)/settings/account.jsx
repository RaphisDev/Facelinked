import {Alert, Platform, Text, TouchableOpacity, View, Dimensions, ScrollView} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../../../../components/WebSocketProvider";
import {useRouter} from "expo-router";
import {useEffect, useState} from "react";
import {showAlert} from "../../../../components/PopUpModalView";
import ip from "../../../../components/AppManager";
import {SafeAreaView} from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AccountSettings() {
    const router = useRouter();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > 768);

    // Handle window resize for responsive layout
    useEffect(() => {
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            setWindowWidth(newWidth);
            setIsDesktop(newWidth > 768);
        };

        if (Platform.OS === 'web') {
            window.addEventListener('resize', handleResize);
        }

        return () => {
            if (Platform.OS === 'web') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, []);

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });
    }, []);

    const handleLogout = async () => {
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
        });
    };

    const handleDeleteAccount = () => {
        showAlert({
            title: "Are you sure you want to delete your account?",
            message: "This action cannot be undone.",
            buttons: [
                {text: "Cancel", onPress: () => {}},
                {text: "Continue", onPress: async () => {
                        let token;
                        if (Platform.OS === "web") {
                            token = localStorage.getItem("token");
                        } else {
                            token = SecureStore.getItem("token");
                        }
                        const response = await fetch(`${ip}/profile/delete`, {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
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
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">Account Settings</Text>
                </View>
            </View>

            {/* Content */}
            <ScrollView 
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 40,
                    maxWidth: isDesktop ? '800px' : '100%',
                    alignSelf: 'center',
                    width: '100%'
                }}
            >
                <View className={`${isDesktop ? "max-w-2xl mx-auto" : ""} w-full`}>
                    {/* Account Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Account Management</Text>

                        {/* Logout Button */}
                        <TouchableOpacity 
                            activeOpacity={0.7}
                            onPress={handleLogout}
                            className="flex-row items-center p-4 bg-white dark:bg-dark-primary rounded-xl shadow-sm mb-3 hover:shadow-md transition-shadow duration-200"
                        >
                            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                                <Ionicons name="log-out-outline" size={22} color="#3B82F6" />
                            </View>
                            <Text className="ml-3 text-lg font-semibold dark:text-dark-text text-gray-800">Log out</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-red-500 dark:text-red-400 mb-3 px-1">Danger Zone</Text>

                        {/* Delete Account Button */}
                        <TouchableOpacity 
                            activeOpacity={0.7}
                            onPress={handleDeleteAccount}
                            className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 mb-3"
                        >
                            <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center">
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </View>
                            <Text className="ml-3 text-lg font-semibold text-red-600 dark:text-red-400">Delete Account</Text>
                        </TouchableOpacity>
                        <Text className="text-sm text-red-400 dark:text-red-500 px-1">
                            Warning: This action cannot be undone. All your data will be permanently deleted.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
