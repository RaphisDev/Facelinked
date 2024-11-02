import { Tabs } from "expo-router";
import searchBar from "react-native-screens/src/components/SearchBar";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
    return (
        <>
            <Tabs screenOptions={{tabBarShowLabel: false}}>
                <Tabs.Screen name="index" options={{headerTitle: "Home",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
                }}/>
                <Tabs.Screen name="profile" options={{headerTitle: "Profile",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "person-sharp" : "person-outline"} size={30}/>
                }}/>
            </Tabs>
        </>
    );
}
