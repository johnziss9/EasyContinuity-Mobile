import React from 'react';
import { StyleSheet, View, Text, Pressable, Image, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import someImage from '../assets/dummy-image.jpg';

const SnapshotCard = ({ snapshotName, onPress }) => {
    return (
        <Pressable style={styles.pressable} onPress={onPress} testID='snapshot-component'>
            <View style={styles.container}>
                <Image source={someImage} style={styles.image} />
                <Text style={styles.text}>{snapshotName}</Text>
                <Pressable style={styles.editSpace}>
                    <Ionicons name="create-outline" size={30} color="#CDA7AF" />
                </Pressable>
                <Pressable style={styles.deleteSpace}>
                    <Ionicons name="trash-outline" size={30} color="#CDA7AF" />
                </Pressable>
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
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 200,
    },
    image: {
      width: 90,
      height: 90,
      marginRight: 10,
      borderRadius: 100,
      borderColor: '#CDA7AF',
      borderWidth: 2
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

export default SnapshotCard;