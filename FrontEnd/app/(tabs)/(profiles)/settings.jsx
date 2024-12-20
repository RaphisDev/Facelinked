import "../../../global.css"
import {ScrollView, Text, View} from "react-native";

export default function Settings() {
    return (
        <View className="bg-primary dark:bg-dark-primary">
           <ScrollView className="h-full w-full mt-4">
               <View className="self-center items-center">
                   <Text className="text-xl dark:text-dark-text">Developed by </Text>
                   <Text className="text-xl dark:text-dark-text font-bold">Raphael Templer</Text>
               </View>
           </ScrollView>
        </View>
    );
}