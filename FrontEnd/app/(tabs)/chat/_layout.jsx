import {Stack} from "expo-router";

export default function ChatsLayout() { //maybe do Utilities instead and put chats under tabs under header as an option
    return (
        <>
            <Stack>
                <Stack.Screen name="index"/>
                <Stack.Screen name="[receiver]" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}