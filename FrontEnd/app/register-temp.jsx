
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
