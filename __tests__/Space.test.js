import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Space from '../pages/Space';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    NavigationContainer: ({ children }) => children
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('Space Component', () => {

    it('should render the component', () => {
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>);

        expect(getByTestId('search-input')).toBeTruthy();
        expect(getByTestId('add-item-button')).toBeTruthy();
        expect(getByText('Folder 1')).toBeTruthy();
        expect(getByText('Folder 2')).toBeTruthy();
    });

    it('shout open add new item modal', () => {
        const { getByTestId, getByText } = render(<Space />);
        fireEvent.press(getByTestId('add-item-button'));
        expect(getByText('Add Item:')).toBeTruthy();
    });

    it('should open the add new item modal, select folder button and add new folder', async () => {
        const { getByTestId, getByText, getByPlaceholderText } = render(<Space />);

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
        fireEvent.changeText(getByPlaceholderText('Folder Name'), 'Folder-1');
        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(getByText('Folder-1')).toBeTruthy();
        });
    });

    it('should open the add new item modal, select folder and cancel', async () => {
        const { getByTestId, queryByText, getByPlaceholderText, queryByPlaceholderText } = render(<Space />);

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
        fireEvent.changeText(getByPlaceholderText('Folder Name'), 'Folder-2');
        fireEvent.press(getByTestId('add-space-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Add Item:')).toBeNull();
            expect(queryByPlaceholderText('Folder Name')).toBeNull();
        });

        expect(queryByText('Folder-2')).toBeNull();
    });

    it('should allow editing a folder name', async () => {
        const { getByText, getByTestId, getByPlaceholderText, getAllByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        expect(getByText('Folder 1')).toBeTruthy();

        fireEvent.press(getAllByTestId('edit-folder-button')[0]);

        expect(getByPlaceholderText('Folder Name')).toBeTruthy();

        fireEvent.changeText(getByPlaceholderText('Folder Name'), 'Folder 01');
        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(getByText('Folder 01')).toBeTruthy();
        });
    });

    it('should allow deleting a folder', async () => {
        const { getByText, getAllByTestId, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        expect(getByText('Folder 1')).toBeTruthy();

        fireEvent.press(getAllByTestId('delete-folder-button')[0]);

        await waitFor(() => {
            expect(queryByText('Folder 1')).toBeNull();
        });
    });

    it('should filter items when using the search bar', async () => {
        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        expect(getByText('Folder 1')).toBeTruthy();
        expect(getByText('Folder 2')).toBeTruthy();
        expect(getByText('Rhaenyra')).toBeTruthy();

        fireEvent.changeText(getByTestId('search-input'), 'Folder 1');

        await waitFor(() => {
            expect(getByText('Folder 1')).toBeTruthy();
            expect(queryByText('Folder 2')).toBeNull();
            expect(queryByText('Rhaenyra')).toBeNull();
        });

        fireEvent.changeText(getByTestId('search-input'), '');

        await waitFor(() => {
            expect(getByText('Folder 1')).toBeTruthy();
            expect(getByText('Folder 2')).toBeTruthy();
            expect(getByText('Rhaenyra')).toBeTruthy();
        });

        fireEvent.changeText(getByTestId('search-input'), 'Rhaenyra');

        await waitFor(() => {
            expect(getByText('Rhaenyra')).toBeTruthy();
            expect(queryByText('Folder 1')).toBeNull();
            expect(queryByText('Folder 2')).toBeNull();
        });
    });

    it('should clear search bar', () => {
        const { getByTestId, getByText } = render(<Space />);

        fireEvent.changeText(getByTestId('search-input'), 'Folder 1');
        fireEvent.press(getByTestId('clear-search-button'));

        expect(getByTestId('search-input').props.value).toBe('');
        expect(getByText('Folder 1')).toBeTruthy();
        expect(getByText('Folder 2')).toBeTruthy();
    });

    it('should navigate to Snapshot screen', () => {
        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(<Space />);

        // TODO Replace this with a snapshot generated at the top of the test page and pressing it.
        fireEvent.press(getByText('Rhaenyra'));

        expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
    });

    it('should navigate to SnapshotGeneralInfo screen when adding new snapshot', () => {
        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId, getByText } = render(<Space />);

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-snapshot-button'));

        expect(mockNavigate).toHaveBeenCalledWith('SnapshotGeneralInfo', { isNewSnapshot: true });
    });
})