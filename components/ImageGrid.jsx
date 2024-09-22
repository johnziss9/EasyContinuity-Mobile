import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ImageGrid = ({ images, onImagePress }) => {

    const imageCount = images.length;

    return (
        <View style={[
            imageCount === 0 ? styles.containerNoImages : styles.container,
            imageCount === 2 && styles.containerTwo,
            imageCount === 3 && styles.containerThree,
            (imageCount === 5 || imageCount === 6) && styles.containerFiveOrSix
        ]}>
            {imageCount === 0 ? (
                <View style={styles.noPhotoWrapper}>
                    <Ionicons name="camera" size={70} color="#CDA7AF" />
                    <Text style={styles.noImagesText}>No Images. Tap + to add.</Text>
                </View>
            ) : (
            images.map((image, index) => (
                <TouchableOpacity
                    key={image.id}
                    style={[
                        styles.imageWrapper,
                        imageCount === 1 && styles.imageWrapperOne,
                        imageCount === 2 && styles.imageWrapperTwo,
                        imageCount === 3 && (index < 2 ? styles.imageWrapperThreeSmall : styles.imageWrapperThreeLarge),
                        imageCount === 4 && styles.imageWrapperFour,
                        imageCount === 5 && (index === 4 ? styles.imageWrapperFiveLarge : styles.imageWrapperFiveSmall),
                        imageCount === 6 && styles.imageWrapperSix,
                    ]}
                    onPress={() => onImagePress(index)}
                >
                    <Image source={image.source} style={styles.image} />
                </TouchableOpacity>
            ))
        )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 350,
        height: 350
    },
    containerNoImages: {
        width: 350,
        height: 100        
    },
    noImagesText: {
        color: '#3F4F5F',
    },
    containerTwo: {
        flexDirection: 'column',
    },
    containerThree: {
        flexDirection: 'row',
    },
    containerFiveOrSix: {
        flexDirection: 'column',
    },
    noPhotoWrapper: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noPhotoImage: {
        width: '50%',
        height: '50%',
        resizeMode: 'contain',
    },
    imageWrapper: {
        borderWidth: 2,
        borderColor: '#CDA7AF',
    },
    imageWrapperOne: {
        width: '100%',
        height: '100%',
    },
    imageWrapperTwo: {
        width: '50%',
        height: '100%',
    },
    imageWrapperThreeSmall: {
        width: '50%',
        height: '50%',
    },
    imageWrapperThreeLarge: {
        width: '100%',
        height: '50%',
    },
    imageWrapperFour: {
        width: '50%',
        height: '50%',
    },
    imageWrapperFiveSmall: {
        width: '50%',
        height: '33.33%',
    },
    imageWrapperFiveLarge: {
        width: '100%',
        height: '66.66%',
    },
    imageWrapperSix: {
        width: '50%',
        height: '33.33%',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});

export default ImageGrid;