import { StyleSheet, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Home = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.tempText}>THIS IS THE HOMEPAGE</Text>
            <Pressable style={[styles.button, styles.loginButton]}>
                <Text style={[styles.buttonText, styles.loginButtonText]}>Sign In</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.createButton]}>
                <Text style={[styles.buttonText, styles.createButtonText]}>Create an Account</Text>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#87789a',
        alignItems: 'center',
        justifyContent: 'center'
    },
    button: {
        padding: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#626d9e',
        margin: 10,
        width: 250,
        height: 60,
        display: 'flex',
        justifyContent: 'center'
    },
    loginButton: {
        backgroundColor: '#626d9e'
    },
    createButton: {
        backgroundColor: '#87789a'
    },
    buttonText: {
        textAlign: 'center'
    },
    loginButtonText: {
        color: '#fff'
    },
    createButtonText: {
        color: '#fff'
    },

    tempText: {
        color: '#fff'
    }
});

export default Home;
