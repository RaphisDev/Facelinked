import { Text, View } from "react-native";
import "../../global.css"

export default function Profile() {

    return (
        <View className="bg-primary dark:bg-dprimary" style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Text className="font-bold text-text dark:text-dtext text-3xl">Profile</Text>

        </View>
    );
}
