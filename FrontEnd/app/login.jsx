import {Button, Pressable, Text, TextInput, TouchableOpacity, View} from "react-native";
import "../global.css"
import {useState} from "react";
import {Redirect, router} from "expo-router";
//import * as AppleAuthentication from "expo-apple-authentication";

export default function Login() {

   let email = "";
   let password = "";

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
            fetch("http://localhost:8080/auth/authenticate", {
                method: "POST",
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            }).then(response => {
                if(response.status === 403) {
                    alert("Error occured while logging in");
                }
                if(response.ok) {
                    setProfile(true);
                    token = response.body.values().value; // check if thats the token
                    //localStorage.setItem("token", token); Use secure storage
                    router.push("/");
                }
            }).catch((error) => {
                console.error('Error:', error);
                });
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
                            <Text className="font-bold">Email</Text>
                            <TextInput className="border-black border-2 p-1 mt-1 mb-1 min-w-full max-w-full" type="email" placeholder="Enter your email" onChangeText={(text) => email = text}/>
                            <Text className="font-bold">Password</Text>
                            <TextInput className="border-black border-2 p-1 mt-1 mb-3" type="password" placeholder="Enter your password" onChangeText={(text) => password = text}/>
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