import { View, Text, TouchableOpacity, Modal, Pressable, Alert, Platform, Share, StyleSheet, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import "../../global.css";
import {useTranslation} from "react-i18next";

export default function MessageEntry({ message }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState({});

  // Animation for new message appearance
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const {t} = useTranslation();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const isSender = message.isSender;
  message.timestamp = message.millis;

  // Get images from message if they exist
  const images = message.images || [];
  const hasImages = images.length > 0;
  const hasText = message.content && message.content.trim().length > 0;

  // Determine if message was sent recently (within last minute)
  const isRecent = Date.now() - message.timestamp < 60000;

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

  const isWeb = Platform.OS === 'web';

  const handleSaveImage = async () => {
    try {
      if (isWeb) {
        // Desktop-specific image download logic
        const link = document.createElement('a');
        link.href = selectedImage;
        link.download = `facelinked_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Mobile-specific logic
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
              <Ionicons name="image" size={24} color={isSender ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"} />
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
                  <Ionicons name="image" size={16} color={isSender ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)"} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };

  // Calculate border radius based on message position
  const getBubbleStyle = () => {
    return {
      backgroundColor: isSender ? "#3B82F6" : "#E5E7EB",
      borderTopLeftRadius: isSender ? 18 : 4,
      borderTopRightRadius: isSender ? 4 : 18,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
      padding: hasImages && !hasText ? 4 : 12,
      paddingBottom: hasText ? 8 : 4,
      maxWidth: '85%',
      ...(!hasImages && { minWidth: 80 })
    };
  };

  return (
    <Animated.View
      style={[
        styles.messageContainer,
        {
          alignItems: isSender ? 'flex-end' : 'flex-start',
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <View style={getBubbleStyle()}>
        {hasImages && renderImages()}

        {hasText && (
          <Text
            style={{
              color: isSender ? "#FFFFFF" : "#1F2937",
              fontSize: 16,
              lineHeight: 22,
              marginTop: hasImages ? 8 : 0,
              paddingHorizontal: hasImages ? 8 : 0
            }}
          >
            {message.content}
          </Text>
        )}

        <View style={styles.messageFooter}>
          <Text
            style={{
              color: isSender ? "rgba(255,255,255,0.7)" : "rgba(31,41,55,0.5)",
              fontSize: 11,
              marginRight: isSender && !message.isOptimistic ? 4 : 0
            }}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </Text>

          {isSender && (
            <View style={{ flexDirection: 'row' }}>
              {message.isOptimistic ? (
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.7)" />
              ) : (
                <Ionicons
                  name="checkmark-done"
                  size={12}
                  color="rgba(255,255,255,0.7)"
                />
              )}
            </View>
          )}
        </View>
      </View>

      {/* Full screen image modal */}
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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginVertical: 2,
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
