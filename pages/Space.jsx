import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, FlatList, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import SnapshotCard from '../components/SnapshotCard';
import someImage from '../assets/dummy-image.jpg';

const Space = () => {
    const { filesInfo, browseFiles } = useFileBrowser();

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showViewSnapshotModal, setShowViewSnapshotModal] = useState(false);

    const renderFileItem = ({ item }) => (
        <Text>
            {item.name || item.uri} ({item.size} bytes)
        </Text>
    );

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

            {/* Atachment Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showViewSnapshotModal}
                onRequestClose={() => setShowViewSnapshotModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ScrollView>
                            <Text style={styles.modalTextTitle}>Snapshot Name</Text>
                            <View style={styles.modalImagesContainer}>
                                <Image source={someImage} style={styles.modalImage} />
                                <Image source={someImage} style={styles.modalImage} />
                                <Image source={someImage} style={styles.modalImage} />
                                <Image source={someImage} style={styles.modalImage} />
                            </View>
                            <Text style={styles.modalTextSubtitle} accessibilityLabel="Information:">Information:</Text>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Episode Number:">Episode Number:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Scene Number:">Scene Number:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Story Day:">Story Day:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Actor Name:">Actor Name:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Actor Number:">Actor Number:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Character:">Character:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Notes:">Notes:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <Text style={styles.modalTextSubtitle} accessibilityLabel="Makeup:">Makeup:</Text>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Skin:">Skin:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Brows:">Brows:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Eyes:">Eyes:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Lips:">Lips:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Makeup Notes:">Makesup Notes:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <Text style={styles.modalTextSubtitle} accessibilityLabel="Hair:">Hair:</Text>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Prep:">Prep:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Method:">Method:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Styling Tools:">Styling Tools:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Products:">Products:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                            <View style={styles.modalTextContainer}>
                                <Text style={styles.modalTextLabel} accessibilityLabel="Hair Notes:">Hair Notes:</Text>
                                <Text style={styles.modalText}>Something</Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <SnapshotCard snapshotName={'Rhaenyra'} onPress={() => setShowViewSnapshotModal(true)}/>
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
    modalTextTitle: {
        fontSize: 25,
        marginBottom: 15,
        color: '#3F4F5F'
    },
    modalTextSubtitle: {
        fontSize: 22,
        marginTop: 10,
        marginBottom: 10,
        color: '#3F4F5F'
    },
    modalTextContainer: {
        marginLeft: 5,
        flexDirection: "row"
    },
    modalTextLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        color: '#3F4F5F'
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
    },
    modalImagesContainer: {
        width: '100%',
        height: 'auto',
        aspectRatio: 1,
        borderWidth: 2,
        borderColor: '#CDA7AF',
        backgroundColor: '#3F4F5F',
        marginBottom: 20,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalImage: {
        width: '50%',
        height: '50%',
        // resizeMode: 'contain',
        borderColor: '#CDA7AF',
        borderWidth: 1
    }
});

export default Space;