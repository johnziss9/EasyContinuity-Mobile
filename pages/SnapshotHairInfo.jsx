import React, { useState } from 'react';
import { StyleSheet, Text, ScrollView, TextInput, Modal, View, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const SnapshotHairInfo = ({ route }) => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const { isNewSnapshot } = route.params; // Passing this to SnapshotHairInfo to show the right title

    const [prep, setPrep] = useState("");
    const [method, setMethod] = useState("");
    const [stylingTools, setStylingTools] = useState("");
    const [products, setProducts] = useState("");
    const [notes, setNotes] = useState("");

    const handleCancelPress = () => {
        navigation.navigate(isNewSnapshot ? 'Space' : 'Snapshot');
    };

    const dynamicStyles = {
        container: {
            paddingLeft: width > 600 ? 15 : 0,
            flex: 1,
            backgroundColor: '#E2CFC8'
        }
    };

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <ScrollView>
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
                    onChangeText={setMethod}
                    value={method}
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
                    <TouchableOpacity style={[styles.formButton, styles.buttonSave]} testID='hair-submit-button'>
                        <Text style={[styles.buttonText, styles.buttonTextSave]}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
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