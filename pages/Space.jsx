import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Space = () => {
    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddNewItemModal}
                onRequestClose={() => setShowAddNewItemModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Add Item:">Add Item:</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonFolder]} testID='add-new-folder-button' onPress={() => setShowAddNewItemModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextFolder]}>Folder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonAttachment]} testID='add-new-attachment-button' onPress={() => setShowAddNewItemModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextAttachment]}>Attachment</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Pressable style={styles.addNewButton} testID='add-item-button' onPress={() => setShowAddNewItemModal(true)}>
                <Ionicons name="add-circle-sharp" size={70} color="#CDA7AF" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center'
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    modalContent: {
        width: '85%',
        padding: 20,
        backgroundColor: '#E2CFC8',
        borderRadius: 10,
        alignItems: 'left',
    },
    modalText: {
        fontSize: 20,
        marginBottom: 10,
        color: '#3F4F5F'
    },
    modalButtonsContainer: {
        alignItems: 'center'
    },
    modalButton: {
        borderRadius: 5,
        width: '70%',
        height: 60,
        justifyContent: 'center',
        margin: 10
    },
    modalButtonAttachment: {
        backgroundColor: '#3F4F5F',
    },
    modalButtonFolder: {
        borderWidth: 2,
        borderColor: '#3F4F5F'
    },
    modalButtonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalButtonTextAttachment: {
        color: '#E2CFC8'
    },
    modalButtonTextFolder: {
        color: '#3F4F5F'
    }
});

export default Space;