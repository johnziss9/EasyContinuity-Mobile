import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import ToastNotification from '../utils/ToastNotification';

const SnapshotMakeupInfo = () => {

    const route = useRoute();
    const { isNewSnapshot, spaceId, spaceName, folderId, folderName, snapshotId, snapshotName } = route.params;

    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [skin, setSkin] = useState("");
    const [brows, setBrows] = useState("");
    const [eyes, setEyes] = useState("");
    const [lips, setLips] = useState("");
    const [effects, setEffects] = useState("");
    const [notes, setNotes] = useState("");
    const [snapshot, setSnapshot] = useState([]);

    useEffect(() => {
        handleFetchSnapshot(snapshotId);
    }, []);

    useEffect(() => {
        if (snapshot) {
            setSkin(snapshot.skin || '');
            setBrows(snapshot.brows || '');
            setEyes(snapshot.eyes || '');
            setLips(snapshot.lips || '');
            setEffects(snapshot.effects || '');
            setNotes(snapshot.makeupNotes || '');
        }
    }, [snapshot]);

    const getTextInputStyle = (value) => ({
        fontStyle: value ? 'normal' : 'italic',
    });

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

    const handleUpdateMakeupPress = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'PUT';
            const body = {
                name: snapshotName,
                spaceId: spaceId,
                folderId: folderId,
                skin: skin,
                brows: brows,
                eyes: eyes,
                lips: lips,
                effects: effects,
                makeupNotes: notes,
                lastUpdatedOn: new Date().toISOString()
                // TODO Include AddedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                ToastNotification.show('success', 'Success', 'Snapshot Makeup Details Updated Successfully');
                navigation.navigate('Snapshot', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName, snapshotId: snapshotId, snapshotName: snapshotName });
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to update snapshot');
        }
    }

    const handleCancelPress = () => {
        navigation.navigate('Snapshot', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName, snapshotId: snapshotId, snapshotName: snapshotName });
    };

    const dynamicStyles = {
        container: {
            paddingLeft: width > 600 ? 15 : 5,
            flex: 1,
            backgroundColor: '#E2CFC8',
            paddingTop: 30
        }
    };

    return (
        <View style={dynamicStyles.container} testID='snapshot-makeup-container'>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>{isNewSnapshot ? "Add Makeup Details" : "Edit Makeup Details"}</Text>
                <Text style={styles.label} accessibilityLabel="Skin:">Skin:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(skin)]}
                    onChangeText={setSkin}
                    value={skin}
                    placeholder='Skin'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-skin-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Brows:">Brows:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(brows)]}
                    onChangeText={setBrows}
                    value={brows}
                    placeholder='Brows'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-brows-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Eyes:">Eyes:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(eyes)]}
                    onChangeText={setEyes}
                    value={eyes}
                    placeholder='Eyes'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-eyes-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Lips:">Lips:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(lips)]}
                    onChangeText={setLips}
                    value={lips}
                    placeholder='Lips'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-lips-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Effects:">Effects:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(effects)]}
                    onChangeText={setEffects}
                    value={effects}
                    placeholder='Effects'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-effects-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Notes:">Notes:</Text>
                <TextInput
                    style={[styles.multilineTextbox, getTextInputStyle(notes)]}
                    onChangeText={setNotes}
                    value={notes}
                    placeholder='Makeup Notes'
                    placeholderTextColor="rgba(63, 79, 95, 0.55)"
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-notes-text-input'
                />
                <View style={styles.formButtonsContainer}>
                    <TouchableOpacity style={[styles.formButton, styles.buttonCancel]} onPress={handleCancelPress} testID='makeup-cancel-button'>
                        <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} onPress={handleUpdateMakeupPress} testID='makeup-submit-button'>
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
        marginBottom: 25,
        marginLeft: 20,
        color: '#3F4F5F',
        textAlignVertical: 'top'
    },
    formButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300,
        marginLeft: 20,
        marginBottom: 30,
        marginTop: 5
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

export default SnapshotMakeupInfo;