import {View, Text} from "react-native";

export default function Message(props) {
    return (
        <View className="w-full bg-primary dark:bg-dark-primary p-3">
            <View className="border-2 border-black rounded-xl p-3">
                <Text className="text-text dark:text-dark-text text-xl text-center">{props.content}</Text>
                <Text className="text-text dark:text-dark-text text-xs">{props.timestamp.split("2024")[0] +
                    props.timestamp.split("GMT")[0].split("2024")[1]}</Text>
            </View>
        </View>
    )
}