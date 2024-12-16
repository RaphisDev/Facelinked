import {Stack, Tabs, useGlobalSearchParams, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Pressable, Text, TouchableOpacity} from "react-native";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../components/StateManager";


export default function TabsLayout() {
    const router = useRouter();
    const route = useGlobalSearchParams();

    return (
        <>
            <Tabs screenOptions={{tabBarShowLabel: false}} screenListeners={{tabPress:
                (e) => {
                    if (e.target?.split("-")[0] === "(profiles)" && route?.profile !== SecureStore.getItem("username") && route?.profile !== undefined) {
                        router.navigate(`/${SecureStore.getItem("username")}`);
                    }
                    if (e.target?.split("-")[0] === "chat") {
                        const stateManager = new StateManager();
                        if (!stateManager.chatOpened) {
                            router.replace("/chat");
                        }
                    }
                }
            }}>
                <Tabs.Screen name="home/index" options={{headerTitle: () => <Pressable onPress={() => router.replace("/home", {animationEnabled: false})}><Text className="font-courier text-xl">FaceLinked</Text></Pressable>,
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
                }}/>
                <Tabs.Screen name="networks" options={{headerTitle: "Networks",
                    headerTitleAlign: "center",
                    headerLeft: () => <TouchableOpacity onPress={() => router.navigate("/networks/create")}>
                        <Ionicons className="ml-2 mb-1" name="add" size={25}/>
                    </TouchableOpacity>,
                    headerRight: () => <TouchableOpacity>
                        <Ionicons className="mr-4 mb-1" name="search" size={25}/>
                    </TouchableOpacity>,
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "git-merge-sharp" : "git-merge-outline"} size={30}/>
                }}/>
                <Tabs.Screen name="chat" options={{headerTitle: "Chats",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "chatbubbles-sharp" : "chatbubble-outline"} size={30}/>,
                }}/>

                <Tabs.Screen name="(profiles)" options={{headerShown: false,
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "person-sharp" : "person-outline"} size={30}/>,
                }}/>
            </Tabs>
        </>
    );
}