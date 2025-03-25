import React, { useState, useCallback, useLayoutEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
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
    const [currentSort, setCurrentSort] = useState({ id: 1, label: 'Date: Newest First' });
    const [folderToDelete, setFolderToDelete] = useState(null);
    const [snapshotToDelete, setSnapshotToDelete] = useState(null);

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showAddNewFolderModal, setShowAddNewFolderModal] = useState(false);
    const [showSortByModal, setShowSortByModal] = useState(false);
    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
    const [showDeleteSnapshotModal, setShowDeleteSnapshotModal] = useState(false);
    const [showConfirmationFolderModal, setShowConfirmationFolderModal] = useState(false);
    const [confirmationModalText, setConfirmationModalText] = useState('');

    const route = useRoute();
    const navigation = useNavigation();
    const { spaceId, spaceName, folderId, folderName } = route.params;

    const sortOptions = [
        { id: 1, label: 'Date: Newest First' },
        { id: 2, label: 'Date: Oldest First' },
        { id: 3, label: 'Name: A to Z' },
        { id: 4, label: 'Name: Z to A' }
    ];

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

    const handleSort = (option) => {
        setCurrentSort(option);
        setShowSortByModal(false);

        let sortedFolders = [...folders];
        let sortedSnapshots = [...snapshots];

        switch (option.id) {
            case 1: // Date: Newest First
                sortedFolders.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
                sortedSnapshots.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
                break;
            case 2: // Date: Oldest First
                sortedFolders.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
                sortedSnapshots.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
                break;
            case 3: // Name: A to Z
                sortedFolders.sort((a, b) => a.name.localeCompare(b.name));
                sortedSnapshots.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 4: // Name: Z to A
                sortedFolders.sort((a, b) => b.name.localeCompare(a.name));
                sortedSnapshots.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                break;
        }

        setFolders(sortedFolders);
        setSnapshots(sortedSnapshots);
    };

    const handleConfirmDeleteSnapshotPress = async (snapshot) => {
        try {
            const url = `/snapshot/${snapshot.id}`;
            const method = 'PUT';
            const body = {
                name: snapshot.name,
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
            console.error('Error Deleting Snapshot:', error);

            // TODO Replace error with fail toast
            throw error;
        } finally {
            // TODO Show deletion confirmation
        }
    }

    const handleConfirmDeleteFolderPress = async (folder) => {
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

            // Applying default sorting when this function is called - Date Created Newest First
            const sortedFolders = foldersResponse.data.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
            const sortedSnapshots = snapshotsResponse.data.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

            setFolders(sortedFolders);
            setSnapshots(sortedSnapshots);

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
            spaceId,
            spaceName,
            folderId: folderId,
            folderName: folderName,
            snapshotId: snapshot.id,
            snapshotName: snapshot.name
        });
    };

    const handleCancelAddFolder = () => {
        setShowAddNewFolderModal(false);
        setFolderEditing(false);
        setFolderNameField('');
    }
    
    const handleDeleteSnapshotPress = (snapshot) => {
        setSnapshotToDelete(snapshot);
        setShowDeleteSnapshotModal(true);
    }

    const handleDeleteFolderPress = (folder) => {
        setFolderToDelete(folder);
        setShowDeleteFolderModal(true);
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
                    setConfirmationModalText('Folder Updated Successfully');
                    setShowConfirmationFolderModal(true);
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
                    setConfirmationModalText('Folder Added Successfully');
                    setShowConfirmationFolderModal(true);
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

    return (
        <View style={styles.container}>

            {/* Added/Updated Folder confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showConfirmationFolderModal}
                onRequestClose={() => setShowConfirmationFolderModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{confirmationModalText}</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='added-folder-confirm-button'
                                onPress={() => {
                                    setShowConfirmationFolderModal(false);
                                    handleFetchAllFolderData();
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Snapshot confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteSnapshotModal}
                onRequestClose={() => setShowDeleteSnapshotModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Snapshot?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='delete-snapshot-cancel-button' onPress={() => setShowDeleteSnapshotModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='delete-snapshot-confirm-button'
                                onPress={() => {
                                    setShowDeleteSnapshotModal(false);
                                    handleConfirmDeleteSnapshotPress(snapshotToDelete);
                                    setSnapshotToDelete(null); 
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Delete Folder confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteFolderModal}
                onRequestClose={() => setShowDeleteFolderModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Folder?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='delete-folder-cancel-button' onPress={() => setShowDeleteFolderModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonLeftRight]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='delete-folder-confirm-button'
                                onPress={() => {
                                    setShowDeleteFolderModal(false);
                                    handleConfirmDeleteFolderPress(folderToDelete);
                                    setFolderToDelete(null); 
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='add-new-folder-button' onPress={handleAddFolderPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Folder</Text>
                            </TouchableOpacity>
                            {/* onPress={browseFiles} *** this should be going on where the file browsing button will be *** */}
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='add-new-snapshot-button' onPress={handleAddSnapshotPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Snapshot</Text>
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
                            style={styles.modalTextbox}
                            onChangeText={setFolderNameField}
                            value={folderNameField}
                            placeholder='Folder Name'
                            cursorColor={'#3F4F5F'}
                            testID='folder-name-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='add-folder-cancel-button' onPress={handleCancelAddFolder}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='add-folder-submit-button' onPress={handleCreateOrEditFolder}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Sort By Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showSortByModal}
                onRequestClose={() => setShowSortByModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalText, { marginBottom: 10 }]} accessibilityLabel="Sort By:">Sort By:</Text>
                        {sortOptions.map((option) => (
                            <Pressable
                                key={option.id}
                                style={styles.sortOptionButton}
                                onPress={() => handleSort(option)}
                            >
                                <View style={styles.sortRadioOption}>
                                    <View style={styles.sortRadioOuter}>
                                        {currentSort?.id === option.id && (
                                            <View style={styles.sortRadioInner} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.sortOptionText,
                                        currentSort?.id === option.id && styles.selectedOptionText
                                    ]}>
                                        {option.label}
                                    </Text>
                                </View>
                            </Pressable>
                        ))}
                    </View>
                </View>
            </Modal>

            <View style={styles.sortFilterContainer}>
                <Pressable style={styles.sortFilterButton} testID='sort-button' onPress={() => setShowSortByModal(true)}>
                    <Ionicons name="funnel-outline" size={14} color="#CDA7AF" />
                    <Text style={styles.sortFilterText}>Sort</Text>
                </Pressable>

                <Pressable style={styles.sortFilterButton} testID='filter-button'>
                    <Ionicons name="filter-outline" size={14} color="#CDA7AF" />
                    <Text style={styles.sortFilterText}>Filter</Text>
                </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
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
                                        onDeletePress={() => handleDeleteSnapshotPress(snapshot)}
                                        onPress={() => handleSnapshotPress(snapshot)}
                                    />
                                ))}
                            </>
                        ) : (
                            <View style={styles.noItemsContainer}>
                                <Text style={styles.noItemsTitle}>No Items In Folder Yet</Text>
                                <Text style={styles.noItemsText}>Get started by pressing the + button below to add your first item.</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
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
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 10,
        borderColor: '#3F4F5F',
        padding: 20,
        maxWidth: 600,
        marginHorizontal: 20
    },
    noItemsTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3F4F5F'
    },
    noItemsText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#3F4F5F'
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
        borderRadius: 10,
        maxWidth: 400
    },
    modalText: {
        fontSize: 18,
        marginLeft: 2,
        color: '#3F4F5F',
        fontWeight: 'bold'
    },
    modalTextbox: {
        width: '100%',
        height: 60,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        marginTop: 10,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        fontSize: 18,
        marginBottom: 10,
        color: '#3F4F5F'
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    modalButton: {
        marginTop: 10,
        borderRadius: 5,
        width: 150,
        height: 50,
        justifyContent: 'center'
    },
    modalButtonRight: {
        backgroundColor: '#3F4F5F',
    },
    modalButtonLeft: {
        borderWidth: 2,
        borderColor: '#3F4F5F'
    },
    modalButtonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalButtonTextRight: {
        color: '#E2CFC8'
    },
    modalButtonTextLeft: {
        color: '#3F4F5F'
    },
    sortFilterContainer: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15
    },
    sortFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: '#3F4F5F',
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 15,
        width: 70,
        justifyContent: 'center'
    },
    sortFilterText: {
        color: '#CDA7AF',
        fontSize: 13,
        fontWeight: 'bold'
    },
    sortOptionButton: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#3F4F5F',
        paddingHorizontal: 20
    },
    sortRadioOption: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    sortRadioOuter: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#3F4F5F',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10
    },
    sortRadioInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#CDA7AF'
    },
    sortOptionText: {
        fontSize: 16,
        color: '#3F4F5F',
        fontWeight: 'bold'
    },
    scrollViewContent: {
        width: '100%'
    }
});

export default Folder;