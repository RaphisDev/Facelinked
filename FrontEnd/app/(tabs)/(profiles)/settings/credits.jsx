import "../../../../global.css"
import {Platform, ScrollView, Text, View, Dimensions, TouchableOpacity} from "react-native";
import {Link, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image} from "expo-image";

export default function Credits() {
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

    // List of technologies used
    const technologies = [
        { name: "Ionicons", url: "https://github.com/ionic-team/ionicons", icon: "logo-github" },
        { name: "Expo", url: "https://github.com/expo/expo", icon: "logo-github" },
        { name: "React Native", url: "https://github.com/facebook/react-native", icon: "logo-react" },
        { name: "NativeWind/Tailwind", url: "https://github.com/tailwindlabs/tailwindcss", icon: "logo-github" },
        { name: "RN DateTime Picker", url: "https://github.com/react-native-datetimepicker/datetimepicker", icon: "logo-github" },
        { name: "RN Async Storage", url: "https://github.com/react-native-async-storage/async-storage", icon: "logo-github" },
        { name: "Spring Boot", url: "https://github.com/spring-projects/spring-boot", icon: "logo-github" },
        { name: "StompJs", url: "https://github.com/stomp-js/stompjs", icon: "logo-github" },
        { name: "Lucid Icons", url: "https://github.com/lucide-icons/lucide", icon: "logo-github" }
    ];

    return (
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">Credits</Text>
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
                    {/* Developer Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Developer</Text>
                        <View className="bg-white dark:bg-dark-primary p-5 rounded-xl shadow-sm flex-row items-center">
                            <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center mr-4">
                                <Ionicons name="code-slash-outline" size={32} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="text-gray-500 dark:text-gray-400">Developed by</Text>
                                <Text className="text-xl font-bold text-gray-800 dark:text-dark-text">Raphael Templer</Text>
                            </View>
                        </View>
                    </View>

                    {/* Technologies Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Technologies</Text>
                        <View className="bg-white dark:bg-dark-primary p-5 rounded-xl shadow-sm">
                            <Text className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4">Special Thanks To</Text>

                            <View className="space-y-3">
                                {technologies.map((tech, index) => (
                                    <Link 
                                        key={index}
                                        href={tech.url}
                                        target="_blank"
                                        asChild
                                    >
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            className="flex-row items-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg"
                                        >
                                            <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 items-center justify-center">
                                                <Ionicons name={tech.icon} size={20} color="#3B82F6" />
                                            </View>
                                            <Text className="ml-3 text-gray-800 dark:text-gray-300 font-medium">{tech.name}</Text>
                                            <Ionicons 
                                                name="open-outline" 
                                                size={18} 
                                                color="#3B82F6" 
                                                className="ml-auto"
                                            />
                                        </TouchableOpacity>
                                    </Link>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* App Info */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">App Information</Text>
                        <View className="bg-white dark:bg-dark-primary p-5 rounded-xl shadow-sm items-center">
                            <Text className="text-center text-blue-600 dark:text-blue-400 text-2xl font-bold mb-2">FaceLinked</Text>
                            <Text className="text-center text-gray-500 dark:text-gray-400 mb-4">Version 1.0.0</Text>
                            <Text className="text-center text-gray-600 dark:text-gray-300 text-sm">
                                © 2023 FaceLinked. All rights reserved.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
