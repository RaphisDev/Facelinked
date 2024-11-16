import {Stack} from "expo-router";

export default function ProfileLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="[profile]/index"/>
                <Stack.Screen name="[profile]/posts" options={{headerShown: true, title: "Posts"}}/>
            </Stack>
        </>
    );
}