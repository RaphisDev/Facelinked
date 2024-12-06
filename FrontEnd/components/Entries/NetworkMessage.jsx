import "../../global.css"
import {Text, View} from "react-native";

export default function NetworkMessage(props) {
    return (
        <View className="w-full">
            <View className="rounded-xl p-2" style={{backgroundColor: props.isSender ? "#007BFF" : "#6C757D", width: "70%"}}>
                <Text style={{color: "#FFFFFF"}} className="text-xl text-center">{props.content}</Text>
                <Text style={{color: "#FFFFFF", textAlign: "right", fontSize: 11}}>{props.timestamp.split("2024")[0] +
                    props.timestamp.split("GMT")[0].split("2024")[1]}</Text>
            </View>
        </View>
    )
}