import "../../global.css"
import {Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";

export default function NetworkMessage(props) {
    const router = useRouter();

    return (
        <View className="w-full pb-2">
            <View className="bg-dark-primary dark:bg-[#6C757D] rounded-xl justify-center mr-1.5 ml-1.5">
                <TouchableOpacity activeOpacity={0.65} onPress={() => router.navigate(`/${props.sender}`)} className="flex flex-row ml-2 mt-2 mb-3">
                    <Image source={{uri: props.senderProfilePicturePath.split(',')[0]}} style={{width: 25, marginTop: 3, aspectRatio: "18/19", borderRadius: 11}}/>
                    <Text className="font-bold text-lg text-dark-text self-center ml-2">{props.sender}</Text>
                </TouchableOpacity>
                <Text style={{color: "#FFFFFF"}} className="text-xl ml-2 mr-16">{props.content}</Text>
                <Text className="pb-2" style={{color: "#FFFFFF", textAlign: "right", fontSize: 11, marginRight: 8}}>
                    {props.timestamp}</Text>
            </View>
        </View>
    )
}