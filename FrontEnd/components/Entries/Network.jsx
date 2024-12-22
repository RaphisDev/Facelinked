import {TouchableOpacity, View, Text} from "react-native";
import {useRouter} from "expo-router";
import "../../global.css"
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Network(props) {
    const router = useRouter();

    return (
        <TouchableOpacity activeOpacity={0.9} style={{ marginLeft: 15, marginRight: 15, paddingBottom: 7}} onPress={() => router.navigate(`/networks/${props.id}?name=${props.network}`)}>
            <View className="rounded-xl bg-dark-primary/90 dark:bg-[#6C757D]" style={{ height: 90 }}>
                <Text className="text-dark-text text-xl font-bold mt-2 text-center">{props.network}</Text>
                <Text className="text-dark-text mt-1 text-center">{props.description}</Text>
                <Text className="mt-4 text-dark-text font-bold text-center">created by {props.creator}</Text>
            </View>
            {props.isPrivate && <Ionicons name={"lock-closed"} style={{position: "absolute", right: 10, top: 7}} size={24} color={"#FFFFFF"}/>}
        </TouchableOpacity>);
}