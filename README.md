```
███████╗ █████╗  ██████╗███████╗██╗     ██╗███╗   ██╗██╗  ██╗███████╗██████╗ 
██╔════╝██╔══██╗██╔════╝██╔════╝██║     ██║████╗  ██║██║ ██╔╝██╔════╝██╔══██╗
█████╗  ███████║██║     █████╗  ██║     ██║██╔██╗ ██║█████╔╝ █████╗  ██║  ██║
██╔══╝  ██╔══██║██║     ██╔══╝  ██║     ██║██║╚██╗██║██╔═██╗ ██╔══╝  ██║  ██║
██║     ██║  ██║╚██████╗███████╗███████╗██║██║ ╚████║██║  ██╗███████╗██████╔╝
╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═════╝
                     Real friendships. No noise.
```
[![License][license-image]][license-url]
[![Contributors][contributors-image]][contributors-url]
[![GitHub stars][stars-image]][stars-url]

> Facelinked — an open-source, ad-free social media platform for **genuine friendships**, not followers or clicks.

---

## 🎥 Quick Look

<table>
  <tr>
    <td><img src="https://github.com/raphisdev/facelinked/blob/main/readme/iOS_Demo.png" alt="iOS Demo" width="250" style="border-radius: 12px;"></td>
    <td><img src="https://github.com/raphisdev/facelinked/blob/main/readme/iPadOS_Demo.png" alt="iPadOS Demo" width="407" style="border-radius: 7px;"></td>
    <td><img src="https://github.com/raphisdev/facelinked/blob/main/readme/iOS_Demo_02.png" alt="iOS Demo 2" width="250" style="border-radius: 12px;"></td>
  </tr>
</table>

*A quick glimpse of the platform in action — fostering real friendships.*

**[More iPad images](https://github.com/raphisdev/facelinked/blob/main/readme/iPad%20Images%20Store)** | **[More iPhone images](https://github.com/raphisdev/facelinked/blob/main/readme/iOS%20Images%20Store)**

---

## 📑 Table of Contents

- [🌱 Why Facelinked Exists](#-why-facelinked-exists)
- [Get Facelinked](#get-facelinked)
- [🚀 Features](#-features)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🔧 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [🛠 Installation](#-installation)
    - [🌐 Frontend Setup](#-frontend-setup)
    - [⚙️ Backend Setup](#️-backend-setup)

---

## 🌱 Why Facelinked Exists

Social media started as a way to connect with friends.  
Somewhere along the way, it became a billboard.  
Your feed turned into an ad slot. Your time became a product.  

**Facelinked is here to change that.**  

We’re building a platform where your feed isn’t hijacked by celebrities or advertisers,  
where “likes” matter less than *laughs shared in real life*,  
and where technology helps you stay close to real friends.

✨ No ads  
✨ No influencers  
✨ No addictive tricks  
Just **real connections**.

---

## Get Facelinked

[![Download Facelinked](https://img.shields.io/badge/Download-Facelinked-blue.svg)](https://www.facelinked.com/apps)
<br/><br/><img src="https://github.com/raphisdev/facelinked/blob/main/readme/qr-code.png" width="150" alt="QR Code"/>

---

## 🚀 Features

- 📰 **Ad-free feed** — only updates from people you actually know
- 🔒 **Private** — no data tracking, no selling your info
- 📱 **Cross-platform** — Web, iOS, Android, macOS, and iPadOS
- 🛠 **Open source** — community-driven

“We’re not here to keep you scrolling. We’re here to keep you connected.”

---

## 🤝 Contributing

We welcome contributions that align with our mission—helping people form and sustain real friendships.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes
4. Submit a Pull Request (PR)

**Note:** For discussions, questions, and ideas, please use [GitHub Discussions](https://github.com/raphisdev/facelinked/discussions).

---

## 📜 License

[MIT License](https://github.com/raphisdev/facelinked/blob/main/LICENSE) — Free to use, modify, and share.

---

## 🔧 Getting Started

### Prerequisites

- **Node.js** (v23+)
- **Expo** & **React Native** (for Frontend)
- **Java** (v17+)
  - Maven (Build tool)
  - Spring Boot
- **Android Studio** (for Android builds)
- **Xcode** & **Apple Developer Account** (for iOS builds)
- **AWS Account** with:
    - DynamoDB (with provided schema)
    - S3 Storage
    - EC2 Server (for backend)
    - IAM Roles (for API access)
    - Amplify & Route 53 (for website)
- **Firebase Project** with FCM configured (for Android Notifications)
- **APNS** configured (for iOS Notifications)
- **Docker Desktop** (for backend deployment)
- **Google Cloud Console OAuth 2.0** configured (for Google Sign-In)
- **Git**

## 🛠 Installation

```sh
git clone https://github.com/raphisdev/facelinked.git
cd facelinked
```

### 🌐 Frontend Setup

```sh
cd Frontend
npm install

# Rename the AppManager_Template.jsx to AppManager.jsx
# Then configure with your server's IP address and Google OAuth credentials
mv components/AppManager_Template.jsx components/AppManager.jsx

# Build for Android
npx expo run:android

# Build for iOS
npx expo run:ios

# Start development server
npx expo start
# Press "w" to open in web browser
```

### ⚙️ Backend Setup

**MacOS & Linux**
```sh
# Transfer APNS Key to the server
scp -i /path/to/your/NOTIFICATION_KEY user@your-server-ip:/path/to/destination/ -i /path/to/your/private-key.pem

# Paste your secretAccountKey.json from Firebase Console in resources
cp /path/to/your/secretAccountKey.json facelinked/src/main/resources/

# Connect to the server with the private key from your AWS EC2 instance
# Make sure you have the permissions to access the server
ssh user@your-server-ip -i /path/to/your/private-key.pem

# Install Docker
sudo apt-get update
sudo apt-get install docker.io -y

# Install Certbot and configure SSL
sudo apt-get install certbot -y

# Follow prompts to generate SSL certificates
# (Replace [your domain] with your actual domain that points to your server)
# Make sure your EC2 Security Group allows port 80 and 443
sudo certbot certonly -a standalone -d [your domain]

# Generate PKCS#12 file
# Generated files in: /etc/letsencrypt/live/[your domain]
cd /etc/letsencrypt/live/[your domain]
openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem -out keystore.p12

# Install and configure AWS CLI with your IAM credentials
# Currently your IAM user should only have permissions for DynamoDB and S3
sudo apt-get install awscli -y
aws configure

# Now switch to your local Backend directory
# Configure the application.properties file in facelinked/src/main/resources/

# Build the backend
cd facelinked
docker buildx build --platform linux/amd64 -t YOUR_DOCKER_HUB_ID/YOUR_PROJECT_ID:AVAILABLE_TAG .
docker push YOUR_DOCKER_HUB_ID/YOUR_PROJECT_ID:AVAILABLE_TAG
	
# Now switch to terminal
# Replace placeholder and paste this command to run the Docker container
sudo docker run \
  -e JWT_SECRET='YOUR_256_BIT_JWT_SECRET_KEY' \
  -e KEY_STORE_PASSWORD='YOUR_PASSWORD_FOR_SSL_CERTIFICATE' \
  -e APNS_KEY_PATH='YOUR_PATH_TO_APNS_KEY' \
  -e APNS_TEAM_ID='YOUR_APPLE_ACCOUNT_TEAM_ID' \
  -e APNS_KEY_ID='YOUR_APNS_KEY_ID' \
  -e GOOGLE_ANDROID_CLIENT_ID='YOUR_ANDROID_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE' \
  -e GOOGLE_IOS_CLIENT_ID='YOUR_IOS_CLIENT_ID_FROM_GOOGLE_CLOUD_CONSOLE' \
  -v ~/.aws:/root/.aws \
  -v ./PATH_TO_SSL_keystore.p12:/app/keystore.p12 \
  -v ./PATH_TO_APNS_KEY:/app/Notification_key.p8 \
  -d -p 8443:8443 YOUR_DOCKER_HUB_ID/YOUR_PROJECT_ID:latest
```

<!-- Markdown link & img dfn's -->
[stars-image]: https://img.shields.io/github/stars/raphisdev/facelinked?style=social
[stars-url]: https://github.com/raphisdev/facelinked/stargazers
[contributors-image]: https://img.shields.io/github/contributors/raphisdev/facelinked
[contributors-url]: https://github.com/raphisdev/facelinked/graphs/contributors
[license-image]: https://img.shields.io/github/license/raphisdev/facelinked
[license-url]: https://github.com/raphisdev/facelinked/blob/main/LICENSE
