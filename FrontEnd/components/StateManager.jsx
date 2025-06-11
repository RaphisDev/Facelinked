import {EventEmitter} from "expo";
import {Platform} from "react-native";
import * as SecureStore from "expo-secure-store";

let stateManagerInstance = null;

class StateManager {
    chatOpened = false;
    networkOpened = false;
    homePressed = new EventEmitter();
    currentUsername = "profile";
    username = "";
    tabBarVisible = true;
    tabBarChanged = new EventEmitter();

    constructor() {
        if (!stateManagerInstance) {
            stateManagerInstance = this;
        }
        return stateManagerInstance;
    }

    setTabBarVisible(visible) {
        this.tabBarVisible = visible;
        this.tabBarChanged.emit("tabBarChanged", visible);
    }

    getActualUsername() {
        if(this.username === "") {
            this.username = Platform.OS === 'web' ? localStorage.getItem('username') : SecureStore.getItem('username');
        }
        return this.username;
    }
    getCurrentUsername() {
        return this.currentUsername;
    }

    setCurrentUsername(username) {
        this.currentUsername = username;
    }

    setChatState(newState) {
        this.chatOpened = newState;
    }
    setNetworkState(newState) {
        this.networkOpened = newState;
    }
    setHomePressed() {
        this.homePressed.emit("homePressed");
    }
}

export default StateManager;