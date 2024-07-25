import { StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Pressable style={[styles.button, styles.loginButton]}>
                <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
            </Pressable>
            <Pressable style={[styles.button]}>
                <Text style={[styles.buttonText, styles.createButtonText]}>Create an Account</Text>
            </Pressable>
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
        width: 250,
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
    }
});

export default Home;
