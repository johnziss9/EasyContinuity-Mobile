import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import someImage from '../assets/dummy-image.jpg';
import ImageGrid from '../components/ImageGrid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import useFileBrowser from '../hooks/useFileBrowser';

const Snapshot = () => {

    const navigation = useNavigation();

    const MAX_IMAGES = 6;

    const { filesInfo, browseFiles, clearFiles } = useFileBrowser({
        fileTypes: ['image/jpeg', 'image/jpg', 'image/png']
    });

    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);

    const dummyImages = [
        { id: 1, source: someImage },
        { id: 2, source: someImage },
        { id: 3, source: someImage },
        { id: 4, source: someImage }
    ];

    const renderField = (label, value, index) => (
        <View key={`field-${index}`} style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldText}>{value}</Text>
        </View>
    );

    const renderSection = (title, fields, onPress) => (
        <View key={`section-${title.toLowerCase().replace(/\s+/g, '-')}`} style={styles.section}>
            <View style={styles.sectionTitleAndIcon}>
                <Text style={styles.sectionHeader}>{title}</Text>
                <TouchableOpacity style={styles.editSection} onPress={onPress}>
                    <Ionicons name="create-outline" size={30} color="#3F4F5F" />
                </TouchableOpacity>
            </View>
            {fields.map(([label, value], index) => renderField(label, value, index))}
        </View>
    );

    const handleEditImagesPress = () => {
        navigation.navigate('SnapshotImagesAddEdit', { isNewSnapshot: false });
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
            
            if (result === null || result.length === 0) {
                console.log('No valid files selected or unsupported file type.');
            } else {
                const newImages = result.slice(0, availableSlots);
                setSelectedImages(prevImages => [...prevImages, ...newImages]);

                console.log(`Selected ${newImages.length} file(s)`);
                newImages.forEach((file, index) => {
                    console.log(`File ${index + 1}: ${file.name} (${file.size} bytes)`);
                });

                if (result.length > availableSlots) {
                    Alert.alert(
                        "Maximum Images Reached",
                        `Only ${availableSlots} image(s) were added to reach the maximum of ${MAX_IMAGES} images.`,
                        [{ text: "OK" }]
                    );
                }
            }
        } catch (error) {
            console.error('Error browsing files:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>

            {/* View Image Modal */}
            <Modal
                transparent={true}
                animationType="fade"
                visible={showImageModal}
                onRequestClose={() => setShowImageModal(false)} // Android back button handling
            >
                <View style={styles.modalContainer}>
                    <Image
                        source={someImage}
                        style={styles.modalViewImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>

            <ScrollView>
                <View style={styles.imageSection}>
                    <View style={styles.imageSectionHeader}>
                        <Text style={styles.sectionHeader}>Images</Text>
                        {dummyImages.length > 0 ?
                            <TouchableOpacity onPress={handleEditImagesPress}>
                                <Ionicons name="create-outline" size={30} color="#3F4F5F" />
                            </TouchableOpacity> :
                            <TouchableOpacity onPress={handleBrowseFiles}>
                                <Ionicons name="add-outline" size={30} color="#3F4F5F" />
                            </TouchableOpacity>
                        }
                    </View>
                    <View style={styles.imageSliderContainer}>
                        <ImageGrid images={dummyImages} onImagePress={() => setShowImageModal(true)} />
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
                ], handleEditGeneralPress)}

                {renderSection("Makeup", [
                    ["Skin:", "Something"],
                    ["Brows:", "Something"],
                    ["Eyes:", "Something"],
                    ["Lips:", "Something"],
                    ["Effects:", "Something"],
                    ["Makeup Notes:", "Something"]
                ], handleEditMakeupPress)}

                {renderSection("Hair", [
                    ["Prep:", "Something"],
                    ["Method:", "Something"],
                    ["Styling Tools:", "Something"],
                    ["Products:", "Something"],
                    ["Hair Notes:", "Something"]
                ], handleEditHairPress)}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center'
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