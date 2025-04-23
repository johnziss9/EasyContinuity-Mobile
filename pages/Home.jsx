import React, { useState } from 'react';
import { StyleSheet, Text, Pressable, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import ToastNotification from '../utils/ToastNotification';

const Home = () => {
    const navigation = useNavigation();

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [passwordConfirmation, setPasswordConfirmation] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLoginCancel = () => {
        setShowLoginForm(!showLoginForm);
        handleClearTextboxes();
    }

    const handleCreateAccountCancel = () => {
        setShowCreateForm(!showCreateForm);
        handleClearTextboxes();
    }

    const handleClearTextboxes = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
    }

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                ToastNotification.show('error', 'Error', 'Email and password are required');
                return;
            }

            setIsLoading(true);
            
            const url = '/authentication/login';
            const method = 'POST';
            const body = {
                email,
                password
            };
    
            const { success, data } = await handleHttpRequest(url, method, body);
    
            if (success) {
                navigation.navigate('Dashboard');
            } else {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    ToastNotification.show('error', 'Error', parsedData.title || 'Login failed');
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    ToastNotification.show('error', 'Error', 'Login failed');
                }                
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateAccount = async () => {
        try {
            if (!firstName || !lastName || !email || !password || !passwordConfirmation) {
                ToastNotification.show('error', 'Error', 'Please fill in all fields');
                return;
            }
    
            if (password !== passwordConfirmation) {
                
                ToastNotification.show('error', 'Error', 'Passwords do not match');
                return;
            }

            if (password.length < 8) {
                ToastNotification.show('error', 'Error', 'Password must be at least 8 characters');
                return;
            }
    
            setIsLoading(true);
            
            const url = '/authentication/register';
            const method = 'POST';
            const body = {
                firstName,
                lastName,
                email,
                password,
                confirmPassword: passwordConfirmation
            };
    
            const { success, data } = await handleHttpRequest(url, method, body);
        
            if (success) {
                ToastNotification.show('success', 'Success', 'Account created successfully. Please sign in.');
                handleClearTextboxes();
                setShowLoginForm(!showLoginForm)
            } else {
                try {
                    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
                    ToastNotification.show('error', 'Error', parsedData.title || 'Registration failed');
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    ToastNotification.show('error', 'Error', 'Registration failed');
                }    
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {showLoginForm ?
                <>
                    <TextInput
                        style={styles.textbox}
                        onChangeText={setEmail}
                        value={email}
                        placeholder='Email Address'
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
                    <View style={{ height: 12 }} />
                    <Pressable onPress={handleLogin} style={[styles.button, styles.loginButton]}>
                        <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
                    </Pressable>
                    <Pressable onPress={() => handleLoginCancel()} style={[styles.button]}>
                        <Text style={[styles.buttonText, styles.createButtonText]}>Cancel</Text>
                    </Pressable>
                </> : showCreateForm ?
                    <>
                        <TextInput
                            style={styles.textbox}
                            onChangeText={setFirstName}
                            value={firstName}
                            placeholder='First Name'
                            cursorColor={'#3F4F5F'}
                        />
                        <TextInput
                            style={styles.textbox}
                            onChangeText={setLastName}
                            value={lastName}
                            placeholder='Last Name'
                            cursorColor={'#3F4F5F'}
                        />
                        <TextInput
                            style={styles.textbox}
                            onChangeText={setEmail}
                            value={email}
                            placeholder='Email Address'
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
                        <TextInput
                            style={styles.textbox}
                            onChangeText={setPasswordConfirmation}
                            value={passwordConfirmation}
                            placeholder='Confirm Password'
                            cursorColor={'#3F4F5F'}
                            secureTextEntry
                        />
                        <View style={{ height: 12 }} />
                        <Pressable onPress={() => handleCreateAccount()} style={[styles.button, styles.loginButton]}>
                            <Text style={[styles.buttonText, styles.loginButtonText]}>Create Account</Text>
                        </Pressable>
                        <Pressable onPress={() => handleCreateAccountCancel()} style={[styles.button]}>
                            <Text style={[styles.buttonText, styles.createButtonText]}>Cancel</Text>
                        </Pressable>
                    </> :
                    <>
                        <Pressable onPress={() => setShowLoginForm(!showLoginForm)} style={[styles.button, styles.loginButton]}>
                            <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
                        </Pressable>
                        <Pressable onPress={() => setShowCreateForm(!showCreateForm)} style={[styles.button]}>
                            <Text style={[styles.buttonText, styles.createButtonText]}>Create an Account</Text>
                        </Pressable>
                    </>
            }
        </View>
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
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        margin: 10,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        outlineStyle: 'none',
        color: '#3F4F5F'
    }
});

export default Home;
