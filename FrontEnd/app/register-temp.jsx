/*
            import React, { useState, useRef } from 'react';
            import { router } from "expo-router";
            import { View, Text, TextInput, TouchableOpacity, Platform, Switch } from "react-native";
            import * as SecureStore from "expo-secure-store";
            import "../global.css";
            import RNDateTimePicker from "@react-native-community/datetimepicker";
            import { Image } from "expo-image";
            import * as ImagePicker from "expo-image-picker";
            import Ionicons from "@expo/vector-icons/Ionicons";
            import ip from "../components/AppManager";

// Main component that handles navigation between screens
            const Register = () => {
                const [currentScreen, setCurrentScreen] = useState('welcome');
                const [registrationStep, setRegistrationStep] = useState(1);

                // Core registration data and refs from original code
                const email = useRef("");
                const emailRef = useRef(null);
                const password = useRef("");
                const passwordRef = useRef(null);
                const username = useRef("");
                const name = useRef("");
                const birthDay = useRef("");
                const age = useRef(0);
                const [relationship, setRelationship] = useState(false);
                const partner = useRef("");
                const location = useRef("");
                const hobbies = useRef("");
                const image = useRef(null);
                const [imageUri, setImageUri] = useState("");
                const imageUrl = useRef("");
                let [registered, setRegistered] = useState(false);
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                let token = useRef("");

                // Core registration function from original code
                async function Register() {
                    if (emailRegex.test(email.current) && password.current.length >= 6 && username.current.length > 3 && name.current.length > 3 && !registered) {
                        try {
                            const response = await fetch(`${ip}/auth/register`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                    email: email.current,
                                    password: password.current,
                                    username: username.current,
                                    name: name.current,
                                }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                token.current = data.token;
                            }
                            else {
                                alert("There is already an account with that email or username.");
                                setRegistrationStep(1);
                            }
                        }
                        catch (error) {
                            alert("There was an error registering. Please try again.");
                            setRegistrationStep(1);
                        }
                        await CompleteProfile();
                    }
                    else if(!registered) {
                        alert("Please enter a valid email and password");
                        setRegistrationStep(1);
                    }
                }

                // Core profile completion function from original code
                async function CompleteProfile() {
                    if(age.current > 13 && hobbies.current.length > 3 && location.current.length > 2 && imageUri !== "") {
                        try {
                            const bucketResponse = await fetch(`${ip}/profile/upload`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${token.current}`,
                                }
                            });

                            if (bucketResponse.ok) {
                                const url = await bucketResponse.text();

                                const response = await fetch(image.current.assets[0].uri);
                                const blob = await response.blob();

                                await fetch(url, {
                                    method: "PUT",
                                    headers: {
                                        "Content-Type": blob.type
                                    },
                                    body: blob,
                                });
                                imageUrl.current = url.split('?')[0];
                            }
                            else {
                                alert("There was an error uploading the image");
                                return;
                            }

                            const response = await fetch(`${ip}/profile/register`, {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": `Bearer ${token.current}`,
                                },
                                body: JSON.stringify({
                                    username: username.current,
                                    name: name.current,
                                    profilePicturePath: imageUrl.current,
                                    dateOfBirth: birthDay.current,
                                    hobbies: hobbies.current,
                                    inRelationship: relationship,
                                    partner: partner.current,
                                    location: location.current,
                                }),
                            });

                            if (response.ok) {
                                setRegistered(true);

                                if (Platform.OS === "web") {
                                    localStorage.setItem("token", token.current);
                                    localStorage.setItem("username", username.current);
                                    localStorage.setItem("profilePicture", imageUrl.current);
                                    localStorage.setItem("profile", JSON.stringify({
                                        name: name.current,
                                        location: location.current,
                                        score: 0,
                                        hobbies: hobbies.current,
                                        inRelationship: relationship,
                                        partner: partner.current,
                                        profilePicturePath: imageUrl.current,
                                        dateOfBirth: birthDay.current,
                                    }));
                                } else {
                                    await SecureStore.setItemAsync("token", token.current);
                                    await SecureStore.setItemAsync("username", username.current);
                                    await SecureStore.setItemAsync("profilePicture", imageUrl.current);
                                    await SecureStore.setItemAsync("profile", JSON.stringify({
                                        name: name.current,
                                        location: location.current,
                                        score: 0,
                                        hobbies: hobbies.current,
                                        inRelationship: relationship,
                                        partner: partner.current,
                                        profilePicturePath: imageUrl.current,
                                        dateOfBirth: birthDay.current,
                                    }));
                                }

                                setTimeout(() => {router.replace("/home");}, 1500);
                            }
                            else {
                                alert("There is already an account with that email or username");
                            }
                        }
                        catch (error) {
                            alert("There was an error registering. Please try again");
                        }
                    }
                    else {
                        alert("Your profile data is not compatible with FaceLinked's terms of service. Please try again.");
                    }
                }

                // Handle navigation between screens
                const navigateTo = (screen) => {
                    setCurrentScreen(screen);
                };

                // Render appropriate screen based on state
                const renderScreen = () => {
                    switch(currentScreen) {
                        case 'welcome':
                            return <WelcomePage navigateTo={navigateTo} />;
                        case 'login':
                            return <LoginPage navigateTo={navigateTo} />;
                        case 'register':
                            return (
                                <RegistrationFlow
                                    step={registrationStep}
                                    setStep={setRegistrationStep}
                                    email={email}
                                    password={password}
                                    username={username}
                                    name={name}
                                    birthDay={birthDay}
                                    age={age}
                                    relationship={relationship}
                                    setRelationship={setRelationship}
                                    partner={partner}
                                    location={location}
                                    hobbies={hobbies}
                                    image={image}
                                    imageUri={imageUri}
                                    setImageUri={setImageUri}
                                    navigateTo={navigateTo}
                                    onRegister={Register}
                                />
                            );
                        default:
                            return <WelcomePage navigateTo={navigateTo} />;
                    }
                };

                return renderScreen();
            };

// Welcome/Landing Page Component
            const WelcomePage = ({ navigateTo }) => {
                return (
                    <View className="h-full w-full bg-primary dark:bg-dark-primary">
                        <View className="mt-[80] h-full">
                            <TouchableOpacity
                                className="border-b-2 border-t-2 border-gray-800 p-2 mb-4 bg-dark-primary dark:bg-primary"
                                activeOpacity={0.6}
                                onPress={() => navigateTo('login')}
                            >
                                <Text className="text-center text-dark-text dark:text-text font-bold">Already using Facelinked?</Text>
                            </TouchableOpacity>

                            <Text className="text-text dark:text-dark-text text-center font-bold text-4xl">Welcome to {"\n"} Facelinked</Text>

                            <View className="h-1/2 mt-10 self-center flex-wrap justify-center">
                                <View>
                                    <Text className="dark:text-dark-text text-text text-xl mb-8 text-center">
                                        Connect with people who share your interests
                                    </Text>

                                    <TouchableOpacity
                                        className="bg-dark-primary dark:bg-primary p-4 rounded-lg self-center"
                                        activeOpacity={0.6}
                                        onPress={() => navigateTo('register')}
                                    >
                                        <Text className="font-bold text-xl text-center dark:text-text text-dark-text">
                                            Get Started
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            };

// Login Page Component
            const LoginPage = ({ navigateTo }) => {
                const [showPassword, setShowPassword] = useState(false);
                const [emailValue, setEmailValue] = useState('');
                const [passwordValue, setPasswordValue] = useState('');

                return (
                    <View className="h-full w-full bg-primary dark:bg-dark-primary">
                        <View className="mt-[80] h-full">
                            <TouchableOpacity
                                className="mb-5 ml-2"
                                onPress={() => navigateTo('welcome')}
                            >
                                <Ionicons name="arrow-back" size={25}/>
                            </TouchableOpacity>

                            <Text className="text-text dark:text-dark-text text-center font-bold text-4xl mb-10">Login to Facelinked</Text>

                            <View className="h-1/2 mt-10 self-center w-5/6">
                                <View className="border-2 border-black dark:border-white w-full p-5 rounded-xl">
                                    <Text className="dark:text-dark-text text-text font-bold">Email</Text>
                                    <TextInput
                                        autoCapitalize="none"
                                        textContentType="emailAddress"
                                        autoComplete="email"
                                        onChangeText={e => setEmailValue(e)}
                                        className="dark:text-dark-text text-text border-gray-700/80 border-4 mt-1 rounded-lg active:bg-gray-600/10 h-10 font-medium p-1 pl-2.5 mb-1 min-w-full max-w-full"
                                        type="email"
                                        placeholder="Enter your email"
                                    />

                                    <Text className="dark:text-dark-text text-text mt-4 font-bold">Password</Text>
                                    <TextInput
                                        autoComplete="password"
                                        autoCapitalize="none"
                                        textContentType="password"
                                        onChangeText={p => setPasswordValue(p)}
                                        className="dark:text-dark-text text-text border-gray-700/80 mt-1 active:bg-gray-600/10 rounded-lg border-4 font-medium h-10 p-1 pl-2.5 mb-4"
                                        type="password"
                                        placeholder="Enter your password"
                                        secureTextEntry={!showPassword}
                                    />

                                    <TouchableOpacity
                                        activeOpacity={0.6}
                                        className="rounded-lg max-w-40 self-center p-2 bg-dark-primary dark:bg-primary"
                                    >
                                        <Text className="text-center text-dark-text dark:text-text font-bold">Login</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text className="dark:text-dark-text text-text text-center font-bold mt-5">or</Text>

                                <TouchableOpacity
                                    className="self-center w-full min-w-44 rounded-lg p-2 mt-5 bg-dark-primary dark:bg-primary"
                                >
                                    <Text className="text-center text-dark-text dark:text-text font-bold">Login with Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="self-center w-full min-w-44 rounded-lg p-2 mt-5 bg-dark-primary dark:bg-primary"
                                >
                                    <Text className="text-center text-dark-text dark:text-text font-bold">Login with Apple</Text>
                                </TouchableOpacity>

                                <View className="mt-8 items-center">
                                    <Text className="dark:text-dark-text text-text">
                                        Don't have an account yet?{" "}
                                    </Text>
                                    <TouchableOpacity onPress={() => navigateTo('register')}>
                                        <Text className="dark:text-dark-text text-text font-bold">Sign up</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                );
            };

// Registration Flow Component
            const RegistrationFlow = ({
                                          step,
                                          setStep,
                                          email,
                                          password,
                                          username,
                                          name,
                                          birthDay,
                                          age,
                                          relationship,
                                          setRelationship,
                                          partner,
                                          location,
                                          hobbies,
                                          image,
                                          imageUri,
                                          setImageUri,
                                          navigateTo,
                                          onRegister
                                      }) => {
                const totalSteps = 5;

                const nextStep = () => {
                    if (step < totalSteps) {
                        setStep(step + 1);
                    } else {
                        // Final step - trigger registration
                        onRegister();
                    }
                };

                const prevStep = () => {
                    if (step > 1) {
                        setStep(step - 1);
                    } else {
                        navigateTo('welcome');
                    }
                };

                // Render appropriate step based on current step
                const renderStep = () => {
                    switch(step) {
                        case 1:
                            return (
                                <View>
                                    <Text className="dark:text-dark-text text-text text-3xl font-bold mb-2 text-center">What's your name?</Text>
                                    <TextInput
                                        className="dark:text-dark-text text-text w-full min-w-52 self-center active:bg-gray-600/10 border-gray-700/80 rounded-lg border-4 p-1 pl-2 mb-6 font-semibold"
                                        autoComplete="name"
                                        maxLength={25}
                                        textContentType="name"
                                        placeholder="Enter your name"
                                        onChangeText={n => name.current = n}
                                    />

                                    <Text className="dark:text-dark-text text-text text-3xl font-bold mb-2 text-center">
                                        Choose a username
                                    </Text>
                                    <TextInput
                                        className="dark:text-dark-text text-text w-full min-w-52 self-center active:bg-gray-600/10 border-gray-700/80 rounded-lg border-4 p-1 pl-2 mb-12 font-semibold"
                                        maxLength={20}
                                        autoCapitalize="none"
                                        placeholder="Enter username"
                                        onChangeText={u => username.current = u}
                                    />

                                    <TouchableOpacity
                                        className="bg-dark-primary dark:bg-primary p-2 rounded-lg self-center"
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            if (name.current.length > 3 && username.current.length > 3) {
                                                nextStep();
                                            } else {
                                                alert("Username and name must be at least 4 characters long");
                                            }
                                        }}
                                    >
                                        <Text className="font-bold text-xl text-center dark:text-text text-dark-text">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            );

                        case 2:
                            return (
                                <View className="items-center w-5/6">
                                    <View className="border-2 border-black dark:border-white w-full p-5 rounded-xl">
                                        <Text className="dark:text-dark-text text-text font-bold">Email</Text>
                                        <TextInput
                                            autoCapitalize="none"
                                            textContentType="emailAddress"
                                            autoComplete="email"
                                            onChangeText={e => email.current = e}
                                            className="dark:text-dark-text text-text border-gray-700/80 border-4 mt-1 rounded-lg active:bg-gray-600/10 h-10 font-medium p-1 pl-2.5 mb-1 min-w-full max-w-full"
                                            type="email"
                                            placeholder="Enter your email"
                                        />

                                        <Text className="dark:text-dark-text text-text mt-4 font-bold">Password</Text>
                                        <TextInput
                                            autoComplete="password"
                                            autoCapitalize="none"
                                            textContentType="password"
                                            onChangeText={p => password.current = p}
                                            className="dark:text-dark-text text-text border-gray-700/80 mt-1 active:bg-gray-600/10 rounded-lg border-4 font-medium h-10 p-1 pl-2.5 mb-4"
                                            type="password"
                                            placeholder="Enter your password"
                                            secureTextEntry={true}
                                        />

                                        <TouchableOpacity
                                            activeOpacity={0.6}
                                            className="rounded-lg max-w-40 self-center p-2 bg-dark-primary dark:bg-primary"
                                            onPress={() => {
                                                if (emailRegex.test(email.current) && password.current.length >= 6) {
                                                    nextStep();
                                                } else {
                                                    alert("Please enter a valid email and password (min 6 characters)");
                                                }
                                            }}
                                        >
                                            <Text className="text-center text-dark-text dark:text-text font-bold">Next</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );

                        case 3:
                            return (
                                <View>
                                    <Text className="dark:text-dark-text text-text text-3xl font-bold mb-2">How old are you?</Text>
                                    {Platform.OS !== "web" && (
                                        <RNDateTimePicker
                                            value={new Date()}
                                            mode="date"
                                            display="spinner"
                                            onChange={(event, selectedDate) => {
                                                birthDay.current = selectedDate.toISOString().split("T")[0];
                                                const birthDate = new Date(selectedDate);
                                                const ageDiff = Date.now() - birthDate.getTime();
                                                const ageDate = new Date(ageDiff);
                                                age.current = Math.abs(ageDate.getUTCFullYear() - 1970);
                                            }}
                                        />
                                    )}

                                    {Platform.OS === "web" && (
                                        <input
                                            className="dark:bg-gray-900 self-center pl-3 pr-3 dark:color-white rounded-xl mb-2 p-1"
                                            type="date"
                                            onChange={(event) => {
                                                const selectedDate = new Date(event.target.value);
                                                birthDay.current = selectedDate.toISOString().split("T")[0];
                                                const ageDiff = Date.now() - selectedDate.getTime();
                                                const ageDate = new Date(ageDiff);
                                                age.current = Math.abs(ageDate.getUTCFullYear() - 1970);
                                            }}
                                        />
                                    )}

                                    <TouchableOpacity
                                        className="bg-dark-primary dark:bg-primary rounded-lg p-2.5 self-center mt-4"
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            if (age.current > 13) {
                                                nextStep();
                                            } else {
                                                alert("You must be at least 14 years old to use Facelinked");
                                            }
                                        }}
                                    >
                                        <Text className="font-bold text-xl text-center dark:text-text text-dark-text">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            );

                        case 4:
                            return (
                                <View>
                                    <Text className="dark:text-dark-text text-text text-3xl font-bold mb-7">
                                        Tell us about yourself
                                    </Text>

                                    <Text className="dark:text-dark-text text-text text-xl font-bold mb-2">
                                        Are you in a relationship?
                                    </Text>
                                    <View className="flex flex-row justify-center mb-6">
                                        <TouchableOpacity
                                            className={`w-20 mr-5 ${relationship ? 'bg-accent' : 'bg-dark-primary dark:bg-gray-900'} rounded-lg p-2.5 self-center`}
                                            activeOpacity={0.6}
                                            onPress={() => setRelationship(true)}
                                        >
                                            <Text className="font-bold text-xl text-center text-dark-text">Yes</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className={`w-20 ${!relationship ? 'bg-accent' : 'bg-dark-primary dark:bg-gray-900'} rounded-lg p-2.5 self-center`}
                                            activeOpacity={0.6}
                                            onPress={() => setRelationship(false)}
                                        >
                                            <Text className="font-bold text-xl text-center text-dark-text">No</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {relationship && (
                                        <View className="mb-6">
                                            <Text className="dark:text-dark-text text-text text-xl font-bold mb-2">
                                                Partner's name
                                            </Text>
                                            <TextInput
                                                className="dark:text-dark-text text-text min-w-52 self-center active:bg-gray-600/10 border-gray-700/80 rounded-lg border-4 p-1 pl-2 font-semibold"
                                                placeholder="Partner's name"
                                                onChangeText={p => partner.current = p}
                                            />
                                        </View>
                                    )}

                                    <Text className="dark:text-dark-text text-text text-xl font-bold mb-2">
                                        Where are you from?
                                    </Text>
                                    <TextInput
                                        className="dark:text-dark-text text-text w-full min-w-52 self-center active:bg-gray-600/10 border-gray-700/80 rounded-lg border-4 p-1 pl-2 mb-6 font-semibold"
                                        placeholder="Your location"
                                        onChangeText={l => location.current = l}
                                    />

                                    <Text className="dark:text-dark-text text-text text-xl font-bold mb-2">
                                        What are your hobbies or interests?
                                    </Text>
                                    <TextInput
                                        className="dark:text-dark-text text-text w-full min-w-52 self-center active:bg-gray-600/10 border-gray-700/80 rounded-lg border-4 p-1 pl-2 mb-6 font-semibold"
                                        placeholder="football, reading, ..."
                                        onChangeText={h => hobbies.current = h}
                                    />

                                    <TouchableOpacity
                                        className="bg-dark-primary dark:bg-primary p-2 rounded-lg self-center mt-4"
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            if (location.current.length > 2 && hobbies.current.length > 3) {
                                                nextStep();
                                            } else {
                                                alert("Please provide your location and hobbies");
                                            }
                                        }}
                                    >
                                        <Text className="font-bold text-xl text-center dark:text-text text-dark-text">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            );

                        case 5:
                            return (
                                <View>
                                    <Text className="dark:text-dark-text text-text text-3xl font-bold mb-6 text-center">
                                        Profile Picture
                                    </Text>

                                    <View className="w-full self-center items-center">
                                        {imageUri ? (
                                            <View style={{
                                                width: 200,
                                                aspectRatio: 16 / 19,
                                                borderRadius: 24,
                                                overflow: 'hidden',
                                                marginBottom: 20
                                            }}>
                                                <Image
                                                    source={{uri: imageUri}}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: "cover"
                                                    }}
                                                />
                                            </View>
                                        ) : (
                                            <View style={{
                                                width: 200,
                                                aspectRatio: 16 / 19,
                                                borderRadius: 24,
                                                backgroundColor: '#e0e0e0',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                marginBottom: 20
                                            }}>
                                                <Ionicons name="person" size={80} color="#a0a0a0" />
                                            </View>
                                        )}

                                        <TouchableOpacity
                                            className="bg-dark-primary dark:bg-gray-500/30 p-2 border-gray-600 border-2 rounded-lg self-center"
                                            activeOpacity={0.6}
                                            onPress={async () => {
                                                const result = await ImagePicker.launchImageLibraryAsync({
                                                    allowsEditing: true,
                                                    aspect: [16, 19],
                                                    quality: 0.8,
                                                    mediaTypes: "images"
                                                });

                                                if (!result.canceled) {
                                                    image.current = result;
                                                    setImageUri(result.assets[0].uri);
                                                }
                                            }}
                                        >
                                            <View className="flex-row items-center justify-center">
                                                <Ionicons name="image" color="#FFFFFF" size={20}/>
                                                <Text className="font-bold text-xl text-center text-dark-text"> Choose Image</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        className="bg-dark-primary dark:bg-primary p-2.5 rounded-lg self-center mt-8"
                                        activeOpacity={0.6}
                                        onPress={() => {
                                            if (imageUri !== "") {
                                                // Final step - complete registration
                                                onRegister();
                                            } else {
                                                alert("Please upload a profile picture");
                                            }
                                        }}
                                    >
                                        <Text className="font-bold text-xl text-center dark:text-text text-dark-text">
                                            Complete Registration
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );

                        default:
                            return null;
                    }
                };

                return (
                    <View className="h-full w-full bg-primary dark:bg-dark-primary">
                        <View className="mt-[80] h-full">
                            <TouchableOpacity
                                className="mb-5 ml-2"
                                onPress={prevStep}
                            >
                                <Ionicons name="arrow-back" size={25}/>
                            </TouchableOpacity>

                            <Text className="text-text dark:text-dark-text text-center font-bold text-4xl mb-6">
                                Create Your Account
                            </Text>


                            <View className="flex-row justify-center mb-8">
                                {Array.from({ length: totalSteps }).map((_, index) => (
                                    <View
                                        key={index}
                                        className={`h-2 w-10 mx-1 rounded-full ${
                                            index < step ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'
                                        }`}
                                    />
                                ))}
                            </View>

                            <View className="h-1/2 mt-4 self-center flex-wrap justify-center w-5/6">
                                {renderStep()}
                            </View>
                        </View>
                    </View>
                );
            };

            export default Register;

            */

/*
            import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { ArrowRight, Mail, Lock, Eye, EyeOff, X, Camera, Check } from 'lucide-react-native';

// Main component that handles navigation between screens
const FacelinkedApp = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [registrationStep, setRegistrationStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        relationship: null,
        birthDate: { day: 15, month: 'March', year: 2025 },
        location: '',
        interests: '',
        profilePicture: null
    });

    // Handle navigation between screens
    const navigateTo = (screen) => {
        setCurrentScreen(screen);
    };

    // Render appropriate screen based on state
    const renderScreen = () => {
        switch(currentScreen) {
            case 'welcome':
                return <WelcomePage navigateTo={navigateTo} />;
            case 'login':
                return <LoginPage navigateTo={navigateTo} />;
            case 'register':
                return (
                    <RegistrationFlow
                        step={registrationStep}
                        setStep={setRegistrationStep}
                        formData={formData}
                        setFormData={setFormData}
                        navigateTo={navigateTo}
                    />
                );
            default:
                return <WelcomePage navigateTo={navigateTo} />;
        }
    };

    return renderScreen();
};

// Welcome/Landing Page Component
const WelcomePage = ({ navigateTo }) => {
    return (
        <SafeAreaView style={styles.welcomeContainer}>
            <StatusBar barStyle="light-content" />

            <View style={styles.topRightDecoration}></View>
            <View style={styles.topLeftDecoration}></View>

            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.logoText}>Facelinked</Text>
                    <TouchableOpacity
                        onPress={() => navigateTo('login')}
                        style={styles.signInButton}
                    >
                        <Text style={styles.signInButtonText}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.mainContent}>
                    <View style={styles.profilePicturesContainer}>
                        <View style={styles.profilePicture}>
                            <Image source={{uri: 'https://via.placeholder.com/64'}} style={styles.profileImage} />
                        </View>
                        <View style={[styles.profilePicture, styles.profilePictureOffset]}>
                            <Image source={{uri: 'https://via.placeholder.com/64'}} style={styles.profileImage} />
                        </View>
                        <View style={[styles.profilePicture, styles.profilePictureOffset]}>
                            <Image source={{uri: 'https://via.placeholder.com/64'}} style={styles.profileImage} />
                        </View>
                    </View>

                    <Text style={styles.heroTitle}>Connect with people who share your interests</Text>
                    <Text style={styles.heroSubtitle}>
                        Join our community to meet new friends, discover shared hobbies, and build meaningful connections
                    </Text>

                    <TouchableOpacity
                        onPress={() => navigateTo('register')}
                        style={styles.getStartedButton}
                    >
                        <Text style={styles.getStartedButtonText}>Get Started</Text>
                        <ArrowRight color="#3b82f6" size={20} style={{marginLeft: 8}} />
                    </TouchableOpacity>

                    <View style={styles.signInPrompt}>
                        <Text style={styles.signInPromptText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigateTo('login')}>
                            <Text style={styles.signInLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <View style={styles.additionalButtonContainer}>
                    <TouchableOpacity
                        onPress={() => navigateTo('register')}
                        style={styles.additionalGetStartedButton}
                    >
                        <Text style={styles.additionalGetStartedText}>Get Started</Text>
                        <ArrowRight color="white" size={20} style={{marginLeft: 8}} />
                    </TouchableOpacity>
                </View>

                <View style={styles.featuresSection}>
                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <Text style={styles.featureIcon}>👥</Text>
                        </View>
                        <Text style={styles.featureTitle}>Meet New People</Text>
                        <Text style={styles.featureDescription}>Connect with people nearby who share your interests</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <Text style={styles.featureIcon}>💬</Text>
                        </View>
                        <Text style={styles.featureTitle}>Join Communities</Text>
                        <Text style={styles.featureDescription}>Find and participate in groups dedicated to your favorite activities</Text>
                    </View>

                    <View style={styles.featureCard}>
                        <View style={styles.featureIconContainer}>
                            <Text style={styles.featureIcon}>😊</Text>
                        </View>
                        <Text style={styles.featureTitle}>Share Experiences</Text>
                        <Text style={styles.featureDescription}>Create and join events to share real-life moments with friends</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2025 Facelinked. Privacy Policy • Terms of Service</Text>
            </View>
            </SafeAreaView>
            );
            };

            // Login Page Component
            const LoginPage = ({ navigateTo }) => {
                const [showPassword, setShowPassword] = useState(false);
                const [email, setEmail] = useState('');
                const [password, setPassword] = useState('');

                return (
                    <SafeAreaView style={styles.loginContainer}>
                        <View style={styles.loginHeader}>
                            <TouchableOpacity
                                onPress={() => navigateTo('welcome')}
                                style={styles.backButton}
                            >
                                <X size={20} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.loginHeaderTitle}>Login to Facelinked</Text>
                            <View style={{width: 32}} />
                        </View>

                        <ScrollView contentContainerStyle={styles.loginContent}>
                            <View style={styles.loginLogoContainer}>
                                <View style={styles.loginLogo}>
                                    <Text style={styles.loginLogoText}>F</Text>
                                </View>
                                <Text style={styles.loginWelcomeText}>Welcome back!</Text>
                                <Text style={styles.loginSubtitle}>Log in to continue your journey</Text>
                            </View>

                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email</Text>
                                    <View style={styles.inputContainer}>
                                        <Mail size={18} color="#9ca3af" style={styles.inputIcon} />
                                        <TextInput
                                            placeholder="Enter your email"
                                            style={styles.textInput}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Lock size={18} color="#9ca3af" style={styles.inputIcon} />
                                        <TextInput
                                            secureTextEntry={!showPassword}
                                            placeholder="Enter your password"
                                            style={styles.textInput}
                                            value={password}
                                            onChangeText={setPassword}
                                        />
                                        <TouchableOpacity
                                            style={styles.passwordToggle}
                                            onPress={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff size={18} color="#9ca3af" />
                                            ) : (
                                                <Eye size={18} color="#9ca3af" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.rememberForgotContainer}>
                                    <View style={styles.rememberMeContainer}>
                                        <View style={styles.checkbox} />
                                        <Text style={styles.rememberMeText}>Remember me</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.loginButton}>
                                    <Text style={styles.loginButtonText}>Log In</Text>
                                </TouchableOpacity>

                                <View style={styles.dividerContainer}>
                                    <View style={styles.divider} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.divider} />
                                </View>

                                <View style={styles.socialButtonsContainer}>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <View style={styles.googleIcon} />
                                        <Text style={styles.socialButtonText}>Google</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.socialButton}>
                                        <View style={styles.appleIcon} />
                                        <Text style={styles.socialButtonText}>Apple</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.signupPromptContainer}>
                                <Text style={styles.signupPromptText}>
                                    Don't have an account yet?{" "}
                                </Text>
                                <TouchableOpacity onPress={() => navigateTo('register')}>
                                    <Text style={styles.signupLink}>Sign up</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                );
            };

            // Styles
            const styles = StyleSheet.create({
                // Welcome Page Styles
                welcomeContainer: {
                    flex: 1,
                    backgroundColor: '#3b82f6', // blue-500
                },
                topRightDecoration: {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 256,
                    height: 256,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderBottomLeftRadius: 256,
                },
                topLeftDecoration: {
                    position: 'absolute',
                    top: 80,
                    left: 40,
                    width: 64,
                    height: 64,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 32,
                },
                container: {
                    flex: 1,
                    paddingHorizontal: 24,
                    paddingVertical: 48,
                },
                header: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                },
                logoText: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    color: 'white',
                },
                signInButton: {
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                signInButtonText: {
                    color: 'white',
                },
                mainContent: {
                    alignItems: 'center',
                    paddingTop: 96,
                },
                profilePicturesContainer: {
                    flexDirection: 'row',
                    marginBottom: 24,
                },
                profilePicture: {
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'white',
                    borderWidth: 2,
                    borderColor: 'white',
                    overflow: 'hidden',
                },
                profilePictureOffset: {
                    marginLeft: -16,
                },
                profileImage: {
                    width: '100%',
                    height: '100%',
                },
                heroTitle: {
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: 16,
                },
                heroSubtitle: {
                    fontSize: 18,
                    color: 'rgba(255, 255, 255, 0.8)',
                    textAlign: 'center',
                    marginBottom: 48,
                    maxWidth: '80%',
                },
                getStartedButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 28,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                },
                getStartedButtonText: {
                    color: '#3b82f6',
                    fontWeight: 'bold',
                    fontSize: 18,
                },
                signInPrompt: {
                    flexDirection: 'row',
                    marginTop: 32,
                },
                signInPromptText: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                signInLink: {
                    color: 'white',
                    textDecorationLine: 'underline',
                },
                featuresSection: {
                    marginTop: 24,
                },
                featureCard: {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    padding: 24,
                    borderRadius: 12,
                    marginBottom: 16,
                },
                featureIconContainer: {
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                },
                featureIcon: {
                    fontSize: 24,
                    color: 'white',
                },
                featureTitle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: 8,
                },
                featureDescription: {
                    color: 'rgba(255, 255, 255, 0.7)',
                },
                footer: {
                    paddingVertical: 24,
                    alignItems: 'center',
                },
                footerText: {
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 14,
                },
                additionalButtonContainer: {
                    alignItems: 'center',
                    marginTop: 40,
                    marginBottom: 16,
                },
                additionalGetStartedButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#3b82f6',
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 24,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                },
                additionalGetStartedText: {
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: 16,
                },

                // Login Page Styles
                loginContainer: {
                    flex: 1,
                    backgroundColor: '#f9fafb', // gray-50
                },
                loginHeader: {
                    backgroundColor: 'white',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#e5e7eb', // gray-200
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                backButton: {
                    padding: 8,
                    borderRadius: 20,
                },
                loginHeaderTitle: {
                    fontSize: 18,
                    fontWeight: '600',
                    flex: 1,
                    textAlign: 'center',
                },
                loginContent: {
                    padding: 24,
                    alignItems: 'center',
                },
                loginLogoContainer: {
                    alignItems: 'center',
                    marginBottom: 48,
                },
                loginLogo: {
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: '#3b82f6', // blue-500
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                },
                loginLogoText: {
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                },
                loginWelcomeText: {
                    fontSize: 24,
                    fontWeight: '600',
                    marginBottom: 8,
                },
                loginSubtitle: {
                    color: '#6b7280', // gray-500
                },
                formContainer: {
                    width: '100%',
                    marginBottom: 32,
                },
                inputGroup: {
                    marginBottom: 24,
                },
                inputLabel: {
                    fontSize: 14,
                    fontWeight: '500',
                    color: '#374151', // gray-700
                    marginBottom: 4,
                },
                inputContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#d1d5db', // gray-300
                    borderRadius: 8,
                    backgroundColor: 'white',
                },
                inputIcon: {
                    marginLeft: 12,
                },
                textInput: {
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                },
                passwordToggle: {
                    padding: 12,
                },
                rememberForgotContainer: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                },
                rememberMeContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                },
                checkbox: {
                    width: 16,
                    height: 16,
                    borderWidth: 1,
                    borderColor: '#d1d5db', // gray-300
                    borderRadius: 4,
                },
                rememberMeText: {
                    marginLeft: 8,
                    fontSize: 14,
                    color: '#374151', // gray-700
                },
                forgotPasswordText: {
                    color: '#3b82f6', // blue-500
                    fontSize: 14,
                },
                loginButton: {
                    backgroundColor: '#3b82f6', // blue-500
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    marginBottom: 24,
                },
                loginButtonText: {
                    color: 'white',
                    fontWeight: '500',
                    fontSize: 16,
                },
                dividerContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginVertical: 24,
                },
                divider: {
                    flex: 1,
                    height: 1,
                    backgroundColor: '#e5e7eb', // gray-200
                },
                dividerText: {
                    paddingHorizontal: 8,
                    color: '#6b7280', // gray-500
                    fontSize: 14,
                },
                socialButtonsContainer: {
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                },
                socialButton: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#d1d5db', // gray-300
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    flex: 0.48,
                },
                googleIcon: {
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#3b82f6', // blue-500
                    marginRight: 8,
                },
                appleIcon: {
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: 'black',
                    marginRight: 8,
                },
                socialButtonText: {
                    fontSize: 14,
                    color: '#374151', // gray-700
                },
                signupPromptContainer: {
                    flexDirection: 'row',
                    marginTop: 32,
                    justifyContent: 'center',
                },
                signupPromptText: {
                    color: '#6b7280', // gray-500
                },
                signupLink: {
                    color: '#3b82f6', // blue-500
                    fontWeight: '500',
                },
            });


            const RegistrationFlow = () => {
                const [step, setStep] = useState(1);
                const [formData, setFormData] = useState({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    relationship: null,
                    birthDate: { day: 15, month: 'March', year: 2025 },
                    location: '',
                    interests: '',
                    profilePicture: null
                });

                const totalSteps = 5;

                const updateFormData = (field, value) => {
                    setFormData({ ...formData, [field]: value });
                };

                const nextStep = () => {
                    if (step < totalSteps) {
                        setStep(step + 1);
                    }
                };

                const prevStep = () => {
                    if (step > 1) {
                        setStep(step - 1);
                    }
                };

                const renderProgress = () => {
                    return (
                        <div className="w-full mb-8">
                            <div className="flex justify-between mb-2">
                                {Array.from({ length: totalSteps }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center
                ${index + 1 === step ? 'bg-blue-500 text-white' :
                                            index + 1 < step ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                                    >
                                        {index + 1 < step ? <Check size={16} /> : index + 1}
                                    </div>
                                ))}
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${(step / totalSteps) * 100}%` }}
                                />
                            </div>
                        </div>
                    );
                };

                const renderStepContent = () => {
                    switch(step) {
                        case 1:
                            return (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-semibold">Let's get started</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Your Name</label>
                                            <input
                                                type="text"
                                                placeholder="Enter your name"
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.name}
                                                onChange={(e) => updateFormData('name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Choose a Username</label>
                                            <input
                                                type="text"
                                                placeholder="Enter username"
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.username}
                                                onChange={(e) => updateFormData('username', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        case 2:
                            return (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-semibold">Your account details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Email</label>
                                            <input
                                                type="email"
                                                placeholder="Enter your email"
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter password"
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.password}
                                                onChange={(e) => updateFormData('password', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center justify-center mt-4">
                                            <span className="text-gray-400">or</span>
                                        </div>
                                        <div className="space-y-3">
                                            <button className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                                                <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                                                <span>Login with Google</span>
                                            </button>
                                            <button className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                                                <div className="w-5 h-5 bg-black rounded-full"></div>
                                                <span>Login with Apple</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 3:
                            return (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-3">Are you in a relationship?</h3>
                                            <div className="flex gap-4">
                                                <button
                                                    className={`flex-1 p-3 rounded-lg border ${formData.relationship === true ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
                                                    onClick={() => updateFormData('relationship', true)}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    className={`flex-1 p-3 rounded-lg border ${formData.relationship === false ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}
                                                    onClick={() => updateFormData('relationship', false)}
                                                >
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium mb-3">When were you born?</h3>
                                            <div className="flex gap-2">
                                                <div className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center">
                                                    {formData.birthDate.day}
                                                </div>
                                                <div className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center">
                                                    {formData.birthDate.month}
                                                </div>
                                                <div className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center">
                                                    {formData.birthDate.year}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Select day, month and year</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 4:
                            return (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-semibold">Your profile details</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Where are you from?</label>
                                            <input
                                                type="text"
                                                placeholder="You live in"
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.location}
                                                onChange={(e) => updateFormData('location', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">What are your hobbies or interests?</label>
                                            <input
                                                type="text"
                                                placeholder="football, reading, ..."
                                                className="w-full p-3 border border-gray-300 rounded-lg"
                                                value={formData.interests}
                                                onChange={(e) => updateFormData('interests', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        case 5:
                            return (
                                <div className="space-y-6">
                                    <h2 className="text-2xl font-semibold">Profile Picture</h2>
                                    <div className="flex flex-col items-center">
                                        <div className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative">
                                            {formData.profilePicture ? (
                                                <img src="/api/placeholder/200/200" alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                                    <Camera size={48} />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center gap-2"
                                            onClick={() => updateFormData('profilePicture', '/placeholder.jpg')}
                                        >
                                            <Camera size={16} />
                                            Choose Image
                                        </button>
                                    </div>
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="terms"
                                                className="mr-2 h-4 w-4"
                                            />
                                            <label htmlFor="terms" className="text-sm">
                                                You are 14 or older and accept the <a href="#" className="text-blue-500 underline">Privacy Policy</a> & <a href="#" className="text-blue-500 underline">Terms and Conditions</a>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                    }
                };

                return (
                    <div className="min-h-screen bg-gray-50 flex flex-col">
                        <header className="bg-white p-4 border-b border-gray-200 flex items-center">
                            <button
                                onClick={prevStep}
                                className="p-2 rounded-full hover:bg-gray-100"
                                disabled={step === 1}
                            >
                                <X size={20} />
                            </button>
                            <h1 className="text-lg font-semibold mx-auto">Welcome to Facelinked</h1>
                            <div className="w-8"></div>
                        </header>

                        <div className="flex-1 p-6 max-w-md mx-auto w-full">
                            {renderProgress()}
                            {renderStepContent()}
                        </div>

                        <div className="p-6 border-t border-gray-200 bg-white">
                            <div className="max-w-md mx-auto">
                                <button
                                    onClick={nextStep}
                                    className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                                >
                                    {step < totalSteps ? (
                                        <>
                                            Continue <ArrowRight size={16} />
                                        </>
                                    ) : (
                                        'Confirm & Create Account'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            };


            export default FacelinkedApp;
            */


import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, Eye, EyeOff, X, Camera, Check } from 'lucide-react-native';
import Ionicons from "@expo/vector-icons/Ionicons";
import {ScrollView} from "react-native";

// Main component that handles navigation between screens
const FacelinkedApp = () => {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [registrationStep, setRegistrationStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        relationship: null,
        birthDate: { day: 15, month: 'March', year: 2025 },
        location: '',
        interests: '',
        profilePicture: null
    });

    // Handle navigation between screens
    const navigateTo = (screen) => {
        setCurrentScreen(screen);
    };

    // Render appropriate screen based on state
    const renderScreen = () => {
        switch(currentScreen) {
            case 'welcome':
                return <WelcomePage navigateTo={navigateTo} />;
            case 'login':
                return <LoginPage navigateTo={navigateTo} />;
            case 'register':
                return (
                    <RegistrationFlow
                        step={registrationStep}
                        setStep={setRegistrationStep}
                        formData={formData}
                        setFormData={setFormData}
                        navigateTo={navigateTo}
                    />
                );
            default:
                return <WelcomePage navigateTo={navigateTo} />;
        }
    };

    return renderScreen();
};

// Welcome/Landing Page Component
const WelcomePage = ({ navigateTo }) => {
    return (
        <ScrollView className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white">
<div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-bl-full"></div>
<div className="absolute top-20 left-10 w-16 h-16 bg-white opacity-10 rounded-full"></div>

<div className="container mx-auto px-6 py-12 relative z-10">
    <header className="flex justify-between items-center">
        <div className="text-2xl font-bold">Facelinked</div>
        <button
            onClick={() => navigateTo('login')}
            className="px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition"
        >
            Sign In
        </button>
    </header>

    <div className="mt-24 flex flex-col items-center text-center">
        <div className="flex space-x-2 mb-6">
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden border-2 border-white">
                <img src="/api/placeholder/64/64" alt="Profile" className="object-cover w-full h-full" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden border-2 border-white -ml-4">
                <img src="/api/placeholder/64/64" alt="Profile" className="object-cover w-full h-full" />
            </div>
            <div className="w-16 h-16 rounded-full bg-white overflow-hidden border-2 border-white -ml-4">
                <img src="/api/placeholder/64/64" alt="Profile" className="object-cover w-full h-full" />
            </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Connect with people who share your interests</h1>
        <p className="text-xl text-white/80 mb-12 max-w-lg">
            Join our community to meet new friends, discover shared hobbies, and build meaningful connections
        </p>

        <button
            onClick={() => navigateTo('register')}
            className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg shadow-lg hover:bg-opacity-90 transition flex items-center"
        >
            Get Started <ArrowRight className="ml-2" size={20} />
        </button>

        <div className="mt-8">
            <p className="text-white/70">Already have an account? <button onClick={() => navigateTo('login')} className="text-white underline">Sign in</button></p>
        </div>
    </div>

    <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Meet New People</h3>
            <p className="text-white/70">Connect with people nearby who share your interests</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Join Communities</h3>
            <p className="text-white/70">Find and participate in groups dedicated to your favorite activities</p>
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                    <line x1="9" y1="9" x2="9.01" y2="9"></line>
                    <line x1="15" y1="9" x2="15.01" y2="9"></line>
                </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Experiences</h3>
            <p className="text-white/70">Create and join events to share real-life moments with friends</p>
        </div>
    </div>
</div>

<div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-black/20 to-transparent"></div>
<div className="absolute bottom-0 left-0 w-full text-center py-6 text-white/60 text-sm">
    <p>© 2025 Facelinked. Privacy Policy • Terms of Service</p>
</div>
</ScrollView>
);
};

// Login Page Component
const LoginPage = ({ navigateTo }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white p-4 border-b border-gray-200 flex items-center">
                <button
                    onClick={() => navigateTo('welcome')}
                    className="p-2 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>
                <h1 className="text-lg font-semibold mx-auto">Login to Facelinked</h1>
                <div className="w-8"></div>
            </header>

            <div className="flex-1 p-6 max-w-md mx-auto w-full">
                <div className="mb-12 text-center">
                    <div className="inline-block w-20 h-20 bg-blue-500 rounded-full mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">F</span>
                    </div>
                    <h2 className="text-2xl font-semibold">Welcome back!</h2>
                    <p className="text-gray-500 mt-2">Log in to continue your journey</p>
                </div>

                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff size={18} className="text-gray-400" />
                                ) : (
                                    <Eye size={18} className="text-gray-400" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="text-blue-500 hover:text-blue-600">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="w-full py-3 bg-blue-500 text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                        Log In
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                            <div className="w-5 h-5 mr-2 bg-blue-500 rounded-full"></div>
                            Google
                        </button>
                        <button
                            type="button"
                            className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                        >
                            <div className="w-5 h-5 mr-2 bg-black rounded-full"></div>
                            Apple
                        </button>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Don't have an account yet?{" "}
                        <button
                            onClick={() => navigateTo('register')}
                            className="text-blue-500 font-medium hover:text-blue-600"
                        >
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

// Registration Flow Component (from previous response, with modifications)
const RegistrationFlow = ({ step, setStep, formData, setFormData, navigateTo }) => {
    const totalSteps = 5;

    const updateFormData = (field, value) => {
        setFormData({...formData, [field]: value});
    };

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    }
}

export default FacelinkedApp;
