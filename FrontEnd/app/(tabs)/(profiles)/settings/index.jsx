import "../../../../global.css"
import {Alert, Platform, ScrollView, Text, TouchableOpacity, View} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {useRouter} from "expo-router";

export default function Index() {
    const router = useRouter();

    return (
        <View className="bg-primary dark:bg-dark-primary">
           <ScrollView className="h-full w-full">
               <View className="self-center w-full items-center">
                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/account")} className="p-0.5 bg-dark-primary border-t border-b border-gray-500 w-full">
                       <Text className="text-center text-lg font-semibold text-dark-text">Profile</Text>
                   </TouchableOpacity>
                   <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/legal")} className=" p-0.5 bg-dark-primary border-b border-gray-500  w-full">
                       <Text className="text-center text-lg font-semibold text-dark-text">Legal</Text>
                    </TouchableOpacity>
                   <Text className="text-xl dark:text-dark-text mt-10">Developed by </Text>
                   <Text className="text-xl dark:text-dark-text font-bold">Raphael Templer</Text>
               </View>
           </ScrollView>
        </View>
    );
}