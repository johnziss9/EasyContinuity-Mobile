import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageAttachment from '../components/ImageAttachment';

const SnapshotImagesAddEdit = () => {

    return (
        <SafeAreaView style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Add or Edit Images</Text>
                </View>
                <ImageAttachment />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center'
    },
    headerContainer: {
        width: '100%',
        marginBottom: 30,
        paddingHorizontal: 20
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#3F4F5F'
    }
});

export default SnapshotImagesAddEdit;