import "../../../global.css"
import {TextInput, View} from "react-native";
import {useLocalSearchParams} from "expo-router";

export default function ChatRoom(props) {

    const {username} = useLocalSearchParams();

    function sendMessage(message) {
        /*props.stompClient.publish({
            destination: '/app/chat',
            body: message + Date + username etc
        })*/
    }

    //use textinput style from login page
    //Change header to show name instead of Chats and change when navigating to different chat or back to all chats
    return(
        <View>
            <View>
                <TextInput onSubmitEditing={
                    (e) => {
                        sendMessage(e.nativeEvent.text);
                        e.nativeEvent.text = "";
                    }
                } className="h-10 w-full bg-white dark:bg-dark-secondary" placeholder="Type a message" style={{borderBottomWidth: 1}
                }></TextInput>
            </View>
        </View>
    )
}