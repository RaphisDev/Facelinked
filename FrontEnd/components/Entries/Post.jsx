import "../../global.css";
import {FlatList, Platform, Share, Text, TouchableOpacity, View} from "react-native";
import {Image} from "expo-image";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import {useState} from "react";

export default function Post(props) {

    const renderImages = () => {
        if (!props.content || props.content.length === 0) return null;

        if (props.content.length === 1) {
            return (
                <TouchableOpacity 
                    className="mb-3 rounded-lg overflow-hidden"
                    onPress={() => props.onImagePress ? props.onImagePress(props.content[0]) : null}
                    activeOpacity={0.9}
                >
                    <Image 
                        source={{uri: props.content[0]}}
                        style={{width: '100%', aspectRatio: 16/9}}
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
                                className="p-1"
                                style={{
                                    width: props.content.length === 2 ? '50%' : 
                                           props.content.length >= 4 ? '50%' : '33.33%',
                                }}
                                onPress={() => props.onImagePress ? props.onImagePress(item) : null}
                                activeOpacity={0.9}
                            >
                                <View className="rounded-lg overflow-hidden" style={{aspectRatio: 1}}>
                                    <Image 
                                        source={{uri: item}}
                                        style={{width: '100%', height: '100%'}}
                                        contentFit="cover"
                                    />
                                    {index === 3 && props.content.length > 4 && (
                                        <View className="absolute inset-0 bg-black/60 items-center justify-center">
                                            <Text className="text-white font-bold text-xl">+{props.content.length - 4}</Text>
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
            <View className="bg-white p-4 rounded-xl">
                {/* Post Header */}
                <View className="flex-row items-center mb-3">
                    <View className="flex-1">
                        <Text className="text-gray-800 font-medium text-lg">{props.title}</Text>
                    </View>
                </View>

                {/* Post Images */}
                {renderImages()}

                {/* Post Actions */}
                <View className="flex-row justify-between pt-2 border-t border-gray-100">
                    <TouchableOpacity 
                        className="flex-row items-center py-2 px-3 rounded-full hover:bg-gray-100"
                        activeOpacity={0.7}
                        onPress={props.onLikePress}
                    >
                        <Ionicons name="heart-outline" size={20} color="#6B7280" />
                        <Text className="ml-1 text-gray-600 font-medium">
                            {props.likes.length > 0 ? props.likes.length : "Like"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        className="flex-row items-center py-2 px-3 rounded-full hover:bg-gray-100"
                        activeOpacity={0.7}
                        onPress={props.onCommentPress}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="#6B7280" />
                        <Text className="ml-1 text-gray-600 font-medium">
                            {props.comments > 0 ? props.comments : "Comment"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => Share.share({
                            title: "Check out this post!",
                            message: `https://facelinked.com/${props.username === undefined ? Platform.OS === "web" ? localStorage.getItem("username") : SecureStore.getItem("username") : props.username}?post=${encodeURIComponent(props.id.millis)}`,
                            dialogTitle: "Check out this post!",
                            text: "Check out this post!"
                        })}
                        className="flex-row items-center py-2 px-3 rounded-full hover:bg-gray-100"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="share-outline" size={20} color="#6B7280" />
                        <Text className="ml-1 text-gray-600 font-medium">Share</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
