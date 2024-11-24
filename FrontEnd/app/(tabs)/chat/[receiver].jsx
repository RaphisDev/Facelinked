import "../../../global.css"
import {
    Animated, Easing,
    FlatList, Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable, StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import {useLocalSearchParams} from "expo-router";
import Message from "../../../components/Entries/Message";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as StompJs from "@stomp/stompjs";
import * as SecureStorage from "expo-secure-store";
import {useEffect, useRef, useState} from "react";

export default function ChatRoom(props) {

    const {username} = useLocalSearchParams();
    const ip = Platform.OS === "android" ? "10.0.2.2" : "192.168.0.178";
    const message = useRef("");
    const input = useRef(null);
    const [messages, addMessage] = useState([]);
    const connected = useRef(false);

    const stompClient = useRef(null);

    if (!connected.current) {
        stompClient.current = new StompJs.Client({
            brokerURL: `wss://${ip}:8080/ws`,
            webSocketFactory: () => {
                return new WebSocket(`wss://${ip}:8080/ws`, [], {
                    headers: {
                        "Authorization": `Bearer ${SecureStorage.getItem("token")}`
                    }
                });
            },
            forceBinaryWSFrames: true,
            appendMissingNULLonIncoming: true,
            onConnect: () => {
                stompClient.current.subscribe('/topic/messages', (message) => {
                    const parsedMessage = JSON.parse(message.body);
                    addMessage((prevMessages) => [...prevMessages, {content: parsedMessage.content, timestamp: parsedMessage.timestamp}]);
                });
            }
        });
    }

    useEffect(() => {
        if (connected.current) {
            return;
        }
        stompClient.current.activate();
        connected.current = true;

        return () => {
            handleDisconnect();
        }
    }, []);

    const translateY = useRef(new Animated.Value(0)).current;

    //Why need 83 offset? -> fix
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (event) => {
                const offset = event.endCoordinates.height - 83;
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

    function handleDisconnect() {
        stompClient.current.deactivate();
    }

    //bug where messages are not sent sometimes -> fix
    function sendMessage(message) {

        input.current.clear();
        input.current.blur();

        if (message === "") {return;}

        try {
            /*if(!stompClient.current.connected) {
                stompClient.current.activate();
            }*/
            stompClient.current.publish({
                destination: '/app/chat',
                body: JSON.stringify({
                    content: message,
                    timestamp: new Date().toString()
                })
            })
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

    //Save messages only in localStorage???
    //Change header to show name instead of Chats and change when navigating to different chat or back to all chats
    return(
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View>
                <FlatList data={messages} renderItem={(item) =>
                    <Message content={item.item.content} timestamp={item.item.timestamp}/>}
                          keyExtractor={(item, index) => index.toString()}></FlatList>
            </View>
            <Pressable className="h-full w-full" onPress={Keyboard.dismiss}></Pressable>
            <View className="bottom-0 absolute w-full">
                <Animated.View className="bg-gray-100 dark:bg-gray-700" style={[styles.inputContainer, { transform: [{ translateY }] }]}>
                    <View className="ml-0.5">
                        <TextInput ref={input} onSubmitEditing={
                            (e) => {
                                sendMessage(e.nativeEvent.text);
                            }
                        } className="bg-white dark:bg-dark-primary/50 w-fit mr-16 dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg border-4 font-medium text-lg p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                        <TouchableOpacity className="absolute right-0 bottom-0 m-1.5 mr-5" activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                            <Ionicons name={"send"} size={24} ></Ionicons>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </View>
    )
}