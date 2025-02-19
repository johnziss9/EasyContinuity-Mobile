import React, { useState } from 'react';
import { StyleSheet, Image, View, Text, TouchableOpacity, TextInput, FlatList, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';
import handleHttpRequest from '../api/api';

const ImageAttachment = ({ spaceId, folderId, snapshotId }) => {
    const { browseFiles, clearFiles } = useFileBrowser({
        fileTypes: ['image/jpeg', 'image/jpg', 'image/png']
    });

    const [attachments, setAttachments] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);

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
            isEdit: false,
            editName: '',
            isPreview: true,
            mimeType: file.mimeType
        }));
    
        setSelectedFiles(previews);
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        try {
            const formData = new FormData();

            formData.append('spaceId', spaceId);
            if (snapshotId) formData.append('snapshotId', snapshotId);
            if (folderId) formData.append('folderId', folderId);

            selectedFiles.forEach((file, index) => {
                formData.append('files', {
                    uri: file.source.uri,
                    type: file.mimeType,
                    name: file.name
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
                setAttachments(prev => [...prev, ...response.data]);
                setSelectedFiles([]);
                clearFiles();
            } else {
                console.error('Upload failed:', response.error);
                // TODO: Show error toast to user
            }
        } catch (error) {
            console.error('Upload error:', {message: error.message, stack: error.stack, error: error.toString()});
            // TODO: Show error toast to user
        }
    };

    const handleEditImageName = (id) => {
        setAttachments(prevAttachments =>
            prevAttachments.map(att =>
                att.id === id ? { ...att, isEdit: true, editName: att.name } : att
            )
        );
    }

    const handleChangeImageName = (id, newName) => {
        setAttachments(prevAttachments =>
            prevAttachments.map(att =>
                att.id === id ? { ...att, editName: newName } : att
            )
        );
    }

    const handleSaveImageName = (id) => {
        setAttachments(prevAttachments =>
            prevAttachments.map(att =>
                att.id === id ? { ...att, name: att.editName, isEdit: false } : att
            )
        );
    }

    const handleDeleteImage = (id) => {
        setAttachments(prevAttachments =>
            prevAttachments.filter(att => att.id !== id)
        );
    }

    const renderItem = ({ item }) => (
        <View style={styles.attachmentContainer}>
            <View style={styles.imageContainer}>
                <Image source={item.source} style={styles.image} />
            </View>
            <View style={styles.nameContainer}>
                {!item.isEdit ? (
                    <>
                        <Text style={styles.text}>{item.name}</Text>
                        {item.isPreview && <Text style={styles.previewText}>Preview</Text>}
                    </>                    
                ) : (
                    <TextInput
                        style={styles.textbox}
                        onChangeText={(text) => handleChangeImageName(item.id, text)}
                        value={item.editName}
                        placeholder='Image Name'
                        cursorColor={'#3F4F5F'}
                    />
                )}
            </View>
            {!item.isEdit ?
                <>
                    <TouchableOpacity style={styles.editButton} onPress={() => handleEditImageName(item.id)} testID="edit-image-button">
                        <Ionicons name="create-outline" size={30} color="#CDA7AF" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteImage(item.id)} testID="delete-image-button">
                        <Ionicons name="trash-outline" size={30} color="#CDA7AF" />
                    </TouchableOpacity>
                </> :
                <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveImageName(item.id)} testID="save-image-button">
                    <Ionicons name="save-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
            }
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={[...selectedFiles, ...attachments]}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.noImagesText}>No Images. Tap + to add.</Text>}
            />
            {selectedFiles.length > 0 && (
                <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                    <Text style={styles.uploadButtonText}>Upload Selected Files</Text>
                </TouchableOpacity>
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
    previewText: {
        color: '#CDA7AF',
        fontSize: 12,
        fontStyle: 'italic'
    },
    textbox: {
        height: 55,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 5,
        paddingLeft: 7,
        backgroundColor: 'rgba(205, 167, 175, 1)',
        color: '#3F4F5F'
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
    saveButton: {
        position: 'absolute',
        bottom: 20,
        right: 15
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
    },
    uploadButton: {
        backgroundColor: '#3F4F5F',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center',
        zIndex: 1
    },
    uploadButtonText: {
        color: '#CDA7AF',
        fontSize: 16,
        fontWeight: 'bold'
    }
});

export default ImageAttachment;