import {TextInput, TouchableOpacity, View, Text, Switch, SwitchBase, SwitchComponent, Platform} from "react-native";
import {useRef, useState} from "react";
import {useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function CreateNetwork() {

    function toggleSwitch() {
        setIsPrivate(previousState => !previousState);
        //Add logic to change the network to private or public
        //Add field to add people to the network
    }

    function addMember(member) {
        members.current.push({memberId: member});
    }

    async function createNetwork() {
        members.current.push({memberId: "raphi.t31"});
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
                members: members.current
            })
        });

        if (!data.ok) {
            alert("Failed to create network. Please try again later.");
        }
        else {
            router.back();
        }
    }

    const [isPrivate, setIsPrivate] = useState(false);
    const members = useRef([]);
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
                <TouchableOpacity activeOpacity={0.9} onPress={() => createNetwork()} className="w-full h-10 bg-accent dark:bg-dark-accent mt-5 p-2 rounded-lg">
                    <Text className="text-dark-text font-bold text-center">Create Network</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}