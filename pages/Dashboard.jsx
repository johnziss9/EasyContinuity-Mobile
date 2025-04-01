import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpaceCard from '../components/SpaceCard';
import { SelectList } from 'react-native-dropdown-select-list'
import { useNavigation } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import ToastNotification from '../utils/ToastNotification';

const Dashboard = () => {
    const navigation = useNavigation();

    const [showAddNewSpaceModal, setShowAddNewSpaceModal] = useState(false);
    const [showDeleteSpaceModal, setShowDeleteSpaceModal] = useState(false);

    const [spaceNameField, setSpaceNameField] = React.useState('');
    const [spaceDescription, setSpaceDescription] = React.useState('');
    const [spaceType, setSpaceType] = useState('');
    const [spaces, setSpaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSpaceId, setCurrentSpaceId] = useState(null);
    const [spaceToDelete, setSpaceToDelete] = useState(null);

    const spaceTypes = [
        { key: '1', value: 'Movie' },
        { key: '2', value: 'Series' }
    ];

    useEffect(() => {
        handleGetAllSpaces();
    }, []);

    const handleSpacePress = (spaceId, spaceName) => {
        navigation.navigate('Space', {
            spaceId,
            spaceName
        });
    };

    const handleModalCancelPress = () => {
        setSpaceNameField('');
        setSpaceDescription('');
        setIsEditing(false);
        setShowAddNewSpaceModal(false);
    };

    const handleSpaceTypeSelect = (selectedKey) => {
        setSpaceType(selectedKey);
    };

    const handleEditSpacePress = (space) => {
        setIsEditing(true);
        setShowAddNewSpaceModal(true);
        setCurrentSpaceId(space.id);
        setSpaceNameField(space.name);
        setSpaceDescription(space.description);
        setSpaceType(space.type);
    }

    const handleConfirmDeleteSpacePress = async (space) => {
        try {
            const url = `/space/${space.id}`;
            const method = 'PUT';
            const body = {
                name: space.name,
                type: space.type,
                isDeleted: true,
                deletedOn: new Date().toISOString()
                // TODO Include deletedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                handleGetAllSpaces();
                ToastNotification.show('success', 'Success', 'Space Deleted Successfully');
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to delete space');
        }
    }

    const handleDeleteSpacePress = (space) => {
        setSpaceToDelete(space);
        setShowDeleteSpaceModal(true);
    }

    const handleSaveSpace = async () => {
        if (isEditing) {
            try {
                const url = `/space/${currentSpaceId}`;
                const method = 'PUT';
                const body = {
                    name: spaceNameField,
                    type: spaceType,
                    description: spaceDescription,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include lastUpdatedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    handleGetAllSpaces();
                    ToastNotification.show('success', 'Success', 'Space Updated Successfully');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to update space');
            } finally {
                setShowAddNewSpaceModal(false);
                setSpaceNameField('');
                setSpaceType('');
                setIsEditing(false);
            }
        } else {
            try {
                const url = '/space/';
                const method = 'POST';
                const body = {
                    name: spaceNameField,
                    type: spaceType,
                    description: spaceDescription,
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    handleGetAllSpaces();
                    ToastNotification.show('success', 'Success', 'Space Added Successfully');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to add space');
            } finally {
                setShowAddNewSpaceModal(false);
                setSpaceNameField('');
            }
        }
    }

    const handleGetAllSpaces = async () => {
        try {
            setIsLoading(true);

            const url = '/space';
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSpaces(response.data);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load spaces');
        } finally {
            setIsLoading(false);
        }
    }

    const getTextInputStyle = (value) => ({
        fontWeight: value ? 400 : 'normal'
    });

    const getSelectListStyle = (value) => ({
        fontSize: 18,
        color: '#3F4F5F',
        fontWeight: value ? 400 : 'normal'
    });

    return (
        <View style={styles.container}>

            {/* Delete space confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteSpaceModal}
                onRequestClose={() => setShowDeleteSpaceModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Space?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='delete-space-cancel-button' onPress={() => setShowDeleteSpaceModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='delete-space-confirm-button'
                                onPress={() => {
                                    setShowDeleteSpaceModal(false);
                                    handleConfirmDeleteSpacePress(spaceToDelete);
                                    setSpaceToDelete(null);
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add/Edit space modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showAddNewSpaceModal}
                onRequestClose={() => setShowAddNewSpaceModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Add Space:">Add Space:</Text>
                        {!isEditing ?
                            <SelectList
                                setSelected={handleSpaceTypeSelect}
                                data={spaceTypes}
                                placeholder="Type"
                                searchPlaceholder="Search..."
                                save='key'
                                boxStyles={styles.dropdownBox}
                                inputStyles={getSelectListStyle(spaceType)}
                                dropdownStyles={styles.dropdownList}
                                dropdownItemStyles={styles.dropdownListItem}
                                dropdownTextStyles={styles.dropdownListText}
                                maxHeight={150}
                                testID="space-type-select"
                            /> :
                            <View pointerEvents='none'>
                                <SelectList
                                    setSelected={handleSpaceTypeSelect}
                                    data={spaceTypes}
                                    placeholder="Type"
                                    defaultOption={spaceTypes.find(type => type.key === spaceType)}
                                    save="key"
                                    style={styles.selectList}
                                    boxStyles={{
                                        ...styles.dropdownBox,
                                        backgroundColor: 'rgba(153, 153, 153, 0.3)'
                                    }}
                                    inputStyles={getSelectListStyle(spaceType)}
                                    dropdownStyles={styles.dropdownList}
                                    dropdownItemStyles={styles.dropdownListItem}
                                    dropdownTextStyles={styles.dropdownListText}
                                    maxHeight={150}
                                    testID="space-type-select"
                                    pointerEvents="none"
                                />
                            </View>
                        }
                        <TextInput
                            style={[styles.modalTextbox, { height: 60 }, getTextInputStyle(spaceNameField)]}
                            onChangeText={setSpaceNameField}
                            value={spaceNameField}
                            placeholder='Name'
                            cursorColor={'#3F4F5F'}
                            testID='space-name-text-input'
                        />
                        <TextInput
                            style={[styles.modalTextbox, { height: 120, textAlignVertical: 'top' }, getTextInputStyle(spaceDescription)]}
                            onChangeText={setSpaceDescription}
                            value={spaceDescription}
                            placeholder='Description'
                            cursorColor={'#3F4F5F'}
                            multiline
                            numberOfLines={4}
                            testID='space-description-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='add-space-cancel-button' onPress={handleModalCancelPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='add-space-submit-button' onPress={handleSaveSpace}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewContent}>
                {isLoading ? (
                    <ActivityIndicator size="large" color="#3F4F5F" />
                ) : (
                    <>
                        {Array.isArray(spaces) && spaces.length > 0 ? spaces.map((space) => (
                            <SpaceCard
                                key={space.id}
                                spaceName={space.name}
                                description={space.description}
                                onPress={() => handleSpacePress(space.id, space.name)}
                                onEditPress={() => handleEditSpacePress(space)}
                                onDeletePress={() => handleDeleteSpacePress(space)}
                            />
                        )) :
                            <View style={styles.noSpacesContainer}>
                                <Text style={styles.noSpacesTitle}>No Spaces Yet</Text>
                                <Text style={styles.noSpacesText}>Get started by pressing the + button below to create your first space.</Text>
                            </View>
                        }
                    </>
                )}
            </ScrollView>
            <Pressable style={styles.addNewButton} testID='add-space-button' onPress={() => setShowAddNewSpaceModal(true)}>
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
    noSpacesContainer: {
        alignItems: 'center',
        borderWidth: 3,
        borderRadius: 10,
        borderColor: '#3F4F5F',
        padding: 20,
        maxWidth: 600
    },
    noSpacesTitle: {
        fontSize: 23,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#3F4F5F'
    },
    noSpacesText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#3F4F5F'
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
    modalTextbox: {
        width: '100%',
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
        width: '100%',
        height: 60,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        marginBottom: 10,
        marginTop: 10,
        alignItems: 'center',
        paddingHorizontal: 7
    },
    dropdownList: {
        borderColor: '#3F4F5F',
        borderRadius: 5,
        width: '100%',
        marginTop: 0,
        marginBottom: 25
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    modalButton: {
        marginTop: 10,
        padding: 10,
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
    scrollViewContent: {
        width: '100%'
    }
});

export default Dashboard;