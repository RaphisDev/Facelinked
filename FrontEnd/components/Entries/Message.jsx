import { View, Text, TouchableOpacity, Modal, Pressable, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import "../../global.css";

export default function MessageEntry({ message }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [optionsVisible, setOptionsVisible] = useState(false);

  const isSender = message.isSender;
  message.timestamp = message.millis;
  
  // Get images from message if they exist
  const images = message.images || [];
  const hasImages = images.length > 0;
  
  const handleImageLongPress = (image) => {
    setSelectedImage(image);
    setOptionsVisible(true);
  };
  
  const handleImagePress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };
  
  const renderImages = () => {
    if (images.length === 1) {
      return (
        <TouchableOpacity
          onPress={() => handleImagePress(images[0])}
          onLongPress={() => handleImageLongPress(images[0])}
          delayLongPress={500}
        >
          <Image
            source={{ uri: images[0] }}
            style={{ 
              width: '100%', 
              aspectRatio: 1.5, 
              maxHeight: 250, 
              borderRadius: 12, 
              marginBottom: 8 
            }}
            contentFit="cover"
          />
        </TouchableOpacity>
      );
    } else if (images.length > 1) {
      return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {images.map((image, index) => (
            <TouchableOpacity
              key={index}
              style={{ 
                width: images.length === 2 ? '50%' : '33.33%', 
                padding: 2,
                aspectRatio: 1
              }}
              onPress={() => handleImagePress(image)}
              onLongPress={() => handleImageLongPress(image)}
              delayLongPress={500}
            >
              <Image
                source={{ uri: image }}
                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return null;
  };
  
  return (
    <View className={`p-2 ${isSender ? 'items-end' : 'items-start'}`}>
      <View 
        className="rounded-xl p-3 max-w-[80%]" 
        style={{ backgroundColor: isSender ? "#3B82F6" : "#E5E7EB" }}
      >
        {hasImages && renderImages()}
        
        {message.content && (
          <Text 
            style={{ color: isSender ? "#FFFFFF" : "#1F2937" }} 
            className="text-base"
          >
            {message.content}
          </Text>
        )}

        <Text
          style={{ color: isSender ? "rgba(255,255,255,0.7)" : "rgba(31,41,55,0.7)" }}
          className="text-xs mt-1 text-right"
        >
          {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </Text>
      </View>

      {/* Full screen image modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' }} 
          onPress={() => setModalVisible(false)}
        >
          <Image
            source={{ uri: selectedImage }}
            style={{ width: '100%', height: '80%' }}
            contentFit="contain"
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 40,
              right: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 20,
              padding: 8
            }}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="white" />
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
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0)' }}
          onPress={() => setOptionsVisible(false)}
        >
          <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}
                onPress={async () => {
                try {
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

                } catch (error) {
                }
                finally {
                    setOptionsVisible(false);
                }
            }}
            >
              <Ionicons name="download-outline" size={24} color="#3B82F6" />
              <Text style={{ marginLeft: 15, fontSize: 16 }}>Save Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}
              onPress={() => {
                // Share image logic would go here
                setOptionsVisible(false);
              }}
            >
              <Ionicons name="share-outline" size={24} color="#3B82F6" />
              <Text style={{ marginLeft: 15, fontSize: 16 }}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}
              onPress={() => setOptionsVisible(false)}
            >
              <Ionicons name="close-outline" size={24} color="#EF4444" />
              <Text style={{ marginLeft: 15, fontSize: 16, color: "#EF4444" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

