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
import {useTranslation} from "react-i18next";
import i18n from "i18next";
import {GoogleSignin} from "@react-native-google-signin/google-signin";

export default function AccountSettings() {
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
            } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });
    }, []);

    const handleLogout = async () => {
        showAlert({
            title: t("are.u.sure"),
            message: t("logout.confirmation"),
            buttons: [
                {text: t("cancel"), onPress: () => {}},
                {
                    text: t("continue"), onPress: async () => {
                        await asyncStorage.clear();
                        if (Platform.OS === "web") {
                            localStorage.clear();
                        } else {
                            await SecureStore.deleteItemAsync("token");
                            await SecureStore.deleteItemAsync("username");
                            await SecureStore.deleteItemAsync("profilePicture");
                        }
                        try {
                            await GoogleSignin.signOut();
                        } catch (error) {
                            console.error(error);
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
            title: t("are.u.sure.delete.account"),
            message: t("action.not.undone"),
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
                            }
                            try {
                                await GoogleSignin.signOut();
                            } catch (error) {
                                console.error(error);
                            }
                            new WebSocketProvider().reset();

                            showAlert({
                                title: t("success"),
                                message: t("account.deleted.successfully"),
                                buttons: [
                                    {text: "Okay", onPress: () => router.replace("/")}
                                ]
                            })
                        } else {
                            showAlert({
                                title: t("error"),
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
            {/* Content */}
            <ScrollView 
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                    maxWidth: isDesktop ? '800px' : '100%',
                    alignSelf: 'center',
                    width: '100%'
                }}
            >
                <View className={`${isDesktop ? "max-w-2xl mx-auto" : ""} w-full mt-4`}>
                    {/* Account Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">{t("account.management")}</Text>
                        {/* Language Selection */}
                        <View
                            style={[{
                                shadowColor: '#000',
                                shadowOpacity: 0.2,
                                shadowRadius: 1.5,
                                elevation: 2,
                            }, Platform.OS === "android" ? {} : {shadowOffset: { width: 0, height: 1 }}]}
                            className="flex-row items-center justify-between p-4 bg-white dark:bg-dark-primary rounded-xl mb-3"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center">
                                    <Ionicons name="language-outline" size={22} color="#10B981" />
                                </View>
                                <Text className="ml-3 text-lg font-semibold dark:text-dark-text text-gray-800">{t("language")}</Text>
                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const currentLang = i18n.language;
                                        const newLang = currentLang === 'en' ? 'de' : 'en';
                                        await i18n.changeLanguage(newLang);
                                        if (Platform.OS === "web") {
                                            localStorage.setItem('userLanguage', newLang);
                                        } else (
                                            await asyncStorage.setItem('userLanguage', newLang)
                                        )
                                    }}
                                    className="px-3 py-2 bg-green-100 dark:bg-green-900 rounded-lg"
                                >
                                    <Text className="text-green-700 dark:text-green-300 font-medium">
                                        {i18n.language === 'en' ? 'English → Deutsch' : 'Deutsch → English'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity 
                            activeOpacity={0.7}
                            onPress={handleLogout}
                            style={[{
                                shadowColor: '#000',
                                shadowOpacity: 0.2,
                                shadowRadius: 1.5,
                                elevation: 2,
                            }, Platform.OS === "android" ? {} : {shadowOffset: { width: 0, height: 1 }}]}
                            className="flex-row items-center p-4 bg-white dark:bg-dark-primary rounded-xl mb-3 hover:shadow-md transition-shadow duration-200"
                        >
                            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                                <Ionicons name="log-out-outline" size={22} color="#3B82F6" />
                            </View>
                            <Text className="ml-3 text-lg font-semibold dark:text-dark-text text-gray-800">{t("log.out")}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Danger Zone */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-red-500 dark:text-red-400 mb-3 px-1">{t("danger.zone")}</Text>

                        {/* Delete Account Button */}
                        <TouchableOpacity 
                            activeOpacity={0.7}
                            onPress={handleDeleteAccount}
                            className="flex-row items-center p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800 mb-3"
                        >
                            <View className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center">
                                <Ionicons name="trash-outline" size={22} color="#EF4444" />
                            </View>
                            <Text className="ml-3 text-lg font-semibold text-red-600 dark:text-red-400">{t("delete.account")}</Text>
                        </TouchableOpacity>
                        <Text className="text-sm text-red-400 dark:text-red-500 px-1">
                            {t("account.deletion.warning")}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
