import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import "../../global.css"
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";

export default function Network(props) {
    const router = useRouter();
    const isDesktop = props.isDesktop;

    return (
        <TouchableOpacity 
            activeOpacity={0.7} 
            style={[
                styles.container,
                isDesktop && styles.desktopContainer
            ]} 
            onPress={() => router.navigate(`/networks/${props.id}`)}
        >
            <View style={[
                styles.card,
                isDesktop && styles.desktopCard
            ]}>
                <View style={[
                    styles.imageContainer,
                    isDesktop && styles.desktopImageContainer
                ]}>
                    {props.networkPicturePath ? (
                        <Image 
                            style={styles.image} 
                            source={{uri: props.networkPicturePath}}
                            contentFit="cover"
                            transition={150}
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="people" size={isDesktop ? 32 : 24} color="#94A3B8" />
                        </View>
                    )}
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={[
                            styles.title,
                            isDesktop && styles.desktopTitle
                        ]} numberOfLines={1}>{props.network}</Text>
                        {props.isPrivate && (
                            <Ionicons name="lock-closed" size={isDesktop ? 20 : 16} color="#64748B" style={styles.lockIcon} />
                        )}
                    </View>

                    <Text style={[
                        styles.description,
                        isDesktop && styles.desktopDescription
                    ]} numberOfLines={isDesktop ? 3 : 2}>{props.description}</Text>

                    <View style={styles.footer}>
                        {props.creator ? (
                            <View style={styles.creatorContainer}>
                                <Ionicons name="person" size={isDesktop ? 16 : 14} color="#64748B" />
                                <Text style={[
                                    styles.creatorText,
                                    isDesktop && styles.desktopFooterText
                                ]}>Created by {props.creator}</Text>
                            </View>
                        ) : (
                            <View style={styles.statsContainer}>
                                <Ionicons name="heart" size={isDesktop ? 16 : 14} color="#F43F5E" />
                                <Text style={[
                                    styles.statsText,
                                    isDesktop && styles.desktopFooterText
                                ]}>{props.favoriteMembers?.length}</Text>
                                {(props.member && props.member.length > 0) && ( <>
                                <Ionicons name="people" size={isDesktop ? 16 : 14} color="#64748B" style={styles.peopleIcon} />
                                <Text style={[
                                    styles.statsText,
                                    isDesktop && styles.desktopFooterText
                                ]}>{props.member.length} Members</Text></>)}
                            </View>
                        )}
                        <Ionicons name="chevron-forward" size={isDesktop ? 20 : 16} color="#94A3B8" />
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
    desktopContainer: {
        marginHorizontal: 20,
        marginBottom: 16,
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
    desktopCard: {
        padding: 16,
        borderRadius: 20,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        marginRight: 12,
    },
    desktopImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 16,
        marginRight: 16,
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
    desktopTitle: {
        fontSize: 18,
        fontWeight: '700',
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
    desktopDescription: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 12,
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
    desktopFooterText: {
        fontSize: 14,
        marginLeft: 6,
    },
    peopleIcon: {
        marginLeft: 8,
    }
});
