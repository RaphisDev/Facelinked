import "../../../global.css"
import {FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import Network from "../../../components/Entries/Network";
import {useEffect, useRef, useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useLocalSearchParams, useRouter} from "expo-router";

export default function Networks() {

    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);

    useEffect(() => {
        if (selected === 0) {
            const loadNetworks = async () => {
                let networks = await AsyncStorage.getItem("networks") || [];
                if (networks.length !== 0 && networks.length !== favoriteNetworks.length) {
                    setNetworks(JSON.parse(networks));
                }
            }
            loadNetworks();
        }
    });


    const currentTab = () => {
        switch (selected) {
            case 0:
                return <>
                    <FlatList contentContainerStyle={{gap: 7}} style={{paddingTop: 15, marginLeft: 15, marginRight: 15}} data={favoriteNetworks}
                              renderItem={(items) => <Network id={items.item.networkId} network={items.item.name} description={items.item.description} creator={items.item.creator} isPrivate={items.item.private}/>}/>
                </>;
            case 1:
                return <></>;
            case 2:
                return <></>;
        }
    }
    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <View className="flex flex-row justify-around items-center">
                <TouchableOpacity activeOpacity={1} onPress={() => setSelected(0)}>
                    <Ionicons className="mt-3 ml-3" name="heart" style={{color: selected !== 0 ? "rgba(76,76,76,0.76)" : "#000000"}} size={selected !== 0 ? 22 : 24} color="black"/>
                </TouchableOpacity>
                <View className="flex-1 ml-3 flex-row justify-around">
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelected(1)}>
                        <Text style={{color: selected !== 1 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 1 ? 22 : 24}} className="text-text mt-3 dark:text-dark-text font-extrabold">Friends</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelected(2)}>
                        <Text style={{color: selected !== 2 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 2 ? 22 : 24}} className="text-text mt-3 dark:text-dark-text font-extrabold">Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {currentTab()}
        </View>
    )
}