import React from 'react';
import { StyleSheet, View, Text, Pressable, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SnapshotCard = ({ snapshotName, images = [], onPress }) => {

    const { width } = useWindowDimensions();

    return (
        <Pressable style={styles.pressable} onPress={onPress} testID='snapshot-component'>
            <View style={styles.container}>
                {width < 400 ?
                    <View style={styles.leftSideContainer}>
                        <View style={[styles.mainImageWrapper, styles.compactMainImageWrapper]} testID='compact-main-image-container'>
                            {images[0] ? (
                                <Image source={images[0]} style={styles.mainImage} />
                            ) : (
                                <Ionicons name="camera" size={70} color="#CDA7AF" />
                            )}
                        </View>
                        <View style={[styles.additionalImages, styles.compactAdditionalImages]} testID='compact-additional-images-icontaner'>
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
                    </View> :
                    <>
                        <View style={styles.mainImageWrapper} testID='main-image-contaner'>
                            {images[0] ? (
                                <Image source={images[0]} style={styles.mainImage} testID="snapshot-image" />
                            ) : (
                                <Ionicons name="camera" size={70} color="#CDA7AF" />
                            )}
                        </View>
                        <View style={styles.rightSideContainer} testID='right-side-content-contaner'>
                            <Text style={styles.text}>{snapshotName}</Text>
                            <View style={styles.additionalImages}>
                                {images.slice(1, 4).map((image, index) => (
                                    <View key={index} style={styles.smallImageWrapper}>
                                        <Image source={image} style={styles.smallImage} testID="snapshot-image" />
                                    </View>
                                ))}
                                {images.length > 4 && (
                                    <View style={styles.moreImagesIndicator}>
                                        <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </>
                }
                {width < 400 ? <Text style={styles.compactText} testID='compact-text'>{snapshotName}</Text> : null}
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
    compactMainImageWrapper: {
        marginBottom: 15
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
    rightSideContainer: {
        justifyContent: 'space-between'
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 200,
    },
    compactText: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 180,
        marginLeft: -55,
        maxHeight: 90,
        marginTop: 5
    },
    additionalImages: {
        flexDirection: 'row'
    },
    compactAdditionalImages: {
        marginLeft: 5
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