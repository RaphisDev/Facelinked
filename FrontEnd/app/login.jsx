import {Pressable, Text, TouchableOpacity, View} from "react-native";
import "../global.css"
import {router} from "expo-router";
import AccountData from "../components/Account/Account Data";
import {useState} from "react";

export default function Login() {

   const [loggedIn, setLoggedIn] = useState(false);

    //Logs user in with Google API
    function loginGoogle(){
        setLoggedIn(true);
    }

    //Logs user in with Apple API
    function loginApple(){
        setLoggedIn(true);
    }

    if(!loggedIn){
        return (
            <View className="h-full w-full bg-primary dark:bg-dark-primary">
                <View className="pt-[80]">
                    <Text className="text-center font-bold text-text dark:text-dark-text text-5xl">Login</Text>
                    <View className="p-7 flex-wrap">
                        <TouchableOpacity className="border-2 border-secText p-2 mb-5 bg-dark-primary dark:bg-primary" onPress={loginGoogle}><Text className="text-dark-text dark:text-text font-bold">Login with Google</Text></TouchableOpacity>
                        <TouchableOpacity className="border-2 border-secText p-2 bg-dark-primary dark:bg-primary" onPress={loginApple}><Text className="text-dark-text dark:text-text font-bold">Login with Apple</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    else {
        return (
            <>
                <AccountData></AccountData>
            </>
        )
    }
}