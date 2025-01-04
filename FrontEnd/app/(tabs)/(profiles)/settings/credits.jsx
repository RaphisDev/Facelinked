import "../../../../global.css"
import {ScrollView, Text, View} from "react-native";

export default function Credits() {
    return (
        <View className="bg-primary dark:bg-dark-primary">
            <View className="self-center w-full items-center">
                <ScrollView className="h-full w-full">
                    <View className="mx-8 mt-7 items-center w-5/6 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl o">
                        <Text className="text-xl dark:text-dark-text">Developed by </Text>
                        <Text className="text-xl dark:text-dark-text font-semibold">Raphael Templer</Text>
                    </View>
                    <View className="w-5/6 mt-7 pb-5 pt-5 bg-white dark:bg-dark-primary self-center rounded-xl overflow-hidden items-center">
                        <Text className="text-2xl dark:text-dark-text font-semibold">Special thanks to</Text>
                        <Text className="mt-2 dark:text-dark-text">Ionicons</Text>
                        <Text className="mt-2 dark:text-dark-text">Expo</Text>
                        <Text className="mt-2 dark:text-dark-text">React Native</Text>
                        <Text className="mt-2 dark:text-dark-text">NativeWind/Tailwind</Text>
                        <Text className="mt-2 dark:text-dark-text">RN DateTime Picker</Text>
                        <Text className="mt-2 dark:text-dark-text">RN Async Storage</Text>
                        <Text className="mt-2 dark:text-dark-text">Spring boot</Text>
                        <Text className="mt-2 dark:text-dark-text">StompJs</Text>
                    </View>
                </ScrollView>
            </View>
        </View>);
}