import "../../global.css"
import {Alert, Modal, Platform, Pressable, Share, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useTranslation} from "react-i18next";

export default function NetworkMessage(props) {
    const router = useRouter();
    const [imageError, setImageError] = useState(false);
    const isDesktop = props.isDesktop;
    const [selectedImage, setSelectedImage] = useState(null);
    const [optionsVisible, setOptionsVisible] = useState(false);
    const [imageLoaded, setImageLoaded] = useState({});
    const [modalVisible, setModalVisible] = useState(false);

    const {t} = useTranslation();
    const isWeb = Platform.OS === 'web';

    const images = props.images || [];
    const hasImages = images.length > 0;
    const hasText = props.content && props.content.trim().length > 0;

    const handleImageLoaded = (index) => {
        setImageLoaded(prev => ({ ...prev, [index]: true }));
    };

    const handleImageLongPress = (image) => {
        setSelectedImage(image);
        setOptionsVisible(true);
    };

    const handleImagePress = (image) => {
        setSelectedImage(image);
        setModalVisible(true);
    };

    const handleSaveImage = async () => {
        try {
            if (isWeb) {
                const link = document.createElement('a');
                link.href = selectedImage;
                link.download = `facelinked_${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const {status} = await MediaLibrary.requestPermissionsAsync();

                if (status !== 'granted') {
                    Alert.alert(
                        "Permission Required",
                        "Please grant permission to save images to your device."
                    );
                    return;
                }
                const filename = `facelinked_${Date.now()}.jpg`;
                const fileUri = FileSystem.documentDirectory + filename;
                await FileSystem.downloadAsync(selectedImage, fileUri);

                await MediaLibrary.saveToLibraryAsync(fileUri);
                await FileSystem.deleteAsync(fileUri);
            }
        } catch (error) {
            console.error("Error saving image:", error);
            Alert.alert("Error", "Failed to save image");
        } finally {
            setOptionsVisible(false);
        }
    };

    const renderImages = () => {
        if (images.length === 1) {
            return (
                <TouchableOpacity
                    onPress={() => handleImagePress(images[0])}
                    onLongPress={() => handleImageLongPress(images[0])}
                    delayLongPress={500}
                    activeOpacity={0.8}
                    style={styles.singleImageContainer}
                >
                    <Image
                        source={{ uri: images[0] }}
                        style={styles.singleImage}
                        contentFit="cover"
                        transition={200}
                        onLoad={() => handleImageLoaded(0)}
                    />
                    {!imageLoaded[0] && (
                        <View style={styles.imageLoading}>
                            <Ionicons name="image" size={24} color={"rgba(255,255,255,0.5)"} />
                        </View>
                    )}
                </TouchableOpacity>
            );
        } else if (images.length > 1) {
            return (
                <View style={styles.multipleImagesContainer}>
                    {images.map((image, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.gridImageContainer,
                                {
                                    width: images.length === 2 ? '49.5%' : '33%',
                                    marginRight: (images.length === 2 && index === 0) ||
                                    (images.length >= 3 && index % 3 !== 2) ? '1%' : 0,
                                    marginBottom: images.length > 3 && index < images.length - 3 ? 4 : 0
                                }
                            ]}
                            onPress={() => handleImagePress(image)}
                            onLongPress={() => handleImageLongPress(image)}
                            delayLongPress={500}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{ uri: image }}
                                style={styles.gridImage}
                                contentFit="cover"
                                transition={200}
                                onLoad={() => handleImageLoaded(index)}
                            />
                            {!imageLoaded[index] && (
                                <View style={styles.imageLoading}>
                                    <Ionicons name="image" size={16} color={"rgba(255,255,255,0.5)"} />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            );
        }
        return null;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = new Date(timestamp);
        const now = new Date();

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

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
                    {hasImages && renderImages()}

                    {hasText && (
                    <Text style={[
                        styles.messageText,
                        isDesktop && styles.desktopMessageText
                    ]}>{props.content}</Text>)}
                </View>

                <View style={styles.timestampContainer}>
                    <Text style={[
                        styles.timestamp,
                        isDesktop && styles.desktopTimestamp
                    ]}>{formatTime(props.timestamp)}</Text>
                </View>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.imageModalContainer}
                >
                    <Image
                        source={{ uri: selectedImage }}
                        style={styles.fullScreenImage}
                        contentFit="contain"
                        transition={300}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.downloadButton}
                        onPress={handleSaveImage}
                    >
                        <Ionicons name="download-outline" size={24} color="white" />
                    </TouchableOpacity>
                </Pressable>
            </Modal>

            {/* Image options modal */}
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
                            <Text style={styles.optionsTitle}>{t("image.options")}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={handleSaveImage}
                        >
                            <Ionicons name="download-outline" size={22} color="#3B82F6" />
                            <Text style={styles.optionText}>{t("save.to.device")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={async () => {
                                if (isWeb) {
                                    await navigator.clipboard.writeText(selectedImage);
                                } else {
                                    await Share.share({
                                        url: selectedImage,
                                        title: 'Share Image'
                                    });
                                }
                                setOptionsVisible(false);
                            }}
                        >
                            <Ionicons name={isWeb ? "copy-outline" : "share-outline"} size={22} color="#3B82F6" />
                            <Text style={styles.optionText}>{isWeb ? "Copy Link" : t("share")}</Text>
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
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
        paddingRight: 4,
    },
    singleImageContainer: {
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
        marginBottom: 9
    },
    singleImage: {
        width: '100%',
        aspectRatio: 1.5,
        maxHeight: 220,
    },
    multipleImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        borderRadius: 16,
        overflow: 'hidden',
        width: '100%',
    },
    gridImageContainer: {
        aspectRatio: 1,
        overflow: 'hidden',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        borderRadius: 4,
    },
    imageLoading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    imageModalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 22,
        padding: 10,
        zIndex: 10,
    },
    downloadButton: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 22,
        padding: 10,
        zIndex: 10,
    },
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
});
