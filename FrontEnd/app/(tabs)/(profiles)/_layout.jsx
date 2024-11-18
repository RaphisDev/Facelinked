import {Stack} from "expo-router";

export default function ProfileLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="[profile]/index" options={{headerTitleAlign: "center"}}/>
                <Stack.Screen name="[profile]/posts" options={{headerShown: true, headerTitle: "Posts"}}/>
            </Stack>
        </>
    );
}