const keys = require('./config/keys');

module.exports = {
  "expo": {
    "name": "TezRide",
    "slug": "TezRide",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/applogo.jpeg",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/logoo.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF5C00"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#FF5C00",
        "foregroundImage": "./assets/applogo.jpeg",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "package": "com.anonymous.TezRide",
      "config": {
        "googleMaps": {
          "apiKey": keys.GOOGLE_MAPS_API_KEY
        }
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-font",
      "expo-localization",
      [
        "react-native-maps",
        {
          "androidGoogleMapsApiKey": keys.GOOGLE_MAPS_API_KEY
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "3757b012-d00a-4c03-9e38-189c26489153"
      }
    }
  }
};
