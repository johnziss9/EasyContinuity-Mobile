import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CharacterCard = ({ characterName, onEditPress, onDeletePress }) => {
    return (
        <View style={styles.cardContainer} testID='character-component'>
            <View style={styles.container}>
                <View style={styles.characterContainer}>
                    <Ionicons name="person-sharp" size={35} color="#CDA7AF" />
                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.text}>{characterName}</Text>
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={onEditPress} testID="edit-character-button">
                        <Ionicons name="create-outline" size={25} color="#CDA7AF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onDeletePress} testID="delete-character-button">
                        <Ionicons name="trash-outline" size={25} color="#CDA7AF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#3F4F5F',
        width: '90%',
        paddingHorizontal: 13,
        height: 70,
        marginBottom: 20,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    characterContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
        maxWidth: 170,
        marginLeft: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center'
    }
});

export default CharacterCard;