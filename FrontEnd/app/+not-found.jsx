import {View, StyleSheet} from 'react-native';
import {Link, Stack} from "expo-router"
import * as Linking from "expo-linking";

export default function NotFoundScreen() {

    return (
        <>
            <Stack.Screen options={{ headerTitle: "Oops! Not Found" }}/>
            <View className="dark:bg-dark-primary bg-primary">
                <Link href="/" className="text-3xl dark:text-dark-text text-text">
                    Go back to Home
                </Link>
            </View>
        </>
    )
}