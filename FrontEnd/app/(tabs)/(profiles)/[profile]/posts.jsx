import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../../../../global.css"
import {router} from "expo-router";

export default function Profile() {

    //Create directories instead of files for tabs

    return (
        <View className="">
            <Pressable onPress={() => router.push("/")}><Text>Home</Text></Pressable>
        </View>
    );
}