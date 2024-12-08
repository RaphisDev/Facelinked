import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../../../global.css"
import {router} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useState} from "react";

export default function Index() {

    const [selected, setSelected] = useState(0);

    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <View className="flex flex-row justify-around items-center">
                <View className="flex-1 flex-row justify-around">
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelected(0)}>
                        <Text style={{color: selected !== 0 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 0 ? 22 : 24}} className="text-text mt-3 dark:text-dark-text font-extrabold">Friends</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelected(1)}>
                        <Text style={{color: selected !== 1 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 1 ? 22 : 24}} className="text-text mt-3 dark:text-dark-text font-extrabold">Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}