import {Text, View} from 'react-native';
import { Link, Stack } from 'expo-router';
import * as Linking from 'expo-linking';

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ headerTitle: "Oops! Not Found" }}/>
      <View className="flex-1 items-center justify-center dark:bg-dark-primary bg-primary">
          <Text className="text-4xl font-bold mb-5">404 NOT FOUND</Text>
        <Link
          href="/"
          className="text-3xl dark:text-dark-text mb-5 text-gray-600"
        >
                    Go back to Home
                </Link>
            </View>
        </>
  );
}