import {Stack, Tabs} from "expo-router";
import searchBar from "react-native-screens/src/components/SearchBar";
import Ionicons from "@expo/vector-icons/Ionicons";
//import * as NavigationBar from "expo-navigation-bar" Add after Prebuild


export default function TabsLayout() {

    //NavigationBar.setBehaviorAsync(""); //Test: inset-swipe inset-touch overlay-swipe

    return (
        <>
            <Tabs screenOptions={{tabBarShowLabel: false}}>
                <Tabs.Screen name="home" options={{headerTitle: "Home",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
                }}/>
                <Tabs.Screen name="networks" options={{headerTitle: "Networks",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "git-merge-sharp" : "git-merge-outline"} size={30}/>
                }}/>
                <Tabs.Screen name="chat" options={{headerTitle: "Chats",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "chatbubbles-sharp" : "chatbubble-outline"} size={30}/>
                }}/>

                <Tabs.Screen name="(profiles)" options={{headerShown: false,
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "person-sharp" : "person-outline"} size={30}/>
                }}/>
            </Tabs>
        </>
    );
}