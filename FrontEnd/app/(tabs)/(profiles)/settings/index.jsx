import "../../../../global.css"
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View, Dimensions} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {useNavigation, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {showAlert} from "../../../../components/PopUpModalView";
import WebSocketProvider from "../../../../components/WebSocketProvider";
import {useTranslation} from "react-i18next";

export default function Index() {
    const router = useRouter();
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isDesktop, setIsDesktop] = useState(windowWidth > 768);

    const {t} = useTranslation();

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
            title: t("profile"),
            icon: "person-outline",
            route: "/settings/account"
        },
        {
            title: t("legal"),
            icon: "document-text-outline",
            route: "/settings/legal"
        },
        {
            title: t("credits"),
            icon: "information-circle-outline",
            route: "/settings/credits"
        }
    ];

    const renderSettingItem = (item, index) => (
        <TouchableOpacity 
            key={index}
            activeOpacity={0.7} 
            onPress={() => router.push(item.route)}
            style={[{
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 1.5,
                elevation: 2,
            }, Platform.OS === "android" ? {} : {shadowOffset: { width: 0, height: 1 }}]}
            className={`flex-row items-center p-4 bg-white dark:bg-dark-primary rounded-xl mb-3 hover:shadow-md transition-shadow duration-200`}
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
            <TouchableOpacity
                onPress={router.back}
                className="flex-row items-center ml-7"
                style={Platform.OS !== "ios" && {display: 'none'}}
                activeOpacity={0.7}
            >
                <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2">
                    <Ionicons name="arrow-back" size={18} color="#3B82F6" />
                </View>
                <Text className="text-blue-600 font-medium">{t("back")}</Text>
            </TouchableOpacity>
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
                <View className={`${isDesktop ? "max-w-2xl mx-auto" : ""} w-full mt-4`}>
                    {/* Settings Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">{t("account.settings")}</Text>
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
                        <Text className="ml-3 text-lg font-semibold text-red-600 dark:text-red-400">{t("log.out")}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
