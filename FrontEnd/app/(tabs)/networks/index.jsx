import "../../../global.css"
import {FlatList, Keyboard, Platform, Text, TextInput, TouchableOpacity, View} from "react-native";
import Network from "../../../components/Entries/Network";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useFocusEffect, useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import ip from "../../../components/AppManager";
import {Image} from "expo-image";
import * as SecureStore from "expo-secure-store";
import StateManager from "../../../components/StateManager";

export default function Networks() {

    const [selected, setSelected] = useState(0);
    const [favoriteNetworks, setNetworks] = useState([]);
    const segments = useSegments();

    const stateManager = new StateManager();

    const [showInput, setShowInput] = useState(false);
    const input = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const navigation = useNavigation("/(tabs)");
    const router = useRouter();
    const token = useRef(null);

    useEffect(() => {
        if (selected === 0) {
            const loadNetworks = async () => {
                let networks = await AsyncStorage.getItem("networks") || [];
                if (networks.length !== 0) {
                    setNetworks(JSON.parse(networks));
                }
            }
            loadNetworks();
        }
    }, [segments]);

    useFocusEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity className="mr-4 mb-1.5" onPress={handleAddBar}><Ionicons name="search" size={25}/></TouchableOpacity>,
        });
    });

    useEffect(() => {
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
        }
        else {
            token.current = SecureStore.getItem("token");
        }
        setTimeout(() => {
            if (token.current === null) {router.replace("/")}
        })

        stateManager.setNetworkState(true);
    });

    function handleAddBar() {
        setShowInput(shown => {
            if (shown) {
                Keyboard.dismiss();
                setIsSearching(false);
            }
            else {
                setTimeout(() => {
                    input.current.focus();
                }, 100);
                setSearchResults([]);
            }
            return !shown
        });
    }

    const currentTab = () => {
        const renderNetworkItem = ({ item }) => (
            <TouchableOpacity 
                style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 12,
                    marginHorizontal: 16,
                    marginBottom: 12,
                    padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                }}
                onPress={() => router.navigate(`/networks/${item.networkId}`)}
                activeOpacity={0.7}
            >
                <View style={{ flexDirection: 'row' }}>
                    <View style={{
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#E2E8F0',
                        overflow: 'hidden',
                        marginRight: 16,
                    }}>
                        {item.networkPicturePath && (
                            <Image 
                                source={{ uri: item.networkPicturePath }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        )}
                    </View>
                    <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 18, fontWeight: '600', color: '#1E293B' }}>
                                {item.name}
                            </Text>
                            {item.private && (
                                <Ionicons name="lock-closed" size={16} color="#64748B" />
                            )}
                        </View>
                        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 8 }}>
                            {item.description}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="people" size={14} color="#64748B" />
                            <Text style={{ fontSize: 12, color: '#64748B', marginLeft: 4 }}>
                                {item.memberCount || 0} members
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );

        switch (selected) {
            case 0:
                return (
                    <FlatList 
                        data={favoriteNetworks}
                        renderItem={renderNetworkItem}
                        keyExtractor={(item) => item.networkId}
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                        ListEmptyComponent={renderEmptyComponent}
                        showsVerticalScrollIndicator={false}
                    />
                );
            case 1:
                // Get friends networks
                const friendsNetworks = [];
                return (
                    <FlatList 
                        data={friendsNetworks}
                        renderItem={renderNetworkItem}
                        keyExtractor={(item) => item.networkId}
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <View style={[styles.emptyIcon, { backgroundColor: '#EBF5FF', padding: 24, borderRadius: 40 }]}>
                                    <Ionicons name="people" size={48} color="#3B82F6" />
                                </View>
                                <Text style={styles.emptyTitle}>No friend networks</Text>
                                <Text style={styles.emptyText}>
                                    Your friends haven't created any networks yet
                                </Text>
                                <TouchableOpacity 
                                    style={styles.createEmptyButton}
                                    onPress={() => setCreateModalVisible(true)}
                                >
                                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.createEmptyButtonText}>Create Network</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                );
            case 2:
                // Get explore networks
                const exploreNetworks = [];
                return (
                    <FlatList 
                        data={exploreNetworks}
                        renderItem={renderNetworkItem}
                        keyExtractor={(item) => item.networkId}
                        contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <View style={[styles.emptyIcon, { backgroundColor: '#EBF5FF', padding: 24, borderRadius: 40 }]}>
                                    <Ionicons name="compass" size={48} color="#3B82F6" />
                                </View>
                                <Text style={styles.emptyTitle}>Explore networks</Text>
                                <Text style={styles.emptyText}>
                                    No public networks available to explore right now
                                </Text>
                                <TouchableOpacity 
                                    style={styles.createEmptyButton}
                                    onPress={() => setCreateModalVisible(true)}
                                >
                                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                                    <Text style={styles.createEmptyButtonText}>Create Network</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />
                );
        }
    }
    return (
        <View style={styles.container}>
            {/* Search Input */}
            <TextInput 
                ref={input}
                style={[styles.searchInput, { display: showInput ? 'flex' : 'none' }]}
                placeholder="Search networks..."
                placeholderTextColor="#94A3B8"
                onChangeText={(text) => {
                    if (text.trim().length > 0) {
                        setIsSearching(true);
                    } else {
                        setIsSearching(false);
                    }

                    if (text.length >= 2 && text.length % 2 === 0) {
                        fetch(`${ip}/networks/search?searchName=${encodeURIComponent(text)}`, {
                            method: 'GET',
                            headers: {
                                "Authorization": `Bearer ${token.current}`
                            }
                        }).then(async (res) => {
                            if (res.ok) {
                                return res.json();
                            } else {
                                return [];
                            }
                        }).then((data) => {
                            setSearchResults(data);
                        });
                    } else if (text.length < 2) {
                        setSearchResults([]);
                    }
                }}
                onEndEditing={(t) => {
                    if (t.nativeEvent.text.trim().length === 0 && showInput) {
                        handleAddBar();
                    }
                }}
                onSubmitEditing={(e) => {
                    if (e.nativeEvent.text.trim().length > 0 && searchResults.length > 0 && isSearching) {
                        input.current.focus();
                    }
                }}
            />

            {/* Search Results */}
            {isSearching ? (
                <FlatList 
                    data={searchResults}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            onPress={() => {
                                router.navigate(`/networks/${item.id}`);
                                input.current.clear();
                                handleAddBar();
                            }}
                            style={{
                                flexDirection: 'row',
                                padding: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: '#E2E8F0',
                            }}
                        >
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                backgroundColor: '#E2E8F0',
                                overflow: 'hidden',
                                marginRight: 16,
                            }}>
                                {item.networkPicturePath && (
                                    <Image 
                                        source={{ uri: item.networkPicturePath }}
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                )}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>
                                    {item.name}
                                </Text>
                                <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>
                                    {item.description}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={() => (
                        <View style={{ padding: 24, alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: '#64748B' }}>No networks found</Text>
                        </View>
                    )}
                />
            ) : (
                <>
                    {/* Tab Bar */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity 
                            style={[styles.tabItem, selected === 0 && styles.activeTabItem]}
                            onPress={() => setSelected(0)}
                        >
                            <Text style={[styles.tabText, selected === 0 && styles.activeTabText]}>
                                Favorites
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabItem, selected === 1 && styles.activeTabItem]}
                            onPress={() => setSelected(1)}
                        >
                            <Text style={[styles.tabText, selected === 1 && styles.activeTabText]}>
                                Friends
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.tabItem, selected === 2 && styles.activeTabItem]}
                            onPress={() => setSelected(2)}
                        >
                            <Text style={[styles.tabText, selected === 2 && styles.activeTabText]}>
                                Explore
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Network Lists */}
                    {currentTab()}
                </>
            )}

            {/* Create Network Modal */}
            <Modal
                visible={createModalVisible}
                animationType="slide"
                onRequestClose={() => setCreateModalVisible(false)}
                presentationStyle="pageSheet"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Create Network</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setCreateModalVisible(false)}
                        >
                            <Ionicons name="close" size={24} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formContainer}>
                        {/* Network Image */}
                        <View style={styles.selectedImageContainer}>
                            <TouchableOpacity onPress={pickNetworkImage}>
                                <View style={styles.selectedImage}>
                                    {selectedImage ? (
                                        <Image 
                                            source={{ uri: selectedImage.assets[0].uri }}
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    ) : (
                                        <View style={{ 
                                            flex: 1, 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <Ionicons name="image" size={32} color="#94A3B8" />
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.imageButton}
                                onPress={pickNetworkImage}
                            >
                                <Ionicons name="image" size={20} color="#FFFFFF" />
                                <Text style={styles.imageButtonText}>
                                    {selectedImage ? 'Change Image' : 'Add Image'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Network Name */}
                        <Text style={styles.inputLabel}>Network Name</Text>
                        <TextInput 
                            style={styles.textInput}
                            placeholder="Enter network name"
                            placeholderTextColor="#94A3B8"
                            value={networkName}
                            onChangeText={setNetworkName}
                        />

                        {/* Network Description */}
                        <Text style={styles.inputLabel}>Description</Text>
                        <TextInput 
                            style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
                            placeholder="Describe your network"
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            value={networkDescription}
                            onChangeText={setNetworkDescription}
                        />

                        {/* Private Toggle */}
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Private Network</Text>
                            <Switch
                                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                                thumbColor={isPrivate ? '#3B82F6' : '#F1F5F9'}
                                ios_backgroundColor="#CBD5E1"
                                onValueChange={togglePrivate}
                                value={isPrivate}
                            />
                        </View>

                        {/* Members (for private networks) */}
                        {isPrivate && (
                            <>
                                <Text style={styles.inputLabel}>Add Members</Text>
                                <TextInput 
                                    ref={memberInput}
                                    style={styles.textInput}
                                    placeholder="Enter username"
                                    placeholderTextColor="#94A3B8"
                                    onSubmitEditing={(e) => {
                                        if (e.nativeEvent.text.trim()) {
                                            addMember(e.nativeEvent.text.trim());
                                            memberInput.current.clear();
                                        }
                                    }}
                                />

                                {members.length > 0 && (
                                    <View style={styles.membersContainer}>
                                        <Text style={[styles.inputLabel, { marginTop: 8 }]}>
                                            Members ({members.length})
                                        </Text>
                                        {members.map((member, index) => (
                                            <View key={index} style={styles.memberItem}>
                                                <Text style={styles.memberName}>
                                                    {member.memberId}
                                                </Text>
                                                <TouchableOpacity 
                                                    style={styles.removeButton}
                                                    onPress={() => {
                                                        setMembers(members.filter((_, i) => i !== index));
                                                    }}
                                                >
                                                    <Ionicons name="close-circle" size={20} color="#EF4444" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        )}

                        {/* Create Button */}
                        <TouchableOpacity 
                            style={[
                                styles.createButton,
                                (isCreating || !networkName.trim() || !networkDescription.trim()) && 
                                styles.createButtonDisabled
                            ]}
                            disabled={isCreating || !networkName.trim() || !networkDescription.trim()}
                            onPress={createNetwork}
                        >
                            <Text style={styles.createButtonText}>
                                {isCreating ? 'Creating...' : 'Create Network'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Floating Action Button (on mobile) */}
            {!isSearching && Platform.OS !== 'web' && (
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 24 + insets.bottom,
                        right: 24,
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: '#3B82F6',
                        alignItems: 'center',
                        justifyContent: 'center',
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Ionicons name="add" size={30} color="#FFFFFF" />
                </TouchableOpacity>
            )}
        </View>
    );
}
