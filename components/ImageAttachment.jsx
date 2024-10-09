import React, { useState } from 'react';
import { StyleSheet, Image, View, Text, TouchableOpacity, TextInput, FlatList, Pressable } from 'react-native';
import someImage from '../assets/dummy-image.jpg';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ImageAttachment = () => {

    const [attachments, setAttachments] = useState([
        { id: '1', source: someImage, name: 'Image 1', isEdit: false, editName: '' },
        { id: '2', source: someImage, name: 'Image 2', isEdit: false, editName: '' },
        { id: '3', source: someImage, name: 'Image 3', isEdit: false, editName: '' },
        { id: '4', source: someImage, name: 'Image 4', isEdit: false, editName: '' }
    ]);

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

    const handleAddAttachment = () => {
        const newId = (parseInt(attachments[attachments.length - 1]?.id || '0') + 1).toString();
        const newAttachment = {
            id: newId,
            source: someImage, // You might want to replace this with a default image or allow user to choose
            name: `Image ${newId}`,
            isEdit: false,
            editName: ''
        };
        setAttachments(prevAttachments => [...prevAttachments, newAttachment]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.attachmentContainer}>
            <View style={styles.imageContainer}>
                <Image source={item.source} style={styles.image} />
            </View>
            <View style={styles.nameContainer}>
                {!item.isEdit ? (
                    <Text style={styles.text}>{item.name}</Text>
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
                data={attachments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.noImagesText}>No Images. Tap + to add.</Text>}
            />
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
});

export default ImageAttachment;