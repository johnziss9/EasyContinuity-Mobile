import React, { useState } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SelectList } from 'react-native-dropdown-select-list'

const SnapshotGeneralInfo = ({ route }) => {
    // const navigation = useNavigation();
    const { isNewSnapshot } = route.params; // Passing this to SnapshotGeneralInfo to show the right title

    const [name, setName] = useState("");
    const [episodeNumber, setEpisodeNumber] = useState("");
    const [sceneNumber, setSceneNumber] = useState("");
    const [storyDay, setStoryDay] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedActor, setSelectedActor] = useState("");
    const [selectedCharacter, setSelectedCharacter] = useState("");
    const [showAddActorModal, setShowAddActorModal] = useState(false);
    const [showAddCharacterModal, setShowAddCharacterModal] = useState(false);
    const [actorName, setActorName] = useState("");
    const [actorNumber, setActorNumber] = useState("");
    const [characterName, setCharacterName] = useState("");

    const actors = [
        { key: '1', value: 'Add New Actor' },
        { key: '2', value: 'Jason Statham - 1' },
        { key: '3', value: 'Sydney Sweeny - 2' },
        { key: '4', value: 'Tom Cruise - 3' },
    ];

    const characters = [
        { key: '1', value: 'Add New Character' },
        { key: '2', value: 'Tony Soprano' },
        { key: '3', value: 'Wonder Woman' },
        { key: '4', value: 'Rhaenyra' },
    ];

    const handleSelectNewActor = (selectedKey, selectedValue) => {
        if (selectedKey === '1') {
            setShowAddActorModal(true);
        } else {
            setSelectedActor(selectedValue);
        }

        // TODO Add validation if user selected first value and then cancels the snapshot shouldn't save
    };

    const handleSelectNewCharacter = (selectedKey, selectedValue) => {
        if (selectedKey === '1') {
            setShowAddCharacterModal(true);
        } else {
            setSelectedCharacter(selectedValue);
        }

        // TODO Add validation if user selected first value and then cancels the snapshot shouldn't save
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* Add New Actor Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddActorModal}
                onRequestClose={() => setShowAddActorModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Add New Actor:">Add New Actor:</Text>
                        <TextInput
                            style={styles.modalTextbox}
                            onChangeText={setActorName}
                            value={actorName}
                            placeholder='Actor Full Name'
                            cursorColor={'#3F4F5F'}
                            testID='actor-name-text-input'
                        />
                        <TextInput
                            style={styles.modalTextbox}
                            onChangeText={setActorNumber}
                            value={actorNumber}
                            placeholder='Actor Number'
                            cursorColor={'#3F4F5F'}
                            testID='actor-number-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.buttonCancel]} testID='add-new-actor-cancel-button' onPress={() => setShowAddActorModal(false)}>
                                <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} testID='add-new-actor-submit-button' onPress={() => setShowAddActorModal(false)}>
                                <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                            <TouchableOpacity style={[styles.modalButton, styles.buttonSave]} testID='add-new-character-submit-button' onPress={() => setShowAddCharacterModal(false)}>
                                <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView>
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
                <Text style={styles.label} accessibilityLabel="Actor Name/Number:">Actor Name/Number:</Text>
                <SelectList
                    setSelected={handleSelectNewActor}
                    data={actors}
                    placeholder="Actor Name"
                    searchPlaceholder="Search..."
                    style={styles.selectList}
                    boxStyles={styles.dropdownBox}
                    inputStyles={styles.dropdownInput}
                    dropdownStyles={styles.dropdownList}
                    dropdownItemStyles={styles.dropdownListItem}
                    dropdownTextStyles={styles.dropdownListText}
                    maxHeight={150}
                />
                <Text style={styles.label} accessibilityLabel="Character:">Character:</Text>
                <SelectList
                    setSelected={handleSelectNewCharacter}
                    data={characters}
                    placeholder="Character"
                    searchPlaceholder="Search..."
                    style={styles.selectList}
                    boxStyles={styles.dropdownBox}
                    inputStyles={styles.dropdownInput}
                    dropdownStyles={styles.dropdownList}
                    dropdownItemStyles={styles.dropdownListItem}
                    dropdownTextStyles={styles.dropdownListText}
                    maxHeight={150}
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
                    <TouchableOpacity style={[styles.formButton, styles.buttonCancel]} testID='add-new-actor-cancel-button'>
                        <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} testID='add-new-actor-submit-button'>
                        <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8'
    },
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