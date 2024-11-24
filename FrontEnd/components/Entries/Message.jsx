import {View, Text} from "react-native";

export default function Message(props) {
    return (
        <View className="w-full bg-primary dark:bg-dark-primary rounded-lg p-3 m-2">
            <View className="border-2 border-black w-full">
                <Text className="text-text">{props.content}</Text>
                <Text className="text-text text-xs">{props.timestamp}</Text>
            </View>
        </View>
    )
}