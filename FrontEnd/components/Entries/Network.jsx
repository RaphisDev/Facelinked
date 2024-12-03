import "../../global.css"
import {TouchableOpacity, View, Text} from "react-native";
import {useRouter} from "expo-router";

export default function Network(props) {
    const router = useRouter();

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={() => router.navigate(`/networks/${props.networkId}`)}>
            <View className="rounded-xl" style={{backgroundColor: "#6C757D", height: 90}}>
                <Text className="text-white text-center">{props.network}</Text>
            </View>
        </TouchableOpacity>);
}