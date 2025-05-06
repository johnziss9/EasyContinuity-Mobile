import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SpaceCard from '../components/SpaceCard';

describe('SpaceCard', () => {
    const mockProps = {
        spaceName: 'Test Folder',
        description: 'Test Description',
        onPress: jest.fn(),
        onEditPress: jest.fn(),
        onDeletePress: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByTestId, queryByText } = render(<SpaceCard {...mockProps} />);

        expect(getByText(mockProps.spaceName)).toBeTruthy();
        expect(getByTestId('space-card-component')).toBeTruthy();
        expect(getByTestId('edit-space-button')).toBeTruthy();
        expect(getByTestId('delete-space-button')).toBeTruthy();
        expect(getByTestId('toggle-description-button')).toBeTruthy();

        expect(queryByText(mockProps.description)).toBeNull();
    });

    it('should show/hide description when toggle button is pressed', () => {
        const { getByTestId, queryByText } = render(<SpaceCard {...mockProps} />);

        // Initially description should be hidden
        expect(queryByText(mockProps.description)).toBeNull();

        // Press toggle button
        fireEvent.press(getByTestId('toggle-description-button'));

        // Description should now be visible
        expect(queryByText(mockProps.description)).toBeTruthy();

        // Press toggle button again
        fireEvent.press(getByTestId('toggle-description-button'));

        // Description should be hidden again
        expect(queryByText(mockProps.description)).toBeNull();
    });

    it('should show "No description available" when description prop is not provided', () => {
        const propsWithoutDescription = {
            ...mockProps,
            description: undefined
        };

        const { getByTestId, queryByText } = render(<SpaceCard {...propsWithoutDescription} />);

        // Press toggle button
        fireEvent.press(getByTestId('toggle-description-button'));

        // Should show default text
        expect(queryByText('No description available')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
        const { getByTestId } = render(<SpaceCard {...mockProps} />);
        fireEvent.press(getByTestId('space-card-main-content'));
        expect(mockProps.onPress).toHaveBeenCalled();
    });

    it('should call onEditPress when edit button is pressed', () => {
        const { getByTestId } = render(<SpaceCard {...mockProps} />);
        fireEvent.press(getByTestId('edit-space-button'));
        expect(mockProps.onEditPress).toHaveBeenCalled();
    });

    it('should call onDeletePress when delete button is pressed', () => {
        const { getByTestId } = render(<SpaceCard {...mockProps} />);
        fireEvent.press(getByTestId('delete-space-button'));
        expect(mockProps.onDeletePress).toHaveBeenCalled();
    });
});