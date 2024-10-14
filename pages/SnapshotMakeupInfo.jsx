import React, { useState } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SnapshotMakeupInfo = ({ route }) => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const { isNewSnapshot } = route.params; // Passing this to SnapshotMakeupInfo to show the right title

    const [skin, setSkin] = useState("");
    const [brows, setBrows] = useState("");
    const [eyes, setEyes] = useState("");
    const [lips, setLips] = useState("");
    const [effects, setEffects] = useState("");
    const [notes, setNotes] = useState("");

    const handleCancelPress = () => {
        navigation.navigate(isNewSnapshot ? 'Space' : 'Snapshot');
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
        <View style={dynamicStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>{isNewSnapshot ? "Add Makeup Details" : "Edit Makeup Details"}</Text>
                <Text style={styles.label} accessibilityLabel="Skin:">Skin:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setSkin}
                    value={skin}
                    placeholder='Skin'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-skin-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Brows:">Brows:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setBrows}
                    value={brows}
                    placeholder='Brows'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-brows-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Eyes:">Eyes:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setEyes}
                    value={eyes}
                    placeholder='Eyes'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-eyes-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Lips:">Lips:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setLips}
                    value={lips}
                    placeholder='Lips'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-lips-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Effects:">Effects:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setEffects}
                    value={effects}
                    placeholder='Effects'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-effects-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Notes:">Notes:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setNotes}
                    value={notes}
                    placeholder='Makeup Notes'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='makeup-notes-text-input'
                />
                <View style={styles.formButtonsContainer}>
                    <TouchableOpacity style={[styles.formButton, styles.buttonCancel]} onPress={handleCancelPress} testID='makeup-cancel-button'>
                        <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} testID='makeup-submit-button'>
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