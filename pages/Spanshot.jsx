import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Modal, Image, Pressable } from 'react-native';
import someImage from '../assets/dummy-image.jpg';
import ImageGrid from '../components/ImageGrid';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

const Snapshot = () => {

    const [showImageModal, setShowImageModal] = useState(false);

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

    const renderSection = (title, fields) => (
        <View key={`section-${title.toLowerCase().replace(/\s+/g, '-')}`} style={styles.section}>
            <View style={styles.sectionTitleAndIcon}>
                <Text style={styles.sectionHeader}>{title}</Text>
                <Pressable style={styles.editSection}>
                    <Ionicons name="create-outline" size={30} color="#3F4F5F" />
                </Pressable>
            </View>
            {fields.map(([label, value], index) => renderField(label, value, index))}
        </View>
    );

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
                <View style={styles.imageSliderContainer}>
                    <ImageGrid images={dummyImages} onImagePress={() => setShowImageModal(true)} />
                </View>

                {renderSection("General", [
                    ["Episode Number:", "Something"],
                    ["Scene Number:", "Something"],
                    ["Story Day:", "Something"],
                    ["Actor Name:", "Something"],
                    ["Actor Number:", "Something"],
                    ["Character:", "Something"],
                    ["Notes:", "Something"]
                ])}

                {renderSection("Makeup", [
                    ["Skin:", "Something"],
                    ["Brows:", "Something"],
                    ["Eyes:", "Something"],
                    ["Lips:", "Something"],
                    ["Makeup Notes:", "Something"]
                ])}

                {renderSection("Hair", [
                    ["Prep:", "Something"],
                    ["Method:", "Something"],
                    ["Styling Tools:", "Something"],
                    ["Products:", "Something"],
                    ["Hair Notes:", "Something"]
                ])}
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
        justifyContent: 'space-between'
    },
    sectionHeader: {
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 16,
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
    }
});

export default Snapshot;