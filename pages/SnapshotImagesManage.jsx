import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ImageAttachment from '../components/ImageAttachment';

const SnapshotImagesManage = () => {

    return (
        <View style={styles.container} testID="safe-area-view">
                <View style={styles.headerContainer} testID="header-container">
                    <Text testID="header-text" style={styles.header}>Manage Images</Text>
                </View>
                <ImageAttachment />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center',
        paddingTop: 30
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

export default SnapshotImagesManage;