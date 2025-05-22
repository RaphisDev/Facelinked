import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import "../../global.css"
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";

export default function Network(props) {
    const router = useRouter();

    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={styles.container} 
            onPress={() => router.navigate(`/networks/${props.id}`)}
        >
            <View style={styles.card}>
                <View style={styles.imageContainer}>
                    {props.networkPicturePath ? (
                        <Image 
                            style={styles.image} 
                            source={{uri: props.networkPicturePath}}
                            contentFit="cover"
                            transition={150}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="people" size={24} color="#94A3B8" />
                        </View>
                    )}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.title} numberOfLines={1}>{props.network}</Text>
                        {props.isPrivate && (
                            <Ionicons name="lock-closed" size={16} color="#64748B" style={styles.lockIcon} />
                        )}
                    </View>

                    <Text style={styles.description} numberOfLines={2}>{props.description}</Text>

                    <View style={styles.footer}>
                        {props.creator ? (
                            <View style={styles.creatorContainer}>
                                <Ionicons name="person" size={14} color="#64748B" />
                                <Text style={styles.creatorText}>Created by {props.creator}</Text>
                            </View>
                        ) : (
                            <View style={styles.statsContainer}>
                                <Ionicons name="heart" size={14} color="#F43F5E" />
                                <Text style={styles.statsText}>{props.member}</Text>
                                <Ionicons name="people" size={14} color="#64748B" style={styles.peopleIcon} />
                                <Text style={styles.statsText}>Members</Text>
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        marginRight: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        flex: 1,
    },
    lockIcon: {
        marginLeft: 6,
    },
    description: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 8,
        lineHeight: 18,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    creatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    creatorText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        fontSize: 12,
        color: '#64748B',
        marginLeft: 4,
    },
    peopleIcon: {
        marginLeft: 8,
    }
});
