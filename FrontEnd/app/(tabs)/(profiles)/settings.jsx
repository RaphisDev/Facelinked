import "../../../global.css"
import {Alert, ScrollView, Text, TouchableOpacity, View} from "react-native";
import asyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {useRouter} from "expo-router";
import WebSocketProvider from "../../../components/WebSocketProvider";

export default function Settings() {
    const router = useRouter();

    return (
        <View className="bg-primary dark:bg-dark-primary">
           <ScrollView className="h-full w-full mt-4">
               <View className="self-center items-center">
                   <Text className="text-4xl font-bold dark:text-dark-text">Account</Text>
                   <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                       Alert.alert("Are you sure you want to log out?", "You will be logged out of your account", [
                            {
                                 text: "Cancel",
                                 onPress: () => {}
                            },
                            {
                                 text: "Log out",
                                 onPress: async () => {
                                     await asyncStorage.clear();
                                     await SecureStore.deleteItemAsync("token");
                                     await SecureStore.deleteItemAsync("username");
                                     await SecureStore.deleteItemAsync("profilePicture");
                                     await SecureStore.deleteItemAsync("profile");
                                     new WebSocketProvider().reset();
                                     router.replace("/");
                                 }
                            }
                          ]);
                   }} className="bg-accent mt-2 p-0.5 w-28 rounded-lg">
                          <Text className="text-center text-xl font-semibold text-dark-text">Log out</Text>
                   </TouchableOpacity>
                   <Text className="text-xl dark:text-dark-text mt-10">Developed by </Text>
                   <Text className="text-xl dark:text-dark-text font-bold">Raphael Templer</Text>
               </View>
           </ScrollView>
        </View>
    );
}