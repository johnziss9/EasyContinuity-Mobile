import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Space = (props) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{props.spaceName}</Text>
            <Pressable style={styles.editSpace}>
                <Ionicons name="create-outline" size={30} color="#CDA7AF" />
            </Pressable>
            <Pressable style={styles.deleteSpace}>
                <Ionicons name="trash-outline" size={30} color="#CDA7AF" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#3F4F5F',
        width: '90%',
        paddingHorizontal: 20,
        height: 110,
        marginTop: 10,
        marginBottom: 10,
        borderRadius: 10
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        paddingTop: 10
    },
    editSpace: {
        position: 'absolute',
        bottom: 10,
        right: 60
    },
    deleteSpace: {
        position: 'absolute',
        bottom: 10,
        right: 10
    }
});

export default Space;