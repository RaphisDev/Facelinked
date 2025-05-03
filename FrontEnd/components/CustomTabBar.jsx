// components/CustomTabBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { useEmbeddedState } from "./EmbeddedStateManager";

const MOBILE_WIDTH_THRESHOLD = 768;
const SIDEBAR_WIDTH = 220;

const CustomTabBar = ({ state, descriptors, navigation }) => {
    const insets = useSafeAreaInsets();
    const windowWidth = Dimensions.get('window').width;
    const isDesktop = windowWidth > MOBILE_WIDTH_THRESHOLD;
    const pathname = usePathname();
    const router = useRouter();
    const embedded = useEmbeddedState();

    // Define tab routes and their icons
    const tabRoutes = [
        { name: 'home', label: 'Home', iconFocused: 'home-sharp', iconUnfocused: 'home-outline' },
        { name: 'networks', label: 'Networks', iconFocused: 'git-merge-sharp', iconUnfocused: 'git-merge-outline' },
        { name: 'chats', label: 'Chats', iconFocused: 'chatbubbles-sharp', iconUnfocused: 'chatbubbles-outline' },
        { name: 'profile', label: 'Profile', iconFocused: 'person-sharp', iconUnfocused: 'person-outline' }
    ];

    const renderTab = (route, index) => {
        let isActive = pathname.startsWith(`/${route.name}`);
        if (route.name === 'profile') {
            isActive = !pathname.includes("settings") && !pathname.startsWith("/home") && !pathname.startsWith("/networks") && !pathname.startsWith("/chats");
        }

        const onPress = () => {
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
                { paddingTop: insets.top, paddingBottom: insets.bottom }
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
        position: 'fixed', // Use fixed instead of absolute for web
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
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
