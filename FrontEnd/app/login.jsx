import {Button, Platform, Pressable, Text, TextInput, TouchableOpacity, View} from "react-native";
import "../global.css"
import React, {useRef, useState} from "react";
import {Redirect, router} from "expo-router";
import * as SecureStore from "expo-secure-store";
//import * as AppleAuthentication from "expo-apple-authentication";

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    //Logs user in with Google API
    async function loginGoogle(){

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

    }

    async function loginEmail(){
        if(email.length > 0 && password.length > 0){
            setPassword("");
            setEmail("");

            const ip = Platform.OS === 'android' ? '10.0.2.2' : '192.168.0.178';
            try {
                const response = await fetch(`http://${ip}:8080/auth/authenticate`, {
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
                    router.replace("/");
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
                <Text className="text-center font-bold text-text dark:text-dark-text text-5xl">Login</Text>
                <View className="p-7 items-center self-center flex-wrap">
                    <View className="w-full">
                        <View className="border-2 border-black dark:border-white w-3/4 p-5 rounded-xl">
                            <Text className="dark:text-dark-text text-text font-bold text-lg">Email</Text>
                            <TextInput value={email} textContentType="emailAddress" autoComplete="email" onChangeText={e => setEmail(e)} className="dark:text-dark-text text-text border-gray-700/80 border-4 rounded-lg active:bg-gray-600/10 font-medium text-lg p-0.5 pl-2.5 mb-1 min-w-full max-w-full" type="email" placeholder="Enter your email"/>
                            <Text className="dark:text-dark-text text-text mt-4 font-bold text-lg">Password</Text>
                            <TextInput value={password} textContentType="password" autoComplete="current-password" onSubmitEditing={() => {
                                if (email.length > 0 && password.length > 0) {
                                    loginEmail();
                                }
                            }} onChangeText={p => setPassword(p)} className="dark:text-dark-text text-text border-gray-700/80 active:bg-gray-600/10 rounded-lg border-4 font-medium text-lg p-0.5 pl-2.5 mb-4" type="password" placeholder="Enter your password"/>

                            <TouchableOpacity activeOpacity={0.6} className="rounded-lg max-w-40 self-center border-2 border-secText p-2 bg-dark-primary dark:bg-primary" onPress={loginEmail}><Text className="text-center text-dark-text dark:text-text font-bold">Login</Text></TouchableOpacity>
                        </View>
                        <Text className="dark:text-dark-text text-text text-center font-bold text-lg mt-5">or</Text>
                        <TouchableOpacity className="rounded-lg border-2 border-secText p-2 mt-5 bg-dark-primary dark:bg-primary" onPress={loginGoogle}><Text className="text-center text-dark-text dark:text-text font-bold">Login with Google</Text></TouchableOpacity>
                        <TouchableOpacity className="rounded-lg border-2 border-secText p-2 mt-5 bg-dark-primary dark:bg-primary" onPress={loginApple}><Text className="text-center text-dark-text dark:text-text font-bold">Login with Apple</Text></TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}