import {View, Text} from "react-native";
import "../../global.css";

export default function Message(props) {
    return (
        <View className="p-2 mr-2.5 ml-2.5" style={{alignItems: props.isSender ? "flex-end" : "flex-start"}}>
            <View className="rounded-xl p-2" style={{backgroundColor: props.isSender ? "#007BFF" : "#6C757D", width: "70%"}}>
                <Text style={{color: "#FFFFFF"}} className="text-xl text-center">{props.content}</Text>
                <Text style={{color: "#FFFFFF", textAlign: "right", fontSize: 11}}>{props.timestamp.split(202)[0] +
                    props.timestamp.split("GMT")[0].split(202)[1].slice(2)}</Text>
            </View>
        </View>
    )
}