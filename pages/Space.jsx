import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, useWindowDimensions, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SnapshotCard from '../components/SnapshotCard';
import FolderCard from '../components/FolderCard';
import handleHttpRequest from '../api/api';
import SearchBar from '../components/SearchBar';
import ToastNotification from '../utils/ToastNotification';

const Space = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();
    const route = useRoute();
    const { spaceId, spaceName } = route.params;

    const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
    const [showAddNewFolderModal, setShowAddNewFolderModal] = useState(false);
    const [showSortByModal, setShowSortByModal] = useState(false);
    const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
    const [showDeleteSnapshotModal, setShowDeleteSnapshotModal] = useState(false);

    const [folderName, setFolderName] = useState('');
    const [currentFolderId, setCurrentFolderId] = useState(0);
    const [folderEditing, setFolderEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [folders, setFolders] = useState([]);
    const [snapshots, setSnapshots] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchResults, setSearchResults] = useState(null);
    const [currentSort, setCurrentSort] = useState({ id: 1, label: 'Date: Newest First' });
    const [folderToDelete, setFolderToDelete] = useState(null);
    const [snapshotToDelete, setSnapshotToDelete] = useState(null);
    const [hideTools, setHideTools] = useState(false);

    const sortOptions = [
        { id: 1, label: 'Date: Newest First' },
        { id: 2, label: 'Date: Oldest First' },
        { id: 3, label: 'Name: A to Z' },
        { id: 4, label: 'Name: Z to A' }
    ];

    useFocusEffect(
        React.useCallback(() => {
            if (spaceId) {
                handleFetchSpaceItems();
            }
        }, [spaceId])
    );

    const getTextInputStyle = (value) => ({
        fontStyle: value ? 'normal' : 'italic',
    });

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
        setSearchResults(null);
        handleFetchSpaceItems();
    }

    const handleCancelAddFolder = () => {
        setShowAddNewFolderModal(false);
        setFolderEditing(false);
        setFolderName('');
    }

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
                handleFetchSpaceItems();
                ToastNotification.show('success', 'Success', 'Snapshot Deleted Successfully');
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to delete snapshot');
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
                handleFetchSpaceItems();
                ToastNotification.show('success', 'Success', 'Folder Deleted Successfully');
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to delete folder');
        }
    }

    const handleSearch = async () => {
        // If the search string is empty then it exits the function to prevent API calls
        if (!searchQuery.trim()) return;

        setIsLoading(true);

        try {
            const url = `/space/${spaceId}/search?query=${encodeURIComponent(searchQuery)}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (!response.success) {
                ToastNotification.show('error', 'Error', response.error);
                return;
            }

            // Transform results to include type information
            const resultsWithType = response.data.map(item => ({
                ...item,
                itemType: ('episode' in item || 'scene' in item || 'storyDay' in item)
                    ? 'snapshot'
                    : 'folder'
            }));

            switch (currentSort.id) {
                case 1: // Date: Newest First
                    resultsWithType.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
                    break;
                case 2: // Date: Oldest First
                    resultsWithType.sort((a, b) => new Date(a.createdOn) - new Date(b.createdOn));
                    break;
                case 3: // Name: A to Z
                    resultsWithType.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 4: // Name: Z to A
                    resultsWithType.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }

            setSearchResults(resultsWithType);
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load search results');
        } finally {
            setIsLoading(false);
        }
    };

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
                    name: folderName,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include lastUpdatedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    handleFetchSpaceItems();
                    ToastNotification.show('success', 'Success', 'Folder Updated Successfully');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to update folder');
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
                    handleFetchSpaceItems();
                    ToastNotification.show('success', 'Success', 'Folder Added Successfully');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }

                setShowAddNewFolderModal(false);
                setFolderName('');
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to add folder');
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
                ToastNotification.show('error', 'Error', foldersResponse.error || snapshotsResponse.error);
            }

            const rootFolders = foldersResponse.data.filter(folder => folder.parentId === null);
            const rootSnapshots = snapshotsResponse.data.filter(snapshot => snapshot.folderId === null);

            // Applying default sorting when this function is called - Date Created Newest First
            const sortedFolders = rootFolders.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
            const sortedSnapshots = rootSnapshots.sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));

            if (sortedFolders.length === 0 && sortedSnapshots.length === 0) {
                setHideTools(true);
            } else {
                setHideTools(false);
            }

            setFolders(sortedFolders);
            setSnapshots(sortedSnapshots);
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load items');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <View style={styles.container}>

            {/* Delete Snapshot Confirmation Modal */}
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
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
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
                            style={[styles.modalTextbox, getTextInputStyle(folderName)]}
                            onChangeText={setFolderName}
                            value={folderName}
                            placeholder='Folder Name'
                            placeholderTextColor="rgba(63, 79, 95, 0.55)"
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

            {!hideTools && (
                <>
                    <SearchBar
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSearch={handleSearch}
                        onClear={handleClearSearchBar}
                        width={width}
                    />
        
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
                </>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#3F4F5F" testID='activity-indicator' />
                ) : (
                    <>
                        {searchResults ? (
                            // Search results view
                            searchResults.length > 0 ? (
                                <>
                                    {searchResults.map((item) => (
                                        item.itemType === 'snapshot' ? (
                                            <SnapshotCard
                                                key={`snapshot-${item.id}`}
                                                snapshotName={item.name}
                                                onDeletePress={() => handleDeleteSnapshotPress(item)}
                                                onPress={() => handleSnapshotPress(item)}
                                                path={item.path}
                                            />
                                        ) : (
                                            <FolderCard
                                                key={`folder-${item.id}`}
                                                folderName={item.name}
                                                onEditPress={() => handleEditFolderPress(item)}
                                                onDeletePress={() => handleDeleteFolderPress(item)}
                                                onPress={() => handleFolderPress(item.id, item.name)}
                                                path={item.path}
                                            />
                                        )
                                    ))}
                                </>
                            ) : (
                                <View style={styles.noItemsContainer}>
                                    <Text style={styles.noItemsTitle}>No matches found</Text>
                                    <Text style={styles.noItemsText}>
                                        Try different search terms or clear search to show all items
                                    </Text>
                                </View>
                            )
                        ) : (
                            // Root Folders and Snapshots when no search is happening
                            Array.isArray(folders) && Array.isArray(snapshots) &&
                                (folders.length > 0 || snapshots.length > 0) ? (
                                <>
                                    {folders.length > 0 && folders.map((folder) => (
                                        <FolderCard
                                            key={folder.id}
                                            folderName={folder.name}
                                            onEditPress={() => handleEditFolderPress(folder)}
                                            onDeletePress={() => handleDeleteFolderPress(folder)}
                                            onPress={() => handleFolderPress(folder.id, folder.name)}
                                        />
                                    ))}
                                    {snapshots.length > 0 && snapshots.map((snapshot) => (
                                        <SnapshotCard
                                            key={snapshot.id}
                                            snapshotName={snapshot.name}
                                            onDeletePress={() => handleDeleteSnapshotPress(snapshot)}
                                            onPress={() => handleSnapshotPress(snapshot)}
                                        />
                                    ))}
                                </>
                            ) : (
                                <View style={styles.noItemsContainer}>
                                    <Text style={styles.noItemsTitle}>No Items Yet</Text>
                                    <Text style={styles.noItemsText}>
                                        Get started by pressing the + button below to add your first item.
                                    </Text>
                                </View>
                            )
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

export default Space;