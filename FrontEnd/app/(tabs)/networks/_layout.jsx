import {Stack, Tabs} from "expo-router";

export default function NetworksLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="index" options={{headerShown: false,
                }}/>
                <Stack.Screen name="create" options={{headerShown: false,
                }}/>
                <Stack.Screen name="(topics)/explore" options={{headerShown: false,
                }}/>
            </Stack>
        </>
    );
}