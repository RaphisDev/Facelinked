let stateManagerInstance = null;

class StateManager {
    chatOpened = false;
    networkOpened = false;

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
}

export default StateManager;