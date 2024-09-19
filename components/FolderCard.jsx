import React from 'react';
import { StyleSheet, View, Text, Pressable, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FolderCard = ({ folderName, onPress }) => {
    return (
        <Pressable style={styles.pressable} onPress={onPress} testID='folder-component'>
            <View style={styles.container}>
                <View style={styles.folderContainer}>
                    <Ionicons name="folder" size={80} color="#CDA7AF" style={styles.folderIcon} />
                </View>
                <Text style={styles.text}>{folderName}</Text>
                <TouchableOpacity style={styles.editSpace}>
                    <Ionicons name="create-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteSpace}>
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
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    folderContainer: {
        width: 90,
        height: 90,
        marginRight: 10,
        borderRadius: 100,
    },
    folderIcon: {
        marginLeft: 4,
        marginTop: 2
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 200,
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

export default FolderCard;