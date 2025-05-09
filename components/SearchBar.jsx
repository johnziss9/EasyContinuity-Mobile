import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SearchBar = ({ 
    value, 
    onChangeText, 
    onSearch, 
    onClear, 
    placeholder = "Search space...", 
    width 
}) => {
    const containerWidth = width < 420 ? 300 : width > 600 ? 500 : 350;

    const getTextInputStyle = (value) => ({
        fontStyle: value ? 'normal' : 'italic',
    });
    
    return (
        <View testID="search-container" style={[styles.searchContainer, {width: containerWidth}]}>
            <TextInput 
                style={[styles.searchInput, getTextInputStyle(value)]} 
                placeholder={placeholder}
                placeholderTextColor="rgba(63, 79, 95, 0.55)"
                value={value} 
                onChangeText={onChangeText} 
                testID="search-input" 
                selectionColor="#CDA7AF" />
            {value !== '' && (
                <Pressable style={styles.clearButton} testID='clear-search-button' onPress={onClear}>
                    <Ionicons name="close" size={20} color="#3F4F5F" />
                </Pressable>
            )}
            <Pressable style={styles.searchButton} testID='search-button' onPress={onSearch} disabled={!value.trim()}>
                <Ionicons name="search" size={20} color={value.trim() ? "#CDA7AF" : "#6F7F8F"} />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#3F4F5F',
        borderRadius: 10,
        backgroundColor: '#E2CFC8'
    },
    searchInput: {
        flex: 1,
        height: 50,
        paddingLeft: 16,
        paddingRight: 60,
        color: '#3F4F5F',
        fontSize: 18
    },
    clearButton: {
        position: 'absolute',
        right: 60,
        padding: 10
    },
    searchButton: {
        backgroundColor: '#3F4F5F',
        height: 50,
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderTopRightRadius: 9,
        borderBottomRightRadius: 9
    }
});

export default SearchBar;