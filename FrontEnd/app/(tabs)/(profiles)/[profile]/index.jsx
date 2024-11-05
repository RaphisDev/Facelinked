//Modal for more profile infos?? Better solution?
//Also for own profile. By clicking on Tab icon it opens your profile /"empty": own profile
import {FlatList, Pressable, Text, TouchableOpacity, View} from "react-native";
import "../../../../global.css"
import {router} from "expo-router";
import {Image} from "expo-image";

export default function Index() {

    const data = {name: "Raphael Templer", username: "raphi.t08", age: 16, school: "Willibald-Gymnasium", class: 10, classInteger: "b", relationshipStatus: false};
    //Too much shadow for profile picture??

    return (
        <>
            <View className="bg-primary dark:bg-dark-primary w-full h-full">
                <Text className="text-text dark:text-dark-text text-center font-bold mt-24 text-4xl">{data.name}</Text>
                <View className="justify-between flex-row mt-10">
                    <View className="ml-3">
                        <Text className="font-medium text-xl text-text dark:text-dark-text">{data.username}</Text>
                        <Text className="font-bold text-2xl underline text-text dark:text-dark-text">Infos</Text>
                        <FlatList data={[
                            {id: "age", value: data.age},
                            {id: "school", value: data.school},
                            {id: "class", value: data.class + data.classInteger},
                            {id: "relationshipStatus", value: data.relationshipStatus ? "in Relationship" : "Single"}
                        ]} renderItem={({item}) => <Text className="text-xl font-medium text-text dark:text-dark-text" id={item.id}>• {item.value}</Text>}/>
                    </View>
                    <View className="shadow-xl shadow-black h-80 w-56 mr-3 rounded-3xl overflow-hidden">
                        <Image style={{ width: '100%', height: '100%', objectFit: "cover", position: "static", borderRadius: 24 }} alt="Profile picture" source={require('../../../../assets/images/profilePicture.jpeg')}/>
                    </View>
                </View>


                <View className="invisible">
                    <Pressable onPress={() => router.push(`/${data.username}/posts`)}><Text>Posts</Text></Pressable>
                </View>
            </View>
        </>
    );
}

