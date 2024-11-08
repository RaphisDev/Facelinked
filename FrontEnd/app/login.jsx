import {Pressable, Text, TextInput, TouchableOpacity, View} from "react-native";
import "../global.css"
import {useState} from "react";
import Registration from "../components/Authentication/Registration";
import {Redirect, router} from "expo-router";

export default function Login() {

   const [loggedIn, setLoggedIn] = useState(false);
   const [registered, setRegistered] = useState(true);

   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");

    //Logs user in with Google API
    async function loginGoogle(){
        setLoggedIn(true);
    }

    //Logs user in with Apple API: "expo-apple-authentication": "~6.4.2",
    async function loginApple(){
        //Check if registered
        setLoggedIn(true);
    }

    async function loginEmail(email, password){
        console.log(email);
        setLoggedIn(true);
    }

    if(loggedIn) {
        router.push("/");
        return null;
    }
    else {
        if(registered){
            return (
                <View className="h-full w-full bg-primary dark:bg-dark-primary">
                    <View className="pt-[80]">
                        <Text className="text-center font-bold text-text dark:text-dark-text text-5xl">Login</Text>
                        <View className="p-7 flex-wrap">
                            <View>
                                <View>
                                    <TextInput type="email" placeholder="Enter your email" onChange={e => setEmail(e.target.context)}/>
                                </View>
                                <TouchableOpacity className="border-2 border-secText p-2 bg-dark-primary dark:bg-primary" onPress={loginEmail}><Text className="text-dark-text dark:text-text font-bold">Login with Email</Text></TouchableOpacity>
                            </View>
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
                    <Registration></Registration>
                </>
            )
        }
    }
}