import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import SnapshotCard from '../components/SnapshotCard';
import FolderCard from '../components/FolderCard';
import handleHttpRequest from '../api/api';

const Space = () => {
    const navigation = useNavigation();
    // const { filesInfo, browseFiles } = useFileBrowser();
    const { width } = useWindowDimensions();
    const route = useRoute();
    const { spaceId, spaceName } = route.params;

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showAddNewFolderModal, setShowAddNewFolderModal] = useState(false);

    const [folderName, setFolderName] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState(0);
    const [folderEditing, setFolderEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState([]);
    const [snapshots, setSnapshots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            if (spaceId) {
                handleFetchSpaceItems();
            }
        }, [spaceId])
    );

    const handleFolderPress = (folderId, folderName) => {
        navigation.navigate('Folder', {
            spaceId,
            spaceName,
            folderId,
            folderName
        });
    };

    const handleSnapshotPress = (snapshot) => {
        navigation.navigate('Snapshot', {
            spaceId,
            spaceName,
            folderId: null, // This is a root item
            folderName: null, // This is a root item
            snapshotId: snapshot.id,
            snapshotName: snapshot.name
        });
    };

    const handleAddSnapshotPress = () => {
        setShowAddNewItemModal(false);
        navigation.navigate('SnapshotGeneralInfo', {
            isNewSnapshot: true,
            spaceId,
            spaceName,
            folderId: null // this is set to null as this is a root folder
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
        setFolderName(folder.name);
    }

    const handleClearSearchBar = () => {
        setSearchQuery('');
    }

    const handleCancelAddFolder = () => {
        setShowAddNewFolderModal(false);
        setFolderEditing(false);
        setFolderName('');
    }

    const handleDeleteSnapshotPress = async (snapshot) => {
        // TODO Add modal for confirmation

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
                handleFetchSpaceItems();
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
                handleFetchSpaceItems();
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
                    name: folderName,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include lastUpdatedBy
                };
    
                const response = await handleHttpRequest(url, method, body);
    
                if (response.success) {
                    // TODO Show success toast
                    // TODO Refresh data on screen
                    handleFetchSpaceItems();
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
                setFolderName('');
                setFolderEditing(false);
            }
        } else {
            try {
                const url = '/folder/';
                const method = 'POST';
                const body = {
                    name: folderName,
                    spaceId: spaceId,
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    // TODO Show success toast
                    handleFetchSpaceItems();
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }

                setShowAddNewFolderModal(false);
                setFolderName('');
            } catch (error) {
                console.error('Error Creating Folder:', error);

                // TODO Replace error with fail toast
                throw error;
            }
        }
    }

    const handleFetchSpaceItems = async () => {
        try {
            setIsLoading(true);

            const [foldersResponse, snapshotsResponse] = await Promise.all([
                handleHttpRequest(`/folder/space/${spaceId}`, 'GET'),
                handleHttpRequest(`/snapshot/space/${spaceId}`, 'GET')
            ]);

            if (!foldersResponse.success || !snapshotsResponse.success) {
                // TODO Handle error and show toaster
                throw new Error(foldersResponse.error || snapshotsResponse.error);
            }

            const rootFolders = foldersResponse.data.filter(folder => folder.parentId === null);
            const rootSnapshots = snapshotsResponse.data.filter(snapshot => snapshot.folderId === null);

            setFolders(rootFolders);
            setSnapshots(rootSnapshots);
        } catch (error) {
            console.error('Error fetching items:', error);
            // TODO Replace with fail toast
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

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
        },
        searchInput: {
            marginBottom: 30,
            borderBottomWidth: 1,
            borderColor: '#3F4F5F',
            width: width < 420 ? 300 : width > 600 ? 500 : 350,
            paddingLeft: 5,
            height: 50,
            outlineStyle: 'none',
            color: '#3F4F5F',
            fontSize: 18
        },
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
                            onChangeText={setFolderName}
                            value={folderName}
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

            <View style={styles.searchContainer}>
                <TextInput
                    style={dynamicStyles.searchInput}
                    placeholder="Search by name"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    testID="search-input"
                    selectionColor="#3F4F5F"
                />
                {searchQuery !== '' ?
                    <Pressable style={styles.searchBarIcon} testID='clear-search-button' onPress={handleClearSearchBar}>
                        <Ionicons name="close" size={20} color="#3F4F5F" />
                    </Pressable> :
                    <Ionicons name="search-outline" size={20} color="#3F4F5F" style={styles.searchBarIcon} />
                }

            </View>

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
                            <Text style={styles.noItemsTitle}>No Items Yet</Text>
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
    },
    flatListContainer: {
        minWidth: '100%'
    },
    searchContainer: {
        flexDirection: 'row'
    },
    searchBarIcon: {
        marginTop: 18,
        marginLeft: -30
    }
});

export default Space;