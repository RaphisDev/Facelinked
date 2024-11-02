import {View, StyleSheet} from 'react-native';
import {Link, Stack} from "expo-router"

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ headerTitle: "Oops! Not Found" }}/>
            <View className="dark:bg-dprimary bg-primary">
                <Link href="/" className="text-3xl dark:text-dtext text-text">
                    Go back to Home
                </Link>
            </View>
        </>
    )
}