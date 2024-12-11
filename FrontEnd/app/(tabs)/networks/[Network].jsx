import "../../../global.css"
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {
    Animated,
    Easing,
    FlatList,
    Keyboard, Modal,
    Platform,
    Pressable, StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    Text, Share, Alert
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import WebSocketProvider from "../../../components/WebSocketProvider";
import NetworkMessage from "../../../components/Entries/NetworkMessage";
import * as SecureStorage from "expo-secure-store";
import {Image} from "expo-image";

export default function Network() {

    const {Network, name} = useLocalSearchParams();

    const navigator = useNavigation("../../");
    const router = useRouter();
    const ws = new WebSocketProvider();

    const [messages, addMessage] = useState([]);
    const messageList = useRef(null);
    const input = useRef(null);
    const message = useRef("");

    const ip = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.178';

    //seperate Messages from Chat.jsx and Network.jsx
    //only save messages from favorite networks
    //check if network is private and you have access to it

    useEffect(() => {

        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black"/></TouchableOpacity>,
            headerRight: () => <TouchableOpacity className="mr-2" onPress={() => setModalVisible(true)}><Ionicons name="people" size={24} color="black"/></TouchableOpacity>,
            headerTitle: name,
        });

        const loadMessages = async () => {
            const loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || null;
            if (loadedMessages !== null) {
                addMessage(JSON.parse(loadedMessages));

                if (messageList.current !== null) {
                    messageList.current.scrollToEnd();
                }
            }
        }
        loadMessages();

        const loadNetworks = async () => {
            const loadedNetworks = await asyncStorage.getItem("networks") || null;
            if (loadedNetworks !== null) {
                const parsedNetworks = JSON.parse(loadedNetworks);
                //favorite networks should be subscribed in the background
                if (!parsedNetworks.find((network) => Number.parseInt(network.networkId) === Number.parseInt(Network))) {
                    if (ws.stompClient.connected) {
                        ws.stompClient.subscribe(`/networks/${Network}`, async (message) => {
                            const parsedMessage = JSON.parse(message.body);
                            alert(parsedMessage.content);
                        });
                    }
                }
            }
        }
        loadNetworks();

        const loadMember = async () => {
            const receivedData = await fetch(`http://${ip}:8080/networks/${Network}/member`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${SecureStorage.getItem("token")}`,
                    "Application-Type": "application/json"
                }
            });
            if (receivedData.ok) {
                member.current = await receivedData.json();
            }
        }
        loadMember();

        ws.messageReceived.addListener("networkMessageReceived", async (e) => {
            if (e.detail.networkId !== Network) {
                return;
            }

            addMessage((prevMessages) => [...prevMessages, e.detail]);

            let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
            if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
            await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...loadedMessages, e.detail]));
        });

        return () => {
            navigator.setOptions({
                headerLeft: () => <TouchableOpacity className="ml-2 mb-1" onPress={() => router.navigate("/networks/create")}>
                    <Ionicons name="add" size={25}/>
                </TouchableOpacity>,
                headerRight: () => <TouchableOpacity>
                    <Ionicons className="mr-4 mb-1" name="search" size={25}/>
                </TouchableOpacity>,
                headerTitle: "Networks",
            });
            ws.messageReceived.removeAllListeners("messageReceived");
        }
    }, []);

    async function sendMessage(message) {

        input.current.clear();
        input.current.blur();

        if (message === "") {return;}

        try {
            ws.stompClient.publish({
                destination: `/app/networks/send`,
                body: JSON.stringify({
                    receiver: Network,
                    content: message,
                    timestamp: new Date().toString()
                })
            });

            addMessage((prevMessages) => [...prevMessages, {isSender: true, content: message, timestamp: new Date().toString()}]);

            if (JSON.parse(await asyncStorage.getItem("networks")).find((network) => Number.parseInt(network.networkId) === Number.parseInt(Network))) {
                let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
                if (loadedMessages.length !== 0) {
                    loadedMessages = JSON.parse(loadedMessages);
                }
                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...loadedMessages, {
                    isSender: true,
                    content: message,
                    timestamp: new Date().toString()
                }]));
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    const translateY = useRef(new Animated.Value(0)).current;
    useEffect(() => {

        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const offset = Platform.OS === "ios" ? event.endCoordinates.height - 83 : 10;
                Animated.timing(translateY, {
                    toValue: -offset,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.poly(1.5)),
                }).start();
            }
        );

        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.poly(4)),
                }).start();
            }
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    const styles = StyleSheet.create({
        inputContainer: {
            padding: 8,
            borderTopWidth: 0.2,
            borderTopColor: '#000',
        }
    });

    const [isModalVisible, setModalVisible] = useState(false);
    const member = useRef([]);

    return(
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View className="mb-14 h-fit">
                <FlatList ref={messageList} onContentSizeChange={() => messageList.current.scrollToEnd()} data={messages} renderItem={(item) =>
                    <NetworkMessage content={item.item.content} isSender={item.item.isSender} timestamp={item.item.timestamp}/>}
                          keyExtractor={(item, index) => index.toString()}>
                </FlatList>
            </View>
            <Pressable className="h-full w-full" onPress={Keyboard.dismiss}></Pressable>
            <View className="bottom-0 absolute w-full">
                <Animated.View className="bg-gray-100 dark:bg-gray-700" style={[styles.inputContainer, { transform: [{ translateY }] }]}>
                    <View className="ml-0.5">
                        <TextInput ref={input} autoCapitalize='none' onSubmitEditing={
                            (e) => {
                                sendMessage(e.nativeEvent.text);
                            }
                        } className="bg-white dark:bg-dark-primary/50 w-fit mr-16 dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg dark:border-black border-4 font-medium h-10 p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                        <TouchableOpacity className="absolute right-0 bottom-0 m-1.5 mr-5" activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                            <Ionicons name={"send"} size={24}></Ionicons>
                        </TouchableOpacity>
                        <Modal animationType="slide" presentationStyle="formSheet" visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
                            <View className="h-full w-full dark:bg-dark-primary">
                                <Text className="text-center text-text dark:text-dark-text font-bold text-2xl mt-3">Member</Text>
                                <View className="flex-row justify-center items-center mt-7 mb-6">
                                    <TouchableOpacity onPress={() => {
                                        Alert.prompt("Add User", "Enter the username of the user you want to add to the network", [
                                            {text: "Cancel"},
                                            {text: "Add", onPress: async (text) => {
                                                const response = await fetch(`http://${ip}:8080/networks/${Network}/add`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Application-Type": "application/json",
                                                        "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                                                    },
                                                    body: JSON.stringify({memberId: text})
                                                });

                                                if (response.ok) {
                                                    const parsedResponse = await response.json();
                                                    if (!parsedResponse.ok) {
                                                        Alert.alert("Error adding user");
                                                    }
                                                    else {
                                                        Alert.alert("User added");
                                                    }
                                                }
                                                Alert.alert("User added");
                                                }},
                                        ]);
                                    }} activeOpacity={0.65} className="rounded-full bg-accent p-5">
                                        <Ionicons name={"add"} size={24} color={"#FFFFFF"}></Ionicons>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.65} onPress={() => {
                                        Share.share({
                                            message: "Check out this network!",
                                            title: "Check out this network!",
                                            text: "Check out this network!",
                                            url: `https://facelinked.net/networks/${Network}`,
                                            dialogTitle: "Check out this network!"
                                        });
                                    }} className="rounded-full ml-11 mr-11 bg-accent p-5">
                                        <Ionicons name={"share-outline"} size={24} color={"#FFFFFF"}></Ionicons>
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.65} className="rounded-full bg-accent p-5">
                                        <Ionicons name={"search"} size={24} color={"#FFFFFF"}></Ionicons>
                                    </TouchableOpacity>
                                </View>
                                <FlatList data={member.current} renderItem={(item) =>
                                    <View>
                                        <TouchableOpacity onPress={() => {
                                            setModalVisible(false);
                                            router.navigate(`/${item.item.memberId}`);
                                        }} activeOpacity={0.4} className="flex-row justify-between items-center p-3">
                                            <Image source={{uri: item.item.memberProfilePicturePath}} style={{width: 45, height: 45, borderRadius: 45}}></Image>
                                            <Text className="text-text mr-14 dark:text-dark-text font-bold text-lg">{item.item.memberName} ({item.item.memberId})</Text>
                                            <TouchableOpacity onPress={() => {
                                                Alert.alert("User removed");
                                            }} activeOpacity={0.65} className="rounded-full bg-accent p-2">
                                                <Ionicons name={"trash"} size={16} color={"#FFFFFF"}></Ionicons>
                                            </TouchableOpacity>
                                        </TouchableOpacity>
                                        <View className="border-b border-gray-700/80"></View>
                                    </View>
                                }></FlatList>
                            </View>
                        </Modal>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}