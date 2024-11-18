import {Text, View} from "react-native";
import * as Image from "expo-image";

export default function Chat(props) {
    return (
        <View className="rounded-lg border-2 border-black">
            {/*<Image source={{uri: props.image}}></Image>*/}
            <Text>{props.name}</Text>
        </View>
    )
}