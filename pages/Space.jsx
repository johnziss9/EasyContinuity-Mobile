import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import SnapshotCard from '../components/SnapshotCard';

const Space = () => {
    const navigation = useNavigation();

    const { filesInfo, browseFiles } = useFileBrowser();

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);

    const renderFileItem = ({ item }) => (
        <Text>
            {item.name || item.uri} ({item.size} bytes)
        </Text>
    );

    const handleSnapshotPress = () => {
        navigation.navigate('Snapshot');
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Add New Item Modal */}
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
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSnapshot]} testID='add-new-snapshot-button' onPress={browseFiles}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSnapshot]}>Snapshot</Text>
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

            <SnapshotCard snapshotName={'Rhaenyra'} onPress={handleSnapshotPress} />
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
        fontSize: 18,
        marginBottom: 5,
        marginLeft: 5,
        color: '#3F4F5F',
        maxWidth: "70%"
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
    modalButtonSnapshot: {
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
    modalButtonTextSnapshot: {
        color: '#E2CFC8'
    },
    modalButtonTextFolder: {
        color: '#3F4F5F'
    }
});

export default Space;