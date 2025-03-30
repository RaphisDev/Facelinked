import {
    Appearance,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
    Share,
    ScrollView,
    TextInput,
    SafeAreaView, StyleSheet, Linking
} from "react-native";
import "../global.css";
import {router, useRouter} from "expo-router";
import * as SecureStore from "expo-secure-store";
import WebSocketProvider from "../components/WebSocketProvider";
import {Image} from "expo-image";
import * as Device from "expo-device";
import * as Notification from "expo-notifications";
import ip from "../components/AppManager";
import React, { useState, useEffect, useRef } from 'react';
import {ChevronRight, User, Users, Heart, MessageCircle, MapPin, Menu, X, Share2, ArrowRight,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Check,
    ArrowLeft,
    Volleyball,
    Camera,} from 'lucide-react-native';
import {Link} from "expo-router";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import {TextEncoder} from "text-encoding";
import asyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "@expo/vector-icons/Ionicons";
import CustomAlertProvider, {showAlert} from "../components/PopUpModalView";
import {MotiView} from "moti";
import {ImageManipulator, SaveFormat} from "expo-image-manipulator";
import {useDerivedValue} from "react-native-reanimated";

global.TextEncoder = TextEncoder;

Object.assign(global, { WebSocket });

const Index = () => {

    const [loggedIn, setLoggedIn] = useState(false);

    async function signedIn() {
        if (Platform.OS === "web") {
            return localStorage.getItem("token") != null;
        }
        const token = await SecureStore.getItemAsync("token");

        if (Notification.PermissionStatus.GRANTED && Platform.OS === 'ios' && token != null && Device.isDevice && await asyncStorage.getItem("deviceToken") !== "true") {
            const deviceToken = await Notification.getDevicePushTokenAsync();
            const status = await fetch(`${ip}/messages/setDeviceToken`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SecureStore.getItem("token")}`
                },
                body: JSON.stringify({
                    token: deviceToken
                })
            });

            if (status.ok) {
                await asyncStorage.setItem("deviceToken", "true");
            }
        }
        return token != null;
    }

    useEffect(() => {
        if (Platform.OS !== "web") {
            Appearance.setColorScheme("light");
        }

        setTimeout(async () => {
            if (await signedIn()) {
                new WebSocketProvider();
                router.replace("/home");
            } else {
                setLoggedIn(true);
            }
       }, Platform.OS === "web" ? 0 : 1000);
    }, []);

    if (loggedIn) {
        return <HomePage />;
    }
    else {
        if (Platform.OS === "web") {return <View className="bg-white"></View>}
        return (
            <MotiView
                from={{ opacity: 0, scale: 1}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: 'timing',
                    duration: 200,
                }}
            >
            <View className="w-full h-full bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col justify-between p-8">
                <View className="flex-1" />
                <View className="backdrop-blur-md bg-white/60 rounded-3xl p-10 shadow-xl border border-white/50 flex flex-col items-center w-full max-w-md mx-auto">
                    <View className="mb-4">
                        <Image
                            source={require("../assets/images/icon.png")}
                            style={{width: 130, height: 130, borderRadius: 35}}
                            className="shadow-md"
                        />
                    </View>

                            <Text style={{
                        fontSize: 32,
                                fontWeight: 'bold',
                                textAlign: 'center',
                        color: '#1d4ed8',
                        marginTop: 16
                            }}>
                        Facelinked
                            </Text>

                    <View className="flex-row items-center justify-center my-4">
                        <View className="h-2 w-2 bg-blue-400 rounded-full mr-2 opacity-70"></View>
                        <View className="h-2 w-2 bg-blue-500 rounded-full mr-2 opacity-80"></View>
                        <View className="h-2 w-2 bg-blue-600 rounded-full opacity-90"></View>
                        </View>

                    <View className="mt-5 bg-blue-500/20 px-5 py-2 rounded-full">
                            <Text style={{
                            fontSize: 14,
                                textAlign: 'center',
                                color: '#2563eb',
                                fontWeight: '600'
                            }}>
                            crafted with ♥ by Orion
                    </Text>
                </View>
            </View>
                <View className="flex-1" />
                </View>
            </MotiView>
        );
    }
}

const HomePage = () => {

    //look if newPassword, existingPassword, newMail, existing mail works
    //look if images work on android, web, ios

    const [currentPage, setCurrentPage] = useState('landing');
    const previousPage = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const scrollContent = useRef(null);

    const navigateTo = (page) => {
        previousPage.current = currentPage;
        setCurrentPage(page);
    };

    const renderPage = () => {
        switch(currentPage) {
            case 'landing':
                return <LandingPage navigateTo={navigateTo} scrollContent={scrollContent} />;
            case 'login':
                return <AuthPages navigateTo={navigateTo} currentPage={currentPage} previousPage={previousPage.current} showPassword={showPassword} setShowPassword={setShowPassword} />;
            case 'register':
                return <AuthPages navigateTo={navigateTo} currentPage={currentPage} previousPage={previousPage.current} showPassword={showPassword} setShowPassword={setShowPassword} />;
            default:
                return <LandingPage navigateTo={navigateTo} scrollContent={scrollContent} />;
        }
    };

    return renderPage();
};

const NavigationBar = ({navigateTo, scrollContent}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    if (Platform.OS !== "web") {return null}
    return (<>
    <nav
        className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm py-4 px-6 flex justify-between items-center">
        <Pressable onPress={() => navigateTo('landing')} className="flex flex-row items-center space-x-2">
            <View
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <Image source={require("../assets/images/icon-bg-removed.png")} style={{height:35,width:35}}/>
            </View>
            <span
                className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Facelinked</span>
        </Pressable>

        {/* Desktop Navigation */}
        <View className="hidden md:flex md:flex-row space-x-8">
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigateTo('landing')} className="font-medium text-gray-600 hover:text-blue-600">Home</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.navigate("/about")} className="font-medium text-gray-600 hover:text-blue-600">About</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => scrollContent?.current.scrollTo(500,0)} className="font-medium text-gray-600 hover:text-blue-600">Features</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => scrollContent?.current.scrollTo(1900,0)} className="font-medium text-gray-600 hover:text-blue-600">Testimonials</TouchableOpacity>
        </View>

        <View className="hidden md:flex md:flex-row space-x-4">
            <button onClick={() => navigateTo("login")}
                    className="px-6 py-2 rounded-full backdrop-blur-md bg-white/80 border border-blue-200 text-blue-600 font-medium hover:bg-white transition duration-300">
                Login
            </button>
            <button onClick={() => navigateTo("register")}
                    className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium hover:from-blue-600 hover:to-blue-800 shadow-md shadow-blue-200 transition duration-300">
                Join Now
            </button>
        </View>

        {/* Mobile Menu Button */}
        <View className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
                {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
        </View>
    </nav>

    {/* Mobile Menu */}
    <View
        className={`md:hidden fixed top-16 left-0 right-0 z-40 backdrop-blur-lg bg-white/90 p-5 shadow-lg transform transition-transform duration-300 ease-in-out`}  style={{
        transform: mobileMenuOpen ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 300ms ease-in-out",
    }}
    >
        <View className="flex flex-col space-y-4">
            <TouchableOpacity activeOpacity={0.7} onPress={() => {navigateTo('landing'); setMobileMenuOpen(false)}} className="font-medium text-gray-600 hover:text-blue-600 py-2">Home</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => router.navigate('/about')} className="font-medium text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>About</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => scrollContent?.current.scrollTo(500,0)} className="font-medium text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Features</TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={() => scrollContent?.current.scrollTo(1900,0)} className="font-medium text-gray-600 hover:text-blue-600 py-2" onClick={() => setMobileMenuOpen(false)}>Testimonials</TouchableOpacity>
            <View className="flex flex-row space-x-4 py-2">
                <button
                    onClick={() => {
                        setMobileMenuOpen(false);
                        navigateTo("login");
                    }}
                    className="flex-1 py-2 rounded-full backdrop-blur-md bg-white/80 border border-blue-200 text-blue-600 font-medium hover:bg-white transition duration-300"
                >
                    Login
                </button>
                <button
                    onClick={() => {
                        setMobileMenuOpen(false);
                        navigateTo("register");
                    }}
                    className="flex-1 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium hover:from-blue-600 hover:to-blue-800 shadow-md shadow-blue-200 transition duration-300"
                >
                    Join Now
                </button>
            </View>
        </View>
    </View>
    </>)
}

const Footer = ({navigateTo, scrollContent}) => {
    //html is alright (only displayed in web, please future self don't do the pain and convert the lists)
    const router = useRouter();

    if (Platform.OS !== 'web') { return null}

    return (
        <>
            <footer className="bg-gray-800 text-gray-300 py-10 px-4 mt-auto">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <div className="h-8 w-8 rounded-full bg-blue-600"></div>
                                <span className="font-bold text-xl text-white">Facelinked</span>
                            </div>
                            <p>Redefining social media through authentic connections and meaningful interactions.</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Features</h3>
                            <ul className="space-y-2">
                                <li><Pressable onPress={() => scrollContent?.current.scrollTo(500,0)} className="hover:text-blue-400">Chat</Pressable></li>
                                <li><Pressable onPress={() => scrollContent?.current.scrollTo(500,0)} className="hover:text-blue-400">Connect</Pressable></li>
                                <li><Pressable onPress={() => scrollContent?.current.scrollTo(500,0)} className="hover:text-blue-400">Share</Pressable></li>
                                <li><Pressable onPress={() => scrollContent?.current.scrollTo(500,0)} className="hover:text-blue-400">Discover</Pressable></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><Pressable onPress={() => router.navigate('/about')} className="hover:text-blue-400">About Us</Pressable></li>
                                <li><Pressable onPress={() => router.navigate('/privacy')} className="hover:text-blue-400">Privacy Policy</Pressable></li>
                                <li><Pressable onPress={() => router.navigate('/terms')} className="hover:text-blue-400">Terms of Service</Pressable></li>
                                <li><a href={"mailto:bretter.schlaue83@icloud.com"} className="hover:text-blue-400">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold text-white mb-4">Join Us</h3>
                            <p className="mb-4">Sign up to get updates and early access.</p>
                            <div className="flex">
                                <input type="email" placeholder="Your email"
                                       className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800"/>
                                <a href={"mailto:bretter.schlaue83@icloud.com"} className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700">
                                    <ChevronRight className="h-5 w-5"/>
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                        <p>&copy; 2025 Facelinked. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    )
}

const LandingPage = ({navigateTo, scrollContent}) => {

    return (
        <MotiView
            from={{ opacity: 0, scale: 1}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'timing',
                duration: 175,
            }}
        >
        <ScrollView className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100" ref={scrollContent}>
            <NavigationBar navigateTo={navigateTo} scrollContent={scrollContent} />

            {Platform.OS !== "web" && (
            <View className="flex-1 items-center justify-center min-h-screen py-16 px-4">
                <View
                        className="relative z-10 backdrop-blur-sm mb-8 bg-white/40 rounded-3xl shadow-xl border border-white/50 p-8 w-full max-w-4xl mx-auto flex-1 flex flex-col justify-between">
                    <View className="flex-1 justify-start mt-32 items-center">
                    <Text style={{fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#1f2937'}}>
                            Welcome to <Text style={{color: '#2563eb'}}>Facelinked</Text>
                    </Text>
                        <Text style={{fontSize: 16, textAlign: 'center', color: '#4b5563', maxWidth: 320, alignSelf: 'center', marginTop: 16}}>
                        A platform designed for authentic connections, real friendships, and meaningful interactions.
                    </Text>
                    </View>

                    <View className="flex flex-col gap-4 items-center w-full mt-auto">
                            <TouchableOpacity activeOpacity={0.7} onPress={() => navigateTo("register")}
                                style={{
                                    backgroundColor: '#3b82f6',
                                    paddingHorizontal: 32,
                                    paddingVertical: 16,
                                    borderRadius: 100,
                                    shadowColor: '#93c5fd',
                                    shadowOffset: {width: 0, height: 4},
                                    shadowOpacity: 0.3,
                                    shadowRadius: 6,
                                    elevation: 4,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%'
                                }}>
                                <Text style={{color: 'white', fontWeight: '500', fontSize: 18, marginRight: 8}}>Join Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => navigateTo("login")}
                                style={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    paddingHorizontal: 32,
                                    paddingVertical: 16,
                                    borderRadius: 100,
                                    borderWidth: 1,
                                    borderColor: '#bfdbfe',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%'
                                }}>
                                <Text style={{color: '#2563eb', fontWeight: '500', fontSize: 18}}>Login</Text>
                            </TouchableOpacity>
                    </View>
                    <View className="mt-8 flex-row items-center justify-center">
                        <View className="h-1 w-1 bg-blue-400 rounded-full mr-1 opacity-70"></View>
                        <View className="h-1 w-1 bg-blue-500 rounded-full mr-1 opacity-80"></View>
                        <View className="h-1 w-1 bg-blue-600 rounded-full opacity-90"></View>
                    </View>
                </View>
            </View>)}

            {Platform.OS === "web" && ( <>
            <View className="relative flex items-center justify-center py-20 px-4">
                <View className="absolute inset-0 z-0">
                    <View
                        className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-300/20 filter blur-3xl"></View>
                    <View
                        className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-400/20 filter blur-3xl"></View>
                </View>

                <View
                    className="relative z-10 backdrop-blur-sm bg-white/40 rounded-3xl shadow-xl border border-white/50 p-14 max-w-4xl mx-auto text-center">
                    <Text className="text-4xl text-center md:text-6xl font-bold text-gray-800 mb-8">
                        Welcome to the <Text
                        className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">new social media.</Text>
                    </Text>
                    <Text className="text-xl text-center text-gray-700 mb-10 max-w-2xl mx-auto">
                        A platform designed for authentic connections, real friendships, and meaningful interactions.
                    </Text>
                    <View className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Pressable onPress={() => navigateTo("register")}
                                className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium text-lg hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-200/50 transition duration-300">
                            Join Now
                        </Pressable>
                        <Pressable onPress={() => navigateTo("login")}
                                className="px-8 py-4 rounded-full backdrop-blur-md bg-white/70 border border-blue-200 text-blue-600 font-medium text-lg hover:bg-white transition duration-300">
                            Login
                        </Pressable>
                    </View>
                </View>
            </View>

            <div className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">What
                        We're About</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Chat Feature */}
                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                                <MessageCircle className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Chat</h3>
                            <p className="text-gray-700">
                                Get to know the people around you better. Start meaningful conversations that
                                matter.
                            </p>
                        </div>

                        {/* Connect Feature */}
                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                                <Users className="h-8 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Connect</h3>
                            <p className="text-gray-700">
                                Connect with others in a meaningful way. We are not about fake profiles, but about real friends.
                            </p>
                        </div>

                        {/* Share Feature */}
                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                            <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                                <Share2 className="h-8 mr-1 w-8 text-white"/>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Share</h3>
                            <p className="text-gray-700">
                                We are not about likes, but about real connections. We are not about fake news, but about real
                                stories.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* How It Works - With Flowing Background */}
            <div className="relative py-20 px-4">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-200/30 filter blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-300/30 filter blur-3xl"></div>
                </div>

                <div className="relative z-10 max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">How
                        It Works</h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                            <div
                                className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">1
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Create Your Profile</h3>
                            <p className="text-gray-700">Show your authentic self with a simple, genuine profile that highlights
                                your real interests.</p>
                        </div>

                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                            <div
                                className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">2
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Connect With People</h3>
                            <p className="text-gray-700">Find friends and meet people near you who share your values and
                                interests.</p>
                        </div>

                        <div
                            className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                            <div
                                className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">3
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-800">Build Real Relationships</h3>
                            <p className="text-gray-700">Enjoy meaningful conversations and experiences that strengthen your
                                connections.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Community Section */}
            <div className="relative py-20 px-4 overflow-hidden">
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-blue-700">
                    <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-white/10 filter blur-3xl"></div>
                </div>

                <div
                    className="relative z-10 backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join Our Growing Community</h2>
                    <p className="text-xl text-white/90 mb-10">
                        Many people are already rediscovering what social media should be about - real people, real
                        connections, and real stories.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <button onClick={() => navigateTo("register")}
                                className="px-8 py-4 rounded-full bg-white text-blue-600 font-medium text-lg hover:bg-blue-50 shadow-lg transition duration-300">
                            Join Now
                        </button>
                        <button onClick={() => navigateTo("login")}
                                className="px-8 py-4 rounded-full bg-transparent border border-white text-white font-medium text-lg hover:bg-white/10 transition duration-300">
                            Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">What
                        Our Users Say</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                            <p className="text-gray-700 mb-6">"I've made more meaningful connections in one month on Facelinked than
                                I did in years on other platforms."</p>
                            <div className="flex items-center">
                                <div
                                    className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-white font-bold">T</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Tom</h4>
                                    <p className="text-gray-500">Member since 2024</p>
                                </div>
                            </div>
                        </div>

                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                            <p className="text-gray-700 mb-6">"Finally, a social network that values quality over quantity. I feel
                                heard and seen on Facelinked."</p>
                            <div className="flex items-center">
                                <div
                                    className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-white font-bold">LM</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Lukas M.</h4>
                                    <p className="text-gray-500">Member since 2025</p>
                                </div>
                            </div>

                        </div>

                        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                            <p className="text-gray-700 mb-12">"Real friends. Real Connections. Real stories."</p>
                            <div className="flex items-center">
                                <div
                                    className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                                    <span className="text-white font-bold">RT</span>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-800">Raphael T.</h4>
                                    <p className="text-gray-500">Member since 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>)}

            <Footer navigateTo={navigateTo} scrollContent={scrollContent} />
        </ScrollView>
        </MotiView>)
}

const AuthPages = ({ navigateTo, currentPage, previousPage, showPassword, setShowPassword}) => {

    if (Platform.OS !== "web") {
        return (
            <MotiView
                from={{ opacity: 0, scale: 1}}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    type: 'timing',
                    duration: 125
                }}
            >
                {currentPage === 'login' ? (
            <LoginPage navigateTo={navigateTo} showPassword={showPassword}
                       setShowPassword={setShowPassword} previousPage={previousPage}/>
        ) : (
            <RegistrationFlow navigateTo={navigateTo} showPassword={showPassword}
                              setShowPassword={setShowPassword} previousPage={previousPage}/>
                )}
            </MotiView>
        );
    }
    return (
        <MotiView
            from={{ opacity: 0, scale: 1}}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'timing',
                duration: 125
            }}
        >
        <ScrollView className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
            <NavigationBar navigateTo={navigateTo} />

            <View className="flex-1 flex justify-center items-center p-4 md:p-8 lg:p-12">
                <View className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between">
                    {/* Left side content for desktop */}
                    <View className="hidden md:block w-full md:w-1/2 pr-8 mb-8 md:mb-0">
                        <Text className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text mb-6">
                            {currentPage === 'login' ? 'Welcome Back to Facelinked' : 'Join the Facelinked Community'} {"\n"}
                        </Text>
                        <Text className="text-lg text-gray-600">
                            {currentPage === 'login'
                                ? 'Connect with friends, colleagues and like-minded professionals. Sign in to continue your journey.'
                                : 'Create your professional identity and build your network. Registration takes just a few minutes.'}
                        </Text>
                        <View className="flex flex-col mt-8 space-y-4">
                            <View className="flex flex-row items-center">
                                <View
                                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <Users className="h-6 w-6 text-blue-600"/>
                                </View>
                                <View>
                                    <Text style={{fontSize: 16}} className="font-semibold text-gray-800">Connect with Others</Text>
                                    <Text style={{fontSize: 15}} className="text-gray-600">Build your professional network</Text>
                                </View>
                            </View>
                            <View className="flex flex-row items-center">
                                <View
                                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <Lock className="text-blue-600"/>
                                </View>
                                <View>
                                    <Text style={{fontSize: 16}} className="font-semibold text-gray-800">Secure & Private</Text>
                                    <Text style={{fontSize: 15}} className="text-gray-600">Your data is always protected</Text>
                                </View>
                            </View>
                            <View className="flex flex-row items-center">
                                <View
                                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <MapPin className="h-6 w-6 text-blue-600"/>
                                </View>
                                <View>
                                    <Text style={{fontSize: 16}} className="font-semibold text-gray-800">Discover Opportunities</Text>
                                    <Text style={{fontSize: 15}} className="text-gray-600">Find events and connections near you</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Right side auth forms */}
                    <View className="w-full md:w-1/2">
                        {currentPage === 'login' ? (
                          <LoginPage navigateTo={navigateTo} showPassword={showPassword}
                                       setShowPassword={setShowPassword} previousPage={previousPage}/>
                        ) : (
                            <RegistrationFlow navigateTo={navigateTo} showPassword={showPassword}
                                              setShowPassword={setShowPassword} previousPage={previousPage}/>
                        )}
                    </View>
                </View>
            </View>

            <View className="hidden md:flex">
                <Footer navigateTo={navigateTo} />
            </View>
        </ScrollView>
        </MotiView>
    );
};

const LoginPage = ({navigateTo, showPassword, setShowPassword, previousPage}) => {

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(true);

    async function loginEmail(){
        if(formData.email.length > 0 && formData.password.length > 0){
            try {
                const response = await fetch(`${ip}/auth/authenticate`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const token = data.token;

                    const profile = await fetch(`${ip}/profile/${data.username}`, {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    });
                    if (profile.ok) {
                        const profileJson = await profile.json();

                        if (rememberMe) {
                            if (Platform.OS === "web") {
                                localStorage.setItem("token", token);
                                localStorage.setItem("username", data.username);
                                localStorage.setItem("profilePicture", profileJson.profilePicturePath);
                                localStorage.setItem("profile", JSON.stringify(profileJson));
                            }
                            else {
                                await SecureStore.setItemAsync("token", token);
                                await SecureStore.setItemAsync("username", data.username);
                                await SecureStore.setItemAsync("profilePicture", profileJson.profilePicturePath);
                                await SecureStore.setItemAsync("profile", JSON.stringify(profileJson));
                            }
                        }
                        router.replace("/");
                    }
                } else {
                    showAlert({
                        title: "Error",
                        message: "Invalid email or password. Please try again.",
                        buttons: [{
                            text: 'OK',
                            onPress: () => {

                            }
                        }],
                    })
                }
            } catch (error) {
                console.error("Error:", error);
            }
        }
        else {
            showAlert({
                title: "Error",
                message: "Invalid email or password. Please try again.",
                buttons: [{
                    text: 'OK',
                    onPress: () => {

                    }
                }],
            })
        }
    }

    const updateFormData = (name, value) => {
        setFormData({
            ...formData,
            [name]: value
        });
    }

    if (Platform.OS === "web") {
        return (
            <View
                className="backdrop-blur-sm bg-white/60 rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 w-full max-w-md mx-auto">
                <View className="mb-8">
                    <TouchableOpacity activeOpacity={0.7}
                                      onPress={() => {
                                          if (previousPage === "register") {
                                              navigateTo("landing");
                                          } else {
                                              navigateTo(previousPage);
                                          }
                                      }}
                                      className="p-2 rounded-full self-start hover:bg-gray-100"
                    >
                        {<X size={20}/>}
                    </TouchableOpacity>
                    <Text
                        className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Welcome
                        Back</Text>
                    <Text className="text-gray-600 text-center mt-2">Sign in to your account</Text>
                </View>

                <View className="space-y-6">
                    <View>
                        <Text htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</Text>
                        <View className="relative">
                            <View
                                className="absolute inset-y-0 left-0 pl-3 flex flex-row items-center pointer-events-none">
                                <Mail size={18} className="text-gray-400"/>
                            </View>
                            <TextInput
                                type="email"
                                name="email"
                                onChangeText={(value) => updateFormData("email", value)}
                                className="pl-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your email"
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>
                    </View>

                    <View>
                        <Text htmlFor="password"
                              className="block text-sm font-medium text-gray-700 mb-1">Password</Text>
                        <View className="relative">
                            <View
                                className="absolute inset-y-0 left-0 pl-3 flex flex-row items-center pointer-events-none">
                                <Lock size={18} className="text-gray-400"/>
                            </View>
                            <TextInput
                                secureTextEntry={!showPassword}
                                onChangeText={(value) => updateFormData("password", value)}
                                className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter your password"
                                placeholderTextColor="#9CA3AF"
                            />
                            <View className="absolute inset-y-0 right-0 pr-3 flex flex-row items-center">
                                <Pressable
                                    type="button"
                                    onPress={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </Pressable>
                            </View>
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-between">
                        <View className="flex flex-row items-center">
                            <Pressable disabled={true}
                                       onPress={() => setRememberMe(prev => !prev)}
                                       className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                            >
                                {rememberMe && (
                                    <View className="h-3 w-3 bg-blue-500 rounded"></View>
                                )}
                            </Pressable>
                            <Text htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </Text>
                        </View>
                        <View className="text-sm">
                            <Link href="mailto:bretter.schlaue83@icloud.com"
                                  className="text-sm font-medium text-blue-500 hover:text-blue-600 active:text-blue-400">
                                Forgot password?
                            </Link>
                        </View>
                    </View>

                    <TouchableOpacity activeOpacity={0.9} onPress={() => loginEmail()}
                                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white text-center bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Sign in
                    </TouchableOpacity>

                    <View className="mt-6">
                        <View className="flex-row items-center">
                            <View className="flex-1 h-px bg-gray-300"/>
                            <Text className="mx-2 text-gray-500 text-sm">Or continue with</Text>
                            <View className="flex-1 h-px bg-gray-300"/>
                        </View>

                        <View className="mt-6 grid grid-cols-2 gap-3">
                            <TouchableOpacity activeOpacity={0.9}
                                              className="py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
                                Google
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.9}
                                              className="py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
                                Apple
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <Text className="mt-8 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <TouchableOpacity activeOpacity={0.8}
                                      onPress={() => navigateTo('register')}
                                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                        Sign up
                    </TouchableOpacity>
                </Text>
            </View>
        );
    } else {
        return <MobileLoginFlow previousPage={previousPage} loginEmail={loginEmail} navigateTo={navigateTo} showPassword={showPassword} setShowPassword={setShowPassword}
                                rememberMe={rememberMe} setRememberMe={setRememberMe} formData={formData} updateFormData={updateFormData} />
    }
};

const RegistrationFlow = ({ navigateTo, showPassword, setShowPassword, previousPage }) => {

    const [step, setStep] = useState(1);
    const [acceptLegals, setAcceptLegals] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [registered, setRegistered] = useState(false);

    const token = useRef("");

    async function Register() {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        const birthDateObj = formData.birthDate;
        const monthIndex = typeof birthDateObj.month === 'string'
            ? ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(birthDateObj.month)
            : birthDateObj.month - 1;
        const birthDate = new Date(birthDateObj.year, monthIndex, birthDateObj.day);

        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();

        if (today.getMonth() < monthIndex || (today.getMonth() === monthIndex && today.getDate() < birthDateObj.day)) {
            age--;
        }

        if (emailRegex.test(formData.email) && formData.password.length > 3 && formData.username.length >= 3 && formData.name.length > 3) {
            if(age <= 13 || formData.interests.length < 3 || formData.location.length <= 3 || !formData.profilePicture) {
                showAlert({
                    title: "Error",
                    message: "Please fill out all fields and comply with the Terms of Service",
                    buttons: [{
                        text: 'OK',
                        onPress: () => {

                        }
                    },],
                })
                jumpToStep(1);
                return;
            }
            setRegistered(true)
            try {
                const response = await fetch(`${ip}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password,
                        username: formData.username,
                        name: formData.name,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    token.current = data.token;
                }
                else {
                    showAlert({
                        title: "Conflict",
                        message: "There is already an account with that email or username.",
                        buttons: [{
                            text: 'OK',
                            onPress: () => {

                            }
                        },],
                    })
                    jumpToStep(1);
                    setRegistered(false);
                }
            }
            catch (error) {
                showAlert({
                    title: "Error",
                    message: "Please try again.",
                    buttons: [{
                        text: 'OK',
                        onPress: () => {

                        }
                    },],
                })
                jumpToStep(1);
                setRegistered(false);
            }
            await CompleteProfile();
        }
        else if(!registered) {
            showAlert({
                title: "Error",
                message: "Please enter a valid email and password",
                buttons: [{
                    text: 'OK',
                    onPress: () => {

                    }
                },],
            })
            jumpToStep(1);
        }
    }

    async function CompleteProfile() {
        const imageUrl = { current: "" };

            try {
                const bucketResponse = await fetch(`${ip}/profile/upload`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token.current}`,
                    }
                });

                if (bucketResponse.ok) {
                    const url = await bucketResponse.text();
                    let image;
                    const manipResult = await ImageManipulator.manipulate(
                        formData.profilePicture).resize({width: 500, height: 500});
                    const renderedImage = await manipResult.renderAsync();
                    const savedImage = await renderedImage.saveAsync({format: SaveFormat.JPEG, compress: 0.7});
                    image = savedImage.uri;

                    const response = await fetch(image);
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
                    showAlert({
                        title: "Error",
                        message: "There was an error uploading the image. Please try again.",
                        buttons: [{
                            text: 'OK',
                            onPress: () => {

                            }
                        },],
                    })
                    return;
                }

                async function requestPermission() {
                    if (Device.isDevice) {
                        const { status: existingStatus } = await Notification.getPermissionsAsync();
                        let finalStatus = existingStatus;

                        if (existingStatus !== 'granted') {
                            const { status } = await Notification.requestPermissionsAsync();
                            finalStatus = status;
                        }

                        if (finalStatus !== 'granted') {
                            showAlert({
                                title: "Permission denied",
                                message: "Notifications are disabled. Enable them in your settings.",
                                buttons: [{
                                    text: 'OK',
                                    onPress: () => {

                                    }
                                },],
                            })
                            return null;
                        }
                        await Notification.getDevicePushTokenAsync().then((token) => {
                            return token;
                        });
                    }
                }

                if (Notification.PermissionStatus.UNDETERMINED && Platform.OS === "ios" && Device.isDevice && await asyncStorage.getItem("deviceToken") === null) {
                    const deviceToken = await requestPermission();
                    if (!deviceToken) {
                        await asyncStorage.setItem("deviceToken", "false");
                    }
                    else {
                        const status = await fetch(`${ip}/messages/setDeviceToken`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${SecureStore.getItem("token")}`
                            },
                            body: JSON.stringify({
                                token: deviceToken
                            })
                        });

                        if (status.ok) {
                            await asyncStorage.setItem("deviceToken", "true");
                        }
                    }
                }

                const response = await fetch(`${ip}/profile/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token.current}`,
                    },
                    body: JSON.stringify({
                        username: formData.username,
                        name: formData.name,
                        profilePicturePath: imageUrl,
                        dateOfBirth: formData.birthDate,
                        hobbies: formData.interests,
                        inRelationship: formData.relationship,
                        location: formData.location,
                    }),
                });

                if (response.ok) {
                    if (Platform.OS === "web") {
                        localStorage.setItem("token", token.current);
                        localStorage.setItem("username", formData.username);
                        localStorage.setItem("profilePicture", imageUrl.current);
                        localStorage.setItem("profile", JSON.stringify({
                            name: formData.name,
                            location: formData.location,
                            score: 0,
                            hobbies: formData.interests,
                            inRelationship: formData.relationship,
                            profilePicturePath: imageUrl.current,
                            dateOfBirth: formData.birthDate,
                        }));
                    } else {
                        await SecureStore.setItemAsync("token", token.current);
                        await SecureStore.setItemAsync("username", formData.username);
                        await SecureStore.setItemAsync("profilePicture", imageUrl.current);
                        await SecureStore.setItemAsync("profile", JSON.stringify({
                            name: formData.name,
                            location: formData.location,
                            score: 0,
                            hobbies: formData.interests,
                            inRelationship: formData.relationship,
                            profilePicturePath: imageUrl.current,
                            dateOfBirth: formData.birthDate,
                        }));
                    }

                    router.replace("/home");
                }
                else {
                    showAlert({
                        title: "Conflict",
                        message: "There is already an account with that email or username.",
                        buttons: [{
                            text: 'OK',
                            onPress: () => {

                            }
                        },],
                    })
                    setRegistered(false);
                    jumpToStep(1);
                }
            }
            catch (error) {
                showAlert({
                    title: "Error",
                    message: "There was an error registering. Please try again",
                    buttons: [{
                        text: 'OK',
                        onPress: () => {

                        }
                    },],
                })
                setRegistered(false)
                jumpToStep(1)
            }
    }

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
            setActiveStep(step + 1);
        } else {
            Register();
        }
    };

    const prevStep = () => {
        if (step > 1) {
            setStep(step - 1);
            setActiveStep(step - 1);
        }
    };

    const jumpToStep = (stepNumber) => {
        if (stepNumber <= activeStep) {
            setStep(stepNumber);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        relationship: null,
        birthDate: { day: 15, month: 'March', year: 2000 },
        location: '',
        interests: '',
        profilePicture: null
    });

    const totalSteps = 5;

    const updateFormData = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    if (Platform.OS === "web") {
        return (
            <View
                className="backdrop-blur-sm bg-white/60 rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 w-full max-w-md mx-auto">
                <View className="flex flex-row items-center mb-6">
                    <TouchableOpacity activeOpacity={0.7}
                                      onPress={() => {
                                          if (step > 1) {
                                              prevStep();
                                          } else {
                                              navigateTo(previousPage);
                                          }
                                      }}
                                      className="p-2 rounded-full hover:bg-gray-100"
                    >
                        {step > 1 ? <ArrowLeft size={20}/> : <X size={20}/>}
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold flex-1 text-center">Create Your Account</Text>
                    <View style={{width: '32px'}}></View>
                </View>

                <View className="mb-8">
                    <View className="hidden md:flex md:flex-row justify-between mb-2">
                        {Array.from({length: totalSteps}).map((_, index) => {
                            const stepNum = index + 1;
                            const isCompleted = stepNum < step;
                            const isActive = stepNum === step;
                            const isPrevious = stepNum < activeStep;

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => jumpToStep(stepNum)}
                                    className={`flex mb-1 flex-col items-center ${isPrevious ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                >
                                    <Text
                                        className={`mb-1 text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                        {['Basic', 'Account', 'About', 'Profile', 'Photo'][index]}
                                    </Text>
                                    <View
                                        className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${isActive
                                            ? 'bg-blue-500 text-white border-2 border-blue-200'
                                            : isCompleted
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200'}`}
                                    >
                                        {isCompleted ? <Check size={16}/> : stepNum}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Mobile step indicators */}
                    <View className="flex flex-row md:hidden justify-between mb-2">
                        {Array.from({length: totalSteps}).map((_, index) => {
                            const stepNum = index + 1;
                            const isCompleted = stepNum < step;
                            const isActive = stepNum === step;

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => jumpToStep(stepNum)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${isActive
                                        ? 'bg-blue-500 text-white border-2 border-blue-200'
                                        : isCompleted
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-200'}`}
                                >
                                    {isCompleted ? <Check size={16}/> : stepNum}
                                </Pressable>
                            );
                        })}
                    </View>

                    <View className="w-full bg-gray-200 h-2 rounded-full">
                        <View
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{width: `${((step - 1) / (totalSteps - 1)) * 100}%`}}
                        />
                    </View>
                </View>

                {/* Step Content */}
                <View className="mb-8">
                    {step === 1 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800">Let's get started</Text>
                            <View className="space-y-4">
                                <View>
                                    <Text htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your
                                        Name</Text>
                                    <TextInput
                                        id="name"
                                        value={formData.name}
                                        onChangeText={(e) => updateFormData('name', e)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter your name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View>
                                    <Text htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Choose
                                        a Username</Text>
                                    <TextInput
                                        id="username"
                                        value={formData.username}
                                        onChangeText={(e) => updateFormData('username', e)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter username"
                                        placeholderTextColor="#9CA3AF"/>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800">Your account details</Text>
                            <View className="space-y-4">
                                <View>
                                    <Text htmlFor="email"
                                          className="block text-sm font-medium text-gray-700 mb-1">Email</Text>
                                    <View className="relative">
                                        <View
                                            className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <Mail size={18} className="text-gray-400"/>
                                        </View>
                                        <TextInput
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChangeText={(e) => updateFormData('email', e)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your email"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                <View>
                                    <Text htmlFor="password"
                                          className="block text-sm font-medium text-gray-700 mb-1">Password</Text>
                                    <View className="relative">
                                        <View
                                            className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <Lock size={18} className="text-gray-400"/>
                                        </View>
                                        <TextInput
                                            secureTextEntry={!showPassword}
                                            id="password"
                                            value={formData.password}
                                            onChangeText={(e) => updateFormData('password', e)}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter your password"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        <View className="absolute inset-y-0 right-0 flex flex-row items-center pr-3">
                                            <Pressable
                                                type="button"
                                                onPress={() => setShowPassword(!showPassword)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                                <View className="mt-6">
                                    <View className="flex-row items-center">
                                        <View className="flex-1 h-px bg-gray-300"/>
                                        <Text className="mx-2 text-gray-500 text-sm">Or continue with</Text>
                                        <View className="flex-1 h-px bg-gray-300"/>
                                    </View>

                                    <View className="mt-6 grid grid-cols-2 gap-3">
                                        <TouchableOpacity activeOpacity={0.8}
                                                          className="py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
                                            Google
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.8}
                                                          className="py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
                                            Apple
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800">Tell us about yourself</Text>
                            <View className="space-y-6">
                                <View>
                                    <Text className="text-lg font-medium text-gray-700 mb-3">Are you in a
                                        relationship?</Text>
                                    <View className="grid grid-cols-2 gap-3">
                                        <Pressable
                                            onPress={() => updateFormData('relationship', true)}
                                            className={`p-3 border rounded-lg flex flex-row justify-center items-center transition-colors ${
                                                formData.relationship === true
                                                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Heart size={18} className="mr-2"/>
                                            Yes
                                        </Pressable>
                                        <Pressable
                                            onPress={() => updateFormData('relationship', false)}
                                            className={`p-3 border rounded-lg flex justify-center items-center transition-colors ${
                                                formData.relationship === false
                                                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            No
                                        </Pressable>
                                    </View>
                                </View>
                                <>
                                    <Text className="text-lg font-medium text-gray-700 mb-3">When were you born?</Text>
                                    <View className="flex flex-row gap-2">
                                        {Platform.OS === 'web' && <>
                                            <select
                                                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                                                value={formData.birthDate.day}
                                                onChange={(e) => updateFormData('birthDate', {
                                                    ...formData.birthDate,
                                                    day: e.target.value
                                                })}
                                            >
                                                {[...Array(31)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                                                value={formData.birthDate.month}
                                                onChange={(e) => updateFormData('birthDate', {
                                                    ...formData.birthDate,
                                                    month: e.target.value
                                                })}
                                            >
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                                    <option key={month} value={month}>{month}</option>
                                                ))}
                                            </select>
                                            <select
                                                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                                                value={formData.birthDate.year}
                                                onChange={(e) => updateFormData('birthDate', {
                                                    ...formData.birthDate,
                                                    year: e.target.value
                                                })}
                                            >
                                                {[...Array(90)].map((_, i) => (
                                                    <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                                                ))}
                                            </select>
                                        </>}
                                        {Platform.OS === 'ios' && <>
                                            <RNDateTimePicker
                                                value={new Date()}
                                                mode="date"
                                                display="spinner"
                                                onChange={(event, selectedDate) => {
                                                    updateFormData('birthDate', {
                                                        day: selectedDate.getDay(),
                                                        month: selectedDate.getMonth(),
                                                        year: selectedDate.getFullYear()
                                                    });
                                                }}
                                            />
                                        </>}
                                        {Platform.OS === 'android' && <>
                                            <RNDateTimePicker
                                                value={new Date()}
                                                mode="date"
                                                display="default"
                                                onChange={(event, selectedDate) => {
                                                    updateFormData('birthDate', {
                                                        day: selectedDate.getDay(),
                                                        month: selectedDate.getMonth(),
                                                        year: selectedDate.getFullYear()
                                                    });
                                                }}
                                            />
                                        </>}
                                    </View>
                                </>
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800">Your profile details</Text>
                            <View className="space-y-4">
                                <View>
                                    <Text htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Where
                                        are you from?</Text>
                                    <View className="relative">
                                        <View
                                            className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <MapPin size={18} className="text-gray-400"/>
                                        </View>
                                        <TextInput
                                            id="location"
                                            value={formData.location}
                                            onChangeText={(e) => updateFormData('location', e)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="You live in"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                <View>
                                    <Text className="block text-sm font-medium mb-1 text-gray-700">What are your hobbies
                                        or interests?</Text>
                                    <TextInput
                                        multiline={true}
                                        numberOfLines={4}
                                        placeholder="football, reading, hiking, cooking..."
                                        placeholderTextColor="#9CA3AF"
                                        onChangeText={(e) => updateFormData('interests', e)}
                                        className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
                                        value={formData.interests}
                                    />
                                    <View className="mt-2 text-xs text-gray-500">
                                        Add multiple interests separated by commas
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 5 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800">Profile Picture</Text>
                            <View className="flex flex-col items-center">
                                <TouchableOpacity activeOpacity={0.7} onPress={async () => {
                                    const result = await ImagePicker.launchImageLibraryAsync({
                                        allowsEditing: true,
                                        aspect: [1, 1],
                                        quality: 0.8,
                                        mediaTypes: "images"
                                    });

                                    if (!result.canceled) {
                                        updateFormData('profilePicture', result.assets[0].uri);
                                    }
                                }}
                                                  className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative">
                                    {formData.profilePicture ? (
                                        <Image source={{uri: formData.profilePicture}} alt="Profile"
                                               className="w-full h-full hover:opacity-65 object-cover"/>
                                    ) : (
                                        <View
                                            className="absolute inset-0 flex border-dashed border-2 hover:opacity-75 border-gray-300 rounded-full items-center justify-center text-gray-400">
                                            <Camera size={48}/>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</Text>
                            </View>
                            <View className="mt-6 pt-6 border-t border-gray-300">
                                <View className="flex flex-row items-center">
                                    <Pressable
                                        onPress={() => setAcceptLegals(prev => !prev)}
                                        className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                                    >
                                        {acceptLegals && (
                                            <View className="h-3 w-3 bg-blue-500 rounded"></View>
                                        )}
                                    </Pressable>
                                    <Text htmlFor="terms" className="ml-2 text-sm text-gray-700">
                                        You are 14 or older and accept the{' '}
                                        <Link target="_blank" href="/privacy" className="text-blue-600 font-medium">
                                            Privacy Policy
                                        </Link>{' '}
                                        &{' '}
                                        <Link target="_blank" href="/terms" className="text-blue-600 font-medium">
                                            Terms and Conditions
                                        </Link>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Navigation Buttons */}
                <View className="flex flex-row justify-between items-center pt-4">
                    {step > 1 ? (
                        <TouchableOpacity activeOpacity={0.85}
                                          onPress={prevStep}
                                          className="px-4 py-2 border border-gray-300 rounded-lg flex flex-row items-center text-gray-600 hover:bg-gray-50"
                        >
                            <ArrowLeft size={16} className="mr-2"/>
                            Back
                        </TouchableOpacity>
                    ) : (
                        <View></View>
                    )}
                    <TouchableOpacity activeOpacity={0.85}
                                      onPress={nextStep}
                                      disabled={(step === 5 && !acceptLegals) || registered}
                                      className={`px-6 py-3 rounded-lg flex flex-row items-center text-white ${
                                          step === 5 && !acceptLegals
                                              ? 'bg-blue-300 cursor-not-allowed'
                                              : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                                      }`}
                    >
                        {step < totalSteps ? (
                            <>
                                Continue <ArrowRight size={16} className="ml-2"/>
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    } else {
        return <MobileRegistrationFlow navigateTo={navigateTo} showPassword={showPassword} setShowPassword={setShowPassword} formData={formData}
                                       previousPage={previousPage} step={step} activeStep={activeStep} jumpToStep={jumpToStep}
                                       acceptLegals={acceptLegals} setAcceptLegals={setAcceptLegals} prevStep={prevStep} nextStep={nextStep} registered={registered} updateFormData={updateFormData} />
    }
};

const MobileLoginFlow = ({navigateTo, previousPage, loginEmail, showPassword, setShowPassword, rememberMe, setRememberMe, formData, updateFormData}) => {

    return (
        <View className="backdrop-blur-sm mt-7 bg-white/60 rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 w-full max-w-md mx-auto">
            <View className="mb-8">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                        if (previousPage === "register") {
                            navigateTo("landing");
                        } else {
                            navigateTo(previousPage);
                        }
                    }}
                    className="p-2 rounded-full self-start hover:bg-gray-100"
                >
                    <X size={20} color="#000000" />
                </TouchableOpacity>
                <Text className="text-3xl text-center font-bold text-blue-600">Welcome Back</Text>
                <Text className="text-gray-600 text-center mt-2">Sign in to your account</Text>
            </View>

            <View className="space-y-6">
                <View className="mb-4">
                    <Text className="block text-sm font-medium text-gray-700 mb-1">Email</Text>
                    <View className="relative">
                        <View className="absolute inset-y-0 left-0 pl-3 flex flex-row items-center pointer-events-none">
                            <Mail size={18} color="#9CA3AF" />
                        </View>
                        <TextInput
                            onChangeText={(value) => updateFormData("email", value)}
                            className="pl-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm"
                            placeholder="Enter your email"
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>
                </View>

                <View className="mb-3">
                    <Text className="block text-sm font-medium text-gray-700 mb-1">Password</Text>
                    <View className="relative">
                        <View className="absolute inset-y-0 left-0 pl-3 flex flex-row items-center pointer-events-none">
                            <Lock size={18} color="#9CA3AF" />
                        </View>
                        <TextInput
                            secureTextEntry={!showPassword}
                            onChangeText={(value) => updateFormData("password", value)}
                            className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 py-3 shadow-sm"
                            placeholder="Enter your password"
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex flex-row items-center"
                        >
                            {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex flex-row items-center justify-between mb-6">
                    <View className="flex flex-row items-center">
                        <Pressable
                            onPress={() => setRememberMe(prev => !prev)}
                            className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                        >
                            {rememberMe && (
                                <View className="h-3 w-3 bg-blue-500 rounded"></View>
                            )}
                        </Pressable>
                        <Text className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </Text>
                    </View>
                    <TouchableOpacity>
                        <Text className="text-sm font-medium text-blue-500">
                            Forgot password?
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={loginEmail}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm bg-blue-600"
                >
                    <Text className="text-white text-center font-medium">Sign in</Text>
                </TouchableOpacity>

                <View className="mt-6">
                    <View className="flex-row items-center">
                        <View className="flex-1 h-px bg-gray-300" />
                        <Text className="mx-2 text-gray-500 text-sm">Or continue with</Text>
                        <View className="flex-1 h-px bg-gray-300" />
                    </View>

                    <View className="mt-6 flex flex-row gap-3">
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center"
                        >
                            <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
                            <Text className="text-gray-700">Google</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={0.9}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center"
                        >
                            <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
                            <Text className="text-gray-700">Apple</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="mt-8">
                <Text className="text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Text
                        onPress={() => navigateTo('register')}
                        className="font-medium text-blue-600"
                    >
                        Sign up
                    </Text>
                </Text>
            </View>
        </View>
    );
}

const MobileRegistrationFlow = ({ navigateTo, showPassword, setShowPassword, previousPage, step, activeStep, acceptLegals, setAcceptLegals, prevStep, nextStep, registered, jumpToStep, updateFormData, formData }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const totalSteps = 5;

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            updateFormData('birthDate', {
                day: selectedDate.getDate(),
                month: monthNames[selectedDate.getMonth()],
                year: selectedDate.getFullYear()
            });
        }
    };

    const renderWebDatePicker = () => (
        <View className="flex flex-row gap-2">
            <select
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                value={formData.birthDate.day}
                onChange={(e) => updateFormData('birthDate', {
                    ...formData.birthDate,
                    day: parseInt(e.target.value)
                })}
            >
                {[...Array(31)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
            </select>
            <select
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                value={formData.birthDate.month}
                onChange={(e) => updateFormData('birthDate', {
                    ...formData.birthDate,
                    month: e.target.value
                })}
            >
                {monthNames.map((month) => (
                    <option key={month} value={month}>{month}</option>
                ))}
            </select>
            <select
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                value={formData.birthDate.year}
                onChange={(e) => updateFormData('birthDate', {
                    ...formData.birthDate,
                    year: parseInt(e.target.value)
                })}
            >
                {[...Array(90)].map((_, i) => (
                    <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                ))}
            </select>
        </View>
    );

    const renderMobileDatePicker = () => {
        const birthDate = new Date(
            formData.birthDate.year,
            monthNames.indexOf(formData.birthDate.month),
            formData.birthDate.day
        );

        return (
            <View>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="p-3 border border-gray-300 rounded-lg flex flex-row justify-center"
                >
                    <Text className="text-gray-700">
                        {formData.birthDate.day} {formData.birthDate.month} {formData.birthDate.year}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <RNDateTimePicker
                        value={birthDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                    />
                )}
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1}} className="mt-7">
            <View className="backdrop-blur-sm bg-white/60 rounded-3xl shadow-xl border border-white/50 p-6 md:p-8 w-full max-w-md mx-auto">
                <View className="flex flex-row items-center mb-6">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => {
                            if (step > 1) {
                                prevStep();
                            } else {
                                navigateTo(previousPage);
                            }
                        }}
                        className="p-2 rounded-full hover:bg-gray-100"
                    >
                        {step > 1 ? <ArrowLeft size={20} color="#000000" /> : <X size={20} color="#000000" />}
                    </TouchableOpacity>
                    <Text className="text-xl font-semibold flex-1 text-center">Create Your Account</Text>
                    <View style={{ width: 32 }}></View>
                </View>

                <View className="mb-8">
                    {/* Progress indicators - web version */}
                    {Platform.OS === 'web' && (
                        <View className="hidden md:flex md:flex-row justify-between mb-2">
                            {Array.from({ length: totalSteps }).map((_, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < step;
                                const isActive = stepNum === step;
                                const isPrevious = stepNum < activeStep;

                                return (
                                    <Pressable
                                        key={index}
                                        onPress={() => jumpToStep(stepNum)}
                                        className={`flex mb-1 flex-col items-center ${isPrevious ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                    >
                                        <Text className={`mb-1 text-xs ${isActive ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                                            {['Basic', 'Account', 'About', 'Profile', 'Photo'][index]}
                                        </Text>
                                        <View
                                            className={`w-8 h-8 rounded-full flex items-center justify-center 
                      ${isActive
                                                ? 'bg-blue-500 text-white border-2 border-blue-200'
                                                : isCompleted
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200'}`}
                                        >
                                            {isCompleted ? <Check size={16} color="#FFFFFF" /> : <Text className={isActive ? "text-white" : "text-gray-700"}>{stepNum}</Text>}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}

                    {/* Progress indicators - mobile version */}
                    <View className={Platform.OS === 'web' ? "flex flex-row md:hidden justify-between mb-2" : "flex flex-row justify-between mb-2"}>
                        {Array.from({ length: totalSteps }).map((_, index) => {
                            const stepNum = index + 1;
                            const isCompleted = stepNum < step;
                            const isActive = stepNum === step;

                            return (
                                <Pressable
                                    key={index}
                                    onPress={() => jumpToStep(stepNum)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center 
                  ${isActive
                                        ? 'bg-blue-500 border-2 border-blue-200'
                                        : isCompleted
                                            ? 'bg-blue-500'
                                            : 'bg-gray-200'}`}
                                >
                                    {isCompleted ?
                                        <Check size={16} color="#FFFFFF" /> :
                                        <Text className={isActive ? "text-white" : "text-gray-700"}>{stepNum}</Text>
                                    }
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Progress bar */}
                    <View className="w-full bg-gray-200 h-2 rounded-full">
                        <View
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
                        />
                    </View>
                </View>

                {/* Step Content */}
                <View className="mb-8">
                    {step === 1 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800 mb-6">Let's get started</Text>
                            <View className="space-y-4">
                                <View className="mb-4">
                                    <Text className="block text-sm font-medium text-gray-700 mb-1">Your Name</Text>
                                    <TextInput
                                        value={formData.name}
                                        onChangeText={(value) => updateFormData('name', value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        placeholder="Enter your name"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                                <View className="mb-4">
                                    <Text className="block text-sm font-medium text-gray-700 mb-1">Choose a Username</Text>
                                    <TextInput
                                        value={formData.username}
                                        onChangeText={(value) => updateFormData('username', value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        placeholder="Enter username"
                                        placeholderTextColor="#9CA3AF"
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800 mb-6">Your account details</Text>
                            <View className="space-y-4">
                                <View className="mb-4">
                                    <Text className="block text-sm font-medium text-gray-700 mb-1">Email</Text>
                                    <View className="relative">
                                        <View className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <Mail size={18} color="#9CA3AF" />
                                        </View>
                                        <TextInput
                                            value={formData.email}
                                            onChangeText={(value) => updateFormData('email', value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                                            placeholder="Enter your email"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                <View className="mb-4">
                                    <Text className="block text-sm font-medium text-gray-700 mb-1">Password</Text>
                                    <View className="relative">
                                        <View className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <Lock size={18} color="#9CA3AF" />
                                        </View>
                                        <TextInput
                                            secureTextEntry={!showPassword}
                                            value={formData.password}
                                            onChangeText={(value) => updateFormData('password', value)}
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                                            placeholder="Enter your password"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 flex flex-row items-center pr-3"
                                        >
                                            {showPassword ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View className="mt-6">
                                    <View className="flex flex-row items-center">
                                        <View className="flex-1 h-px bg-gray-300" />
                                        <Text className="mx-2 text-gray-500 text-sm">Or continue with</Text>
                                        <View className="flex-1 h-px bg-gray-300" />
                                    </View>

                                    <View className="mt-6 flex flex-row gap-3">
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center"
                                        >
                                            <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
                                            <Text className="text-gray-700">Google</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex flex-row items-center justify-center"
                                        >
                                            <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
                                            <Text className="text-gray-700">Apple</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800 mb-6">Tell us about yourself</Text>
                            <View className="space-y-6">
                                <View className="mb-4">
                                    <Text className="text-lg font-medium text-gray-700 mb-3">Are you in a relationship?</Text>
                                    <View className="flex flex-row gap-3">
                                        <Pressable
                                            onPress={() => updateFormData('relationship', true)}
                                            className={`flex-1 p-3 border rounded-lg flex flex-row gap-2 justify-center items-center ${
                                                formData.relationship === true
                                                    ? 'bg-blue-100 border-blue-400'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <Heart size={18} color={formData.relationship === true ? "#3B82F6" : "#6B7280"} className="mr-2" />
                                            <Text className={formData.relationship === true ? "text-blue-700" : "text-gray-700"}>Yes</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => updateFormData('relationship', false)}
                                            className={`flex-1 p-3 border rounded-lg flex flex-row justify-center items-center ${
                                                formData.relationship === false
                                                    ? 'bg-blue-100 border-blue-400'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            <Text className={formData.relationship === false ? "text-blue-700" : "text-gray-700"}>No</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                <View className="mb-4">
                                    <Text className="text-lg font-medium text-gray-700 mb-3">When were you born?</Text>
                                    {Platform.OS === 'web' ? renderWebDatePicker() : renderMobileDatePicker()}
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 4 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800 mb-6">Your profile details</Text>
                            <View className="space-y-4">
                                <View className="mb-4">
                                    <Text className="block text-sm font-medium text-gray-700 mb-1">Where are you from?</Text>
                                    <View className="relative">
                                        <View className="absolute inset-y-0 left-0 flex flex-row items-center pl-3 pointer-events-none">
                                            <MapPin size={18} color="#9CA3AF" />
                                        </View>
                                        <TextInput
                                            value={formData.location}
                                            onChangeText={(value) => updateFormData('location', value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg"
                                            placeholder="You live in"
                                            placeholderTextColor="#9CA3AF"
                                        />
                                    </View>
                                </View>
                                <View>
                                    <Text className="block text-sm font-medium mb-1 text-gray-700">What are your hobbies or interests?</Text>
                                    <TextInput
                                        multiline={true}
                                        numberOfLines={4}
                                        placeholder="football, reading, hiking, cooking..."
                                        placeholderTextColor="#9CA3AF"
                                        onChangeText={(value) => updateFormData('interests', value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg h-24"
                                        textAlignVertical="top"
                                        value={formData.interests}
                                    />
                                    <Text className="mt-2 text-xs text-gray-500">
                                        Add multiple interests separated by commas
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {step === 5 && (
                        <View className="space-y-6">
                            <Text className="text-2xl font-semibold text-gray-800 mb-6">Profile Picture</Text>
                            <View className="flex flex-col items-center">
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={async () => {
                                        const result = await ImagePicker.launchImageLibraryAsync({
                                            allowsEditing: true,
                                            aspect: [1, 1],
                                            quality: 0.8,
                                            mediaTypes: "images"
                                        });

                                        if (!result.canceled) {
                                            updateFormData('profilePicture', result.assets[0].uri);
                                        }
                                    }}
                                    className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative"
                                >
                                    {formData.profilePicture ? (
                                        <Image source={{ uri: formData.profilePicture }} style={{width: "100%", height: "100%"}} className="w-full h-full object-cover" />
                                    ) : (
                                        <View className="absolute inset-0 flex border-dashed border-2 border-gray-300 rounded-full items-center justify-center">
                                            <Camera size={48} color="#9CA3AF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <Text className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</Text>
                            </View>
                            <View className="mt-6 pt-6 border-t border-gray-300">
                                <View className="flex flex-row items-center">
                                    <Pressable
                                        onPress={() => setAcceptLegals(prev => !prev)}
                                        className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                                    >
                                        {acceptLegals && (
                                            <View className="h-3 w-3 bg-blue-500 rounded"></View>
                                        )}
                                    </Pressable>
                                    <Text className="ml-2 text-sm text-gray-700">
                                        You are 14 or older and accept the{' '}
                                        <Text onPress={() => navigateTo('privacy')} className="text-blue-600 font-medium">
                                            Privacy Policy
                                        </Text>{' '}
                                        &{' '}
                                        <Text onPress={() => navigateTo('terms')} className="text-blue-600 font-medium">
                                            Terms and Conditions
                                        </Text>
                                    </Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Navigation Buttons */}
                <View className="flex flex-row justify-between items-center sticky bottom-0 bg-white/95 p-4 border-t border-gray-200">
                    {step > 1 ? (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={prevStep}
                            className="px-4 py-2 border border-gray-300 rounded-lg flex flex-row items-center"
                        >
                            <ArrowLeft size={16} color="#6B7280" className="mr-2" />
                            <Text className="text-gray-600">Back</Text>
                        </TouchableOpacity>
                    ) : (
                        <View></View>
                    )}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={nextStep}
                        disabled={(step === 5 && !acceptLegals) || registered}
                        className={`px-6 py-3 rounded-lg flex flex-row items-center ${
                            step === 5 && !acceptLegals
                                ? 'bg-blue-300'
                                : 'bg-blue-600'
                        }`}
                    >
                        {step < totalSteps ? (
                            <>
                                <Text className="text-white">Continue</Text>
                                <ArrowRight size={16} color="#FFFFFF" className="ml-2" />
                            </>
                        ) : (
                            <Text className="text-white">Create Account</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}

export default Index;