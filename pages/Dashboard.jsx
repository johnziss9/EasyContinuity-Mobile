import React, { useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpaceCard from '../components/SpaceCard';
import { useNavigation } from '@react-navigation/native';

const Dashboard = () => {
    const navigation = useNavigation();

    const [showAddNewSpaceModal, setShowAddNewSpaceModal] = useState(false);
    const [spaceName, setSpaceName] = React.useState('');

    const hendleSpacePress = () => {
        navigation.navigate('Space');
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
                            style={styles.modalTextbox}
                            onChangeText={setSpaceName}
                            value={spaceName}
                            placeholder='Space Name'
                            cursorColor={'#3F4F5F'}
                            testID='space-name-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} testID='add-space-cancel-button' onPress={() => setShowAddNewSpaceModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} testID='add-space-submit-button' onPress={() => setShowAddNewSpaceModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <SpaceCard spaceName={"House of the Dragons"} onPress={hendleSpacePress} />
            <SpaceCard spaceName={"Fast & Furious"} onPress={hendleSpacePress} />
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
        fontSize: 20,
        marginBottom: 15,
        paddingLeft: 1,
        color: '#3F4F5F'
    },
    modalTextbox: {
        width: 300,
        height: 60,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        backgroundColor: 'rgba(205, 167, 175, 0.4)',
        fontSize: 18,
        marginBottom: 10
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
        marginRight: 10
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
    }

});

export default Dashboard;