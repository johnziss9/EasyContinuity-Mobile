import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SpaceCard from '../components/SpaceCard';

describe('SpaceCard', () => {
    const mockProps = {
        spaceName: 'Test Folder',
        onPress: jest.fn(),
        onEditPress: jest.fn(),
        onDeletePress: jest.fn(),
    };

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<SpaceCard {...mockProps} />);

        expect(getByText(mockProps.spaceName)).toBeTruthy();
        expect(getByTestId('space-card-component')).toBeTruthy();
        expect(getByTestId('edit-space-button')).toBeTruthy();
        expect(getByTestId('delete-space-button')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
        const { getByTestId } = render(<SpaceCard {...mockProps} />);
        fireEvent.press(getByTestId('space-card-component'));
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