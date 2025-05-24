import "../../../../global.css"
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View, Dimensions} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {showAlert} from "../../../../components/PopUpModalView";
import WebSocketProvider from "../../../../components/WebSocketProvider";

export default function Index() {
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
            } else { 
                if (SecureStore.getItem("token") === null) {router.replace("/")}
            }
        });
    }, []);

    const settingsOptions = [
        {
            title: "Profile",
            icon: "person-outline",
            route: "/settings/account"
        },
        {
            title: "Legal",
            icon: "document-text-outline",
            route: "/settings/legal"
        },
        {
            title: "Credits",
            icon: "information-circle-outline",
            route: "/settings/credits"
        }
    ];

    const renderSettingItem = (item, index) => (
        <TouchableOpacity 
            key={index}
            activeOpacity={0.7} 
            onPress={() => router.push(item.route)}
            className={`flex-row items-center p-4 bg-white dark:bg-dark-primary rounded-xl shadow-sm mb-3 hover:shadow-md transition-shadow duration-200`}
        >
            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                <Ionicons name={item.icon} size={22} color="#3B82F6" />
            </View>
            <Text className="ml-3 text-lg font-semibold dark:text-dark-text text-gray-800">{item.title}</Text>
            <Ionicons 
                name="chevron-forward" 
                size={22} 
                color="#3B82F6" 
                className="ml-auto"
            />
        </TouchableOpacity>
    );

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

    return (
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">Settings</Text>
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
                    {/* Settings Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Account Settings</Text>
                        {settingsOptions.map(renderSettingItem)}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity 
                        activeOpacity={0.7}
                        onPress={handleLogout}
                        className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 mb-3"
                    >
                        <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center">
                            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
                        </View>
                        <Text className="ml-3 text-lg font-semibold text-red-600 dark:text-red-400">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
