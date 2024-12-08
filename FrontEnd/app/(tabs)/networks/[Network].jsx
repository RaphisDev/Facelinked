import "../../../global.css"
import {useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import {useEffect, useRef, useState} from "react";
import {
    Animated,
    Easing,
    FlatList,
    Keyboard,
    Platform,
    Pressable, StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";
import WebSocketProvider from "../../../components/WebSocketProvider";
import NetworkMessage from "../../../components/Entries/NetworkMessage";

export default function Network() {

    const {Network, name} = useLocalSearchParams();

    const navigator = useNavigation("../../");
    const router = useRouter();
    const ws = new WebSocketProvider();

    const [messages, addMessage] = useState([]);
    const messageList = useRef(null);
    const input = useRef(null);
    const message = useRef("");

    //seperate Messages from Chat.jsx and Network.jsx
    //only save messages from favorite networks
    //check if network is private and you have access to it

    useEffect(() => {

        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => router.back()}><Ionicons name="arrow-back" size={24} color="black"/></TouchableOpacity>,
            headerRight: () => <TouchableOpacity className="mr-2" onPress={() => alert("open Modal and add 3 full rounded buttons in a row with icons. Below list all user")}><Ionicons name="people" size={24} color="black"/></TouchableOpacity>,
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

            /*
            let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
            if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
            await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...loadedMessages, {
                isSender: true,
                content: message,
                timestamp: new Date().toString()
            }]));*/
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
                        } className="bg-white dark:bg-dark-primary/50 w-fit mr-16 dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg border-4 font-medium h-10 p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                        <TouchableOpacity className="absolute right-0 bottom-0 m-1.5 mr-5" activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                            <Ionicons name={"send"} size={24}></Ionicons>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}