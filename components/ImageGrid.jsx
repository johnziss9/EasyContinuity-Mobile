import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import NoImages from '../assets/no-photo.png';

const ImageGrid = ({ images, onImagePress }) => {
    const imageCount = images.length;

    return (
        <View style={[
            styles.container,
            imageCount === 2 && styles.containerTwo,
            imageCount === 3 && styles.containerThree
        ]}>
            {imageCount === 0 ? (
                <View style={styles.noPhotoWrapper}>
                    <Image source={NoImages} style={styles.noPhotoImage} />
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
        aspectRatio: 1
    },
    containerTwo: {
        flexDirection: 'column',
    },
    containerThree: {
        flexDirection: 'row',
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
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});

export default ImageGrid;