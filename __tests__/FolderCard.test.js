import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FolderCard from '../components/FolderCard';

describe('FolderCard Component', () => {
    const mockProps = {
        folderName: 'Test Folder',
        onPress: jest.fn(),
        onEditPress: jest.fn(),
        onDeletePress: jest.fn(),
    };

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<FolderCard {...mockProps} />);

        expect(getByText('Test Folder')).toBeTruthy();
        expect(getByTestId('folder-component')).toBeTruthy();
        expect(getByTestId('edit-folder-button')).toBeTruthy();
        expect(getByTestId('delete-folder-button')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
        const { getByTestId } = render(<FolderCard {...mockProps} />);
        fireEvent.press(getByTestId('folder-component'));
        expect(mockProps.onPress).toHaveBeenCalled();
    });

    it('should call onEditPress when edit button is pressed', () => {
        const { getByTestId } = render(<FolderCard {...mockProps} />);
        fireEvent.press(getByTestId('edit-folder-button'));
        expect(mockProps.onEditPress).toHaveBeenCalled();
    });

    it('should call onDeletePress when delete button is pressed', () => {
        const { getByTestId } = render(<FolderCard {...mockProps} />);
        fireEvent.press(getByTestId('delete-folder-button'));
        expect(mockProps.onDeletePress).toHaveBeenCalled();
    });
});