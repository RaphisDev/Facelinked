import {Stack, Tabs, useGlobalSearchParams, useLocalSearchParams, useNavigation, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {Dimensions, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../components/StateManager";
import CustomTabBar from "../../components/CustomTabBar";
import {SafeAreaProvider, useSafeAreaInsets} from "react-native-safe-area-context";
import {useEffect, useRef, useState} from "react";
import WebSocketProvider from "../../components/WebSocketProvider";
import { useEmbeddedState } from "../../components/EmbeddedStateManager";
import {MotiView} from "moti";

const MOBILE_WIDTH_THRESHOLD = 768;
const SIDEBAR_WIDTH = 220;

function LayoutWrapper({ children }) {
    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
    const isDesktop = dimensions.width > MOBILE_WIDTH_THRESHOLD;
    const embedded = useEmbeddedState();

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });
        return () => subscription.remove();
    }, []);

    return (
        <View style={styles.rootContainer}>
            {(isDesktop && !embedded) && <View style={{ width: SIDEBAR_WIDTH - 3 }} />}
            {children}
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
            <Tabs screenOptions={{tabBarShowLabel: false, animation:"shift", tabBarStyle: {display: "none"}, headerStyle: isDesktop ? {
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
                    }
                    else {
                        if (e.target === undefined) {
                            router.navigate(`/${localStorage.getItem("username")}`)
                        }
                        else if (e.target?.split("-")[0] === "(profiles)" && route?.profile !== localStorage.getItem("username") && route?.profile !== undefined) {
                            router.navigate(`/${localStorage.getItem("username")}`);
                        }
                    }
                }
            }} tabBar={(props) => <CustomTabBar {...props}/>}>
                <Tabs.Screen name="home/index" options={{headerShown: false,
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
                }}/>
                <Tabs.Screen name="networks" options={{headerShown: false,
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "git-merge-sharp" : "git-merge-outline"} size={30}/>
                }}/>
                <Tabs.Screen name="chats" options={{headerShown: false,
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
