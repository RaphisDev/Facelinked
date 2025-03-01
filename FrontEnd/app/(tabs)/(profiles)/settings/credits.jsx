import "../../../../global.css"
import {Platform, ScrollView, Text, View} from "react-native";
import {Link, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect} from "react";
import * as SecureStore from "expo-secure-store";

export default function Credits() {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            if (Platform.OS === "web") {
                if (localStorage.getItem("token") === null) {router.replace("/")}
            } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
        });
    }, []);

    return (
        <View className="bg-primary dark:bg-black h-full">
            <View className="self-center w-full items-center">
                <ScrollView className="h-full w-full">
                    <View className="mx-8 mt-7 items-center w-5/6 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl o">
                        <Text className="text-xl dark:text-dark-text">Developed by </Text>
                        <Text className="text-xl dark:text-dark-text font-semibold">Raphael Templer</Text>
                    </View>
                    <View className="w-5/6 mt-7 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl overflow-hidden items-center">
                        <Text className="text-2xl dark:text-dark-text font-semibold">Special thanks to</Text>
                        <Link target="_blank" href="https://github.com/ionic-team/ionicons" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>Ionicons</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/expo/expo" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>Expo</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/facebook/react-native" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>React Native</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/tailwindlabs/tailwindcss" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>NativeWind/Tailwind</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/react-native-datetimepicker/datetimepicker" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>RN DateTime Picker</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/react-native-async-storage/async-storage" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>RN Async Storage</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/spring-projects/spring-boot" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>Spring boot</Text>
                        </Link>
                        <Link target="_blank" href="https://github.com/stomp-js/stompjs" className="mt-2 dark:text-dark-text flex flex-row items-center">
                            <Ionicons name="link" size={16} className="mr-1" />
                            <Text>StompJs</Text>
                        </Link>
                    </View>
                </ScrollView>
            </View>
        </View>);
}