import "../../../../global.css"
import {FlatList, Text, View} from "react-native";
import Network from "../../../../components/Entries/Network";

export default function index() {
    return (
        <View className="w-full h-full bg-primary dark:bg-dark-primary">
            <FlatList contentContainerStyle={{gap: 7}} style={{marginTop: 20, marginLeft: 15, marginRight: 15}} data={[
                {network: "Network 1", networkId: 1},
                {network: "Network 2", networkId: 2},
                {network: "Network 3", networkId: 3},
                {network: "Network 4", networkId: 4},
                {network: "Network 5", networkId: 5},
                {network: "Network 6", networkId: 6},
                {network: "Network 7", networkId: 7},
                {network: "Network 8", networkId: 8},
                {network: "Network 9", networkId: 9},
                {network: "Network 10", networkId: 10},
                {network: "Network 11", networkId: 11},
                {network: "Network 12", networkId: 12},
                {network: "Network 13", networkId: 13},
                {network: "Network 14", networkId: 14},
                {network: "Network 15", networkId: 15},
                {network: "Network 16", networkId: 16},
                {network: "Network 17", networkId: 17},
                {network: "Network 18", networkId: 18},
                {network: "Network 19", networkId: 19},
                {network: "Network 20", networkId: 20},
            ]} renderItem={() => <Network/>}/>
        </View>
    )
}