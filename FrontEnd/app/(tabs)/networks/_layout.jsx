import {Stack, Tabs} from "expo-router";
import {TouchableOpacity} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function NetworksLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false,
                }}/>
                <Stack.Screen name="[Network]" options={{headerShown: false,}}/>
            </Stack>
        </>
    );
}