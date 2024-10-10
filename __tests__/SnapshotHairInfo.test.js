import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotHairInfo from '../pages/SnapshotHairInfo';
import { useNavigation } from '@react-navigation/native';

// Mock the route prop that checkes is snapshot is getting added or edited
const mockRoute = {
    params: {
        isNewSnapshot: true
    }
};

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    NavigationContainer: ({ children }) => children
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('SnapshotHairInfo', () => {
    it('should render correctly for new snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotHairInfo route={mockRoute} />);

        expect(getByText('Add Hair Details')).toBeTruthy();
        expect(getByTestId('hair-prep-text-input')).toBeTruthy();
        expect(getByTestId('hair-method-text-input')).toBeTruthy();
        expect(getByTestId('hair-styling-tools-text-input')).toBeTruthy();
        expect(getByTestId('hair-products-text-input')).toBeTruthy();
        expect(getByTestId('hair-notes-text-input')).toBeTruthy();
    });

    it('should render correctly for editing snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotHairInfo route={{ params: { isNewSnapshot: false } }} />);

        expect(getByText('Edit Hair Details')).toBeTruthy();
        expect(getByTestId('hair-prep-text-input')).toBeTruthy();
        expect(getByTestId('hair-method-text-input')).toBeTruthy();
        expect(getByTestId('hair-styling-tools-text-input')).toBeTruthy();
        expect(getByTestId('hair-products-text-input')).toBeTruthy();
        expect(getByTestId('hair-notes-text-input')).toBeTruthy();
    });

    it('should allow multi-line input in all fields', () => {
        const { getByTestId } = render(<SnapshotHairInfo route={mockRoute} />);
        
        fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('hair-method-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('hair-styling-tools-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('hair-products-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('hair-notes-text-input'), 'Line 1\nLine 2\nLine 3');
        
        expect(getByTestId('hair-prep-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('hair-method-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('hair-styling-tools-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('hair-products-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('hair-notes-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from a new Snapshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotHairInfo route={mockRoute} />);

        fireEvent.press(getByTestId('hair-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Space');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from an edited Snapshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotHairInfo route={{ params: { isNewSnapshot: false } }} />);

        fireEvent.press(getByTestId('hair-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
    });

    // TODO Write a test for when pressing the submit button in the form
});