import {Pressable, Text, TouchableOpacity, View} from "react-native";
import React, {useState} from "react";

function AccountInfo(props) {
    const [currentPage, setCurrentPage] = useState(0);

    const renderContent = () => {
        switch (currentPage) {
            case 0:
                return(
                    <View>
                        <Text>Question 1</Text>
                        <Pressable onPress={() => setCurrentPage(currentPage + 1)}><Text>Next Question</Text></Pressable>
                    </View>);
            case 1:
                return(
                    <View>
                        <Text>Question 2</Text>
                        <Pressable onPress={() =>  setCurrentPage(currentPage + 1)}><Text>Next Question</Text></Pressable>
                    </View>);
            case 2:
                return(
                    <View>
                        <Text>Question 3</Text>
                        <Pressable onPress={() =>  setCurrentPage(currentPage + 1)}><Text>Next Question</Text></Pressable>
                    </View>);
            default:
                return <Text>You are done!</Text>;
        }
    };

    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <Text className="text-text dark:text-dark-text">Welcome {props.username} to FaceLinked</Text>
            <Text className="text-secText">Now you can extend your account infos</Text>
            {renderContent()}
        </View>
    );
}

export default AccountInfo;