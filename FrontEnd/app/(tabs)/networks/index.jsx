import "../../../global.css"
import {FlatList, Text, TextInput, TouchableOpacity, View} from "react-native";
import Network from "../../../components/Entries/Network";
import {useEffect, useRef, useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useLocalSearchParams, useRouter, useSegments} from "expo-router";

export default function Networks() {

    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);
    const segments = useSegments();

    useEffect(() => {
        if (selected === 0) {
            const loadNetworks = async () => {
                let networks = await AsyncStorage.getItem("networks") || [];
                if (networks.length !== 0) {
                    setNetworks(JSON.parse(networks));
                }
            }
            loadNetworks();
        }
    }, [segments]);


    const currentTab = () => {
        switch (selected) {
            case 0:
                return <>
                    <FlatList ListEmptyComponent={<Text className="text-text mt-6 dark:text-dark-text text-center">No favorite networks</Text>}
                        style={{marginTop: 8}} data={favoriteNetworks}
                              renderItem={(items) => <Network id={items.item.networkId} network={items.item.name} networkPicturePath={items.item.networkPicturePath} description={items.item.description} member={items.item.memberCount} isPrivate={items.item.private}/>}/>
                </>;
            case 1:
                //get friends networks
                const friendsNetworks = [];
                return <>
                    <FlatList ListEmptyComponent={() => <Text className="text-text mt-6 dark:text-dark-text text-center">No networks by friends</Text>}
                        style={{marginTop: 8}} data={friendsNetworks}
                              renderItem={(items) => <Network id={items.item.networkId} network={items.item.name} networkPicturePath={items.item.networkPicturePath} description={items.item.description} creator={items.item.creatorId} isPrivate={items.item.private}/>}/>
                </>;
            case 2:
                //get explore networks
                const exploreNetworks = [];
                return <>
                    <FlatList ListEmptyComponent={() => <Text className="text-text mt-6 dark:text-dark-text text-center">No networks to explore</Text>}
                        style={{marginTop: 8}} data={exploreNetworks}
                              renderItem={(items) => <Network id={items.item.networkId} network={items.item.name} NetworkPicturePath={items.item.networkPicturePath} description={items.item.description} member={items.item.memberCount} isPrivate={items.item.private}/>}/>
                </>;
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
                        <Text style={{color: selected !== 1 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 1 ? 22 : 24}} className=" mt-3 font-extrabold">Friends</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => setSelected(2)}>
                        <Text style={{color: selected !== 2 ? "rgba(76,76,76,0.76)" : "#000000", fontSize: selected !== 2 ? 22 : 24}} className="mt-3 font-extrabold">Explore</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {currentTab()}
        </View>
    )
}