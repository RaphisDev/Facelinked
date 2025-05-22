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
import WebSocketProvider from "../../../components/WebSocketProvider";
import NetworkMessage from "../../../components/Entries/NetworkMessage";
import * as SecureStorage from "expo-secure-store";
import {Image} from "expo-image";
import asyncStorage from "@react-native-async-storage/async-storage";
import ip from "../../../components/AppManager";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";
import {showAlert} from "../../../components/PopUpModalView";

export default function Network() {

    const {Network} = useLocalSearchParams();

    const navigator = useNavigation("../");
    const router = useRouter();
    const ws = new WebSocketProvider();
    const stateManager = new StateManager();

    const [messages, addMessage] = useState([]);
    const messageList = useRef(null);
    const input = useRef(null);
    const message = useRef("");
    const [DataCollapse, setDataCollapse] = useState(true);

    const initializedMessages = useRef(false);
    const loadingAdditionalMessages = useRef(false);

    const token = useRef("");
    const username = useRef("");

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
        })

        navigator.setOptions({
            headerLeft: () => <TouchableOpacity className="ml-2" onPress={() => {
                if (stateManager.networkOpened) {
                    router.back();
                }
                else {
                    router.replace("/networks");
                }
            }}><Ionicons
                name="arrow-back" size={24} color="black"/></TouchableOpacity>,
            headerRight: () => <TouchableOpacity className="mr-2" onPress={() => setModalVisible(true)}><Ionicons
                name="people" size={24} color="black"/></TouchableOpacity>,
        });

            const loadNetwork = async () => {
            const receivedData = await fetch(`${ip}/networks/${Network}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token.current}`,
                    "Application-Type": "application/json"
                }
            });
            if (receivedData.ok) {
                const data = await receivedData.json();
                setMember(data.members);
                currentNetwork.current = {networkId: data.id, name: data.name, description: data.description, creatorId: data.creatorId, private: data.private, memberCount: data.memberCount, networkPicturePath: data.networkPicturePath};

                navigator.setOptions({
                    headerTitle: currentNetwork.current?.name,
                });

                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
                if(loadedNetworks.some((network) =>network.networkId === Network)) {
                    setIsFavorite(true);
                    await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.map((network) => {
                        if (network.networkId === Network) {
                            return {networkId: data.id, name: data.name, description: data.description, creatorId: data.creatorId, private: data.private, members: member.current, memberCount: data.memberCount, networkPicturePath: data.networkPicturePath};
                        }
                        return network;
                    })));
                }
            }
            else {
                showAlert({
                    title: 'Not Found',
                    message: 'Network not found/You have no access',
                    buttons: [
                        {
                            text: 'OK',
                            onPress: () => {

                            }
                        },
                    ],
                });
                router.back();
            }
        }
        loadNetwork();

        const loadMessages = async () => {
            const loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || null;
            if (loadedMessages !== null) {
                addMessage(JSON.parse(loadedMessages));
                setTimeout(() => {
                    initializedMessages.current = true;
                }, 1000);
            }
        }
        loadMessages();

        const receiveNetworkMessages = async () => {
            let parsedNetworks = await asyncStorage.getItem("networks") || [];
            if (parsedNetworks.length !== 0) {
                parsedNetworks = JSON.parse(parsedNetworks);
            }

            if (!parsedNetworks.some((network) => network.networkId === Network)) {
                if (ws.stompClient.connected) {
                    ws.stompClient.subscribe(`/networks/${Network}`, async (message) => {
                        const parsedMessage = JSON.parse(message.body);
                        if (parsedMessage.senderId.memberId === username.current) {return;}
                        addMessage((prevMessages) => [...prevMessages, {sender: parsedMessage.senderId.memberId, senderProfilePicturePath: parsedMessage.senderId.memberProfilePicturePath.split(",")[0], content: parsedMessage.content, millis: parsedMessage.millis}]);
                    });

                    const receivedMessages = await fetch(`${ip}/networks/${Network}/messages`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token.current}`,
                            "Content-Type": "application/json"
                        }
                    });
                    if (receivedMessages.ok) {
                        const data = await receivedMessages.json();
                        addMessage(prevState => [...prevState, ...data.map((message) => {
                            return {senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0], sender: message.senderId.memberId, content: message.content, millis: message.millis};
                        })]);
                        setTimeout(() => {
                            initializedMessages.current = true;
                        }, 1000);
                    }
                }
            }
            else {
                if (await asyncStorage.getItem(`lastNetworkMessageId/${Network}`)) {
                    const receivedMessages = await fetch(`${ip}/networks/${Network}/afterId?id=${encodeURIComponent(await asyncStorage.getItem(`lastNetworkMessageId/${Network}`))}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token.current}`,
                            "Application-Type": "application/json"
                        }
                    });

                    if (receivedMessages.ok) {
                        const data = await receivedMessages.json();

                        addMessage(prevState => [...prevState, ...data.map((message) => {
                            return {
                                senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                sender: message.senderId.memberId,
                                content: message.content,
                                millis: message.millis,
                            };
                        })]);

                        await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, data[data.length - 1].millis.toString());

                        let messages = await asyncStorage.getItem(`networks/${Network}`) || [];
                        if (messages.length !== 0) {
                            messages = JSON.parse(messages);
                        }
                        await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...messages, ...data.map((message) => {
                            return {
                                senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                sender: message.senderId.memberId,
                                content: message.content,
                                millis: message.millis
                            };
                        })]));
                    }
                }
            }
        }
        receiveNetworkMessages();

        ws.messageReceived.addListener("networkMessageReceived", async (e) => {
            if (e.detail.networkId !== Network) {
                return;
            }

            addMessage((prevMessages) => [...prevMessages, e.detail]);
        });

        return () => {
            navigator.setOptions({
                headerLeft: () => <TouchableOpacity className="ml-2 mb-1" onPress={() => router.navigate("/networks/create")}>
                    <Ionicons name="add" size={25}/>
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
                })
            });
            let profilePicture = "";
            if (Platform.OS === "web") {
                profilePicture = localStorage.getItem("profilePicture");
            }
            else {
                profilePicture = SecureStore.getItem("profilePicture");
            }

            addMessage((prevMessages) => [...prevMessages, {sender: username.current, senderProfilePicturePath: profilePicture.split(",")[0], content: message, millis: Date.now()}]);

            if (JSON.parse(await asyncStorage.getItem("networks"))?.some((network) => network.networkId === Network)) {
                let loadedMessages = await asyncStorage.getItem(`networks/${Network}`) || [];
                if (loadedMessages.length !== 0) {
                    loadedMessages = JSON.parse(loadedMessages);
                }
                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify([...loadedMessages, {
                    sender: username.current,
                    content: message,
                    millis: Date.now()
                }]));

                let loadedNetworks = await asyncStorage.getItem("networks") || [];
                if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
                await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks.filter(network => network.networkId === Network), ...loadedNetworks.filter(network => network.networkId !== Network)]));
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    const translateY = useRef(new Animated.Value(0)).current;
    const translateY2 = useRef(new Animated.Value(230)).current;
    const translateY3 = useRef(new Animated.Value(150)).current;

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
    const [member, setMember] = useState([]);
    const currentNetwork = useRef(null);
    const [isFavorite, setIsFavorite] = useState(false);

    async function setFavorite(shouldFavorite) {
        let loadedNetworks = await asyncStorage.getItem("networks") || [];
        if (loadedNetworks.length !== 0) {loadedNetworks = JSON.parse(loadedNetworks);}
        if (!shouldFavorite) {
            await asyncStorage.setItem("networks", JSON.stringify(loadedNetworks.filter((network) => {
                return network.networkId !== Network;
            })));
            await asyncStorage.removeItem(`networks/${Network}`);
            await asyncStorage.removeItem(`lastNetworkMessageId/${Network}`);
        }
        else {
            await asyncStorage.setItem("networks", JSON.stringify([...loadedNetworks, {networkId: currentNetwork.current.networkId, name: currentNetwork.current.name, description: currentNetwork.current.description, creatorId: currentNetwork.current.creatorId, memberCount: currentNetwork.current.memberCount + 1, networkPicturePath: currentNetwork.current.networkPicturePath, private: currentNetwork.current.private, members: member}]));
            if (messages.length !== 0) {
                await asyncStorage.setItem(`networks/${Network}`, JSON.stringify(messages));
            }
            await asyncStorage.setItem(`lastNetworkMessageId/${Network}`, Date.now().toString());
        }
        await fetch(`${ip}/networks/${Network}/favorite?b=${encodeURIComponent(shouldFavorite)}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token.current}`,
            }
        });
    }
    async function removeUser(user) {
        const response = await fetch(`${ip}/networks/${Network}/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token.current}`
            },
            body: JSON.stringify(
                [{
                    memberId: user
                }]
            ),
        });
        if (response.ok) {
            setMember(member.filter((member) => member.memberId !== user));

            showAlert({
                title: 'User removed',
                message: '',
                buttons: [
                    {
                        text: 'OK',
                        onPress: () => {}
                    },
                ],
            });
        }
        else {
            showAlert({
                title: 'Failed to remove user',
                message: '',
                buttons: [
                    {
                        text: 'Cancel',
                        onPress: () => {}
                    },
                ],
            });
        }
    }

    return(
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View className="h-full">
                <FlatList onStartReachedThreshold={0.4} onStartReached={async () => {
                    if (messages.length === 20 && initializedMessages.current) {
                        const loadedNetworks = await asyncStorage.getItem("networks") || null;
                        if (loadedNetworks !== null) {
                            const parsedNetworks = JSON.parse(loadedNetworks);
                            if (!parsedNetworks.some((network) => network.networkId === Network)) {
                                if (ws.stompClient.connected) {
                                    const receivedMessages = await fetch(`${ip}/networks/${Network}/messages?additional=${encodeURIComponent(true)}`, {
                                        method: "GET",
                                        headers: {
                                            "Authorization": `Bearer ${token.current}`,
                                            "Application-Type": "application/json"
                                        }
                                    });
                                    if (receivedMessages.ok) {
                                        loadingAdditionalMessages.current = true;
                                        const data = await receivedMessages.json();
                                        addMessage([...data.map((message) => {
                                            return {
                                                senderProfilePicturePath: message.senderId.memberProfilePicturePath.split(",")[0],
                                                sender: message.senderId.memberId,
                                                content: message.content,
                                                millis: message.millis,
                                            };
                                        })]);
                                        setTimeout(() => {
                                            if (messageList.current !== null && messages.length >= 20) {
                                                messageList.current.scrollToIndex({index: 23, animated: false});
                                            }
                                        }, 100);
                                        setTimeout(() => {
                                            loadingAdditionalMessages.current = false;
                                        }, 1000);
                                    }
                                }
                            }
                        }
                    }
                }} ref={messageList} style={{marginTop: 5, marginBottom: 50}} onContentSizeChange={(size) => {
                    if(!loadingAdditionalMessages.current) {messageList.current.scrollToEnd()}
                    }} data={messages} renderItem={(item) =>
                    <NetworkMessage content={item.item.content} sender={item.item.sender} senderProfilePicturePath={item.item.senderProfilePicturePath.split(",")[0]} timestamp={new Date(item.item.millis).toLocaleString()}/>}
                          keyExtractor={(item, index) => index.toString()}>
                </FlatList>
            </View>
            <Pressable className="h-full w-full" onPress={Keyboard.dismiss}></Pressable>
            <View className="bottom-0 absolute w-full">
                <Animated.View className="bg-gray-100 dark:bg-gray-700" style={[styles.inputContainer, { transform: [{ translateY }] }]}>
                    <View className="ml-0.5 flex-row justify-around items-center">
                        <TextInput ref={input} autoCapitalize='none' onSubmitEditing={
                            (e) => {
                                sendMessage(e.nativeEvent.text);
                            }
                        } className="bg-white dark:bg-gray-700 w-11/12 dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg dark:border-black/30 border-4 font-medium h-10 p-0.5 pl-2.5" placeholder="Type a message" onChangeText={(text) => message.current = text}></TextInput>
                        <TouchableOpacity className="ml-2.5" activeOpacity={0.7} onPress={() => sendMessage(message.current)}>
                            <Ionicons name={"send"} size={24}></Ionicons>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
            <Modal animationType="slide" presentationStyle="formSheet" visible={isModalVisible} onRequestClose={() => setModalVisible(false)}>
                <View className="h-full w-full dark:bg-dark-primary">
                    {Platform.OS === "web" && <TouchableOpacity className="p-4 bg-gray-700 rounded-xl self-end mr-4 mt-4" onPress={() => setModalVisible(false)}><Ionicons size={23} color="white" name="close"/></TouchableOpacity>}
                    {currentNetwork.current?.creatorId === username.current &&
                        <TouchableOpacity activeOpacity={0.6} onPress={() => {
                            setModalVisible(false);
                            showAlert({
                                title: 'Update Network',
                                message: 'Enter a new name for the network\nLeave empty for no change',
                                hasInput: true,
                                inputConfig: {
                                    placeholder: 'New network name',
                                    defaultValue: currentNetwork.current.name
                                },
                                buttons: [
                                {
                                        text: 'Cancel',
                                        onPress: () => {}
                                    },
                                    {
                                        text: 'Update',
                                        onPress: (text) => {
                                        if (text.trim().length === 0) {
                                            text = currentNetwork.current.name;
                                        } else if (text.length <= 3) {
                                            setTimeout(() => {
                                                showAlert({
                                                    title: 'Error',
                                                    message: 'Name too short',
                                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                                });
                                            }, 300)
                                            return;
                                        }

                                            // Use setTimeout to ensure the next alert shows properly
                                            setTimeout(() => {
                                            showAlert({
                                                title: 'Update Network',
                                                message: 'Enter a new description\nLeave empty for no change',
                                                hasInput: true,
                                                inputConfig: {
                                                    placeholder: 'New description',
                                                    defaultValue: currentNetwork.current.description
                                                },
                                                buttons: [
                                            {
                                                        text: 'Cancel',
                                                        onPress: () => {}
                                                    },
                                                    {
                                                        text: 'Update',
                                                        onPress: async (description) => {
                                                    if (description.trim().length === 0) {
                                                        if (text === currentNetwork.current.name) {
                                                            setTimeout(() => {
                                                                showAlert({
                                                                    title: 'No Change',
                                                                    message: 'No change applied',
                                                                    buttons: [{
                                                                        text: 'OK', onPress: () => {
                                                                        }
                                                                    }]
                                                                });
                                                            }, 300);
                                                            return;
                                                        }
                                                        description = currentNetwork.current.description;
                                                    } else if (description.length <= 3) {
                                                        setTimeout(() => {
                                                            showAlert({
                                                                title: 'Error',
                                                                message: 'Description too short',
                                                                buttons: [{
                                                                    text: 'OK', onPress: () => {
                                                                    }
                                                                }]
                                                            });
                                                        }, 300);
                                                        return;
                                                    }

                                                    const response = await fetch(`${ip}/networks/${Network}/update`, {
                                                        method: "POST",
                                                        headers: {
                                                            "Content-Type": "application/json",
                                                            "Authorization": `Bearer ${token.current}`
                                                        },
                                                        body: JSON.stringify({name: text, description: description})
                                                    });

                                                    if (response.ok) {
                                                        navigator.setOptions({
                                                            headerTitle: text
                                                        });
                                                        currentNetwork.current = {
                                                            networkId: currentNetwork.current.networkId,
                                                            name: text,
                                                            description: description,
                                                            creatorId: currentNetwork.current.creatorId,
                                                            private: currentNetwork.current.private,
                                                            memberCount: currentNetwork.current.memberCount,
                                                            networkPicturePath: currentNetwork.current.networkPicturePath
                                                        };

                                                        await asyncStorage.setItem("networks", JSON.stringify(JSON.parse(await asyncStorage.getItem("networks")).map((network) => {
                                                            if (network.networkId === Network) {
                                                                return {
                                                                    networkId: currentNetwork.current.networkId,
                                                                    name: text,
                                                                    description: description,
                                                                    creatorId: currentNetwork.current.creatorId,
                                                                    private: currentNetwork.current.private,
                                                                    members: member,
                                                                    memberCount: currentNetwork.current.memberCount,
                                                                    networkPicturePath: currentNetwork.current.networkPicturePath
                                                                };
                                                            }
                                                            return network;
                                                        })));
                                                        setTimeout(() => {
                                                                showAlert({
                                                                    title: 'Success',
                                                                    message: 'Change approved!',
                                                                    buttons: [{ text: 'OK', onPress: () => {} }]
                                                                });
                                                        }, 300);
                                                    }
                                                }
                                                    }
                                                ]
                                            });
                                            }, 300); // Small delay to ensure previous alert is properly dismissed
                                    }
                                    }
                                ]
                            })
                        }

                        } className="self-center mt-5">
                            <View className="flex-row items-center">
                                <Text className="text-center text-text dark:text-dark-text font-bold text-2xl mr-1">{currentNetwork.current?.name}</Text>
                                <Ionicons name={"create-outline"} size={22} color={"#285FF5"}></Ionicons>
                            </View>
                        </TouchableOpacity>}
                    {currentNetwork.current?.creatorId !== username.current &&
                        <Text className="text-center text-text dark:text-dark-text font-bold text-2xl mt-5">{currentNetwork.current?.name}</Text>
                    }
                    <View className="flex-row justify-center items-center mt-7 mb-6">
                        <TouchableOpacity onPress={() => {
                            setIsFavorite(prevState => {setFavorite(!prevState); return !prevState;});
                        }} activeOpacity={0.65} className="rounded-full bg-accent p-5">
                            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.65} onPress={() => {
                            Share.share({
                                message: "Check out this network!",
                                title: "Check out this network!",
                                text: "Check out this network!",
                                url: `https://facelinked.com/networks/${Network}`,
                                dialogTitle: "Check out this network!"
                            });
                        }} className="rounded-full ml-11 mr-11 bg-accent p-5">
                            <Ionicons name={"share-outline"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.65} className="p-5 bg-accent rounded-full">
                            <Ionicons name={"search"} size={24} color={"#FFFFFF"}></Ionicons>
                        </TouchableOpacity>
                    </View>
                    {(currentNetwork.current?.private && currentNetwork.current.creatorId === username.current) &&
                        <View className="flex-row justify-between">
                            <Text className="text-center text-text dark:text-dark-text self-start font-bold text-xl ml-2 mt-3">Member</Text>
                            <View className="self-end flex-row">
                                <TouchableOpacity onPress={() => {
                                    setModalVisible(false);
                                    showAlert({
                                        title: 'Add User',
                                        message: 'Enter the username of the user you want to add to the network',
                                        hasInput: true,
                                        inputConfig: {
                                            placeholder: 'Username'
                                        },
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                onPress: () => {}
                                            },
                                            {
                                                text: 'Add',
                                                onPress: async (text) => {
                                                if (text.length <= 3) {
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Error',
                                                            message: 'User not found',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300)
                                                    return;
                                                }
                                                const response = await fetch(`${ip}/networks/${Network}/add`, {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                        "Authorization": `Bearer ${token.current}`
                                                    },
                                                    body: JSON.stringify([{memberId: text}])
                                                });

                                                if (response.ok) {
                                                    const receivedData = await fetch(`${ip}/networks/${Network}`, {
                                                        method: "GET",
                                                        headers: {
                                                            "Authorization": `Bearer ${token.current}`,
                                                            "Application-Type": "application/json"
                                                        }
                                                    });
                                                    const data = await receivedData.json();
                                                    setMember(data.members);
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Success',
                                                            message: 'User added',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300);
                                                }
                                                else {
                                                    setTimeout(() => {
                                                        showAlert({
                                                            title: 'Error',
                                                            message: 'User not found',
                                                            buttons: [
                                                                {
                                                                    text: 'OK',
                                                                    onPress: () => {
                                                                    }
                                                                },
                                                            ],
                                                        });
                                                    }, 300)
                                                }
                                                }
                                            },
                                        ],
                                    });
                                }} activeOpacity={0.65} className="rounded-full bg-accent p-2 mr-2 w-20">
                                    <Ionicons name={"add"} size={24} className="text-center" color={"#FFFFFF"}></Ionicons>
                                </TouchableOpacity>
                            </View>
                        </View>}
                    <FlatList data={member} renderItem={(item) =>
                        <View>
                            <TouchableOpacity onPress={() => {
                                setModalVisible(false);
                                router.navigate(`/${item.item.memberId}`);
                            }} activeOpacity={0.4} className="flex-row justify-between items-center p-3">
                                <View className="flex-row items-center">
                                    <Image source={{uri: item.item.memberProfilePicturePath.split(",")[0]}} style={{width: 42, height: 42, borderRadius: 21}}></Image>
                                    <View className="flex-col ml-3">
                                        <Text className="text-text dark:text-dark-text font-bold text-lg">{item.item.memberName}</Text>
                                        <Text className="text-text dark:text-dark-text text-sm">@{item.item.memberId}</Text>
                                    </View>
                                </View>
                                {(currentNetwork.current.private && currentNetwork.current.creatorId === username.current && item.item.memberId !== username.current) && <TouchableOpacity onPress={async() => {
                                    setModalVisible(false);
                                    showAlert({
                                        title: `Remove User`,
                                        message: `Are you sure you want to remove ${item.item.memberId}? This action cannot be undone.`,
                                        buttons: [
                                            {
                                                text: 'Cancel',
                                                onPress: () => {}
                                            },
                                            {
                                                text: 'Remove',
                                                onPress: async () => {
                                                await removeUser(item.item.memberId);
                                                }
                                            }
                                        ],
                                    });
                                }} activeOpacity={0.65} className="rounded-full bg-accent p-2">
                                    <Ionicons name={"trash"} size={16} color={"#FFFFFF"}></Ionicons>
                                </TouchableOpacity>}
                            </TouchableOpacity>
                            <View className="w-11/12 self-center">
                                <View className="border-b border-gray-700/80"></View>
                            </View>
                        </View>
                    }/>
                    <View className="w-[95%] self-center mb-24">
                        <Animated.View style={{ transform: [{translateY: translateY3 }]}}>
                            <TouchableOpacity onPress={() => {
                                setDataCollapse(prevState => {
                                    Animated.timing(translateY2, {
                                        toValue: prevState ? 0 : 230,
                                        duration: 800,
                                        useNativeDriver: true,
                                        easing: Easing.out(Easing.poly(4)),
                                    }).start();
                                    Animated.timing(translateY3, {
                                        toValue: prevState ? 0 : 150,
                                        duration: 800,
                                        useNativeDriver: true,
                                        easing: Easing.out(Easing.poly(4)),
                                    }).start();
                                    return !prevState;
                                })
                            }} activeOpacity={0.65} className="rounded-full bg-accent p-1.5 self-center">
                                <Ionicons name={DataCollapse ? "chevron-down" : "chevron-up"} size={23} color={"#FFFFFF"}></Ionicons>
                            </TouchableOpacity>
                        </Animated.View>
                        <Animated.View style={{ transform: [{translateY: translateY2 }]}}>
                            <View className="mt-4">
                                <Text className="text-center text-text dark:text-dark-text font-semibold text-lg mt-3">Description</Text>
                                <Text className="text-center text-text dark:text-dark-text mt-0.5">{currentNetwork.current?.description}</Text>
                                <View className="flex-row justify-center items-center mt-3.5">
                                    <Ionicons name={"heart"} size={20} color={"black"}/>
                                    <Text className="text-text dark:text-dark-text ml-0.5 font-bold">{currentNetwork.current?.memberCount}</Text>
                                </View>
                                <Text className="text-center text-text dark:text-dark-text font-bold text-lg mt-6">created by {currentNetwork.current?.creatorId}</Text>
                            </View>
                        </Animated.View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}