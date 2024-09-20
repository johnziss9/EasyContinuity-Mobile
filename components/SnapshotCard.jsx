import React from 'react';
import { StyleSheet, View, Text, Pressable, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SnapshotCard = ({ snapshotName, images = [], onPress }) => {
    return (
        <Pressable style={styles.pressable} onPress={onPress} testID='snapshot-component'>
            <View style={styles.container}>
                <View style={styles.mainImageWrapper}>
                    {images[0] ? (
                        <Image source={images[0]} style={styles.mainImage} />
                    ) : (
                        <Ionicons name="camera" size={70} color="#CDA7AF" />
                    )}
                </View>
                <View style={styles.rightSideContainer}>
                    <Text style={styles.text}>{snapshotName}</Text>
                    <View style={styles.additionalImages}>
                        {images.slice(1, 4).map((image, index) => (
                            <View key={index} style={styles.smallImageWrapper}>
                                <Image source={image} style={styles.smallImage} />
                            </View>
                        ))}
                        {images.length > 4 && (
                            <View style={styles.moreImagesIndicator}>
                                <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
                            </View>
                        )}
                    </View>
                </View>
                <TouchableOpacity style={styles.editSpace}>
                    <Ionicons name="create-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteSpace}>
                    <Ionicons name="trash-outline" size={30} color="#CDA7AF" />
                </TouchableOpacity>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 20
    },
    container: {
        backgroundColor: '#3F4F5F',
        width: '90%',
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row'
    },
    mainImageWrapper: {
        width: 90,
        height: 90,
        borderRadius: 100,
        marginRight: 12,
        borderColor: '#CDA7AF',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainImage: {
        width: 86,
        height: 86,
        borderRadius: 100,
    },
    noImage: {
        width: 70,
        height: 70,
        borderRadius: 30,
    },
    placeholderImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#E0E0E0',
    },
    rightSideContainer: {
        justifyContent: 'space-between'
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 200,
    },
    additionalImages: {
        flexDirection: 'row'
    },
    smallImageWrapper: {
        width: 34,
        height: 34,
        borderRadius: 16,
        marginRight: 8,
        overflow: 'hidden',
        borderColor: '#CDA7AF',
        borderWidth: 1
    },
    smallImage: {
        width: 32,
        height: 32,
    },
    placeholderSmallImage: {
        width: 32,
        height: 32,
        backgroundColor: '#E0E0E0',
    },
    moreImagesIndicator: {
        width: 34,
        height: 34,
        borderRadius: 16,
        backgroundColor: '#CDA7AF',
        justifyContent: 'center',
        alignItems: 'center'
    },
    moreImagesText: {
        color: '#3F4F5F',
        fontSize: 13,
        fontWeight: 'bold',
    },
    editSpace: {
        position: 'absolute',
        bottom: 10,
        right: 60
    },
    deleteSpace: {
        position: 'absolute',
        bottom: 10,
        right: 10
    }
});

export default SnapshotCard;