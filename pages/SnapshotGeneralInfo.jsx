import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Modal, View, TouchableOpacity, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import { useNavigation, useRoute } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CharacterCard from '../components/CharacterCard';
import ToastNotification from '../utils/ToastNotification';

const SnapshotGeneralInfo = () => {

    const route = useRoute();
    const { isNewSnapshot, spaceId, spaceName, folderId, folderName, snapshotId } = route.params;

    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [name, setName] = useState("");
    const [episodeNumber, setEpisodeNumber] = useState('');
    const [sceneNumber, setSceneNumber] = useState('')
    const [storyDay, setStoryDay] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedCharacterId, setSelectedCharacterId] = useState(null);
    const [selectListKey, setSelectListKey] = useState(0);
    const [selectedValue, setSelectedValue] = useState('');
    const [characterName, setCharacterName] = useState("");
    const [characters, setCharacters] = useState([]);
    const [characterId, setCharacterId] = useState(null);
    const [snapshot, setSnapshot] = useState([]);
    const [spaceType, setSpaceType] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [characterToDelete, setCharacterToDelete] = useState(null);
    const [characterAdded, setCharacterAdded] = useState(null);
    const [isCharacterNew, setIsCharacterNew] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState('');

    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
    const [showManageCharactersModal, setShowManageCharactersModal] = useState(false);
    const [showDeleteCharacterModal, setShowDeleteCharacterModal] = useState(false);

    useEffect(() => {
        handleGetSpaceType();
        handleGetAllCharacters();

        if (!isNewSnapshot) {
            handleFetchSnapshot(snapshotId);
        }
    }, []);

    useEffect(() => {
        if (!isNewSnapshot && snapshot) {
            setName(snapshot.name || '');
            setEpisodeNumber(snapshot.episode || '');
            setSceneNumber(snapshot.scene ? snapshot.scene.toString() : '');
            setStoryDay(snapshot.storyDay ? snapshot.storyDay.toString() : '');
            setNotes(snapshot.notes || '');
            setSelectedCharacterId(snapshot.character || null);
        }
    }, [snapshot, isNewSnapshot]);

    useEffect(() => {
        if (confirmationModal) {
            handleConfirmationModalOkPress();
        }
    }, [confirmationModal]);

    const handleConfirmationModalOkPress = () => {
        if (confirmationModal === 'Snapshot') {
            handleNavigationOnConfirmOrCancel();
        } else if (confirmationModal === 'Character') {
            handleCharacterConfirmation();
        }
    }

    const handleCharacterConfirmation = async () => {
        if (isCharacterNew) {
            await handleGetAllCharacters();

            // Setting these two so the new added character is selected on the SelectList
            setSelectedCharacterId(characterAdded);
            setSelectListKey(prev => prev + 1);
        } else {
            await handleGetAllCharacters();
            setShowManageCharactersModal(true);
            setCharacterName('');
        }
    };

    const handleClear = () => {
        setSelectedCharacterId(null);
        setSelectedValue('');
        setSelectListKey(prev => prev + 1);
    };

    const handleSelectNewCharacter = (selectedKey, selectedValue) => {
        if (selectedKey === '1') {
            setShowAddCharacterModal(true);
        } else {
            setSelectedCharacterId(selectedKey);
            setSelectedValue(selectedValue);
        }

        // TODO Add validation if user selected first value and then cancels the snapshot shouldn't save
    };

    const handleNavigationOnConfirmOrCancel = () => {
        if (isNewSnapshot && !folderId) {
            navigation.navigate('Space', { spaceId: spaceId, spaceName: spaceName });
        } else if (isNewSnapshot) {
            // If it's a new snapshot and we have a folderId, go back to the folder view
            navigation.navigate('Folder', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName });
        } else {
            navigation.navigate('Snapshot', { spaceId: spaceId, spaceName: spaceName, snapshotId, snapshotName: name });
        }
    }

    const handleCloseManageCharacters = () => {
        setShowManageCharactersModal(false);
        handleClear();
    }

    const handleEditCharacterPress = (character) => {
        setShowManageCharactersModal(false);
        setIsEditing(true);
        setShowAddCharacterModal(true);
        setCharacterId(character.key);
        setCharacterName(character.value);
    };

    const handleConfirmDeleteCharacterPress = async (character) => {
        try {
            const deleteUrl = `/character/${character.key}`;
            const deleteMethod = 'PUT';
            const deleteBody = {
                name: character.value,
                isDeleted: true,
                deletedOn: new Date().toISOString()
                // TODO Include deletedBy
            };

            const deleteResponse = await handleHttpRequest(deleteUrl, deleteMethod, deleteBody);
            
            if (deleteResponse.success) {
                ToastNotification.show('success', 'Success', 'Character Deleted Successfully');

                // API Call 1 - Get all snapshots
                const snapshotsUrl = `/snapshot/space/${spaceId}`;
                const snapshotsMethod = 'GET';

                const snapshotsResponse = await handleHttpRequest(snapshotsUrl, snapshotsMethod);
                
                if (snapshotsResponse.success) {
                    const snapshotsWithDeletedCharacter = snapshotsResponse.data.filter(snapshot => snapshot.character === parseInt(character.key));

                    // API Call 2 - Update filtered snapshots character field to null
                    for (const snapshot of snapshotsWithDeletedCharacter) {
                        const updateUrl = `/snapshot/${snapshot.id}`;
                        const updateMethod = 'PUT';
                        const updateBody = {
                            character: null,
                            forceNullCharacter: true,
                            lastUpdatedOn: new Date().toISOString()
                            // TODO Include updatedBy
                        };

                        const updateResponse = await handleHttpRequest(updateUrl, updateMethod, updateBody);

                        if (!updateResponse) {
                            ToastNotification.show('error', 'Error', updateResponse.error);
                        }

                    }
                } else {
                    ToastNotification.show('error', 'Error', deleteResponse.error);
                }

                // API Call 3 - Update character list in the UI
                // Making a call to the API this way as if I call handleGetAllCharacters won't update straight away due to ti being async
                const getResponse = await handleHttpRequest(`/character/space/${spaceId}`, 'GET');

                // Running this again just like in handleGetAllCharacters to update the state
                const formattedCharacters = [
                    { key: '1', value: 'Add New Character' },
                    ...getResponse.data.map(character => ({
                        key: character.id,
                        value: character.name
                    }))
                ];
                setCharacters(formattedCharacters);

                // This closes the Manage Characters modal if there are no more characters to manage.
                if (getResponse.data.length === 0) {
                    handleCloseManageCharacters();
                }
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to delete character');
        }
    }

    const dynamicStyles = {
        container: {
            paddingLeft: width > 600 ? 15 : 5,
            flex: 1,
            backgroundColor: '#E2CFC8',
            paddingTop: 30
        }
    };

    const handleGetSpaceType = async () => {
        try {
            const url = `/space/${spaceId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSpaceType(response.data.type);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to get space type');
        }
    }

    const handleFetchSnapshot = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSnapshot(response.data);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load snapshot');
        }
    }

    const handleCancelAddOrEditCharacter = () => {
        handleClear();

        setShowAddCharacterModal(false);
        setCharacterName('');

        if (isEditing) {
            setShowManageCharactersModal(true);
        }
    }

    const handleDeleteCharacterPress = (character) => {
        setCharacterToDelete(character);
        setShowDeleteCharacterModal(true);
    }

    const handleCreateOrEditSnapshot = async () => {
        if (isNewSnapshot) {
            try {
                const url = '/snapshot/';
                const method = 'POST';
                const body = {
                    name: name,
                    spaceId: spaceId,
                    folderId: folderId,
                    episode: episodeNumber,
                    scene: sceneNumber ? parseInt(sceneNumber) : null,
                    storyDay: storyDay ? parseInt(storyDay) : null,
                    character: selectedCharacterId,
                    notes: notes,
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    ToastNotification.show('success', 'Success', 'Snapshot Added Successfully');
                    setConfirmationModal('Snapshot');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to create snapshot');
            }
        }
        else {
            try {
                const url = `/snapshot/${snapshotId}`;
                const method = 'PUT';
                const body = {
                    name: name,
                    spaceId: spaceId,
                    folderId: folderId,
                    episode: episodeNumber,
                    scene: sceneNumber ? parseInt(sceneNumber) : null,
                    storyDay: storyDay ? parseInt(storyDay) : null,
                    character: selectedCharacterId,
                    forceNullCharacter: selectedCharacterId === null,
                    notes: notes,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    ToastNotification.show('success', 'Success', 'Snapshot General Details Updated Successfully');
                    setConfirmationModal('Snapshot');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to update snapshot');
            }
        }
    }

    const handleCreateOrEditCharacter = async () => {
        if (!isEditing) {            
            try {
                const url = '/character/';
                const method = 'POST';
                const body = {
                    name: characterName,
                    spaceId: spaceId,
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    ToastNotification.show('success', 'Success', 'Character Added Successfully');
                    setConfirmationModal('Character');
                    setIsCharacterNew(true);
                    setCharacterAdded(response.data.id); // This is used to select the new character on the SelectList
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to create character');
            } finally {
                setShowAddCharacterModal(false);
                setCharacterName('');
            }
        } else {
            try {
                const url = `/character/${characterId}`;
                const method = 'PUT';
                const body = {
                    name: characterName,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include updated by
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    ToastNotification.show('success', 'Success', 'Character Updated Successfully');
                    setConfirmationModal('Character');
                    setIsCharacterNew(false);
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to update character');
            } finally {
                setShowAddCharacterModal(false);
                setIsEditing(false);
            }
        }
    }

    const handleGetAllCharacters = async () => {
        try {
            setIsLoading(true);

            const url = `/character/space/${spaceId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                const formattedCharacters = [
                    { key: '1', value: 'Add New Character' },
                    ...response.data.map(character => ({
                        key: character.id,
                        value: character.name
                    }))
                ];
                setCharacters(formattedCharacters);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load characters');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <View style={dynamicStyles.container} testID='snapshot-general-container'>

            {/* Delete confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteCharacterModal}
                onRequestClose={() => setShowDeleteCharacterModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Character?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='delete-character-cancel-button' onPress={() => setShowDeleteCharacterModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='delete-character-confirm-button'
                                onPress={() => {
                                    setShowDeleteCharacterModal(false);
                                    handleConfirmDeleteCharacterPress(characterToDelete);
                                    setCharacterToDelete(null); 
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Manage Characters Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showManageCharactersModal}
                onRequestClose={() => setShowManageCharactersModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTextManageCharacters} accessibilityLabel={`Manage Characters - ${characters.length - 1}:`}>Manage Characters ({characters.length - 1}):</Text>
                        {isLoading ? (
                            <ActivityIndicator size="large" color="#3F4F5F" />
                        ) : (
                            <>
                                {Array.isArray(characters) ? characters.slice(1).map((character) => (
                                    <CharacterCard
                                        key={character.key}
                                        characterName={character.value}
                                        onEditPress={() => handleEditCharacterPress(character)}
                                        onDeletePress={() => handleDeleteCharacterPress(character)}
                                    />
                                )) : null}
                            </>
                        )}
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='manage-characters-close-button' onPress={handleCloseManageCharacters}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Character Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddCharacterModal}
                onRequestClose={() => setShowAddCharacterModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel={!isEditing ? 'Add New Character:' : 'Update Character:'}>{!isEditing ? 'Add New Character:' : 'Update Character:'}</Text>
                        <TextInput
                            style={styles.modalTextbox}
                            onChangeText={setCharacterName}
                            value={characterName}
                            placeholder='Character Full Name'
                            cursorColor={'#3F4F5F'}
                            testID='character-name-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='add-new-character-cancel-button' onPress={handleCancelAddOrEditCharacter}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='add-new-character-submit-button' onPress={handleCreateOrEditCharacter}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>{isNewSnapshot ? "Add New Snapshot" : "Edit Snapshot"}</Text>
                <Text style={styles.label} accessibilityLabel="Name:">Name:</Text>
                <TextInput
                    style={styles.textbox}
                    onChangeText={setName}
                    value={name}
                    placeholder='Snapshot Name'
                    cursorColor={'#3F4F5F'}
                    testID='snapshot-name-text-input'
                />
                {spaceType == 2 ?
                    <>
                        <Text style={styles.label} accessibilityLabel="Episode Number:">Episode Number:</Text>
                        <TextInput
                            style={styles.textbox}
                            onChangeText={setEpisodeNumber}
                            value={episodeNumber}
                            placeholder='Episode Number'
                            cursorColor={'#3F4F5F'}
                            testID='episode-number-text-input'
                        />
                    </>
                    : null}
                <Text style={styles.label} accessibilityLabel="Scene Number:">Scene Number:</Text>
                <TextInput
                    style={styles.textbox}
                    onChangeText={setSceneNumber}
                    value={sceneNumber}
                    placeholder='Scene Number'
                    cursorColor={'#3F4F5F'}
                    testID='scene-number-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Story Day:">Story Day:</Text>
                <TextInput
                    style={styles.textbox}
                    onChangeText={setStoryDay}
                    value={storyDay}
                    placeholder='Story Day'
                    cursorColor={'#3F4F5F'}
                    testID='story-day-text-input'
                />
                <View style={styles.characterLabel}>
                    <Text style={styles.label} accessibilityLabel="Character:">Character:</Text>
                    <View style={styles.characterSelectButtons}>
                    {selectedCharacterId && 
                        <TouchableOpacity
                            onPress={handleClear}
                            style={styles.characterButton}
                            testID='clear-character-button'
                        >
                            <Ionicons name="close-circle-outline" size={21} color="#3F4F5F" />
                        </TouchableOpacity>
                    }
                        {characters.length > 1 &&
                            <TouchableOpacity
                                onPress={() => setShowManageCharactersModal(true)}
                                style={styles.characterButton}
                                testID='manage-characters-button'
                            >
                                <Ionicons name="settings-outline" size={20} color="#3F4F5F" />
                            </TouchableOpacity>
                        }
                    </View>
                </View>
                <SelectList
                    key={selectListKey}
                    setSelected={handleSelectNewCharacter}
                    data={characters}
                    value={selectedValue}
                    defaultOption={characters.find(char => char.key === selectedCharacterId)}
                    placeholder="Character"
                    searchPlaceholder="Search..."
                    boxStyles={styles.dropdownBox}
                    inputStyles={styles.dropdownInput}
                    dropdownStyles={styles.dropdownList}
                    dropdownItemStyles={styles.dropdownListItem}
                    dropdownTextStyles={styles.dropdownListText}
                    maxHeight={150}
                    testID="character-select"
                />
                <Text style={styles.label} accessibilityLabel="Notes:">Notes:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setNotes}
                    value={notes}
                    placeholder='Snapshot Notes'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='snapshot-notes-text-input'
                />
                <View style={styles.formButtonsContainer}>
                    <TouchableOpacity style={[styles.formButton, styles.modalButtonLeft]} onPress={handleNavigationOnConfirmOrCancel} testID='general-cancel-button'>
                        <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.modalButtonRight]} onPress={handleCreateOrEditSnapshot} testID='general-submit-button'>
                        <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#3F4F5F',
        marginLeft: 20,
        marginBottom: 30
    },
    label: {
        fontSize: 20,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#3F4F5F',
        marginLeft: 22
    },
    textbox: {
        width: 300,
        height: 60,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        fontSize: 18,
        marginBottom: 25,
        marginLeft: 20,
        color: '#3F4F5F'
    },
    dropdownBox: {
        width: 300,
        height: 60,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        marginBottom: 25,
        marginLeft: 20,
        alignItems: 'center',
        paddingHorizontal: 7
    },
    dropdownInput: {
        fontSize: 18,
        color: '#3F4F5F'
        // placeholder colour is rgba(0, 0, 0, 0.54)'
    },
    dropdownList: {
        borderColor: '#3F4F5F',
        borderRadius: 5,
        width: 300,
        marginLeft: 20,
        marginTop: 0,
        marginBottom: 25
    },
    dropdownListItem: {
        marginBottom: 5
    },
    dropdownListText: {
        color: '#3F4F5F',
        fontSize: 18,
    },
    multilineTextbox: {
        width: 300,
        height: 120,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingTop: 5,
        paddingLeft: 7,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        fontSize: 18,
        marginBottom: 30,
        marginLeft: 20,
        color: '#3F4F5F',
        textAlignVertical: 'top'
    },
    formButtonsContainer: {
        width: 300,
        marginLeft: 20,
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    formButton: {
        padding: 10,
        borderRadius: 5,
        width: 140,
        height: 50,
        justifyContent: 'center'
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
        maxWidth: 400
    },
    modalText: {
        fontSize: 18,
        marginLeft: 2,
        fontWeight: 'bold',
        color: '#3F4F5F'
    },
    modalTextManageCharacters: {
        fontSize: 20,
        marginBottom: 12,
        marginLeft: 2,
        fontWeight: 'bold',
        color: '#3F4F5F',
        marginBottom: 25,
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
    characterLabel: {
        flexDirection: 'row',
        alignItems: 'flex-start'
    },
    characterSelectButtons: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    characterButton: {
        marginLeft: 8,
        paddingTop: 5
    }
});

export default SnapshotGeneralInfo;