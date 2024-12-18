import "../../../global.css"
import {ScrollView, Text, View} from "react-native";

export default function Settings() {
    return (
        <View className="bg-primary dark:bg-dark-primary">
           <ScrollView className="h-full w-full mt-4">
               <View className="self-center items-center">
                   <Text className="text-xl">Developed by </Text>
                   <Text className="text-xl font-bold">Raphael Templer</Text>
               </View>
           </ScrollView>
        </View>
    );
}