import "../../global.css"
import {Text, TouchableOpacity, View, StyleSheet, Dimensions, Platform} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import {useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function NetworkMessage(props) {
    const router = useRouter();
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const hasImages = props.images && props.images.length > 0;

    const renderImages = () => {
        if (!hasImages) return null;

        const imageCount = props.images.length;

        return (
            <View style={styles.imageContainer}>
                {props.images.map((image, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.imageWrapper,
                            imageCount === 1 ? styles.singleImage : null,
                            imageCount === 2 ? styles.halfImage : null,
                            imageCount === 3 && index === 0 ? styles.twoThirdsImage : null,
                            imageCount === 3 && index !== 0 ? styles.oneThirdImage : null,
                            imageCount >= 4 ? styles.quarterImage : null,
                        ]}
                        onPress={() => {
                            setSelectedImageIndex(index);
                            setImageViewerVisible(true);
                        }}
                    >
                        <Image
                            source={{ uri: image }}
                            style={styles.image}
                            contentFit="cover"
                            transition={200}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View className="w-full pb-2">
            <View className="bg-dark-primary dark:bg-[#6C757D] rounded-xl justify-center mr-1.5 ml-1.5">
                <TouchableOpacity activeOpacity={0.65} onPress={() => router.navigate(`/${props.sender}`)} className="flex flex-row ml-2 mt-2 mb-3">
                    <Image source={{uri: props.senderProfilePicturePath.split(',')[0]}} style={{width: 25, marginTop: 3, aspectRatio: "18/19", borderRadius: 11}}/>
                    <Text className="font-bold text-lg text-dark-text self-center ml-2">{props.sender}</Text>
                    <View style={styles.messageContainer}>
                        <View style={styles.messageContent}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => router.navigate(`/${props.sender}`)}
                                style={styles.senderContainer}
                            >
                                <Image
                                    source={{uri: props.senderProfilePicturePath}}
                                    style={styles.profileImage}
                                    contentFit="cover"
                                    transition={150}
                                />
                                <View style={styles.senderInfo}>
                                    <Text style={styles.senderName}>{props.sender}</Text>
                                </View>
                            </TouchableOpacity>
                            <Text style={{color: "#FFFFFF"}} className="text-xl ml-2 mr-16">{props.content}</Text>
                            <Text className="pb-2" style={{color: "#FFFFFF", textAlign: "right", fontSize: 11, marginRight: 8}}>
                                {props.timestamp}</Text>

                            {props.content.trim().length > 0 && (
                                <Text style={styles.messageText}>{props.content}</Text>
                            )}

                            {renderImages()}

                            <Text style={styles.timestamp}>{props.timestamp}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </View>)
}

const styles = StyleSheet.create({
                    messageContainer: {
                    paddingHorizontal: 12,
                    marginBottom: 12,
                },
                    messageContent: {
                    backgroundColor: '#1E293B',
                    borderRadius: 16,
                    padding: 12,
                    maxWidth: '100%',
                    shadowColor: "#000",
                    shadowOffset: {
                    width: 0,
                    height: 1,
                },
                    shadowOpacity: 0.08,
                    shadowRadius: 2,
                    elevation: 2,
                },
                    senderContainer: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                },
                    profileImage: {
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#E2E8F0',
                },
                    senderInfo: {
                    marginLeft: 8,
                    flex: 1,
                },
                    senderName: {
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#E2E8F0',
                },
                    messageText: {
                    fontSize: 16,
                    color: '#F8FAFC',
                    marginBottom: 8,
                    lineHeight: 22,
                },
                    timestamp: {
                    fontSize: 11,
                    color: '#94A3B8',
                    alignSelf: 'flex-end',
                    marginTop: 4,
                },
                    imageContainer: {
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginBottom: 8,
                    marginHorizontal: -2,
                },
                    imageWrapper: {
                    margin: 2,
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: '#334155',
                },
                    image: {
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#334155',
                },
                    singleImage: {
                    width: '100%',
                    aspectRatio: 16/9,
                    maxHeight: 200,
                },
                    halfImage: {
                    width: '48.5%',
                    aspectRatio: 1,
                },
                    twoThirdsImage: {
                    width: '100%',
                    aspectRatio: 16/9,
                },
                    oneThirdImage: {
                    width: '49%',
                    aspectRatio: 1,
                },
                    quarterImage: {
                    width: '48.5%',
                    aspectRatio: 1,
                },
                })