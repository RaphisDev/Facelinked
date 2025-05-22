import "../../global.css"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";

export default function NetworkMessage(props) {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

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
        <View style={styles.container}>
            <View style={styles.messageContainer}>
                <TouchableOpacity 
                    activeOpacity={0.7} 
                    onPress={() => router.navigate(`/${props.sender}`)} 
                    style={styles.senderContainer}
                >
                    <View style={styles.avatarContainer}>
                        {!imageError ? (
                            <Image 
                                source={{uri: props.senderProfilePicturePath}} 
                                style={styles.avatar}
                                contentFit="cover"
                                transition={150}
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <View style={[styles.avatar, styles.avatarFallback]}>
                                <Text style={styles.avatarFallbackText}>
                                    {props.sender.charAt(0).toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={styles.senderName}>{props.sender}</Text>
                </TouchableOpacity>

                <View style={styles.contentContainer}>
                    <Text style={styles.messageText}>{props.content}</Text>
                </View>

                <View style={styles.timestampContainer}>
                    <Text style={styles.timestamp}>{formatTime(props.timestamp)}</Text>
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
    senderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        overflow: 'hidden',
        marginRight: 8,
        backgroundColor: '#F1F5F9',
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
    avatarFallbackText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    senderName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    contentContainer: {
        marginBottom: 8,
    },
    messageText: {
        fontSize: 16,
        color: '#334155',
        lineHeight: 22,
    },
    timestampContainer: {
        alignItems: 'flex-end',
    },
    timestamp: {
        fontSize: 12,
        color: '#94A3B8',
    }
});
