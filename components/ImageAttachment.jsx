import React, { useState, useEffect } from 'react';
import { StyleSheet, Image, View, Text, TouchableOpacity, TextInput, FlatList, Pressable, Modal } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import handleHttpRequest from '../api/api';
import { useRoute } from '@react-navigation/native';
import ToastNotification from '../utils/ToastNotification';


const ImageAttachment = ({ spaceId, folderId, snapshotId }) => {
    const route = useRoute();
    const { shouldOpenFileBrowser } = route.params || {};

    const { browseFiles, clearFiles } = useFileBrowser({
        fileTypes: ['image/jpeg', 'image/jpg', 'image/png']
    });

    const [attachments, setAttachments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [showEditImageModal, setShowEditImageModal] = useState(false);
    const [showEditImageConfirmationModal, setShowEditImageConfirmationModal] = useState(false);
    const [showDeleteImageConfirmationModal, setShowDeleteImageConfirmationModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageExtension, setImageExtension] = useState('');
    const [imageName, setImageName] = useState('');
    const [attachmentId, setAttachmentId] = useState(null);

    useEffect(() => {
        fetchAttachments();
    }, [snapshotId]);

    useEffect(() => {
        if (shouldOpenFileBrowser) {
            handleAddAttachment();
        }
    }, []);

    const getTextInputStyle = (value) => ({
        fontStyle: value ? 'normal' : 'italic',
    });

    const fetchAttachments = async () => {
        try {
            setIsLoading(true);
            const url = `/attachment/snapshot/${snapshotId}`;
            const response = await handleHttpRequest(url, 'GET');

            if (response.success && response.data) {

                // Transform the response data to match our attachment structure
                const transformedAttachments = response.data.map(attachment => ({
                    id: attachment.id,
                    name: attachment.name,
                    source: { uri: attachment.url },
                    isPreview: false,
                    mimeType: attachment.mimeType,
                    path: attachment.path,
                    size: attachment.size,
                    isStored: attachment.isStored,
                    addedOn: attachment.addedOn
                }));

                setAttachments(transformedAttachments);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to load attachments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddAttachment = async () => {
        const result = await browseFiles();

        // Files are directly in the array from browseFiles
        if (!result || !Array.isArray(result) || result.length === 0) {
            console.log("No files selected or invalid structure");
            return;
        }

        // Create preview objects from the files array directly
        const previews = result.map(file => ({
            id: Math.random().toString(),
            source: { uri: file.uri },
            name: file.name,
            isPreview: true,
            mimeType: file.mimeType
        }));

        setSelectedFiles(previews);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || isUploading) return;

        setIsUploading(true);

        try {
            const formData = new FormData();

            formData.append('spaceId', spaceId);
            if (snapshotId) formData.append('snapshotId', snapshotId);
            if (folderId) formData.append('folderId', folderId);

            selectedFiles.forEach((file, index) => {
                const cleanFileName = file.name
                    .replace(/[^a-zA-Z0-9.\(\)\-\[\]]/g, '_') // Replace special chars with underscore
                    .replace(/_+/g, '_'); // Replace multiple underscores with single one

                formData.append('files', {
                    uri: file.source.uri,
                    type: file.mimeType,
                    name: cleanFileName
                });
            });

            const url = '/attachment/';
            const method = 'POST';
            const response = await handleHttpRequest(
                url,
                method,
                formData,
                {
                    'Content-Type': 'multipart/form-data',
                }
            );

            if (response.success) {
                setSelectedFiles([]);
                clearFiles();

                await fetchAttachments();
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to upload attachments');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmitEditImage = async () => {
        try {
            const cleanFileName = imageName
                .replace(/[^a-zA-Z0-9.\(\)\-\[\]]/g, '_') // Replace special chars with underscore
                .replace(/_+/g, '_') + imageExtension; // Replace multiple underscores with single one

            if (!attachmentId && selectedImage?.isPreview) {
                setSelectedFiles(prevFiles => {
                    const newFiles = prevFiles.map(file => {
                        if (file.id === selectedImage.id) {
                            return {
                                ...file,
                                name: cleanFileName
                            };
                        }
                        return file;
                    });
                    return newFiles;
                });

                setShowEditImageModal(false);
                return;
            }

            const url = `/attachment/${attachmentId}`;
            const method = 'PUT';
            const body = {
                name: cleanFileName,
                lastUpdatedOn: new Date().toISOString()
                // TODO Include lastUpdatedBy
            };

            const response = await handleHttpRequest(url, method, body);

            if (response.success) {
                setShowEditImageConfirmationModal(true);
            } else {
                ToastNotification.show('error', 'Error', response.error);
            }
        } catch (error) {
            ToastNotification.show('error', 'Error', 'Failed to update image name');
        } finally {
            setShowEditImageModal(false);
            setImageName('');
            setImageExtension('');
            setSelectedImage(null);
            setAttachmentId(null);
        }
    }

    const handleCancelUpload = () => {
        setSelectedFiles([]);
        clearFiles();
    };

    const handleViewImage = (image) => {
        setSelectedImage(image);
        setShowImageModal(true);
    };

    const handleEditImageName = (item) => {
        setSelectedImage(item);
        setAttachmentId(item.isPreview ? null : item.id);
        setShowEditImageModal(true);

        const lastDotIndex = item.name.lastIndexOf('.');
        const nameWithoutExtension = item.name.substring(0, lastDotIndex);
        const extension = item.name.substring(lastDotIndex); // Get the extension including the dot

        setImageName(nameWithoutExtension);
        setImageExtension(extension);
    }

    const handleCancelEditImage = () => {
        setShowEditImageModal(false);
        setImageName('');
    }

    const handleDeleteImagePress = (image) => {
        setSelectedImage(image);
        setShowDeleteImageConfirmationModal(true);
    }

    const handleDeleteImage = async (item) => {
        if (item.isPreview) {
            // Handle preview image deletion
            setSelectedFiles(prevFiles => {
                const newFiles = prevFiles.filter(file => file.id !== item.id);

                // If no more preview files, clear everything
                if (newFiles.length === 0) {
                    clearFiles();
                }

                return newFiles;
            });
        } else {
            try {
                const url = `/attachment/${item.id}`;
                const method = 'PUT';
                const body = {
                    isDeleted: true,
                    deletedOn: new Date().toISOString()
                };

                const response = await handleHttpRequest(url, method, body);

                if (response.success) {
                    fetchAttachments();
                    ToastNotification.show('success', 'Success', 'Image Deleted Successfully');
                } else {
                    ToastNotification.show('error', 'Error', response.error);
                }
            } catch (error) {
                ToastNotification.show('error', 'Error', 'Failed to delete image');
            }
        }
    };

    const renderItem = ({ item }) => {
        const hasPreviewImages = selectedFiles.length > 0;
        const displayName = item.name.substring(0, item.name.lastIndexOf('.'));

        return (
            <View style={[styles.attachmentContainer, item.isPreview && styles.previewAttachmentContainer]}>
                {!item.isPreview && hasPreviewImages && <View style={styles.uploadedOverlay} testID="uploaded-overlay" />}
                <View style={styles.imageContainer}>
                    <Image source={item.source} style={styles.image} />
                </View>
                <View style={styles.nameContainer}>
                    <Text style={[styles.text, (!item.isPreview && hasPreviewImages) && styles.uploadedText]}>{displayName}</Text>
                    {item.isPreview && (
                        <View style={styles.previewLabelContainer}>
                            <Text style={styles.previewLabelText}>PREVIEW</Text>
                        </View>
                    )}
                </View>
                <TouchableOpacity
                    style={[styles.viewButton, (!item.isPreview && hasPreviewImages) && styles.uploadedButton]}
                    onPress={() => handleViewImage(item)}
                    testID="view-image-button"
                >
                    <Ionicons
                        name="eye-outline"
                        size={30}
                        color={(!item.isPreview && hasPreviewImages) ? "rgba(205, 167, 175, 0.6)" : "#CDA7AF"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.editButton, (!item.isPreview && hasPreviewImages) && styles.uploadedButton]}
                    onPress={() => handleEditImageName(item)}
                    testID="edit-image-button"
                >
                    <Ionicons
                        name="create-outline"
                        size={30}
                        color={(!item.isPreview && hasPreviewImages) ? "rgba(205, 167, 175, 0.6)" : "#CDA7AF"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.deleteButton, (!item.isPreview && hasPreviewImages) && styles.uploadedButton]}
                    onPress={() => handleDeleteImagePress(item)}
                    testID="delete-image-button"
                >
                    <Ionicons
                        name="trash-outline"
                        size={30}
                        color={(!item.isPreview && hasPreviewImages) ? "rgba(205, 167, 175, 0.6)" : "#CDA7AF"}
                    />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Delete Image confirmation modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showDeleteImageConfirmationModal}
                onRequestClose={() => setShowDeleteImageConfirmationModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Delete Image?</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='delete-image-cancel-button' onPress={() => setShowDeleteImageConfirmationModal(false)}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='delete-image-confirm-button'
                                onPress={() => {
                                    setShowDeleteImageConfirmationModal(false);
                                    handleDeleteImage(selectedImage);
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edited Image Name Confirmation Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showEditImageConfirmationModal}
                onRequestClose={() => setShowEditImageConfirmationModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Image Name Updated Successfully</Text>
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonRight]}
                                testID='edited-image-name-confirm-button'
                                onPress={() => {
                                    setShowEditImageConfirmationModal(false);
                                    fetchAttachments();
                                }}
                            >
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Edit Image Name Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showEditImageModal}
                onRequestClose={() => setShowEditImageModal(false)}
                testID="edit-image-modal"
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText} accessibilityLabel="Enter Image Name:">Enter Image Name:</Text>
                        <TextInput
                            style={[styles.modalTextbox, getTextInputStyle(imageName)]}
                            onChangeText={setImageName}
                            value={imageName}
                            placeholder='Image Name'
                            placeholderTextColor="rgba(63, 79, 95, 0.55)"
                            cursorColor={'#3F4F5F'}
                            testID='image-name-text-input'
                        />
                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonLeft]} testID='edit-image-name-cancel-button' onPress={handleCancelEditImage}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextLeft]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.modalButtonRight]} testID='edit-image-name-submit-button' onPress={handleSubmitEditImage}>
                                <Text style={[styles.modalButtonText, styles.modalButtonTextRight]}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Image View Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showImageModal}
                onRequestClose={() => setShowImageModal(false)}
                testID="image-modal"
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setShowImageModal(false)}
                        testID="modal-close-button"
                    >
                        <Ionicons name="close" size={30} color="#FFF" />
                    </TouchableOpacity>
                    {selectedImage && (
                        <Image
                            source={selectedImage.source}
                            style={styles.modalViewImage}
                            resizeMode="contain"
                            testID="modal-image"
                        />
                    )}
                </View>
            </Modal>

            <FlatList
                data={[...selectedFiles, ...attachments]}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    isLoading ? (
                        <Text style={styles.noImagesText}>Loading...</Text>
                    ) : (
                        <Text style={styles.noImagesText}>No Images. Tap + to add.</Text>
                    )
                }
            />
            {selectedFiles.length > 0 && (
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity
                        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
                        onPress={handleUpload}
                        disabled={isUploading}
                    >
                        <Text style={styles.uploadButtonText}>
                            {isUploading ? 'Uploading...' : 'Upload Selected Files'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelUpload}
                        disabled={isUploading}
                        testID="cancel-upload-button"
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            )}
            <Pressable style={styles.addNewButton} testID='add-image-button' onPress={handleAddAttachment}>
                <Ionicons name="add-circle-sharp" size={70} color="#CDA7AF" />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '90%',
    },
    noImagesText: {
        color: '#3F4F5F',
        fontSize: 18
    },
    attachmentContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 15,
        paddingVertical: 20,
        backgroundColor: '#3F4F5F',
        borderRadius: 10,
        position: 'relative', // Added for overlay positioning
        overflow: 'hidden', // Ensures overlay stays within borders
    },
    previewAttachmentContainer: {
        borderWidth: 5,
        borderColor: '#CDA7AF',
        backgroundColor: '#3F4F5F',
        zIndex: 2
    },
    uploadedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1,
    },
    uploadedText: {
        opacity: 0.6,
    },
    uploadedButton: {
        opacity: 0.6,
    },
    previewLabelContainer: {
        backgroundColor: '#CDA7AF',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        marginTop: 8,
    },
    previewLabelText: {
        color: '#3F4F5F',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    imageContainer: {
        width: 100,
        height: 100
    },
    image: {
        width: '100%',
        height: '100%'
    },
    nameContainer: {
        flex: 1,
        paddingLeft: 10,
        paddingTop: 5
    },
    text: {
        fontSize: 18,
        color: '#CDA7AF'
    },
    viewButton: {
        position: 'absolute',
        bottom: 18,
        right: 120
    },
    editButton: {
        position: 'absolute',
        bottom: 20,
        right: 70
    },
    deleteButton: {
        position: 'absolute',
        bottom: 20,
        right: 20
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
    },
    buttonsContainer: {
        marginBottom: 15,
        zIndex: 1
    },
    uploadButton: {
        backgroundColor: '#3F4F5F',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
        zIndex: 1 // TODO Remove this when + button goes in the header
    },
    cancelButton: {
        backgroundColor: 'transparent',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#3F4F5F',
    },
    uploadButtonDisabled: {
        opacity: 0.7
    },
    uploadButtonText: {
        color: '#CDA7AF',
        fontSize: 16,
        fontWeight: 'bold'
    },
    cancelButtonText: {
        color: '#3F4F5F',
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
        height: 60,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        marginTop: 10,
        backgroundColor: 'rgba(205, 167, 175, 0.2)',
        fontSize: 18,
        marginBottom: 10,
        color: '#3F4F5F'
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
    modalViewImage: {
        width: '95%',
        height: '95%',
    },
    modalCloseButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        zIndex: 1,
    }
});

export default ImageAttachment;