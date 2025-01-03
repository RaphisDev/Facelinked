import "../../global.css";
import {Share, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function Post(props) {

    return (
        <View className="w-full pb-2">
            <View className="bg-dark-primary dark:bg-[#6C757D] min-h-20 p-5 rounded-xl justify-center mr-1.5 ml-1.5">
                <Text className="text-xl ml-4 mr-16 mb-6 text-dark-text">{props.title}</Text>
                <Image className="rounded-xl" source={{uri: props.content[0]}}/>
                <View className="flex-row justify-evenly">
                    <TouchableOpacity className="flex flex-row items-center">
                        <Ionicons name="heart" color="white" size={20}/>
                        <Text className="ml-1 text-dark-text text-lg">{props.likes === 0 ? "" : props.likes}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex flex-row items-center">
                        <Ionicons name="chatbubble" color="white" size={20}/>
                        <Text className="ml-1 text-dark-text text-lg">{props.comments === 0 ? "" : props.comments}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Share.share({
                        message: "Check out this post!",
                        title: "Check out this post!",
                        text: "Check out this post!",
                        url: `https://friendslinked.de/${props.username}?post=${encodeURIComponent(props.id)}`,
                        dialogTitle: "Check out this post!"
                    })} className="flex flex-row items-center">
                        <Ionicons name="share-outline" color="white" size={20}/>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}