import {FlatList, Platform, Pressable, Text, TouchableOpacity, View} from "react-native";
import "../../../../global.css"
import {router, useLocalSearchParams, useNavigation} from "expo-router";
import {Image} from "expo-image";
import {useEffect, useLayoutEffect, useState} from "react";
import * as SecureStore from "expo-secure-store";

export default function Index() {


    //Seite persoenlicher machen wie in Notion beschrieben anstatt nur die Daten anzuzeigen
    //Like Bio/Description, Hobbies/Interests, things in Design Image + on BlockBlatt, Posts, later friends, etc.
    const navigation = useNavigation();
    let {username} = useLocalSearchParams();

    const [profileInfos, setProfileInfos] = useState({});

    async function fetchData() {
        try {
            if(username === undefined) {
                username = await SecureStore.getItemAsync('username');
            }
            const ip = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.178';
            const data = await fetch(`http://${ip}:8080/profile/${username}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token'),
                    'Content-Type': 'application/json'
                }
            });
            if (data.ok){
                setProfileInfos(await data.json());
            }
        }
        catch (error) {
            console.error("Error fetching data: ", error);
        }
    }

    function calculateAge(birthDate) {
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            title: username ? username : "Profile",
        });
    }, [navigation]);

    useEffect( () => {
        fetchData();
    }, []);

    return (
        <>
            <View className="bg-primary dark:bg-dark-primary w-full h-full">
                <Text className="text-text dark:text-dark-text text-center font-bold mt-7 text-4xl">{profileInfos.name}</Text>
                <View className="justify-between flex-row mt-10">
                    <View className="ml-3 overflow-hidden">
                        <Text className="font-bold text-2xl underline text-text dark:text-dark-text">Infos</Text>
                        <FlatList data={[
                            {id: "age", value: calculateAge(new Date(profileInfos.dateOfBirth))},
                            {id: "school", value: profileInfos.schoolName},
                            {id: "location", value: profileInfos.location},
                            {id: "relationshipStatus", value: profileInfos.inRelationship ? "in Relationship" : "Single"},
                            {id: "partner", value: profileInfos.partner},
                        ]} renderItem={({item}) => <Text className="text-xl font-medium text-text dark:text-dark-text" style={{display: item.id === "partner" ? profileInfos.inRelationship ? "flex" : "none" : "flex"}} id={item.id}>• {item.value}</Text>}/>
                    </View>
                    <View className="h-64 aspect-[16/19] mr-3 rounded-3xl overflow-hidden">
                        <Image style={{ width: '100%', height: '100%', objectFit: "cover", position: "static", borderRadius: 24 }}
                               alt="Profile picture" source={{uri: profileInfos.profilePicturePath}}/>
                    </View>
                </View>
            </View>
        </>
    );
}

