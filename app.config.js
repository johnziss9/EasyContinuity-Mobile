import 'dotenv/config';

export default {
    expo: {
        name: "EasyContinuity",
        slug: "easy-continuity",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/logo-design.png",
        userInterfaceStyle: "light",
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/logo-design.png",
                backgroundColor: "#ffffff"
            },
            permissions: [
                "READ_EXTERNAL_STORAGE",
                "WRITE_EXTERNAL_STORAGE"
            ]
        },
        web: {
            favicon: "./assets/logo-design.png"
        },
        extra: {
            apiUrl: process.env.ENDPOINT_URL
        }
    }
};