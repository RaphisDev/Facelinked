import "../../global.css"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function NetworkMessage(props) {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const isDesktop = props.isDesktop;

    // Format timestamp to show only time if it's today
    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();

        // Check if it's today
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        // Return formatted date and time
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <View style={[
            styles.container,
            isDesktop && styles.desktopContainer
        ]}>
            <View style={[
                styles.messageContainer,
                isDesktop && styles.desktopMessageContainer
            ]}>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => router.navigate(`/${props.sender}`)} 
                    style={[
                        styles.senderContainer,
                        isDesktop && styles.desktopSenderContainer
                    ]}
                >
                    <View style={[
                        styles.avatarContainer,
                        isDesktop && styles.desktopAvatarContainer
                    ]}>
                        {!imageError ? (
                            <Image 
                                source={{uri: props.senderProfilePicturePath}} 
                                style={styles.avatar}
                                contentFit="cover"
                                transition={150}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <View style={[
                                styles.avatar, 
                                styles.avatarFallback,
                                isDesktop && styles.desktopAvatarFallback
                            ]}>
                                <Text style={[
                                    styles.avatarFallbackText,
                                    isDesktop && styles.desktopAvatarFallbackText
                                ]}>
                                    {props.sender.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[
                        styles.senderName,
                        isDesktop && styles.desktopSenderName
                    ]}>{props.sender}</Text>
                </TouchableOpacity>

                <View style={[
                    styles.contentContainer,
                    isDesktop && styles.desktopContentContainer
                ]}>
                    <Text style={[
                        styles.messageText,
                        isDesktop && styles.desktopMessageText
                    ]}>{props.content}</Text>
                </View>

                <View style={styles.timestampContainer}>
                    <Text style={[
                        styles.timestamp,
                        isDesktop && styles.desktopTimestamp
                    ]}>{formatTime(props.timestamp)}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    desktopContainer: {
        paddingHorizontal: 24,
        marginBottom: 16,
        maxWidth: '80%',
        alignSelf: 'center',
    },
    messageContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    desktopMessageContainer: {
        borderRadius: 20,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 5,
    },
    senderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    desktopSenderContainer: {
        marginBottom: 12,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 8,
        backgroundColor: '#F1F5F9',
    },
    desktopAvatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
    },
    desktopAvatarFallback: {
        backgroundColor: '#2563EB',
    },
    avatarFallbackText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    desktopAvatarFallbackText: {
        fontSize: 18,
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    desktopSenderName: {
        fontSize: 16,
    },
    contentContainer: {
        marginBottom: 8,
    },
    desktopContentContainer: {
        marginBottom: 12,
    },
    messageText: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 22,
    },
    desktopMessageText: {
        fontSize: 17,
        lineHeight: 24,
    },
    timestampContainer: {
        alignItems: 'flex-end',
    },
    timestamp: {
        fontSize: 12,
        color: '#94A3B8',
    },
    desktopTimestamp: {
        fontSize: 13,
    }
});
