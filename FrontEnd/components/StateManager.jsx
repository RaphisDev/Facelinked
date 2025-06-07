import {EventEmitter} from "expo";

let stateManagerInstance = null;

class StateManager {
    chatOpened = false;
    networkOpened = false;
    homePressed = new EventEmitter();

    constructor() {
        if (!stateManagerInstance) {
            stateManagerInstance = this;
        }
        return stateManagerInstance;
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