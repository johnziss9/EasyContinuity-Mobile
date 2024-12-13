import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, TouchableOpacity, LayoutAnimation } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SpaceCard = ({ spaceName, description, onPress, onEditPress, onDeletePress }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleDescription = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <Pressable 
            style={styles.pressable} 
            testID='space-card-component'
        >
            <View style={[styles.container, isExpanded && styles.containerExpanded]}>
                {/* Main content section */}
                <TouchableOpacity style={styles.mainContent} onPress={onPress} testID="space-card-main-content">
                    <Text style={styles.text}>{spaceName}</Text>
                </TouchableOpacity>

                {/* Action buttons strip */}
                <View style={styles.actionStrip}>
                    <TouchableOpacity style={styles.actionButton} onPress={toggleDescription} testID="toggle-description-button">
                        <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={22} color="#CDA7AF" />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.actionButton} onPress={onEditPress} testID="edit-space-button">
                        <Ionicons name="create" size={22} color="#CDA7AF" />
                    </TouchableOpacity>
                    <View style={styles.separator} />
                    <TouchableOpacity style={styles.actionButton} onPress={onDeletePress} testID="delete-space-button">
                        <Ionicons name="trash" size={22} color="#CDA7AF" />
                    </TouchableOpacity>
                </View>

                {/* Description section */}
                {isExpanded && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionText}>
                            {description || "No description available"}
                        </Text>
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#3F4F5F',
        width: '90%',
        minHeight: 110,
        marginBottom: 20,
        borderRadius: 10,
        overflow: 'hidden',
    },
    containerExpanded: {
        minHeight: 160,
    },
    mainContent: {
        flex: 1,
        padding: 20,
        paddingBottom: 10,
    },
    text: {
        color: '#E2CFC8',
        fontSize: 20,
    },
    actionStrip: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: 'rgba(226, 207, 200, 0.1)',
        height: 44,
    },
    actionButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
    },
    separator: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
        backgroundColor: 'rgba(226, 207, 200, 0.1)',
    },
    descriptionContainer: {
        padding: 20,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(226, 207, 200, 0.1)',
    },
    descriptionText: {
        color: '#E2CFC8',
        fontSize: 16,
        opacity: 0.8,
        paddingTop: 10
    },
});

export default SpaceCard;