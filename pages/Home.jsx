import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    return (
        <SafeAreaView style={styles.container}>
            {showLoginForm ?
                <>
                    <TextInput
                        style={styles.textbox}
                        onChangeText={setUsername}
                        value={username}
                        placeholder='Username'
                        cursorColor={'#3F4F5F'}
                    />
                    <TextInput
                        style={styles.textbox}
                        onChangeText={setPassword}
                        value={password}
                        placeholder='Password'
                        cursorColor={'#3F4F5F'}
                        secureTextEntry
                    />
                    <Pressable style={[styles.button, styles.loginButton]}>
                        <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
                    </Pressable>
                    <Pressable onPress={() => setShowLoginForm(!showLoginForm)} style={[styles.button]}>
                        <Text style={[styles.buttonText, styles.createButtonText]}>Cancel</Text>
                    </Pressable>
                </> :
                <>
                    <Pressable onPress={() => setShowLoginForm(!showLoginForm)} style={[styles.button, styles.loginButton]}>
                        <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
                    </Pressable>
                    <Pressable style={[styles.button]}>
                        <Text style={[styles.buttonText, styles.createButtonText]}>Create an Account</Text>
                    </Pressable>
                </>
            }

        </SafeAreaView>
    );
}

// Dusty Pink to be used CDA7AF
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#3F4F5F',
        margin: 10,
        width: 300,
        height: 60,
        display: 'flex',
        justifyContent: 'center'
    },
    loginButton: {
        backgroundColor: '#3F4F5F',
    },
    buttonText: {
        textAlign: 'center'
    },
    loginButtonText: {
        color: '#E2CFC8'
    },
    createButtonText: {
        color: '#3F4F5F'
    },
    textbox: {
        width: 300,
        height: 60,
        borderWidth: 2,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        margin: 10,
        backgroundColor: 'rgba(205, 167, 175, 0.4)',
        outlineStyle: 'none'
    }
});

export default Home;
