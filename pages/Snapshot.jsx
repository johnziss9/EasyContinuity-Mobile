import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import someImage from '../assets/dummy-image.jpg';
import someImage2 from '../assets/dummy-image2.jpg';
import someImage3 from '../assets/dummy-image3.jpeg';
import someImage4 from '../assets/dummy-image4.jpeg';
import ImageGrid from '../components/ImageGrid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useFileBrowser from '../hooks/useFileBrowser';

// TODO Using testImages prop in order to test the empty dummyImages array in the Snapshot tests - Needs to be removed
const Snapshot = ({ testImages = null }) => {

    const navigation = useNavigation();

    const MAX_IMAGES = 6;

    const { filesInfo, browseFiles, clearFiles } = useFileBrowser({
        fileTypes: ['image/jpeg', 'image/jpg', 'image/png']
    });

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Initial code was: const dummyImages = [
    // TODO This would need to be removed and updated when there's not images coming from the database
    const dummyImages = testImages !== null ? testImages : [
        { id: 1, source: someImage },
        { id: 2, source: someImage2 },
        { id: 3, source: someImage3 },
        { id: 4, source: someImage4 }
    ];

    const renderField = (label, value, index, sectionId) => (
        <View
            key={`field-${index}`}
            style={styles.fieldContainer}
            testID={`${sectionId}-field-${index}`}
        >
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldText}>{value}</Text>
        </View>
    );

    const renderSection = (title, fields, onPress) => {
        const sectionId = title.toLowerCase().replace(/\s+/g, '-');
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
        navigation.navigate('SnapshotImagesManage', { isNewSnapshot: false });
    };

    const handleEditGeneralPress = () => {
        navigation.navigate('SnapshotGeneralInfo', { isNewSnapshot: false });
    };

    const handleEditMakeupPress = () => {
        navigation.navigate('SnapshotMakeupInfo', { isNewSnapshot: false });
    };

    const handleEditHairPress = () => {
        navigation.navigate('SnapshotHairInfo', { isNewSnapshot: false });
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
    useEffect(() => {
        console.log('Current filesInfo:', filesInfo);
    }, [filesInfo]);

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
                    ["Episode Number:", "Something"],
                    ["Scene Number:", "Something"],
                    ["Story Day:", "Something"],
                    ["Actor Name:", "Something"],
                    ["Actor Number:", "Something"],
                    ["Character:", "Something"],
                    ["Notes:", "Something"]
                ], handleEditGeneralPress, 'edit-general-button')}

                {renderSection("Makeup", [
                    ["Skin:", "Something"],
                    ["Brows:", "Something"],
                    ["Eyes:", "Something"],
                    ["Lips:", "Something"],
                    ["Effects:", "Something"],
                    ["Makeup Notes:", "Something"]
                ], handleEditMakeupPress, 'edit-general-button')}

                {renderSection("Hair", [
                    ["Prep:", "Something"],
                    ["Method:", "Something"],
                    ["Styling Tools:", "Something"],
                    ["Products:", "Something"],
                    ["Hair Notes:", "Something"]
                ], handleEditHairPress)}
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
    imageSection: {
        marginBottom: 10,
    },
    imageSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 15
    }
});

export default Snapshot;