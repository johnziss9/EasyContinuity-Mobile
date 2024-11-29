import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Modal, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import handleHttpRequest from '../api/api';

const SnapshotHairInfo = () => {

    const route = useRoute();
    const { isNewSnapshot, spaceId, spaceName, folderId, folderName, snapshotId, snapshotName } = route.params;

    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [prep, setPrep] = useState("");
    const [hairMethod, setHairMethod] = useState("");
    const [stylingTools, setStylingTools] = useState("");
    const [products, setProducts] = useState("");
    const [notes, setNotes] = useState("");
    const [snapshot, setSnapshot] = useState([]);

    useEffect(() => {
        handleFetchSnapshot(snapshotId);
    }, []);

    useEffect(() => {
        if (snapshot) {
            setPrep(snapshot.prep || '');
            setHairMethod(snapshot.method || '');
            setStylingTools(snapshot.stylingTools || '');
            setProducts(snapshot.products || '');
            setNotes(snapshot.hairNotes || '');
        }
    }, [snapshot]);

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

    const handleUpdateHairPress = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'PUT';
            const body = {
                name: snapshotName,
                spaceId: spaceId,
                folderId: folderId,
                prep: prep,
                method: hairMethod,
                stylingTools: stylingTools,
                products: products,
                hairNotes: notes,
                lastUpdatedOn: new Date().toISOString()
                // TODO Include AddedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                // TODO Show success modal and navigate on okay
                navigation.navigate('Snapshot', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName, snapshotId: snapshotId, snapshotName: snapshotName });
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
        <View style={dynamicStyles.container} testID='snapshot-hair-container'>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.header}>{isNewSnapshot ? "Add Hair Details" : "Edit Hair Details"}</Text>
                <Text style={styles.label} accessibilityLabel="Prep:">Prep:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setPrep}
                    value={prep}
                    placeholder='Prep'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='hair-prep-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Method:">Method:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setHairMethod}
                    value={hairMethod}
                    placeholder='Method'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='hair-method-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Styling Tools:">Styling Tools:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setStylingTools}
                    value={stylingTools}
                    placeholder='Styling Tools'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='hair-styling-tools-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Products:">Products:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setProducts}
                    value={products}
                    placeholder='Products'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='hair-products-text-input'
                />
                <Text style={styles.label} accessibilityLabel="Notes:">Notes:</Text>
                <TextInput
                    style={styles.multilineTextbox}
                    onChangeText={setNotes}
                    value={notes}
                    placeholder='Hair Notes'
                    multiline
                    numberOfLines={4}
                    cursorColor={'#3F4F5F'}
                    testID='hair-notes-text-input'
                />
                <View style={styles.formButtonsContainer}>
                    <TouchableOpacity style={[styles.formButton, styles.buttonCancel]} onPress={handleCancelPress} testID='hair-cancel-button'>
                        <Text style={[styles.buttonText, styles.buttonTextCancel]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} onPress={handleUpdateHairPress} testID='hair-submit-button'>
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

export default SnapshotHairInfo;