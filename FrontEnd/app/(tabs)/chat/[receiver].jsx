import "../../../global.css"
import {
    Animated, Easing,
    FlatList, Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable, StyleSheet, Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {router, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Message from "../../../components/Entries/Message";
import Ionicons from "@expo/vector-icons/Ionicons";
import StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect, useRef, useState} from "react";
import WebSocketProvider from "../../../components/WebSocketProvider";
import asyncStorage from "@react-native-async-storage/async-storage";
import StateManager from "../../../components/StateManager";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";

export default function ChatRoom() {

    //Todo: encrypt localStorage with key thats stored in secure storage
    //Flatlist view not adapted view when keyboard is active

    const {receiver} = useLocalSearchParams();
    const message = useRef("");
    const input = useRef(null);
    const [messages, addMessage] = useState([]);
    const messageList = useRef(null);

    const navigation = useNavigation("../");
    const router = useRouter();
    const stateManager = new StateManager();

    const ws = new WebSocketProvider();

    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <Pressable onPress={() => {
                    router.navigate(`/${receiver}`);
                }}><Text className="font-medium text-xl">{receiver}</Text></Pressable>
            ),
            headerLeft: () => (
                <TouchableOpacity className="ml-2.5" onPress={() => {
                    if (stateManager.chatOpened) {
                        router.back();
                    }
                    else {
                        router.replace("/chat");
                    }
                    navigation.setOptions({
                        headerTitle: "Chats",
                        headerLeft: () => (
                            <></>),
                    });
                    ws.messageReceived.removeAllListeners("messageReceived");
                }}>
                    <Ionicons name={"arrow-back"} size={24}></Ionicons>
                </TouchableOpacity>
            )
        }, []);

        setTimeout(() => {
            navigation.setOptions({
                headerRight: () => (
                    <></>)
            });
        });

        const loadMessages = async () => {
            const loadedMessages = await asyncStorage.getItem(`messages/${receiver}`);
            if (loadedMessages !== null) {
                addMessage(JSON.parse(loadedMessages));
            }
        }
        loadMessages();

        ws.messageReceived.addListener("messageReceived", async (e) => {
            let username;
            if (Platform.OS === "web") {
                username = localStorage.getItem("token");
            }
            else {
                username = SecureStore.getItem("token");
            }
            if (e.detail.sender !== receiver && e.detail.sender !== username) {
                return;
            }

            addMessage((prevMessages) => [...prevMessages, e.detail]);

            setTimeout(async () => {
                let loadedChats = await asyncStorage.getItem("chats") || [];
                if (loadedChats.length !== 0) {
                    loadedChats = JSON.parse(loadedChats);
                }
                await asyncStorage.setItem("chats", JSON.stringify(loadedChats.map((chat) => {
                    if (chat.username === receiver) {
                        return {...chat, unread: false};
                    }
                    return chat;
                })));
            }, 1000);
        });

        return () => {
            ws.messageReceived.removeAllListeners("messageReceived");
            navigation.setOptions({
                headerTitle: "Chats",
                headerLeft: () => (
                    <></>)
            });
        }
    }, []);

    const translateY = useRef(new Animated.Value(0)).current;

    //offset bug?
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

    async function sendMessage(message) {

        input.current.clear();
        input.current.blur();

        if (message === "") {return;}

        try {
            ws.stompClient.publish({
                destination: `/app/chat`,
                body: JSON.stringify({
                    receiver: receiver,
                    content: message,
                    timestamp: new Date().toString()
                })
            });

            addMessage((prevMessages) => [...prevMessages, {isSender: true, content: message, timestamp: new Date().toString()}]);

            let loadedChats = await asyncStorage.getItem("chats") || [];
            if (loadedChats.length !== 0) {loadedChats = JSON.parse(loadedChats);}
            if(!loadedChats.find((chat) => chat.username === receiver) || loadedChats.length === 0) {
                let token;
                if (Platform.OS === "web") {
                    token = localStorage.getItem("token");
                }
                else {
                    token = SecureStore.getItem("token");
                }
                const profile = await fetch(`${ip}/profile/${receiver}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (profile.ok) {
                    const profileJson = await profile.json();
                    await asyncStorage.setItem("chats", JSON.stringify([...loadedChats, { name: profileJson.name, username: profileJson.username, image: profileJson.profilePicturePath }]));
                }
            }

            let loadedMessages = await asyncStorage.getItem(`messages/${receiver}`) || [];
            if (loadedMessages.length !== 0) {loadedMessages = JSON.parse(loadedMessages);}
            await asyncStorage.setItem(`messages/${receiver}`, JSON.stringify([...loadedMessages, {
                isSender: true,
                content: message,
                timestamp: new Date().toString()
            }]));
        }
        catch (e) {
            console.error(e);
        }
    }

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
                <FlatList ref={messageList} ListEmptyComponent={<Text className="text-text dark:text-dark-text text-center mt-5">Start a conversation with {receiver}</Text>} onContentSizeChange={() => messageList.current.scrollToEnd()} data={messages} renderItem={(item) =>
                    <Message content={item.item.content} isSender={item.item.isSender} timestamp={item.item.timestamp}/>}
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
                        } className="bg-white dark:bg-gray-700 w-fit mr-16 h-10 dark:text-dark-text text-text border-gray-700/80 dark:border-black/30 dark:active:bg-primary/5 active:bg-gray-600/10 rounded-lg border-4 font-medium p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                        <TouchableOpacity className="absolute right-0 bottom-0 m-1.5 mr-5" activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                            <Ionicons name={"send"} size={24}></Ionicons>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}