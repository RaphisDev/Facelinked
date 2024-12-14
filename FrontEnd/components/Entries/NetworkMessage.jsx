import "../../global.css"
import {Text, View} from "react-native";
import {Image} from "expo-image";

export default function NetworkMessage(props) {
    return (
        <View className="w-full">
            <View className="bg-dark-primary rounded-lg h-30 justify-center m-1">
                <View className="flex flex-row ml-2 mt-2 mb-3">
                    <Image source={{uri: props.profilePicturePath}} style={{width: 37, height: 37, borderRadius: 23}}/>
                    <Text className="font-bold text-lg text-dark-text self-center ml-2">{props.sender}</Text>
                </View>
                <Text style={{color: "#FFFFFF"}} className="text-xl ml-2 mr-16">{props.content}</Text>
                <Text className="pb-2" style={{color: "#FFFFFF", textAlign: "right", fontSize: 11, marginRight: 8}}>{props.timestamp.split("2024")[0] +
                    props.timestamp.split("GMT")[0].split("2024")[1]}</Text>
            </View>
        </View>
    )
}