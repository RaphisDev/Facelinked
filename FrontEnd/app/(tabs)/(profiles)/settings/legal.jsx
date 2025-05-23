import "../../../../global.css"
import {ScrollView, Text, TouchableOpacity, View, Dimensions, Platform} from "react-native";
import {useRouter} from "expo-router";
import {useEffect, useState} from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LegalSettings() {
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

    const legalOptions = [
        {
            title: "Privacy Policy",
            icon: "shield-checkmark-outline",
            route: "/settings/privacy"
        },
        {
            title: "Terms and Conditions",
            icon: "document-text-outline",
            route: "/settings/terms"
        }
    ];

    const renderLegalItem = (item, index) => (
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

    return (
        <SafeAreaView className="flex-1 bg-blue-50/50 dark:bg-black">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 pt-2 pb-4">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400">Legal Information</Text>
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
                    {/* Legal Documents Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Legal Documents</Text>
                        {legalOptions.map(renderLegalItem)}
                    </View>

                    {/* Impressum Section */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-3 px-1">Impressum</Text>
                        <View className="bg-white dark:bg-dark-primary p-5 rounded-xl shadow-sm">
                            <Text className="text-xl font-bold text-gray-800 dark:text-dark-text mb-4">Contact Information</Text>

                            <View className="mb-4">
                                <Text className="text-gray-700 dark:text-gray-300 font-medium">Monika Schneider</Text>
                                <Text className="text-gray-600 dark:text-gray-400">Elias-Holl-Str. 1</Text>
                                <Text className="text-gray-600 dark:text-gray-400">Eichstaett, Bavaria 85072</Text>
                                <Text className="text-gray-600 dark:text-gray-400">Germany</Text>
                            </View>

                            <View>
                                <Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">Contact</Text>
                                <View className="flex-row items-center mb-1">
                                    <Ionicons name="mail-outline" size={16} color="#3B82F6" />
                                    <Text className="text-gray-600 dark:text-gray-400 ml-2">bretter.schlaue83@icloud.com</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Ionicons name="globe-outline" size={16} color="#3B82F6" />
                                    <Text className="text-gray-600 dark:text-gray-400 ml-2">www.facelinked.com</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
