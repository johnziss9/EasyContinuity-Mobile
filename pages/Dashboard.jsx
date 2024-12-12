import React, { useEffect, useState } from 'react';
import { StyleSheet, Pressable, Modal, View, Text, TouchableOpacity, TextInput, useWindowDimensions, ActivityIndicator, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SpaceCard from '../components/SpaceCard';
import { SelectList } from 'react-native-dropdown-select-list'
import { useNavigation } from '@react-navigation/native';
import handleHttpRequest from '../api/api';

const Dashboard = () => {
    const navigation = useNavigation();
    const { width } = useWindowDimensions();

    const [showAddNewSpaceModal, setShowAddNewSpaceModal] = useState(false);
    const [spaceNameField, setSpaceNameField] = React.useState('');
    const [spaceType, setSpaceType] = useState('');
    const [spaces, setSpaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSpaceId, setCurrentSpaceId] = useState(null);

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
        setSpaceType(space.type);
    }

    const handleDeleteSpacePress = async (space) => {
        // TODO Add modal for confirmation

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
                // TODO Show success toast
                // TODO Refresh data on screen
                handleGetAllSpaces();
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Deleting Space:', error);

            // TODO Replace error with fail toast
            throw error;
        } finally {
            // TODO Show deletion confirmation
        }
    }

    const handleSaveSpace = async () => {
        if (isEditing) {
            try {
                const url = `/space/${currentSpaceId}`;
                const method = 'PUT';
                const body = {
                    name: spaceNameField,
                    type: spaceType,
                    lastUpdatedOn: new Date().toISOString()
                    // TODO Include lastUpdatedBy
                };
    
                const response = await handleHttpRequest(url, method, body);
    
                if (response.success) {
                    // TODO Show success toast
                    // TODO Refresh data on screen
                    handleGetAllSpaces();
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error Updating Space:', error);
    
                // TODO Replace error with fail toast
                throw error;
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
                    createdOn: new Date().toISOString()
                    // TODO Include AddedBy
                };
    
                const response = await handleHttpRequest(url, method, body);
    
                if (response.success) {
                    // TODO Show success toast
                    // TODO Refresh data on screen
                    handleGetAllSpaces();
                } else {
                    // TODO Replace error with fail toast
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error Creating Space:', error);
    
                // TODO Replace error with fail toast
                throw error;
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
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Getting Spaces:', error);

            // TODO Replace error with fail toast
            throw error;
        } finally {
            setIsLoading(false);
        }
    }

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
        <View style={styles.container}>
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
                            onChangeText={setSpaceNameField}
                            value={spaceNameField}
                            placeholder='Space Name'
                            cursorColor={'#3F4F5F'}
                            testID='space-name-text-input'
                        />
                        {!isEditing ?
                            <SelectList
                                setSelected={handleSpaceTypeSelect}
                                data={spaceTypes}
                                placeholder="Type"
                                searchPlaceholder="Search..."
                                save='key'
                                style={styles.selectList}
                                boxStyles={dynamicStyles.dropdownBox}
                                inputStyles={styles.dropdownInput}
                                dropdownStyles={dynamicStyles.dropdownList}
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
                                        ...dynamicStyles.dropdownBox,
                                        backgroundColor: 'rgba(153, 153, 153, 0.3)'
                                    }}
                                    inputStyles={styles.dropdownInput}
                                    dropdownStyles={dynamicStyles.dropdownList}
                                    dropdownItemStyles={styles.dropdownListItem}
                                    dropdownTextStyles={styles.dropdownListText}
                                    maxHeight={150}
                                    testID="space-type-select"
                                    pointerEvents="none"
                                />
                            </View>      
                        }
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} testID='add-space-cancel-button' onPress={handleModalCancelPress}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonSave]} testID='add-space-submit-button' onPress={handleSaveSpace}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Submit</Text>
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
    scrollViewContent: {
        width: '100%'
    }
});

export default Dashboard;