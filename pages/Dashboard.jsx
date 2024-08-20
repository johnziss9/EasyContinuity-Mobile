import React, { useState } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Space from '../components/Space';

const Dashboard = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Space spaceName={"House of the Dragons"} />
            <Space spaceName={"Fast & Furious"} />
            <Pressable style={styles.addNewButton}>
                <Ionicons name="add-circle-sharp" size={70} color="#CDA7AF" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E2CFC8',
        alignItems: 'center'
    },
    addNewButton: {
        position: 'absolute',
        bottom: 30,
        right: 30
    }
});

export default Dashboard;