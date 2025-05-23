import {Stack, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {TouchableOpacity} from "react-native";
import "../../../../global.css";

export default function SettingsLayout() {

    const router = useRouter();

    return (
        <>
            <Stack>
                <Stack.Screen name="account" options={{headerTitle: "Account", headerBackTitle: "Settings"}}/>
                <Stack.Screen name="legal" options={{headerTitle: "Legal", headerBackTitle: "Settings"}}/>
                <Stack.Screen name="privacy" options={{headerTitle: "Privacy Policy", headerBackTitle: "Legal"}}/>
                <Stack.Screen name="terms" options={{headerTitle: "Terms and Conditions", headerBackTitle: "Legal"}}/>
                <Stack.Screen name="credits" options={{headerTitle: "Credits", headerBackTitle: "Settings"}}/>
                <Stack.Screen name="index" options={{headerTitle: "Settings", headerBackTitle: "Back"}}/>
            </Stack>
        </>
    );
}