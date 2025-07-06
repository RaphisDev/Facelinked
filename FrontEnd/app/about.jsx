import "../global.css"
import {Text, View} from "react-native";

export default function About() {
    return (
        <View className="w-5/6 mt-7 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl overflow-hidden items-center">
            <Text className="text-2xl dark:text-dark-text font-semibold">About us</Text>
            <Text className="mt-2 dark:text-dark-text">Monika Schneider</Text>
            <Text className="mt-2 dark:text-dark-text">Elias-Holl-Str. 1</Text>
            <Text className="mt-2 dark:text-dark-text">Eichstaett, Bavaria 85072</Text>
            <Text className="mt-2 dark:text-dark-text">Germany</Text>
            <Text className="mt-4 font-bold dark:text-dark-text">Contact</Text>
            <Text className="mt-2 dark:text-dark-text">Email: info@facelinked.com</Text>
            <Text className="mt-2 dark:text-dark-text">Internet: www.facelinked.com</Text>
        </View>
    )
}