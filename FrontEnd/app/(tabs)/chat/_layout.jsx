import {Stack} from "expo-router";
import {WebSocketProvider} from "../../../components/WebSocketProvider";

export default function ChatsLayout() { //maybe do Utilities instead and put chats under tabs under header as an option
    return (
        <>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false}}/>
                <Stack.Screen name="[receiver]" options={{headerShown: false}}/>
            </Stack>
        </>
    );
}