import React, { useState, useCallback, useLayoutEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, useWindowDimensions, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import FolderCard from '../components/FolderCard';
import SnapshotCard from '../components/SnapshotCard';

const Folder = () => {

    const [isLoading, setIsLoading] = useState(true);
    const [folders, setFolders] = useState([]);
    const [parentFolderId, setParentFolderId] = useState(null);
    const [parentFolderName, setParentFolderName] = useState(null);
    const [snapshots, setSnapshots] = useState([]);
    const [folderNameField, setFolderNameField] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState(0);
    const [folderEditing, setFolderEditing] = useState(false);

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showAddNewFolderModal, setShowAddNewFolderModal] = useState(false);

    const { width } = useWindowDimensions();
    const route = useRoute();
    const navigation = useNavigation();
    const { spaceId, spaceName, folderId, folderName } = route.params;

    useFocusEffect(
        useCallback(() => {
            if (folderId) {
                handleFetchAllFolderData();
            }

            if (Platform.OS === 'android') {
                const onBackPress = () => {
                    if (parentFolderId && parentFolderName) {
                        navigation.navigate('Folder', {
                            folderId: parentFolderId,
                            folderName: parentFolderName,
                            spaceId: spaceId,
                            spaceName: spaceName
                        });
                        return true;
                    } else {
                        navigation.navigate('Space', { spaceId: spaceId, spaceName: spaceName });
                        return true;
                    }
                };

                BackHandler.addEventListener('hardwareBackPress', onBackPress);
                return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
            }
        }, [folderId, parentFolderId, parentFolderName, spaceId, spaceName])
    );

    const handleFetchAllFolderData = async () => {
        try {
            setIsLoading(true);

            const [currentFolderResponse, foldersResponse, snapshotsResponse, spacesResponse] = await Promise.all([
                handleHttpRequest(`/folder/${folderId}`, 'GET'),
                handleHttpRequest(`/folder/parent/${folderId}`, 'GET'),
                handleHttpRequest(`/snapshot/folder/${folderId}`, 'GET'),
                handleHttpRequest(`/space/${spaceId}`, 'GET')
            ]);

            // Check all responses
            if (!currentFolderResponse.success || !foldersResponse.success || !snapshotsResponse.success || !spacesResponse.success) {
                throw new Error(currentFolderResponse.error || foldersResponse.error || snapshotsResponse.error || spacesResponse.error);
            }

            const spaceName = spacesResponse.data.name;

            setFolders(foldersResponse.data);
            setSnapshots(snapshotsResponse.data);

            if (currentFolderResponse.success &&
                currentFolderResponse.data.parentId !== null &&
                currentFolderResponse.data.parentId !== undefined) {

                const parentResponse = await handleHttpRequest(`/folder/${currentFolderResponse.data.parentId}`, 'GET');
                if (parentResponse.success) {
                    setParentFolderId(currentFolderResponse.data.parentId);
                    setParentFolderName(parentResponse.data.name);
                    navigation.setParams({
                        parentFolderId: currentFolderResponse.data.parentId,
                        parentFolderName: parentResponse.data.name,
                        spaceId,
                        spaceName,
                        folderId,
                        folderName
                    });
                }
            } else {
                setParentFolderId(null);
                setParentFolderName(null);
                navigation.setParams({
                    parentFolderId: null,
                    parentFolderName: null,
                    spaceId,
                    spaceName,
                    folderId,
                    folderName
                });
            }
        } catch (error) {
            console.error('Error fetching folder data:', error);
            // TODO: Show error toast
        } finally {
            setIsLoading(false);
        }
    };

    const handleFolderPress = (nestedFolderId, folderName) => {
        navigation.navigate('Folder', {
            folderId: nestedFolderId,
            folderName: folderName,
            spaceId: spaceId,
            spaceName: spaceName
        });
    };

    const handleAddFolderPress = () => {
        setShowAddNewItemModal(false)
        setShowAddNewFolderModal(true);
    }

    const handleEditFolderPress = (folder) => {
        setFolderEditing(true);
        setShowAddNewFolderModal(true);
        setCurrentFolderId(folder.id);
        setFolderNameField(folder.name);
    }

    const handleAddSnapshotPress = () => {
        setShowAddNewItemModal(false);
        navigation.navigate('SnapshotGeneralInfo', {
            isNewSnapshot: true,
            spaceId: spaceId,
            folderId: folderId,
            folderName: folderName
        });
    };

    const handleSnapshotPress = (snapshot) => {
        navigation.navigate('Snapshot', {
            id: snapshot.id,
            snapshotName: snapshot.name
        });
    };

    const handleCancelAddFolder = () => {
        setShowAddNewFolderModal(false);
        setFolderEditing(false);
        setFolderNameField('');
    }

    const handleDeleteFolderPress = async (folder) => {
        // TODO Add modal for confirmation

        try {
            const url = `/folder/${folder.id}`;
            const method = 'PUT';
            const body = {
                name: folder.name,
                isDeleted: true,
                deletedOn: new Date().toISOString()
                // TODO Include deletedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                // TODO Show success toast
                handleFetchAllFolderData();
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Deleting Folder:', error);

            // TODO Replace error with fail toast
            throw error;
        } finally {
            // TODO Show deletion confirmation
        }
    }

    const handleCreateOrEditFolder = async () => {
        if (folderEditing) {
            try {
                const url = `/folder/${currentFolderId}`;
                const method = 'PUT';
                const body = {
                    name: folderNameField,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include lastUpdatedBy
                };
    
                const response = await handleHttpRequest(url, method, body);
    
                if (response.success) {
                    // TODO Show success toast
                    // TODO Refresh data on screen
                    handleFetchAllFolderData();
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error Updating Folder:', error);
    
                // TODO Replace error with fail toast
                throw error;
            } finally {
                setShowAddNewFolderModal(false);
                setFolderNameField('');
                setFolderEditing(false);
            }
        } else {
            try {
                const url = '/folder/';
                const method = 'POST';
                const body = {
                    name: folderNameField,
                    spaceId: spaceId,
                    parentId: folderId,
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    // TODO Show success toast
                    handleFetchAllFolderData();
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }

                setShowAddNewFolderModal(false);
                setFolderNameField('');
            } catch (error) {
                console.error('Error Creating Folder:', error);

                // TODO Replace error with fail toast
                throw error;
            }
        }
    }

    const dynamicStyles = {
        modalTextbox: {
            width: width < 600 ? '100%' : '61%',
            height: 60,
            borderWidth: 1,
            borderColor: '#3F4F5F',
            borderRadius: 5,
            paddingLeft: 7,
            marginTop: 7,
            backgroundColor: 'rgba(205, 167, 175, 0.2)',
            fontSize: 18,
            marginBottom: 10,
            color: '#3F4F5F'
        }
    };

    return (
        <View style={styles.container}>

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
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonFolder]} testID='add-new-folder-button' onPress={handleAddFolderPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextFolder]}>Folder</Text>
                            </TouchableOpacity>
                            {/* onPress={browseFiles} *** this should be going on where the file browsing button will be *** */}
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSnapshot]} testID='add-new-snapshot-button' onPress={handleAddSnapshotPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSnapshot]}>Snapshot</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add New Folder Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddNewFolderModal}
                onRequestClose={() => setShowAddNewFolderModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Enter Folder Name:">Enter Folder Name:</Text>
                        <TextInput
                            style={dynamicStyles.modalTextbox}
                            onChangeText={setFolderNameField}
                            value={folderNameField}
                            placeholder='Folder Name'
                            cursorColor={'#3F4F5F'}
                            testID='folder-name-text-input'
                        />
                        <View style={styles.modalFolderButtonContainer}>
                            <TouchableOpacity style={[styles.modalFolderButton, styles.modalButtonCancel]} testID='add-folder-cancel-button' onPress={handleCancelAddFolder}>
                                <Text style={[styles.modalFolderButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalFolderButton, styles.modalButtonSave]} testID='add-folder-submit-button' onPress={handleCreateOrEditFolder}>
                                <Text style={[styles.modalFolderButtonText, styles.modalButtonTextSave]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {isLoading ? (
                <ActivityIndicator size="large" color="#3F4F5F" testID='activity-indicator' />
            ) : (
                <>
                    {Array.isArray(folders) && Array.isArray(snapshots) && (folders.length > 0 || snapshots.length > 0) ? (
                        <>
                            {folders.length > 0 && folders.map((folder) => (
                                <FolderCard
                                    key={folder.id}
                                    folderName={folder.name}
                                    onEditPress={ () => handleEditFolderPress(folder) }
                                    onDeletePress={() => handleDeleteFolderPress(folder)}
                                    onPress={() => handleFolderPress(folder.id, folder.name)}
                                />
                            ))}
                            {snapshots.length > 0 && snapshots.map((snapshot) => (
                                <SnapshotCard
                                    key={snapshot.id}
                                    snapshotName={snapshot.name}
                                    // images={[someImage, someImage2, someImage3, someImage4, someImage, someImage]}
                                    onPress={() => handleSnapshotPress(snapshot)}
                                />
                            ))}
                        </>
                    ) : (
                        <View style={styles.noItemsContainer}>
                            <Text style={styles.noItemsTitle}>No Items In This Folder Yet</Text>
                            <Text style={styles.noItemsText}>Get started by pressing the + button below to add your first item.</Text>
                        </View>
                    )}
                </>
            )}
            <Pressable style={styles.addNewButton} testID='add-item-button' onPress={() => setShowAddNewItemModal(true)}>
                <Ionicons name="add-circle-sharp" size={70} color="#CDA7AF" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center',
        paddingTop: 30
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
    },
    noItemsContainer: {
        alignItems: 'center'
    },
    noItemsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingVertical: 10
    },
    noItemsText: {
        fontSize: 18,
        width: 300,
        textAlign: 'center'
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)'
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
        fontWeight: 'bold'
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
    modalFolderButtonContainer: {
        flexDirection: 'row'
    },
    modalFolderButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        width: '30%',
        height: 50,
        marginRight: 10,
        justifyContent: 'center'
    },
    modalFolderButtonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalButtonSave: {
        backgroundColor: '#3F4F5F',
    },
    modalButtonCancel: {
        borderWidth: 2,
        borderColor: '#3F4F5F'
    },
    modalButtonTextSave: {
        color: '#E2CFC8'
    },
    modalButtonTextCancel: {
        color: '#3F4F5F'
    }
});

export default Folder;