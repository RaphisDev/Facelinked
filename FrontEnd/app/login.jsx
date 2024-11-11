import {Button, Pressable, Text, TextInput, TouchableOpacity, View} from "react-native";
import "../global.css"
import {useRef, useState} from "react";
import {Redirect, router} from "expo-router";
import * as SecureStore from "expo-secure-store";
//import * as AppleAuthentication from "expo-apple-authentication";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    let token = "";

    //Logs user in with Google API
    async function loginGoogle(){
        //Check if registered
        //setLoggedIn(true);
    }

    //Logs user in with Apple API: "expo-apple-authentication": "~6.4.2",
    /*
    <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={5}
                                onPress={async () => {
                                    try {
                                        const credential = await AppleAuthentication.signInAsync({
                                            requestedScopes: [
                                                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                                                AppleAuthentication.AppleAuthenticationScope.EMAIL,
                                            ],
                                        });
                                        // signed in
                                    } catch (e) {
                                        if (e.code === 'ERR_REQUEST_CANCELED') {
                                            // handle that the user canceled the sign-in flow
                                        } else {
                                            // handle other errors
                                        }
                                    }
                                }}
                            />
     */
    async function loginApple(){
        //Check if registered
        //setRegistered(true);
    }

    async function loginEmail(){
        if(email.length > 0 && password.length > 0){
            setPassword("");
            setEmail("");

            try {
                const response = await fetch("http://10.0.2.2:8080/auth/authenticate", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token;
                    await SecureStore.setItemAsync("token", token);
                    router.push("/");
                } else {
                    alert("Wrong email or password");
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
        else {
            alert("Please enter a valid email and password");
        }
    }

    return (
        <View className="h-full w-full bg-primary dark:bg-dark-primary">
            <View className="mt-[80]">
                <TouchableOpacity className="border-2 border-secText p-2 mt-5 mb-4 bg-dark-primary dark:bg-primary" onPress={() => router.push("/register")}><Text className="text-center text-dark-text dark:text-text font-bold">New to FaceLinked?</Text></TouchableOpacity>
                <Text className="text-center font-bold text-text dark:text-dark-text text-5xl">Login</Text>
                <View className="p-7 items-center self-center flex-wrap">
                    <View>
                        <View className="w-1/2">
                            <Text className="font-bold text-lg">Email</Text>
                            <TextInput value={email} onChangeText={e => setEmail(e)} className="border-gray-700/80 border-4 rounded-lg active:bg-gray-600/10 font-medium text-lg p-0.5 pl-2.5 mb-1 min-w-full max-w-full" type="email" placeholder="Enter your email"/>
                            <Text className="font-bold text-lg mt-1">Password</Text>
                            <TextInput value={password} onSubmitEditing={() => {
                                if (email.length > 0 && password.length > 0) {
                                    loginEmail();
                                }
                            }} onChangeText={p => setPassword(p)} className="border-gray-700/80 active:bg-gray-600/10 rounded-lg border-4 font-medium text-lg p-0.5 pl-2.5 mb-3" type="password" placeholder="Enter your password"/>
                        </View>
                        <TouchableOpacity activeOpacity={0.6} className="max-w-40 self-center border-2 border-secText p-2 bg-dark-primary dark:bg-primary" onPress={loginEmail}><Text className="text-center text-dark-text dark:text-text font-bold">Login with Email</Text></TouchableOpacity>
                    </View>
                    <TouchableOpacity className="border-2 border-secText p-2 mt-5 bg-dark-primary dark:bg-primary" onPress={loginGoogle}><Text className="text-center text-dark-text dark:text-text font-bold">Login with Google</Text></TouchableOpacity>
                    <TouchableOpacity className="border-2 border-secText p-2 mt-5 bg-dark-primary dark:bg-primary" onPress={loginApple}><Text className="text-center text-dark-text dark:text-text font-bold">Login with Apple</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    )
}