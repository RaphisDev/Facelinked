import {Stack} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {TouchableOpacity} from "react-native";

export default function ProfileLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="[profile]/index" options={{headerTitleAlign: "center",
                    headerLeft: () => <TouchableOpacity><Ionicons name="settings-outline" size={25}/></TouchableOpacity>,
                }}/>
            </Stack>
        </>
    );
}