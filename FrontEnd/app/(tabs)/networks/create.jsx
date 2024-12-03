import {TextInput, TouchableOpacity, View, Text, Switch, SwitchBase, SwitchComponent} from "react-native";
import {useRef, useState} from "react";

export default function CreateNetwork() {

    function toggleSwitch() {
        setIsEnabled(previousState => !previousState);
        //Add logic to change the network to private or public
        //Add field to add people to the network
    }
    const [isEnabled, setIsEnabled] = useState(false);

    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <View className="p-5">
                <Text className="text-text dark:text-dark-text text-center text-2xl">Create Network</Text>
                <TextInput className="w-full border-4 border-accent h-10 text-text dark:text-dark-text mt-5 p-2 rounded-lg" placeholder="Network Name"/>
                <TextInput className="w-full border-4 border-accent h-10 text-text dark:text-dark-text mt-5 p-2 rounded-lg" placeholder="Network Description"/>
                <View className="flex-row items-center justify-start mt-3">
                    <Text className="text-text dark:text-dark-text font-bold">Private</Text>
                    <Switch
                        trackColor={{false: '#3e3e3e', true: '#029f13'}}
                        thumbColor={isEnabled ? '#f4f3f4' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSwitch}
                        value={isEnabled}
                        className="ml-3"
                    />
                </View>
                <TouchableOpacity activeOpacity={0.9} className="w-full h-10 bg-accent dark:bg-dark-accent mt-5 p-2 rounded-lg">
                    <Text className="text-dark-text font-bold text-center">Create Network</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}