import {Stack} from "expo-router";
import CustomAlertProvider from "../components/PopUpModalView";

export default function RootLayout() {

  return (
      <>
          <CustomAlertProvider/>
          <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }}/>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }}/>
              <Stack.Screen name="privacy" options={{ headerShown: false }}/>
              <Stack.Screen name="terms" options={{ headerShown: false }}/>
              <Stack.Screen name="about" options={{ headerShown: false }}/>
          </Stack>
      </>
  );
}
