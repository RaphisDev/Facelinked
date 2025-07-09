import {Stack} from "expo-router";
import CustomAlertProvider from "../components/PopUpModalView";
import '../i18n';

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
              <Stack.Screen name="apps" options={{ headerShown: false }}/>
              <Stack.Screen name="eula" options={{ headerShown: false }}/>
          </Stack>
      </>
  );
}
