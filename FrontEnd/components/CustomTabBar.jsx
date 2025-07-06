// components/CustomTabBar.js
import React, {useRef, useState} from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEmbeddedState } from "./EmbeddedStateManager";
import {useTranslation} from "react-i18next";
import StateManager from "./StateManager";

const MOBILE_WIDTH_THRESHOLD = 768;
const SIDEBAR_WIDTH = 220;

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const windowWidth = Dimensions.get('window').width;
    const isDesktop = windowWidth > MOBILE_WIDTH_THRESHOLD;
    const pathname = usePathname();
    const router = useRouter();
    const embedded = useEmbeddedState();
    const [visible, setCurrentVisible] = useState(true);
    new StateManager().tabBarChanged.addListener("tabBarChanged", (newState) => {
        setCurrentVisible(newState);
    })
    const {t} = useTranslation();

    // Define tab routes and their icons
    const tabRoutes = [
        { name: 'home', label: t("home"), iconFocused: 'home-sharp', iconUnfocused: 'home-outline' },
        { name: 'networks', label: t("networks"), iconFocused: 'git-merge-sharp', iconUnfocused: 'git-merge-outline' },
        { name: 'chats', label: t("chats"), iconFocused: 'chatbubbles-sharp', iconUnfocused: 'chatbubbles-outline' },
        { name: 'profile', label: t("profile"), iconFocused: 'person-sharp', iconUnfocused: 'person-outline' }
    ];

    const renderTab = (route, index) => {
        let isActive = pathname.startsWith(`/${route.name}`);
        if (route.name === 'profile') {
            isActive = !pathname.includes("settings") && !pathname.startsWith("/home") && !pathname.startsWith("/networks") && !pathname.startsWith("/chats");
        }

        const onPress = () => {
            if (route.name === 'home') {
                if (pathname === '/home') {
                    new StateManager().setHomePressed();
                }
            } else if (route.name === 'chats') {
                new StateManager().setChatState(true);
            }
            if(pathname === "/profile" && route.name === "profile") {
                return;
            }
            if (pathname === "/chats" && route.name === "chats") {
                return;
            }
            if (pathname === "/networks" && route.name === "networks") {
                return;
            }
            if (route.name === "profile" && (pathname.startsWith("/networks") || pathname.startsWith("/chats") || pathname.startsWith("/home"))) {
                const currentUsername = new StateManager().getCurrentUsername();
                router.push(`/${currentUsername}`);
                return;
            }
            router.push(`/${route.name}`);
        };

        return (
            <TouchableOpacity
                key={route.name}
                accessibilityRole="button"
                accessibilityState={isActive ? { selected: true } : {}}
                onPress={onPress}
                style={[
                    isDesktop ? styles.sidebarTab : styles.bottomTab,
                    isActive && (isDesktop ? styles.sidebarTabActive : styles.bottomTabActive)
                ]}
            >
                <Ionicons
                    name={isActive ? route.iconFocused : route.iconUnfocused}
                    size={24}
                    color={isActive ? '#3182CE' : '#718096'}
                />
                <Text style={[
                    isDesktop ? styles.sidebarLabel : styles.bottomLabel,
                    { color: isActive ? '#3182CE' : '#718096' }
                ]}>
                    {route.label}
                </Text>
            </TouchableOpacity>
        );
    };

    if (isDesktop) {
        // Render sidebar for desktop
        if (embedded) {
            return null;
        }
        return (
            <View style={[
                styles.sidebarContainer,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    position: 'absolute',
                    left: -SIDEBAR_WIDTH,
                    top: 0,
                    bottom: 0,
                    width: SIDEBAR_WIDTH
                }
            ]}>
                <View style={styles.sidebarContent}>
                    {tabRoutes.map((route, index) => renderTab(route, index))}
                </View>
            </View>
        );
    }

    if (tabRoutes.some(route => pathname.startsWith("/" + route.name + "/"))) {
        return null
    }
    if (!visible) {
        return null;
    }

    // Render bottom tab bar for mobile
    return (
        <View style={[
            styles.bottomContainer,
            { paddingBottom: insets.bottom - 20 }
        ]}>
            <View style={styles.bottomContent}>
                {tabRoutes.map((route, index) => renderTab(route, index))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    // Mobile bottom tab bar styles
    bottomContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        alignItems: 'center',
        zIndex: 1000,
    },
    bottomContent: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        width: '100%',
        justifyContent: 'space-around',
    },
    bottomTab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 16,
    },
    bottomTabActive: {
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
    },
    bottomLabel: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },

    // Desktop sidebar styles
    sidebarContainer: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 1000,
    },
    sidebarContent: {
        flex: 1,
        paddingTop: 40,
        paddingHorizontal: 15,
    },
    sidebarTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 8,
        borderRadius: 12,
    },
    sidebarTabActive: {
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
    },
    sidebarLabel: {
        marginLeft: 16,
        fontSize: 15,
        fontWeight: '500',
    },
});

export default CustomTabBar;
