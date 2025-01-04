import "../../../../global.css"
import {Text, TouchableOpacity, View} from "react-native";
import {useRouter} from "expo-router";

export default function LegalSettings() {

    const router = useRouter();
    return (
        <View className="bg-primary dark:bg-dark-primary">
            <View className="self-center w-full items-center">
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/privacy")} className="p-0.5 bg-dark-primary border-t border-b border-gray-500 w-full">
                    <Text className="text-center text-lg font-semibold text-dark-text">Privacy Policy</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}