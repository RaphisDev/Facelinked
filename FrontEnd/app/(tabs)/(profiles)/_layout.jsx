import {Stack, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {TouchableOpacity} from "react-native";

export default function ProfileLayout() {

    const router = useRouter();
    return (
        <>
            <Stack>
                <Stack.Screen name="[profile]/index" options={{headerTitleAlign: "center",
                    headerLeft: () => <TouchableOpacity onPress={() => router.navigate("/settings")}><Ionicons name="settings-outline" size={25}/></TouchableOpacity>,
                }}/>
                <Stack.Screen name="settings" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}