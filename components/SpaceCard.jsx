import React from 'react';
import { StyleSheet, View, Text, Pressable, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SpaceCard = ({ spaceName, onPress, onEditPress, onDeletePress }) => {
    return (
        <Pressable style={styles.pressable} onPress={onPress} testID='space-card-component'>
            <View style={styles.container}>
                <Text style={styles.text}>{spaceName}</Text>
                <TouchableOpacity style={styles.editSpace} onPress={onEditPress} testID="edit-space-button">
                    <Ionicons name="create-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteSpace} onPress={onDeletePress} testID="delete-space-button">
                    <Ionicons name="trash-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#3F4F5F',
        width: '90%',
        paddingHorizontal: 20,
        height: 110,
        marginBottom: 20,
        borderRadius: 10
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        paddingTop: 10,
        maxWidth: 280
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

export default SpaceCard;