import {TextInput, TouchableOpacity, View, Text, Switch, SwitchBase, SwitchComponent, Platform} from "react-native";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {useNavigation, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import ip from "../../../components/AppManager";
import {Image} from "expo-image";
import * as ImagePicker from "expo-image-picker";

export default function CreateNetwork() {

    const memberInput = useRef(null);
    const [isPrivate, setIsPrivate] = useState(false);
    const [members, setMembers] = useState([]);
    const name = useRef("");
    const description = useRef("");
    const image = useRef(null);
    const [isCreating, setCreating] = useState(false);

    const router = useRouter();

    const token = useRef("");
    const username = useRef("");

    function toggleSwitch() {
        setIsPrivate(previousState => !previousState);
        if (isPrivate) {
            memberInput.current.focus();
        }
        else {
            setMembers([]);
        }
    }

    const navigator = useNavigation("../");

    useEffect(() => {
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        }
        else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }
        setTimeout(() => {
            if (token.current === null) {router.replace("/")}
        });

        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black"/></TouchableOpacity>,
            headerRight: () => null
        });

        return () => {
            navigator.setOptions({
                headerLeft: () => <TouchableOpacity className="ml-2 mb-1" onPress={() => router.navigate("/networks/create")}>
                    <Ionicons name="add" size={25}/>
                </TouchableOpacity>
            });
        }
    }, []);

    function addMember(member) {
        if (member === username.current) {
            alert("You cannot add yourself to a network.");
            return;
        }
        if (members.find((m) => m.memberId === member)) {
            alert("This member is already in the network.");
            return;
        }
        setMembers([...members, {memberId: member}]);
    }

    async function createNetwork() {
        if (name.current === "" || description.current === "") {
            alert("Please fill out all fields.");
            return;
        }
        if (isPrivate && members.length === 0) {
            alert("Please add at least one member to a private network.");
            return;
        }
        let url = ""; //url of aws s3 default network icon or no one
        setCreating(true);

        if (image.current !== null) {
            const bucketUrl = await fetch(`${ip}/networks/upload`, {
                method: "GET",
                headers: {
                    "Authorization": "Bearer " + token.current
                }
            });
            if (!bucketUrl.ok) {
                alert("Failed to upload image. Please try again later.");
                return;
            }
            url = await bucketUrl.text();

            const response = await fetch(image.current.assets[0].uri);
            const blob = await response.blob();

            await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": blob.type
                },
                body: blob,
            });
        }
        //const compressedImage = await ImageManipulator.manipulateAsync(imageUri, [], { compress: 0.5 });

        let currentMembers = members;
        currentMembers = [...currentMembers, {memberId: username.current}];

        const data = await fetch(`${ip}/networks/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token.current
            },
            body: JSON.stringify({
                name: name.current,
                description: description.current,
                private: isPrivate,
                members: isPrivate ? currentMembers : [],
                networkPicturePath: url.split('?')[0]
            })
        });

        if (!data.ok) {
            alert("Failed to create network. Please try again later.");
        }
        else {
            const parsedData = await data.json();
            let networks = await AsyncStorage.getItem("networks") || [];
            if (networks.length !== 0) {
                networks = JSON.parse(networks);
            }
            await AsyncStorage.setItem("networks", JSON.stringify([...networks, {networkId: parsedData.id, name: name.current, description: description.current, creator: parsedData.creatorId, private: isPrivate, memberCount: 1, members: parsedData.members, networkPicturePath: url.split('?')[0]}]));
            router.back();
        }
    }

    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <View className="p-5">
                <Text className="text-text dark:text-dark-text text-center text-2xl">Create Network</Text>
                <TextInput onChangeText={(n) => name.current = n} className="w-full border-4 border-accent h-10 text-text dark:text-dark-text mt-5 p-2 rounded-lg" placeholder="Network Name"/>
                <TextInput autoCapitalize="none" onChangeText={(d) => description.current = d} className="w-full border-4 border-accent h-10 text-text dark:text-dark-text mt-5 p-2 rounded-lg" placeholder="Network Description"/>
                <View className="flex-row items-center justify-start mt-3">
                    <Text className="text-text dark:text-dark-text font-bold">Private</Text>
                    <Switch
                        trackColor={{false: '#3e3e3e', true: '#029f13'}}
                        thumbColor={isPrivate ? '#f4f3f4' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isPrivate}
                        className="ml-3"
                    />
                </View>
                <View className="mt-5" style={{display: isPrivate ? "flex" : "none"}}>
                    <Text className="text-text dark:text-dark-text mt-1 font-bold">Members</Text>
                    <TextInput autoCapitalize="none" ref={memberInput} onSubmitEditing={(m) => {addMember(m.nativeEvent.text); memberInput.current.clear();}} className="w-full border-4 border-accent h-10 text-text dark:text-dark-text mt-2 p-2 rounded-lg" placeholder="Add a member"/>
                    <View className="mt-2">
                        <Text className="text-text dark:text-dark-text mt-1 font-bold" style={{display: members.length === 0 ? "none" : "flex"}}>Current Members</Text>
                        {members.map((member, index) => {
                            return (
                                <View key={index} className="flex-row items-center justify-between bg-accent dark:bg-dark-accent p-2 rounded-lg mt-2">
                                    <Text className="text-dark-text font-bold">{member.memberId}</Text>
                                    <TouchableOpacity onPress={() => setMembers(members.filter((_, i) => i !== index))} className="bg-danger dark:bg-dark-danger p-1 rounded-lg">
                                        <Text className="text-dark-text font-bold">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            )
                        })}
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={async () => {
                        const result = await ImagePicker.launchImageLibraryAsync({
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 0.2,
                            mediaTypes: "images"
                        });

                        if (!result.canceled) {
                            image.current = result;
                        }
                    }} className="w-1/2 self-center mt-4 bg-gray-700 flex-row justify-center items-center p-1.5 rounded-lg">
                        <Ionicons name={"image"} size={24} color={"white"} style={{alignSelf: "center"}}/>
                        <Text className="text-dark-text ml-1 font-bold text-center">Upload Image</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity disabled={isCreating} activeOpacity={0.9} onPress={() => createNetwork()} className="w-full bg-accent dark:bg-dark-accent mt-5 p-2.5 rounded-lg">
                    <Text className="text-dark-text font-bold text-center">Create Network</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}