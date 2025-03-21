import {Stack, Tabs, useGlobalSearchParams, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../components/StateManager";
import CustomTabBar from "../../components/CustomTabBar";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {useEffect, useState} from "react";
import WebSidebarStyles from "../../components/WebSidebarStyles";

const MOBILE_WIDTH_THRESHOLD = 768;
const SIDEBAR_WIDTH = 220;

// A wrapper component that handles the layout for desktop/mobile
function LayoutWrapper({ children }) {
    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
    const isDesktop = dimensions.width > MOBILE_WIDTH_THRESHOLD;

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });
        return () => subscription.remove();
    }, []);

    return (
        <View style={styles.rootContainer}>
            {children}
            {isDesktop && <View style={{ width: SIDEBAR_WIDTH }} />}
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        flexDirection: 'row',
    },
});

export default function TabsLayout() {
    const router = useRouter();
    const route = useGlobalSearchParams();

    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
    const isDesktop = dimensions.width > MOBILE_WIDTH_THRESHOLD;
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });
        return () => subscription.remove();
    }, []);

    return (
        <>
            <SafeAreaProvider>
                <LayoutWrapper>
            <Tabs screenOptions={{tabBarShowLabel: false, tabBarStyle: {display: "none"}, headerStyle: isDesktop ? {
                    marginLeft: SIDEBAR_WIDTH,
                } : {},
                contentStyle: isDesktop ? {
                    marginLeft: SIDEBAR_WIDTH,
                } : {},}} screenListeners={{tabPress:
                (e) => {
                    if (Platform.OS !== "web") {
                        if (e.target === undefined) {
                            router.navigate(`/${SecureStore.getItem("username")}`)
                        }
                        else if (e.target?.split("-")[0] === "(profiles)" && route?.profile !== SecureStore.getItem("username") && route?.profile !== undefined) {
                            router.navigate(`/${SecureStore.getItem("username")}`);
                        }
                        else if (e.target?.split("-")[0] === "chat") {
                            const stateManager = new StateManager();
                            if (!stateManager.chatOpened) {
                                router.replace("/chat");
                            }
                        }
                        else if (e.target?.split("-")[0] === "networks") {
                            const stateManager = new StateManager();
                            if (!stateManager.networkOpened) {
                                router.replace("/networks");
                            }
                        }
                    }
                    else {
                        if (e.target === undefined) {
                            router.navigate(`/${localStorage.getItem("username")}`)
                        }
                        else if (e.target?.split("-")[0] === "(profiles)" && route?.profile !== localStorage.getItem("username") && route?.profile !== undefined) {
                            router.navigate(`/${localStorage.getItem("username")}`);
                        }
                        else if (e.target?.split("-")[0] === "chat") {
                            const stateManager = new StateManager();
                            if (!stateManager.chatOpened) {
                                router.replace("/chat");
                            }
                        }
                        else if (e.target?.split("-")[0] === "networks") {
                            const stateManager = new StateManager();
                            if (!stateManager.networkOpened) {
                                router.replace("/networks");
                            }
                        }
                    }
                }
            }} tabBar={(props) => <CustomTabBar {...props}/>}>
                <Tabs.Screen name="home/index" options={{headerTitle: () => <Pressable onPress={() => router.replace("/home", {animationEnabled: false})}>
                        <Text className="font-courier text-xl">Facelinked</Text>
                </Pressable>,
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
                }}/>
                <Tabs.Screen name="networks" options={{headerTitle: "Networks",
                    headerTitleAlign: "center",
                    headerLeft: () => <TouchableOpacity onPress={() => router.navigate("/networks/create")}>
                        <Ionicons className="ml-2 mb-1" name="add" size={25}/>
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
                </LayoutWrapper>
            </SafeAreaProvider>
        </>
    );
}