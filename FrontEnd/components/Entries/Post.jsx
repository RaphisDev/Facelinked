import "../../global.css";
import {
    FlatList,
    Linking,
    Modal,
    Platform,
    Pressable,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {Image} from "expo-image";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useRef, useState} from "react";
import * as Haptics from "expo-haptics";
import {useTranslation} from "react-i18next";

export default function Post(props) {
    // Check if we're in desktop mode
    const isDesktop = props.isDesktop || false;
    const username = useRef(Platform.OS === "web" ? localStorage.getItem("username") : SecureStore.getItem("username"));
    const [optionsVisible, setOptionsVisible] = useState(false);

    const isWeb = Platform.OS === 'web';
    const {t} = useTranslation();

    const renderImages = () => {
        if (!props.content || props.content.length === 0) return null;

        if (props.content.length === 1) {
            return (
                <TouchableOpacity 
                    className={`mb-3 rounded-lg overflow-hidden ${isDesktop ? "hover:opacity-95 transition-opacity duration-200" : ""}`}
                    onPress={() => props.onImagePress ? props.onImagePress(props.content[0]) : null}
                    activeOpacity={0.9}
                >
                    <Image 
                        source={{uri: props.content[0]}}
                        style={{
                            width: '100%', 
                            aspectRatio: isDesktop ? 21/9 : 16/9,
                            maxHeight: isDesktop ? 400 : undefined
                        }}
                        contentFit="cover"
                        className="rounded-lg"
                    />
                </TouchableOpacity>
            );
        } else {
            // For multiple images, create a grid layout
            return (
                <View className="mb-3">
                    <FlatList
                        numColumns={props.content.length === 2 ? 2 : props.content.length >= 4 ? 2 : 3}
                        scrollEnabled={false}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item, index}) => (
                            <TouchableOpacity 
                                className={`p-1 ${isDesktop ? "hover:opacity-95 transition-opacity duration-200" : ""}`}
                                style={{
                                    width: props.content.length === 2 ? '50%' : 
                                           props.content.length >= 4 ? '50%' : '33.33%',
                                }}
                                onPress={() => props.onImagePress ? props.onImagePress(item) : null}
                                activeOpacity={0.9}
                            >
                                <View className="rounded-lg overflow-hidden" style={{
                                    aspectRatio: 1,
                                    maxHeight: isDesktop ? 300 : undefined
                                }}>
                                    <Image 
                                        source={{uri: item}}
                                        style={{width: '100%', height: '100%'}}
                                        contentFit="cover"
                                    />
                                    {index === 3 && props.content.length > 4 && (
                                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                                            <Text className={`text-white font-bold ${isDesktop ? "text-2xl" : "text-xl"}`}>
                                                +{props.content.length - 4}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        // Only show first 4 images in grid, with a +X overlay on the 4th if there are more
                        data={props.content.slice(0, Math.min(4, props.content.length))}
                    />
                </View>
            );
        }
    };

    return (
        <View className="w-full">
            <View className={`bg-white ${isDesktop ? "p-5" : "p-4"} rounded-xl`}>
                {/* Post Header */}
                <View className="flex-row items-center mb-3">
                    <View className="flex-1">
                        <Text className={`text-gray-800 font-medium ${isDesktop ? "text-xl" : "text-lg"}`}>
                            {props.title}
                        </Text>
                    </View>

                        <TouchableOpacity onPress={() => setOptionsVisible(prev => !prev)}>
                            <Ionicons name="ellipsis-horizontal" size={isDesktop ? 24 : 20} color="#6B7280" />
                        </TouchableOpacity>
                </View>

                {/* Post Images */}
                {renderImages()}
                <Text className="font-extralight text-right text-sm mb-1.5">{new Date(props.id.millis).toLocaleString(undefined, {hour12: true, hour: '2-digit', minute: '2-digit', year: 'numeric', month: 'short', day: 'numeric'})}</Text>

                {/* Post Actions */}
                <View className={`flex-row justify-between pt-2 border-t border-gray-100 ${isDesktop ? "mt-1" : ""}`}>
                    <TouchableOpacity 
                        className={`flex-row items-center ${isDesktop ? "py-3 px-4" : "py-2 px-3"} rounded-full ${isDesktop ? "hover:bg-gray-100 transition-colors duration-200" : ""}`}
                        activeOpacity={0.7}
                        onPress={async () => {
                            props.onLikePress();
                            if (!props.likes.some(user => user === username.current)) {
                                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }
                        }}
                        onLongPress={props.onLongPressLikes}
                    >
                        <Ionicons name={props.likes.some((item) => item === username.current) ? "heart" : "heart-outline"} size={isDesktop ? 22 : 20} color={props.likes.some((item) => item === username.current) ? "#f81212" : "#6B7280"} />
                        <Text className={`ml-2 text-gray-600 font-medium ${isDesktop ? "text-base" : ""}`}>
                            {props.likes.length > 0 ? props.likes.length : t("like")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className={`flex-row items-center ${isDesktop ? "py-3 px-4" : "py-2 px-3"} rounded-full ${isDesktop ? "hover:bg-gray-100 transition-colors duration-200" : ""}`}
                        activeOpacity={0.7}
                        onPress={async () => {
                            props.onCommentPress();
                            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                        }}
                    >
                        <Ionicons name="chatbubble-outline" size={isDesktop ? 22 : 20} color="#6B7280" />
                        <Text className={`ml-2 text-gray-600 font-medium ${isDesktop ? "text-base" : ""}`}>
                            {props.comments.length > 0 ? props.comments.length : t("to.comment")}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => Share.share({
                            title: "Check out this post!",
                            message: `https://facelinked.com/${props.username === undefined ? Platform.OS === "web" ? localStorage.getItem("username") : SecureStore.getItem("username") : props.username}?post=${encodeURIComponent(props.id.millis)}`,
                            dialogTitle: "Check out this post!",
                            text: "Check out this post!"
                        })}
                        className={`flex-row items-center ${isDesktop ? "py-3 px-4" : "py-2 px-3"} rounded-full ${isDesktop ? "hover:bg-gray-100 transition-colors duration-200" : ""}`}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-outline" size={isDesktop ? 22 : 20} color="#6B7280" />
                        <Text className={`ml-2 text-gray-600 font-medium ${isDesktop ? "text-base" : ""}`}>
                            {t("share")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={optionsVisible}
                onRequestClose={() => setOptionsVisible(false)}
            >
                <Pressable
                    style={styles.optionsModalOverlay}
                    onPress={(event) => {
                        if (event.target === event.currentTarget) {
                            setOptionsVisible(false);
                        }
                    }}
                >
                    <View style={[
                        styles.optionsContainer,
                        isWeb && styles.optionsContainerWeb
                    ]}>
                        <View style={styles.optionsHeader}>
                            <View style={styles.optionsHandleBar} />
                            <Text style={styles.optionsTitle}>{t("post.options")}</Text>
                        </View>

                        {props.username === username.current && (
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={async () => {
                                props.onDeletePost();
                                setOptionsVisible(false);
                            }}
                        >
                            <Ionicons name="trash" size={22} color="#EF4444" />
                            <Text style={[styles.optionText]}>{t("delete.post")}</Text>
                        </TouchableOpacity>)}

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={async () => {
                                const mailUrl = `mailto:support@facelinked.com?subject=${encodeURIComponent("Report Post")}&body=${encodeURIComponent(`I would like to report the post with the id ${props.id.millis} because it violates...`)}`
                                await Linking.openURL(mailUrl);
                                setOptionsVisible(false);
                            }}
                        >
                            <Ionicons name="mail" size={22} color="#EF4444" />
                            <Text style={[styles.optionText]}>{t("report.post")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.optionButton, styles.cancelButton]}
                            onPress={() => setOptionsVisible(false)}
                        >
                            <Ionicons name="close-outline" size={22} color="#EF4444" />
                            <Text style={[styles.optionText, styles.cancelText]}>{t("cancel")}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    optionsModalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    optionsContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingTop: 8,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    optionsContainerWeb: {
        width: '400px',
        alignSelf: 'center',
        marginBottom: 40,
        borderRadius: 24,
    },
    optionsHeader: {
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 8,
    },
    optionsHandleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#CBD5E1',
        borderRadius: 3,
        marginBottom: 12,
    },
    optionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#334155',
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginVertical: 4,
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    optionText: {
        marginLeft: 15,
        fontSize: 16,
        color: '#334155',
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        marginTop: 8,
    },
    cancelText: {
        color: '#EF4444',
    }
})
