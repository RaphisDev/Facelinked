let stateManagerInstance = null;

class StateManager {
    chatOpened = false;

    constructor() {
        if (!stateManagerInstance) {
            stateManagerInstance = this;
        }
        return stateManagerInstance;
    }

    setState(newState) {
        this.chatOpened = newState;
    }
}

export default StateManager;