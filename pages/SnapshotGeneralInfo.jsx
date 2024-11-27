import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Modal, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list'
import { useNavigation, useRoute } from '@react-navigation/native';
import handleHttpRequest from '../api/api';

const SnapshotGeneralInfo = () => {

    const route = useRoute();
    const { isNewSnapshot, spaceId, spaceName, folderId, folderName, snapshotId, snapshotName } = route.params;

    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [name, setName] = useState("");
    const [episodeNumber, setEpisodeNumber] = useState('');
    const [sceneNumber, setSceneNumber] = useState('')
    const [storyDay, setStoryDay] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedCharacterId, setSelectedCharacterId] = useState(null);
    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
    const [characterName, setCharacterName] = useState("");
    const [characters, setCharacters] = useState([]);
    const [snapshot, setSnapshot] = useState([]);

    useEffect(() =>{
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

    const handleSelectNewCharacter = (selectedKey, selectedValue) => {
        if (selectedKey === '1') {
            setShowAddCharacterModal(true);
        } else {
            setSelectedCharacterId(selectedKey);
        }

        // TODO Add validation if user selected first value and then cancels the snapshot shouldn't save
    };

    const handleCancelPress = () => {
        if (isNewSnapshot && !folderId) {
            navigation.navigate('Space', { spaceId: spaceId, spaceName: spaceName });
          } else if (isNewSnapshot) {
            // If it's a new snapshot and we have a folderId, go back to the folder view
            navigation.navigate('Folder', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName });
          } else {
            navigation.navigate('Snapshot', { snapshotId, snapshotName });
          }
    };

    const dynamicStyles = {
        container: {
            paddingLeft: width > 600 ? 15 : 5,
            flex: 1,
            backgroundColor: '#E2CFC8',
            paddingTop: 30
        }
    };

    const handleFetchSnapshot = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSnapshot(response.data);
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Getting Snapshot:', error);
            
            // TODO Replace error with fail toast
            throw error;
        }
    }

    const handleCreateOrEditSnapshot = async () => {
        if (isNewSnapshot)
        {
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
                    // TODO Show success modal and navigate on okay

                    if (isNewSnapshot && !folderId) {
                        navigation.navigate('Space', { spaceId: spaceId, spaceName: spaceName });
                      } else if (isNewSnapshot) {
                        // If it's a new snapshot and we have a folderId, go back to the folder view
                        navigation.navigate('Folder', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName });
                      } else {
                        navigation.navigate('Snapshot', { snapshotId, snapshotName });
                      }
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error Creating Snapshot:', error);
                
                // TODO Replace error with fail toast
                throw error;
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
                    notes: notes,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);
    
                if (response.success) {
                    // TODO Show success modal and navigate on okay
                    navigation.navigate('Snapshot', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName, snapshotId: snapshotId, snapshotName: name });
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error Updating Snapshot:', error);
                
                // TODO Replace error with fail toast
                throw error;
            }
        }
    }

    const handleCreateCharacter = async () => {
        try {
            const url = '/character/';
            const method = 'POST';
            const body = {
                name: characterName,
                spaceId: spaceId
                // TODO Include AddedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                // TODO Show success toast
                await handleGetAllCharacters();
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Creating Character:', error);
            
            // TODO Replace error with fail toast
            throw error;
        } finally {
            setShowAddCharacterModal(false);
            setCharacterName('');
        }    
    }

    const handleGetAllCharacters = async () => {
        try {
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
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Getting Characters:', error);
            
            // TODO Replace error with fail toast
            throw error;
        }
    }

    return (
        <View style={dynamicStyles.container}>

            {/* Add New Character Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddCharacterModal}
                onRequestClose={() => setShowAddCharacterModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Add New Character:">Add New Character:</Text>
                        <TextInput
                            style={styles.modalTextbox}
                            onChangeText={setCharacterName}
                            value={characterName}
                            placeholder='Character Full Name'
                            cursorColor={'#3F4F5F'}
                            testID='character-name-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.buttonCancel]} testID='add-new-character-cancel-button' onPress={() => setShowAddCharacterModal(false)}>
                                <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} testID='add-new-character-submit-button' onPress={handleCreateCharacter}>
                                <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
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
                <Text style={styles.label} accessibilityLabel="Episode Number:">Episode Number:</Text>
                <TextInput
                    style={styles.textbox}
                    onChangeText={setEpisodeNumber}
                    value={episodeNumber}
                    placeholder='Episode Number'
                    cursorColor={'#3F4F5F'}
                    testID='episode-number-text-input'
                />
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
                <Text style={styles.label} accessibilityLabel="Character:">Character:</Text>
                <SelectList
                    setSelected={handleSelectNewCharacter}
                    data={characters}
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
                    <TouchableOpacity style={[styles.formButton, styles.buttonCancel]} onPress={handleCancelPress} testID='general-cancel-button'>
                        <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} onPress={handleCreateOrEditSnapshot} testID='general-submit-button'>
                        <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300,
        marginLeft: 20,
        marginBottom: 30
    },
    formButton: {
        padding: 10,
        borderRadius: 5,
        width: 140,
        height: 50,
        justifyContent: 'center'
    },
    buttonSave: {
        backgroundColor: '#3F4F5F',
    },
    buttonCancel: {
        borderWidth: 2,
        borderColor: '#3F4F5F',
        marginRight: 10
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
        fontSize: 20,
        marginBottom: 12,
        marginLeft: 2,
        fontWeight: 'bold',
        color: '#3F4F5F'
    },
    modalTextbox: {
        width: 300,
        height: 60,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        fontSize: 18,
        marginBottom: 10,
        color: '#3F4F5F'
    },
    modalButtonsContainer: {
        flexDirection: 'row'
    },
    modalButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 5,
        width: '30%',
        height: 50,
        justifyContent: 'center'
    },
    buttonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    buttonTextSave: {
        color: '#E2CFC8'
    },
    buttonTextCancel: {
        color: '#3F4F5F'
    }
});

export default SnapshotGeneralInfo;