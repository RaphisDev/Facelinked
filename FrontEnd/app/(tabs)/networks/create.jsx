import {TextInput, TouchableOpacity, View, Text, Switch, SwitchBase, SwitchComponent, Platform} from "react-native";
import {useEffect, useRef, useState} from "react";
import {useNavigation, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function CreateNetwork() {

    const memberInput = useRef(null);

    function toggleSwitch() {
        setIsPrivate(previousState => !previousState);
        if (isPrivate) {
            memberInput.current.focus();
        }
        else {
            setMembers([]);
        }
    }

    const navigator = useNavigation("../../");

    useEffect(() => {
        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black"/></TouchableOpacity>,
        });

        return () => {
            navigator.setOptions({
                headerLeft: () => <TouchableOpacity className="ml-2 mb-1" onPress={() => router.navigate("/networks/create")}>
                    <Ionicons name="add" size={25}/>
                </TouchableOpacity>,
            });
        }
    }, []);

    function addMember(member) {
        if (member === SecureStore.getItem("username")) {
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
        let currentMembers = members;
        currentMembers = [...currentMembers, {memberId: await SecureStore.getItemAsync("username")}];

        const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";
        const data = await fetch(`http://${ip}:8080/networks/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + SecureStore.getItem("token")
            },
            body: JSON.stringify({
                name: name.current,
                description: description.current,
                private: isPrivate,
                members: isPrivate ? currentMembers : []
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
            await AsyncStorage.setItem("networks", JSON.stringify([...networks, {networkId: parsedData.id, name: name.current, description: description.current, creator: parsedData.creatorId, private: isPrivate, members: parsedData.members}]));
            router.back();
        }
    }

    const [isPrivate, setIsPrivate] = useState(false);
    const [members, setMembers] = useState([]);
    const name = useRef("");
    const description = useRef("");

    const router = useRouter();

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
                <TouchableOpacity activeOpacity={0.9} onPress={() => createNetwork()} className="w-full bg-accent dark:bg-dark-accent mt-5 p-2.5 rounded-lg">
                    <Text className="text-dark-text font-bold text-center">Create Network</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}