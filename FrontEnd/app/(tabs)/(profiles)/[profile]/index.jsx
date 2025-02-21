import {
    Alert, Dimensions,
    FlatList,
    Keyboard,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import "../../../../global.css"
import {router, useLocalSearchParams, useNavigation, useRouter, useSegments} from "expo-router";
import {Image} from "expo-image";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import * as SecureStore from "expo-secure-store";
import Ionicons from "@expo/vector-icons/Ionicons";
import ip from "../../../../components/AppManager";
import Post from "../../../../components/Entries/Post";

export default function Profile() {

    const navigation = useNavigation();
    let {profile} = useLocalSearchParams();
    const router = useRouter();

    const [showInput, setShowInput] = useState(false);
    const input = useRef(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const scrollView = useRef(null);
    const [posts, setPosts] = useState([]);
    const newPostInput = useRef(null);
    const postInputText = useRef("");
    const cachedPosts = useRef([]);

    const token = useRef("");
    const username = useRef("");
    const profileName = useRef("");

    const [profileInfos, setProfileInfos] = useState({
        name: "Loading...",
        score: 0,
        location: "Loading...",
        hobbies: "Loading...",
        inRelationship: false,
        partner: "Loading...",
        profilePicturePath: "",
        dateOfBirth: new Date()
    });

    async function fetchData() {
        try {
            if (username.current === profileName.current) {
                let profile;
                if (Platform.OS === "web") {
                    profile = JSON.parse(localStorage.getItem('profile'));
                }
                else {
                    profile = JSON.parse(SecureStore.getItem('profile'));
                }
                setProfileInfos(profile);
            }

            const data = await fetch(`${ip}/profile/${profileName.current}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token.current,
                    'Content-Type': 'application/json'
                }
            });
            if (data.ok) {
                const profileInfos = await data.json();
                setProfileInfos(profileInfos);
                if (profileName.current === username.current) {
                    if (Platform.OS === "web") {
                        localStorage.setItem('profile', JSON.stringify(profileInfos));
                    } else {
                        SecureStore.setItem('profile', JSON.stringify(profileInfos));
                    }
                }
            }
        }
        catch (error) {
        }

        try {
            const data = await fetch(`${ip}/profile/posts/last5/${profileName.current}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token.current}`
                }
            });
            if (data.ok) {
                const posts = await data.json();
                setPosts(posts);
            }
        }
        catch (error) {
        }
    }

    function calculateAge(birthDate) {
        const ageDiff = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDiff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

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

    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => <TouchableOpacity onPress={handleAddBar}><Ionicons name="search" size={25}/></TouchableOpacity>,
        });
    }, [navigation]);

    useEffect( () => {
        profileName.current = profile;
        if (Platform.OS === "web") {
            token.current = localStorage.getItem("token");
            username.current = localStorage.getItem("username");
        }
        else {
            token.current = SecureStore.getItem("token");
            username.current = SecureStore.getItem("username");
        }
        if(!profile){ profileName.current = username.current;}

        navigation.setOptions({
            headerTitle: profileName.current !== username.current ? profileName.current : "Profile",
        });
        fetchData();
    }, [profile]);

    function createPost() {
        if (newPostInput.current) {
            return;
        }
        setPosts(prevState => {cachedPosts.current = prevState ;return [{new: true, millis: Date.now()}]});

        setTimeout(() => {
            scrollView.current.scrollToEnd();
            newPostInput.current.focus();
        })
    }

    async function sendPost() {
        setPosts([{title: postInputText.current, content: [], likes: 0, millis: Date.now()}, ...cachedPosts.current]);
        const title = postInputText.current;
        postInputText.current = "";

        const data = await fetch(`${ip}/profile/post`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token.current}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                content: [],
            })
        });

        if (!data.ok) {
            Alert.alert("Error", "An error occurred while sending your post. Please try again later.", [{text: "OK"}]);
            setPosts(prevState => prevState.slice(1));
        }
        else {
            const postData = await fetch(`${ip}/profile/posts/all/${profileName.current}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token.current}`
                }
            });
            if (postData.ok) {
                const posts = await postData.json();
                setPosts(posts);
            }
        }
    }

    const isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
        const paddingToBottom = 20;
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom;
    };

    return (
        <>
            <View className="bg-primary dark:bg-dark-primary w-full h-full">
                <TextInput onEndEditing={(t) => {
                    if (t.nativeEvent.text.trim().length === 0 && showInput) {
                        handleAddBar();
                    }
                }} autoCorrect={false} ref={input} style={{display: !showInput ? "none" : "flex"}} onChangeText={(text) => {
                    if (text.trim().length > 0) {
                        setIsSearching(true);
                    }
                    else {
                        setIsSearching(false);
                    }

                    if (text.length >= 2 && text.length % 2 === 0) {
                        fetch(`${ip}/profile/search/${text}`, {
                            method: 'GET',
                            headers: {
                                "Authorization": `Bearer ${token.current}`
                            }
                        }).then(async (res) => {
                            if (res.ok) {
                                return res.json();
                            }
                            else {
                                return [];
                            }
                        }).then((data) => {
                            setSearchResults(data.filter((item) => item.username !== username.current));
                        })
                    }
                    else if (text.length < 2) {
                        setSearchResults([]);
                    }
                }} placeholder="Type in an username" autoCapitalize="none" className="rounded-xl mt-4 p-2 w-3/4 hidden bg-primary dark:bg-dark-primary dark:text-dark-text text-text mx-auto mb-4 border-4 border-accent" onSubmitEditing={(e) => {
                    if (e.nativeEvent.text.trim().length > 0 && searchResults.length > 0 && isSearching) {
                        input.current.focus();
                    }
                }}/>
                <View style={{display: isSearching ? "flex" : "none"}} className="h-full w-full bg-primary dark:bg-dark-primary">
                    <FlatList data={searchResults} ListEmptyComponent={() => <Text className="text-center text-xl font-semibold mt-10">No results</Text>} renderItem={(item) =>
                        <View>
                        <TouchableOpacity onPress={() => {
                            router.navigate(`/${item.item.username}`);
                            input.current.clear();
                            handleAddBar();
                        }} activeOpacity={0.4} className="flex-row justify-between items-center p-3">
                            <View className="flex-row items-center">
                                <Image source={{uri: item.item.profilePicturePath}} style={{width: 42, height: 42, borderRadius: 21}}></Image>
                                <View className="flex-col ml-3">
                                    <Text className="text-text dark:text-dark-text font-bold text-lg">{item.item.name}</Text>
                                    <Text className="text-text dark:text-dark-text text-sm">@{item.item.username}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        <View className="w-11/12 self-center">
                            <View className="border-b border-gray-700/80"></View>
                        </View>
                    </View>}/>
                </View>
                <ScrollView scrollEventThrottle={400} ref={scrollView} onScroll={async ({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                        if (posts.length === 5) {
                            const data = await fetch(`${ip}/profile/posts/all/${profileName.current}`, {
                                method: 'GET',
                                headers: {
                                    "Authorization": `Bearer ${token.current}`
                                }
                            });
                            if (data.ok) {
                                const posts = await data.json();
                                setPosts(posts);
                            }
                        }
                    }
                }}>
                    <Text className="text-text dark:text-dark-text text-center font-bold mt-7 text-4xl">{profileInfos.name}</Text>
                    <View className="justify-between flex-row mt-10">
                        <View className="ml-3 overflow-hidden w-52">
                            <TouchableOpacity onPress={() => Alert.alert("Score", "The score is calculated based on the amount of likes you have received on your posts.",
                                [{text: "OK"}])} activeOpacity={0.75} className="flex-row items-center justify-center self-center min-w-[95] mr-5 mb-2.5 bg-accent rounded-xl">
                                <Ionicons size={14} color="black" name={"aperture"} className="ml-3"/>
                                <Text className="font-bold text-lg text-center text-dark-text mr-3"> {profileInfos.score}</Text>
                            </TouchableOpacity>
                            <FlatList scrollEnabled={false} data={[
                                {id: "age", value: `${profileInfos.name?.split(" ")[0]}, ${calculateAge(new Date(profileInfos?.dateOfBirth))}`},
                                {id: "location", value: profileInfos.location},
                                {id: "hobbies", value: profileInfos.hobbies},
                                {id: "relationshipStatus", value: profileInfos.inRelationship ? "in Relationship" : "Single"},
                                {id: "partner", value: profileInfos.partner},
                            ]} renderItem={({item}) => <Text className="text-xl font-medium text-text dark:text-dark-text" style={{display: item.id === "partner" ? profileInfos.inRelationship ?
                                    "flex" : "none" : "flex"}} id={item.id}>{item.value}</Text>}/>
                        </View>
                        <View className="h-64 aspect-[16/19] mr-3 rounded-3xl overflow-hidden">
                            <Image style={{ width: '100%', height: '100%', objectFit: "cover", position: "static", borderRadius: 24 }}
                                   alt="Profile picture" source={{uri: profileInfos.profilePicturePath}}/>
                        </View>
                    </View>
                    <View className="flex-row justify-center mt-5" style={{display: profile === username.current || profile === undefined ? "none" : "flex"}}>
                        <TouchableOpacity onPress={() => router.navigate(`/chat/${profile}`)} activeOpacity={0.6} className="mr-16 border-accent bg-accent border-4 rounded-xl p-2">
                            <Text className="text-dark-text font-semibold">Message</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.6} className="border-accent bg-accent border-4 rounded-xl p-2">
                            <Text className="text-dark-text font-semibold">Add friend</Text>
                        </TouchableOpacity>
                    </View>
                    <View>
                        <View className="flex-row mt-10 justify-between mb-4">
                            <Text className="text-center text-text dark:text-dark-text self-start font-bold text-2xl ml-4 mt-3">Posts</Text>
                            {(profileName.current === username.current || profileName.current === undefined) &&
                                <TouchableOpacity onPress={createPost} activeOpacity={0.65} className="rounded-full self-end bg-accent p-2 mr-2 w-20">
                                    <Ionicons name={"add"} size={24} className="text-center" color={"#FFFFFF"}></Ionicons>
                                </TouchableOpacity>}
                        </View>
                    </View>
                    <FlatList keyExtractor={(items) => items.millis} scrollEnabled={false} ListEmptyComponent={<Text className="text-text dark:text-dark-text self-center mt-14 font-semibold text-xl">No posts yet</Text>} data={posts}
                              style={{width :"100%", height: "100%"}} renderItem={(items) => {
                                  if(items.item.new) {
                                      return (
                                          <View className="w-full pb-80">
                                              <View className="bg-dark-primary dark:bg-[#6C757D] min-h-20 p-4 rounded-xl justify-center mr-1.5 ml-1.5">
                                                  <TextInput onChangeText={(text) => {scrollView.current.scrollToEnd(); postInputText.current = text}} onKeyPress={(key) => {if (key.nativeEvent.key === "Enter" && postInputText.current.trim().length > 0) {
                                                        sendPost();
                                                  }
                                                  else if (postInputText.current.trim().length === 0 && key.nativeEvent.key === "Enter") {
                                                      setPosts(cachedPosts.current);
                                                  }}} ref={newPostInput} onEndEditing={() => setPosts(cachedPosts.current)} multiline={true} placeholderTextColor="gray" placeholder="What's on your mind?" className="text-xl text-dark-text mb-1.5 ml-5"/>
                                              </View>
                                          </View>)
                                  } else {
                                      return <Post {...items.item}/>
                                  }
                              }}/>
                </ScrollView>
            </View>
        </>
    );
}