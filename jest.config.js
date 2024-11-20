module.exports = {
    preset: 'jest-expo',
    moduleNameMapper: {
        '^expo-modules-core/build/Refs$': '<rootDir>/__mocks__/expo-modules-core/build/Refs.js',
        '^expo-modules-core/build/web/index.web$': '<rootDir>/__mocks__/expo-modules-core/build/web/index.web.js',
        '^expo/build/winter$': '<rootDir>/__mocks__/expo/build/winter.js',
        '^react-native-vector-icons/Ionicons$': '<rootDir>/__mocks__/react-native-vector-icons/Ionicons.js',
        '^expo-document-picker$': '<rootDir>/__mocks__/expo-document-picker.js'
    },
    transformIgnorePatterns: [
        'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
    ],
    setupFilesAfterEnv: [
        '@testing-library/jest-native/extend-expect',
        '<rootDir>/jest.setup.js'
    ]
};