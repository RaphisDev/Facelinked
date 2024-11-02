import { Stack } from "expo-router";
import searchBar from "react-native-screens/src/components/SearchBar";
import {StatusBar} from "react-native";

export default function RootLayout() {

  return (
      <>
          <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
          </Stack>
      </>
  );
}
