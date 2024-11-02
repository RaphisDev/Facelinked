import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../../global.css"
import {Link} from "expo-router";
import {Image} from "react-native";
import * as ImagePicker from "expo-image-picker"

export default function Index() {

    async function pickImage(){
        let result = await ImagePicker.launchImageLibraryAsync({

        })
    }

    return (
        <View className="bg-primary dark:bg-dprimary" style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
            <Image source={require("../../assets/images/icon.png")} className="size-36"/>
            <TouchableOpacity onPress={pickImage}><Text>Hey</Text></TouchableOpacity>
        </View>
  );
}