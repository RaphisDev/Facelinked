import "../../../../global.css"
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useEffect} from "react";

export default function Index() {
    const router = useRouter();

    useEffect(() => {
            setTimeout(() => {
                if (Platform.OS === "web") {
                    if (localStorage.getItem("token") === null) {router.replace("/")}
                } else { if (SecureStore.getItem("token") === null) {router.replace("/")}}
            });
    }, []);

    return (
        <View className="bg-primary dark:bg-black w-full h-full">
           <ScrollView className="h-full w-full">
               <View className="self-center w-11/12 mt-5 rounded-xl overflow-hidden items-center">
                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/account")}
                                     className="p-1 py-1.5 bg-white active:bg-gray-400 dark:active:bg-dark-primary dark:bg-dark-primary w-full">
                       <Text className="text-left ml-5 text-lg font-semibold dark:text-dark-text text-text">Profile</Text>
                       <Ionicons name={"chevron-forward"} size={22} color="black"
                                 className="absolute right-3 mt-1.5"/>
                   </TouchableOpacity>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/legal")}
                                     className="p-1 py-1.5 bg-white active:bg-gray-400 dark:active:bg-dark-primary dark:bg-dark-primary border-gray-500 border-t w-full">
                       <Text className="text-left ml-5 text-lg font-semibold dark:text-dark-text text-text">Legal</Text>
                       <Ionicons name={"chevron-forward"} size={22} color="black"
                                 className="absolute right-3 mt-1.5"/>
                   </TouchableOpacity>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/credits")}
                                     className="p-1 py-1.5 bg-white dark:active:bg-dark-primary active:bg-gray-400 border-gray-500 border-t  dark:bg-dark-primary w-full">
                       <Text className="text-left ml-5 text-lg font-semibold dark:text-dark-text text-text">Credits</Text>
                       <Ionicons name={"chevron-forward"} size={22} color="black"
                                 className="absolute right-3 mt-1.5"/>
                   </TouchableOpacity>
               </View>
           </ScrollView>
        </View>
    );
}