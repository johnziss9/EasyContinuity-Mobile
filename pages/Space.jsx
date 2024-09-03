import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import AttachmentCard from '../components/AttachmentCard';
import someImage from '../assets/dummy-image.jpg';

const Space = () => {
    const { filesInfo, browseFiles } = useFileBrowser();

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showViewAttachmentModal, setShowViewAttachmentModal] = useState(false);

    const renderFileItem = ({ item }) => (
        <Text>
            {item.name || item.uri} ({item.size} bytes)
        </Text>
    );

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
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonAttachment]} testID='add-new-attachment-button' onPress={browseFiles}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextAttachment]}>Attachment</Text>
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={filesInfo}
                            renderItem={renderFileItem}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<Text>No files selected</Text>}
                        />
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                animationType="fade"
                visible={showViewAttachmentModal}
                onRequestClose={() => setShowViewAttachmentModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalImageContainer}>
                            <Image source={someImage} style={styles.modalImage} />
                        </View>
                        <Text style={styles.modalText} accessibilityLabel="Information:">Information:</Text>
                        <Text style={styles.modalText} accessibilityLabel="Makeup:">Makeup:</Text>
                        <Text style={styles.modalText} accessibilityLabel="Hair:">Hair:</Text>
                    </View>
                </View>
            </Modal>
            <AttachmentCard attachmentName={'Rhaenyra'} onPress={() => setShowViewAttachmentModal(true)}/>
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
        borderRadius: 10
    },
    modalText: {
        fontSize: 22,
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
    },
    modalImageContainer: {
        width: '100%',
        height: 'auto',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#CDA7AF',
        backgroundColor: '#000',
        marginBottom: 20
    },
    modalImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain', 
    }
});

export default Space;