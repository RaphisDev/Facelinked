import {Stack, useRouter} from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {TouchableOpacity} from "react-native";
import "../../../../global.css";
import {useTranslation} from "react-i18next";

export default function SettingsLayout() {

    const router = useRouter();

    const {t} = useTranslation();

    return (
        <>
            <Stack>
                <Stack.Screen name="account" options={{headerTitle: "Account", headerBackTitle: t("settings")}}/>
                <Stack.Screen name="legal" options={{headerTitle: t("legal"), headerBackTitle:t("settings")}}/>
                <Stack.Screen name="privacy" options={{headerTitle: t("privacy.policy"), headerBackTitle: t("legal")}}/>
                <Stack.Screen name="terms" options={{headerTitle: t("terms.and.conditions"), headerBackTitle: t("legal")}}/>
                <Stack.Screen name="credits" options={{headerTitle: t("credits"), headerBackTitle: t("settings")}}/>
                <Stack.Screen name="index" options={{headerTitle: t("settings"), headerBackTitle: t("back")}}/>
                <Stack.Screen name="eula" options={{
                    headerTitle: "Eula",
                    headerBackTitle: t("legal"),
                }}/>
            </Stack>
        </>
    );
}