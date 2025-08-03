import {Stack} from "expo-router";

export default function ChatsLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false, gestureEnabled: false}}/>
                <Stack.Screen name="[username]" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}