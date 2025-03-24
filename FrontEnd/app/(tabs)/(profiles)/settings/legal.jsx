import "../../../../global.css"
import {ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useRouter} from "expo-router";

export default function LegalSettings() {

    const router = useRouter();
    return (
        <View className="bg-primary dark:bg-black w-full h-full">
            <ScrollView className="h-full w-full">
                <View className="self-center w-5/6 mt-5 rounded-xl overflow-hidden items-center">
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/privacy")}
                                      className="p-1 py-1.5 active:bg-gray-400 dark:active:bg-dark-primary dark:bg-dark-primary bg-white border-b border-gray-500 w-full">
                        <Text className="text-center text-lg font-semibold text-text dark:text-dark-text">Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings/terms")}
                                      className="p-1 py-1.5 active:bg-gray-400 dark:active:bg-dark-primary dark:bg-dark-primary bg-white border-gray-500 w-full">
                        <Text className="text-center text-lg font-semibold text-text dark:text-dark-text">Terms and Conditions</Text>
                    </TouchableOpacity>
                </View>
                <View className="w-5/6 mt-7 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl overflow-hidden items-center">
                    <Text className="text-2xl dark:text-dark-text font-semibold">Impressum</Text>
                    <Text className="mt-2 dark:text-dark-text">Monika Schneider</Text>
                    <Text className="mt-2 dark:text-dark-text">Elias-Holl-Str. 1</Text>
                    <Text className="mt-2 dark:text-dark-text">Eichstaett, Bavaria 85072</Text>
                    <Text className="mt-2 dark:text-dark-text">Germany</Text>
                    <Text className="mt-4 font-bold dark:text-dark-text">Kontakt</Text>
                    <Text className="mt-2 dark:text-dark-text">Email: bretter.schlaue83@icloud.com</Text>
                    <Text className="mt-2 dark:text-dark-text">Internet: www.facelinked.com</Text>
                </View>
            </ScrollView>
        </View>
    );
}