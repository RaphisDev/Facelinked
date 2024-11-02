import {Stack, Tabs} from "expo-router";
import searchBar from "react-native-screens/src/components/SearchBar";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function TabsLayout() {
    return (
        <>
            <Stack>>
                <Stack.Screen name="index"/>

                <Stack.Screen name="profile"/>
            </Stack>
        </>
    );
}
/*options={{headerTitle: "Home",
    headerTitleAlign: "center",
    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "home-sharp" : "home-outline"} size={30}/>,
}}/>

 options={{headerTitle: "Profile",
                    headerTitleAlign: "center",
                    tabBarIcon: ({focused, color}) => <Ionicons name={focused ? "person-sharp" : "person-outline"} size={30}%

                     screenOptions={{tabBarShowLabel: false}}*/