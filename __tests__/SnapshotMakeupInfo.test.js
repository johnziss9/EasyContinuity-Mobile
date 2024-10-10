import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotMakeupInfo from '../pages/SnapshotMakeupInfo';
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

describe('SnapshotMakeupInfo', () => {
    it('should render correctly for new snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotMakeupInfo route={mockRoute} />);

        expect(getByText('Add Makeup Details')).toBeTruthy();
        expect(getByTestId('makeup-skin-text-input')).toBeTruthy();
        expect(getByTestId('makeup-brows-text-input')).toBeTruthy();
        expect(getByTestId('makeup-eyes-text-input')).toBeTruthy();
        expect(getByTestId('makeup-lips-text-input')).toBeTruthy();
        expect(getByTestId('makeup-effects-text-input')).toBeTruthy();
        expect(getByTestId('makeup-notes-text-input')).toBeTruthy();
    });

    it('should render correctly for editing snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotMakeupInfo route={{ params: { isNewSnapshot: false } }} />);

        expect(getByText('Edit Makeup Details')).toBeTruthy();
        expect(getByTestId('makeup-skin-text-input')).toBeTruthy();
        expect(getByTestId('makeup-brows-text-input')).toBeTruthy();
        expect(getByTestId('makeup-eyes-text-input')).toBeTruthy();
        expect(getByTestId('makeup-lips-text-input')).toBeTruthy();
        expect(getByTestId('makeup-effects-text-input')).toBeTruthy();
        expect(getByTestId('makeup-notes-text-input')).toBeTruthy();
    });

    it('should allow multi-line input in all fields', () => {
        const { getByTestId } = render(<SnapshotMakeupInfo route={mockRoute} />);
        
        fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('makeup-brows-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('makeup-eyes-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('makeup-lips-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('makeup-effects-text-input'), 'Line 1\nLine 2\nLine 3');
        fireEvent.changeText(getByTestId('makeup-notes-text-input'), 'Line 1\nLine 2\nLine 3');
        
        expect(getByTestId('makeup-skin-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('makeup-brows-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('makeup-eyes-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('makeup-lips-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('makeup-effects-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        expect(getByTestId('makeup-notes-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from a new Spanshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotMakeupInfo route={mockRoute} />);

        fireEvent.press(getByTestId('makeup-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Space');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from an edited Spanshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotMakeupInfo route={{ params: { isNewSnapshot: false } }}/>);

        fireEvent.press(getByTestId('makeup-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
    });

    // TODO Write a test for when pressing the submit button in the form
});