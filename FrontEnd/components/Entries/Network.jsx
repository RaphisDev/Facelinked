import {TouchableOpacity, View, Text} from "react-native";
import {useRouter} from "expo-router";
import "../../global.css"
import Ionicons from "@expo/vector-icons/Ionicons";
import {Image} from "expo-image";

export default function Network(props) {
    const router = useRouter();

    return (
        <TouchableOpacity activeOpacity={0.9} style={{ marginLeft: 15, marginRight: 15, paddingBottom: 7}} onPress={() => router.navigate(`/networks/${props.id}?name=${props.network}`)}>
            <View className="rounded-xl bg-dark-primary/90 dark:bg-[#6C757D]" style={{ height: 90 }}>
                <View className="flex-row w-full h-full">
                    <Image style={{height: 51, width: 51, marginLeft: 18.5, alignSelf: "center", borderRadius: 10}} source={{uri: props.networkPicturePath}}/>
                    <View className="flex-1" style={{marginRight: 50}}>
                        <Text className="text-dark-text text-xl font-bold mt-2 text-center">{props.network}</Text>
                        <Text className="text-dark-text mt-1 text-center">{props.description}</Text>
                        {props.creator && <Text className="mt-3 text-dark-text font-bold text-center">created by {props.creator}</Text>}
                        {!props.creator && <View className="flex-row self-center items-center mt-2">
                            <Ionicons name={"heart"} size={20} color={"white"}/>
                            <Text className="text-dark-text ml-0.5 font-bold">{props.member}</Text>
                        </View>}
                    </View>
                </View>
            </View>
            {props.isPrivate && <Ionicons name={"lock-closed"} style={{position: "absolute", right: 10, top: 7}} size={21} color={"#FFFFFF"}/>}
        </TouchableOpacity>);
}