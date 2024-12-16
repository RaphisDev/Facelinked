import {Alert, FlatList, Keyboard, Platform, Pressable, Text, TextInput, TouchableOpacity, View} from "react-native";
import "../../../../global.css"
import {router, useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import {Image} from "expo-image";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStorage from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Profile() {


    //Posts
    //Pressing on tab icon goes back to your profile or swiping right
    const navigation = useNavigation();
    let {profile} = useLocalSearchParams();
    const router = useRouter();

    const [showInput, setShowInput] = useState(false);
    const input = useRef(null);

    const segments = useSegments();

    const [profileInfos, setProfileInfos] = useState({
        name: "Loading...",
        score: 0,
        location: "Loading...",
        hobbies: "Loading...",
        inRelationship: false,
        partner: "Loading...",
        profilePicturePath: "",
        dateOfBirth: new Date()
    });

    async function fetchData() {
        try {
            if(profile === undefined) {
                profile = await SecureStore.getItemAsync('username');
            }
            const ip = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.178';
            const data = await fetch(`http://${ip}:8080/profile/${profile}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + await SecureStore.getItemAsync('token'),
                    'Content-Type': 'application/json'
                }
            });
            if (data.ok){
                const profileInfos = await data.json();
                setProfileInfos(profileInfos);
                await SecureStore.setItemAsync('profile', JSON.stringify(profileInfos));
            }
        }
        catch (error) {
            setProfileInfos(await SecureStore.getItemAsync('profile').then(JSON.parse));
        }
    }

    function calculateAge(birthDate) {
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    function handleAddBar() {
        setShowInput(shown => !shown);
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={handleAddBar}><Ionicons name="search" size={25}/></TouchableOpacity>,
        });
    }, [navigation]);

    useEffect( () => {
        if(!profile){ profile = SecureStore.getItem("username");}

        navigation.setOptions({
            headerTitle: profile !== SecureStore.getItem("username") ? profile : "Profile",
        });
        fetchData();
    }, [segments]);

    return (
        <>
            <View className="bg-primary dark:bg-dark-primary w-full h-full">
                <TextInput ref={input} style={{display: !showInput ? "none" : "flex"}} placeholder="Type in an username" autoCapitalize="none" className="rounded-xl mt-4 p-2 w-3/4 hidden bg-primary dark:bg-dark-primary dark:text-dark-text text-text mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                    router.navigate(`/${e.nativeEvent.text}`);
                    input.current.clear();
                    handleAddBar();
                }}/>
                <Text className="text-text dark:text-dark-text text-center font-bold mt-7 text-4xl">{profileInfos.name}</Text>
                <View className="justify-between flex-row mt-10">
                    <View className="ml-3 overflow-hidden w-52">
                        <TouchableOpacity onPress={() => Alert.alert("Score", "The score is calculated based on the amount of likes you have received on your posts.",
                            [{text: "OK"}])} activeOpacity={0.75} className="flex-row items-center justify-center self-center w-[117] mr-5 mb-1.5 bg-accent rounded-xl">
                            <Ionicons size={14} color="black" name={"aperture"}/>
                            <Text className="font-bold text-lg text-center text-dark-text"> {profileInfos.score}</Text>
                        </TouchableOpacity>
                        <FlatList scrollEnabled={false} data={[
                            {id: "age", value: `${profileInfos.name?.split(" ")[0]}, ${calculateAge(new Date(profileInfos?.dateOfBirth))}`},
                            {id: "location", value: profileInfos.location},
                            {id: "hobbies", value: profileInfos.hobbies},
                            {id: "relationshipStatus", value: profileInfos.inRelationship ? "in Relationship" : "Single"},
                            {id: "partner", value: profileInfos.partner},
                        ]} renderItem={({item}) => <Text className="text-xl font-medium text-text dark:text-dark-text" style={{display: item.id === "partner" ? profileInfos.inRelationship ?
                                "flex" : "none" : "flex"}} id={item.id}>{item.value}</Text>}/>
                    </View>
                    <View className="h-64 aspect-[16/19] mr-3 rounded-3xl overflow-hidden">
                        <Image style={{ width: '100%', height: '100%', objectFit: "cover", position: "static", borderRadius: 24 }}
                               alt="Profile picture" source={{uri: profileInfos.profilePicturePath}}/>
                    </View>
                </View>
                    <View className="flex-row justify-center mt-5" style={{display: profile === SecureStore.getItem("username") || profile === undefined ? "none" : "flex"}}>
                    <TouchableOpacity onPress={() => router.navigate(`/chat/${profile}`)} activeOpacity={0.6} className="mr-16 border-accent bg-accent border-4 rounded-xl p-2">
                        <Text className="text-dark-text font-semibold">Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.6} className="border-accent bg-accent border-4 rounded-xl p-2">
                      <Text className="text-dark-text font-semibold">Add friend</Text>
                    </TouchableOpacity>
                </View>
                {(profile === SecureStore.getItem("username") || profile === undefined) &&
                    <View>
                        <View className="flex-row mt-10 justify-between mb-2">
                            <Text className="text-center text-text dark:text-dark-text self-start font-bold text-2xl ml-4 mt-3">Posts</Text>
                            <TouchableOpacity activeOpacity={0.65} className="rounded-full self-end bg-accent p-2 mr-2 w-20">
                                <Ionicons name={"add"} size={24} className="text-center" color={"#FFFFFF"}></Ionicons>
                            </TouchableOpacity>
                        </View>
                        <FlatList data={[{ifNoPosts: "display: No posts yet"}]} style={{width :"100%", height: "100%"}} renderItem={() => <View className="self-center mt-14">
                            <Text className="text-text dark:text-dark-text font-semibold text-xl">No posts yet</Text>
                        </View>}/>
                    </View>}
            </View>
        </>
    );
}

