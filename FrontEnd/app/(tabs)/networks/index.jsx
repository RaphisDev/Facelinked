import "../../../global.css"
import {FlatList, Keyboard, Platform, Text, TextInput, TouchableOpacity, View} from "react-native";
import Network from "../../../components/Entries/Network";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect, useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import ip from "../../../components/AppManager";
import {Image} from "expo-image";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";

export default function Networks() {

    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);
    const segments = useSegments();

    const stateManager = new StateManager();

    const [showInput, setShowInput] = useState(false);
    const input = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const navigation = useNavigation("/(tabs)");
    const router = useRouter();
    const token = useRef(null);

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

    useFocusEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity className="mr-4 mb-1.5" onPress={handleAddBar}><Ionicons name="search" size={25}/></TouchableOpacity>,
        });
    });

    useEffect(() => {
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
        }
        else {
            token.current = SecureStore.getItem("token");
        }
        setTimeout(() => {
            if (token.current === null) {router.replace("/")}
        })

        stateManager.setNetworkState(true);
    });

    function handleAddBar() {
        setShowInput(shown => {
            if (shown) {
                Keyboard.dismiss();
                setIsSearching(false);
            }
            else {
                setTimeout(() => {
                    input.current.focus();
                }, 100);
                setSearchResults([]);
            }
            return !shown
        });
    }

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
            <TextInput onEndEditing={(t) => {
                if (t.nativeEvent.text.trim().length === 0 && showInput) {
                    handleAddBar();
                }
            }} autoCorrect={false} ref={input} style={{display: !showInput ? "none" : "flex"}} onChangeText={(text) => {
                if (text.trim().length > 0) {
                    setIsSearching(true);
                }
                else {
                    setIsSearching(false);
                }

                if (text.length >= 2 && text.length % 2 === 0) {
                    fetch(`${ip}/networks/search?searchName=${encodeURIComponent(text)}`, {
                        method: 'GET',
                        headers: {
                            "Authorization": `Bearer ${token.current}`
                        }
                    }).then(async (res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        else {
                            return [];
                        }
                    }).then((data) => {
                        setSearchResults(data);
                    })
                }
                else if (text.length < 2) {
                    setSearchResults([]);
                }
            }} placeholder="Type in keywords" autoCapitalize="none" className="rounded-xl mt-4 p-2 w-3/4 hidden bg-primary dark:bg-dark-primary dark:text-dark-text text-text mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                if (e.nativeEvent.text.trim().length > 0 && searchResults.length > 0 && isSearching) {
                    input.current.focus();
                }
            }}/>
            <View style={{display: isSearching ? "flex" : "none"}} className="h-full w-full bg-primary dark:bg-dark-primary">
                <FlatList data={searchResults} ListEmptyComponent={() => <Text className="text-center text-xl font-semibold mt-10">No results</Text>} renderItem={(item) =>
                    <View>
                        <TouchableOpacity onPress={() => {
                            router.navigate(`/networks/${item.item.id}`);
                            input.current.clear();
                            handleAddBar();
                        }} activeOpacity={0.4} className="flex-row justify-between items-center p-3">
                            <View className="flex-row items-center">
                                <Image source={{uri: item.item.networkPicturePath}} style={{width: 42, height: 42, borderRadius: 11}}></Image>
                                <View className="flex-col ml-3">
                                    <Text className="text-text dark:text-dark-text font-bold text-lg">{item.item.name}</Text>
                                    <Text className="text-text dark:text-dark-text text-sm">{item.item.description}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View className="w-11/12 self-center">
                            <View className="border-b border-gray-700/80"></View>
                        </View>
                    </View>}/>
            </View>
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