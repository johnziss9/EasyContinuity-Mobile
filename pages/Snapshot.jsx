import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import someImage from '../assets/dummy-image.jpg';
import someImage2 from '../assets/dummy-image2.jpg';
import someImage3 from '../assets/dummy-image3.jpeg';
import someImage4 from '../assets/dummy-image4.jpeg';
import ImageGrid from '../components/ImageGrid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import handleHttpRequest from '../api/api';

// TODO Using testImages prop in order to test the empty dummyImages array in the Snapshot tests - Needs to be removed
const Snapshot = ({ testImages = null }) => {

    const navigation = useNavigation();
    const route = useRoute();

    const { spaceId, spaceName, folderId, folderName, snapshotId, snapshotName } = route.params;

    const MAX_IMAGES = 6;

    const { filesInfo, browseFiles, clearFiles } = useFileBrowser({
        fileTypes: ['image/jpeg', 'image/jpg', 'image/png']
    });

    const [showImageModal, setShowImageModal] = useState(false);
    const [showDeleteSnapshotModal, setShowDeleteSnapshotModal] = useState(false);

    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [snapshot, setSnapshot] = useState({});
    const [characterName, setCharacterName] = useState('');
    const [spaceType, setSpaceType] = useState(0);

    // Initial code was: const dummyImages = [
    // TODO This would need to be removed and updated when there's not images coming from the database
    const dummyImages = testImages !== null ? testImages : [
        { id: 1, source: someImage },
        { id: 2, source: someImage2 },
        { id: 3, source: someImage3 },
        { id: 4, source: someImage4 }
    ];

    const renderField = (label, value, index, sectionId) => {
        return (
            <View
                key={`field-${index}`}
                style={styles.fieldContainer}
                testID={`${sectionId}-field-${index}`}
            >
                <Text style={styles.fieldLabel}>{label}</Text>
                <Text style={styles.fieldText}>{value}</Text>
            </View>
        );
    }

    const renderSection = (title, fields, onPress, sectionId) => {
        return (
            <View
                key={`section-${sectionId}`}
                style={styles.section}
                testID={`section-${sectionId}`}
            >
                <View style={styles.sectionTitleAndIcon}>
                    <Text style={styles.sectionHeader}>{title}</Text>
                    <TouchableOpacity
                        style={styles.editSection}
                        onPress={onPress}
                        testID={`edit-${sectionId}-button`}
                    >
                        <Ionicons name="create-outline" size={30} color="#3F4F5F" />
                    </TouchableOpacity>
                </View>
                {fields.map(([label, value], index) => renderField(label, value, index, sectionId))}
            </View>
        );
    };

    const handleEditImagesPress = () => {
        navigation.navigate('SnapshotImagesManage', { spaceId, folderId, snapshotId });
    };

    const handleEditGeneralPress = () => {
        navigation.navigate('SnapshotGeneralInfo', { isNewSnapshot: false, spaceId, spaceName, folderId, folderName, snapshotId, snapshotName });
    };

    const handleEditMakeupPress = () => {
        navigation.navigate('SnapshotMakeupInfo', { spaceId, spaceName, folderId, folderName, snapshotId, snapshotName });
    };

    const handleEditHairPress = () => {
        navigation.navigate('SnapshotHairInfo', { spaceId, spaceName, folderId, folderName, snapshotId, snapshotName });
    };

    const handleImagePress = (index) => {
        setSelectedImageIndex(index);
        setShowImageModal(true);
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex + 1) % dummyImages.length);
    };

    const handlePreviousImage = () => {
        setSelectedImageIndex((prevIndex) => (prevIndex - 1 + dummyImages.length) % dummyImages.length);
    };

    // TODO Remove this once images are working correctly when uploading
    useFocusEffect(
        useCallback(() => {
            handleGetSpaceType();
            handleGetSnapshotInfo();

            console.log('Current filesInfo:', filesInfo);
        }, [])
    );

    const handleConfirmDeleteSnapshotPress = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'PUT';
            const body = {
                name: snapshotName,
                isDeleted: true,
                deletedOn: new Date().toISOString()
                // TODO Include deletedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                // TODO Show success toast
                if (!folderId)
                    navigation.navigate('Space', { spaceId: spaceId, spaceName: spaceName });
                else
                    navigation.navigate('Folder', { spaceId: spaceId, spaceName: spaceName, folderId: folderId, folderName: folderName });
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Deleting Snapshot:', error);

            // TODO Replace error with fail toast
            throw error;
        } finally {
            // TODO Show deletion confirmation
        }
    }

    const handleGetSpaceType = async () => {
        try {
            const url = `/space/${spaceId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSpaceType(response.data.type);
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Getting Space Type:', error);
            
            // TODO Replace error with fail toast
            throw error;
        }
    }

    const handleGetCharacterName = async (characterId) => {
        try {
            const url = `/character/${characterId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setCharacterName(response.data.name)
            } else {
                // TODO Replace error with fail toast
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('Error Getting Character:', error);
            
            // TODO Replace error with fail toast
            throw error;
        }
    }

    const handleGetSnapshotInfo = async () => {
        try {
            const url = `/snapshot/${snapshotId}`;
            const method = 'GET';

            const response = await handleHttpRequest(url, method);

            if (response.success) {
                setSnapshot(response.data);
                if (response.data.character) {
                    await handleGetCharacterName(response.data.character);
                } else {
                    setCharacterName('');
                }
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

    const handleBrowseFiles = async () => {
        console.log('Attempting to browse files...');
        const availableSlots = MAX_IMAGES - selectedImages.length;

        if (availableSlots <= 0) {
            Alert.alert(
                "Maximum Images Reached",
                `You've already selected the maximum of ${MAX_IMAGES} images. Please remove some images before adding more.`,
                [{ text: "OK" }]
            );
            return;
        }

        try {
            const result = await browseFiles();
            console.log('Browse files result:', result);

            if (result === null || result === undefined || result.length === 0) {
                console.log('No valid files selected or unsupported file type.');
            } else {
                const newImages = result.slice(0, availableSlots);
                setSelectedImages(prevImages => [...prevImages, ...newImages]);

                console.log(`Selected ${newImages.length} file(s)`);
                newImages.forEach((file, index) => {
                    console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
                });

                if (result.length > availableSlots) {
                    const addedImages = newImages.length;
                    Alert.alert(
                        "Maximum Images Reached",
                        `Only ${addedImages} image(s) were added to reach the maximum of ${MAX_IMAGES} images.`,
                        [{ text: "OK" }]
                    );
                }
            }
        } catch (error) {
            console.error('Error browsing files:', error);
        }
    };

    return (
        <View style={styles.container}>

            {/* Delete Snapshot confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteSnapshotModal}
                onRequestClose={() => setShowDeleteSnapshotModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Snapshot?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonCancel]} testID='delete-snapshot-cancel-button' onPress={() => setShowDeleteSnapshotModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextCancel]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSave]}
                                testID='delete-snapshot-confirm-button'
                                onPress={() => {
                                    setShowDeleteSnapshotModal(false);
                                    handleConfirmDeleteSnapshotPress();
                                    // setSnapshotToDelete(null); 
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextSave]}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* View Image Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showImageModal}
                onRequestClose={() => setShowImageModal(false)} // Android back button handling
                testID="image-modal"
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowImageModal(false)}>
                        <Ionicons name="close" size={30} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalPrevButton} onPress={handlePreviousImage}>
                        <Ionicons name="chevron-back" size={30} color="#FFF" />
                    </TouchableOpacity>
                    {dummyImages.length > 0 && (
                        <Image
                            source={dummyImages[selectedImageIndex].source}
                            style={styles.modalViewImage}
                            resizeMode="contain"
                        />
                    )}
                    <TouchableOpacity style={styles.modalNextButton} onPress={handleNextImage}>
                        <Ionicons name="chevron-forward" size={30} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </Modal>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageSection}>
                    <View style={styles.imageSectionHeader}>
                        <Text style={styles.sectionHeader}>Images</Text>
                        {dummyImages.length > 0 ?
                            <TouchableOpacity onPress={handleEditImagesPress} testID='edit-images-button'>
                                <Ionicons name="create-outline" size={30} color="#3F4F5F" />
                            </TouchableOpacity> :
                            <TouchableOpacity onPress={handleBrowseFiles} testID="add-images-button">
                                <Ionicons name="add-outline" size={30} color="#3F4F5F" />
                            </TouchableOpacity>
                        }
                    </View>
                    <View style={styles.imageSliderContainer}>
                        <ImageGrid images={dummyImages} onImagePress={handleImagePress} />
                    </View>
                </View>

                {renderSection("General", [
                    ...(Number(spaceType) === 2 ? [["Episode Number:", snapshot.episode]] : []),
                    ["Scene Number:", snapshot.scene],
                    ["Story Day:", snapshot.storyDay],
                    ["Character:", characterName],
                    ["Notes:", snapshot.notes]
                ], handleEditGeneralPress, 'edit-general-button')}

                {renderSection("Makeup", [
                    ["Skin:", snapshot.skin],
                    ["Brows:", snapshot.brows],
                    ["Eyes:", snapshot.eyes],
                    ["Lips:", snapshot.lips],
                    ["Effects:", snapshot.effects],
                    ["Makeup Notes:", snapshot.makeupNotes]
                ], handleEditMakeupPress, 'edit-makeup-button')}

                {renderSection("Hair", [
                    ["Prep:", snapshot.prep],
                    ["Method:", snapshot.method],
                    ["Styling Tools:", snapshot.stylingTools],
                    ["Products:", snapshot.products],
                    ["Hair Notes:", snapshot.hairNotes]
                ], handleEditHairPress, 'edit-hair-button')}

                <View>
                    <TouchableOpacity style={styles.deleteSnapshotButton} onPress={() => setShowDeleteSnapshotModal()} testID='delete-snapshot-button'>
                        <Text style={styles.deleteSnapshotButtonText}>Delete Snapshot</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center',
        paddingTop: 30
    },
    imageSliderContainer: {
        alignItems: 'center',
        marginBottom: 30
    },
    section: {
        marginBottom: 30,
        backgroundColor: 'rgba(205, 167, 175, 0.5)',
        borderRadius: 8,
        padding: 16,
        marginLeft: 10,
        marginRight: 10
    },
    sectionTitleAndIcon: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15
    },
    sectionHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        color: '#3F4F5F',
    },
    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 16,
        fontWeight: "bold",
        color: '#3F4F5F',
        marginBottom: 4,
    },
    fieldText: {
        fontSize: 16,
        color: '#3F4F5F',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalViewImage: {
        width: '95%',
        height: '95%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    },
    modalPrevButton: {
        position: 'absolute',
        left: 20,
        top: '50%',
        zIndex: 1,
    },
    modalNextButton: {
        position: 'absolute',
        right: 20,
        top: '50%',
        zIndex: 1,
    },
    modalContent: {
        width: '85%',
        padding: 20,
        backgroundColor: '#E2CFC8',
        borderRadius: 10
    },
    modalText: {
        fontSize: 18,
        marginBottom: 5,
        marginLeft: 5,
        color: '#3F4F5F',
        fontWeight: 'bold'
    },
    modalButtonsContainer: {
        alignItems: 'center'
    },
    modalButton: {
        borderRadius: 5,
        width: '70%',
        height: 60,
        justifyContent: 'center',
        margin: 10
    },
    modalButtonText: {
        fontSize: 18,
        textAlign: 'center'
    },
    modalButtonSave: {
        backgroundColor: '#3F4F5F',
    },
    modalButtonCancel: {
        borderWidth: 2,
        borderColor: '#3F4F5F'
    },
    modalButtonTextSave: {
        color: '#E2CFC8'
    },
    modalButtonTextCancel: {
        color: '#3F4F5F'
    },
    imageSection: {
        marginBottom: 10,
    },
    imageSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 15
    },
    deleteSnapshotButton: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        height: 40,
        marginBottom: 30,
        backgroundColor: '#3F4F5F',
    },
    deleteSnapshotButtonText: {
        color: '#E2CFC8',
        fontSize: 17,
        fontWeight: 'bold',
    }
});

export default Snapshot;