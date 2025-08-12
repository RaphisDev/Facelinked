// RENAME THIS FILE TO AppManager.jsx

const ip = 'https://YOUR_DOMAIN:8443'; // Use api.facelinked for production
const webSocketIp = 'wss://YOUR_DOMAIN:8443'; //Use api.facelinked for production

// You can find these in your Google Cloud Console under APIs & Services > Credentials
// Replace with your actual iOS client ID
const iosClientId = "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com";

// Replace with your actual Android client ID
const androidClientId = "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";

export default ip;
export {webSocketIp};

export {iosClientId, androidClientId};