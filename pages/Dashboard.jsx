import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpaceCard from '../components/SpaceCard';
import { SelectList } from 'react-native-dropdown-select-list'
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [showAddNewSpaceModal, setShowAddNewSpaceModal] = useState(false);
    const [spaceName, setSpaceName] = React.useState('');
    const [spaceType, setSpaceType] = useState("");

    const spaceTypes = [
        { key: '1', value: 'Movie' },
        { key: '2', value: 'Series' }
    ];

    const handleSpacePress = () => {
        navigation.navigate('Space');
    };

    const handleModalCancelPress = () => {
        setSpaceName('');
        setShowAddNewSpaceModal(false);
    };

    const dynamicStyles = {
        modalTextbox: {
            width: width < 600 ? '100%' : '61%',
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
        dropdownBox: {
            width: width < 600 ? '100%' : '61%',
            height: 60,
            borderColor: '#3F4F5F',
            borderRadius: 5,
            backgroundColor: 'rgba(205, 167, 175, 0.2)',
            marginBottom: 5,
            alignItems: 'center',
            paddingHorizontal: 7
        },
        dropdownList: {
            borderColor: '#3F4F5F',
            borderRadius: 5,
            width: width < 600 ? '100%' : '61%',
            marginTop: 0,
            marginBottom: 25
        },
    };

    return (
        <SafeAreaView style={styles.container}>
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddNewSpaceModal}
                onRequestClose={() => setShowAddNewSpaceModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Enter Space Name:">Enter Space Name:</Text>
                        <TextInput
                            style={dynamicStyles.modalTextbox}
                            onChangeText={setSpaceName}
                            value={spaceName}
                            placeholder='Space Name'
                            cursorColor={'#3F4F5F'}
                            testID='space-name-text-input'
                        />
                        <SelectList
                            setSelected={setSpaceType}
                            data={spaceTypes}
                            placeholder="Type"
                            searchPlaceholder="Search..."
                            style={styles.selectList}
                            boxStyles={dynamicStyles.dropdownBox}
                            inputStyles={styles.dropdownInput}
                            dropdownStyles={dynamicStyles.dropdownList}
                            dropdownItemStyles={styles.dropdownListItem}
                            dropdownTextStyles={styles.dropdownListText}
                            maxHeight={150}
                            testID="space-type-select"
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} testID='add-space-cancel-button' onPress={handleModalCancelPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} testID='add-space-submit-button' onPress={() => setShowAddNewSpaceModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <SpaceCard spaceName={"House of the Dragons"} onPress={handleSpacePress} />
            <SpaceCard spaceName={"Fast & Furious"} onPress={handleSpacePress} />
            <Pressable style={styles.addNewButton} testID='add-space-button' onPress={() => setShowAddNewSpaceModal(true)}>
                <Ionicons name="add-circle-sharp" size={70} color="#CDA7AF" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center'
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
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
        alignItems: 'left',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 13,
        marginLeft: 2,
        fontWeight: 'bold',
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
        marginRight: 10,
        justifyContent: 'center'
    },
    modalButtonSave: {
        backgroundColor: '#3F4F5F',
    },
    modalButtonCancel: {
        borderWidth: 2,
        borderColor: '#3F4F5F'
    },
    modalButtonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalButtonTextSave: {
        color: '#E2CFC8'
    },
    modalButtonTextCancel: {
        color: '#3F4F5F'
    },
    dropdownInput: {
        fontSize: 18,
        color: '#3F4F5F'
    },
    
    dropdownListItem: {
        marginBottom: 5
    },
    dropdownListText: {
        color: '#3F4F5F',
        fontSize: 18,
    },
});

export default Dashboard;