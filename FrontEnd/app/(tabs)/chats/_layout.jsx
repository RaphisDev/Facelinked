import {Stack} from "expo-router";

export default function ChatsLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="[receiver]" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}