import {Stack, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {TouchableOpacity} from "react-native";

export default function ProfileLayout() {

    const router = useRouter();
    return (
        <>
            <Stack>
                <Stack.Screen name="[profile]" options={{headerShown: false}}/>
                <Stack.Screen name="settings" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}