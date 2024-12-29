import {Platform} from "react-native";

const ip = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://192.168.0.178:8080';
const webSocketIp = Platform.OS === 'android' ? 'ws://10.0.2.2:8080' : 'ws://192.168.0.178:8080';
    //later wss and https

export default ip;
export {webSocketIp};