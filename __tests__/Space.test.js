import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Space from '../pages/Space';
import { NavigationContainer } from '@react-navigation/native';
import ToastNotification from '../utils/ToastNotification';

const mockNavigate = jest.fn();
const apiMock = require('../api/api').default;

// Mock the entire @react-navigation/native module
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: {
                spaceId: 1,
                spaceName: 'Test Space'
            }
        }),
    };
});

// Mock the API handling
jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: []
    }))
}));

jest.mock('../utils/ToastNotification', () => ({
    show: jest.fn()
}));

describe('Space Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        apiMock.mockClear();
        ToastNotification.show.mockClear();
    });

    it('should render the component', async () => {
        // Reset the mock implementation for this specific test
        const apiMock = require('../api/api').default;

        // Explicitly set the implementation for the initial API calls
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // For folders
                success: true,
                data: [
                    { id: 1, name: 'Folder-1', spaceId: 1, parentId: null },
                    { id: 2, name: 'Folder-2', spaceId: 1, parentId: null }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // For snapshots
                success: true,
                data: [
                    { id: 3, name: 'Snapshot-1', spaceId: 1, folderId: null },
                    { id: 4, name: 'Snapshot-2', spaceId: 1, folderId: null }
                ]
            }));

        const { getByTestId, getByText, queryByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        // Initial check for loading indicator
        expect(queryByTestId('activity-indicator')).toBeTruthy();

        // Add some debugging to check component state
        console.log('Initial DOM state:', queryByTestId('activity-indicator') ? 'Loading' : 'Loaded');

        // First wait for loading to finish
        await waitFor(() => {
            console.log('Checking loading state:', queryByTestId('activity-indicator') ? 'Still loading' : 'Done loading');
            return expect(queryByTestId('activity-indicator')).toBeNull();
        }, { timeout: 10000 });

        // Verify the API mock was called the expected number of times
        expect(apiMock).toHaveBeenCalledTimes(2);

        // Then check for the other elements separately
        expect(getByTestId('search-input')).toBeTruthy();
        expect(getByTestId('add-item-button')).toBeTruthy();

        // Check content elements
        expect(getByText('Folder-1')).toBeTruthy();
        expect(getByText('Folder-2')).toBeTruthy();
        expect(getByText('Snapshot-1')).toBeTruthy();
        expect(getByText('Snapshot-2')).toBeTruthy();
    }, 15000);

    it('should navigate to Snapshot screen when snapshot card is pressed', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Snapshot-1', spaceId: 1, folderId: null }]
            }));

        const { getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Snapshot-1')).toBeTruthy();
        });

        fireEvent.press(getByText('Snapshot-1'));
        expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: null,
            folderName: null,
            snapshotId: 1,
            snapshotName: 'Snapshot-1'
        });
    });

    it('should open add new item modal', () => {
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        expect(getByText('Add Item:')).toBeTruthy();
    });

    it('should open the add new item modal, select folder button and add new folder', async () => {
        const apiMock = require('../api/api').default;

        // Setup API mock responses
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Initial folders fetch
                success: true,
                data: [
                    { id: 1, name: 'Folder 1', parentId: null },
                    { id: 2, name: 'Folder 2', parentId: null }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Initial snapshots fetch
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Create folder response
                success: true,
                data: { id: 3, name: 'New Folder', parentId: null }
            }));

        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        // Wait for initial render
        await waitFor(() => {
            expect(getByText('Folder 1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        // Add folder name
        const nameInput = getByTestId('folder-name-text-input');
        fireEvent.changeText(nameInput, 'New Folder');

        fireEvent.press(getByTestId('add-folder-submit-button'));

        // Verify API calls
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Folder',
                spaceId: 1,
                createdOn: expect.any(String)
            });

            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Folder Added Successfully'
            );

            expect(queryByText('Enter Folder Name:')).toBeNull();
        });
    });

    it('should open the add new item modal, select folder and cancel', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: '1', name: 'Folder-1', parentId: null },
                    { id: '2', name: 'New Folder', parentId: null }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [] // Empty snapshots
            }));

        const { getByTestId, queryByText, getByPlaceholderText, queryByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Folder-1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
        fireEvent.changeText(getByPlaceholderText('Folder Name'), 'Folder-2');
        fireEvent.press(getByTestId('add-folder-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Add Item:')).toBeNull();
            expect(queryByPlaceholderText('Folder Name')).toBeNull();
            expect(queryByText('Folder-2')).toBeNull();
            expect(getByText('New Folder')).toBeTruthy();
        });
    });

    it('should navigate to SnapshotGeneralInfo when add snapshot is pressed', async () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-snapshot-button'));

        expect(mockNavigate).toHaveBeenCalledWith('SnapshotGeneralInfo', {
            isNewSnapshot: true,
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: null
        });
    });

    it('should close add new item modal when folder option is selected', () => {
        const { getByTestId, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        expect(queryByText('Add Item:')).toBeTruthy();

        fireEvent.press(getByTestId('add-new-folder-button'));
        expect(queryByText('Add Item:')).toBeNull();
    });

    it('should close add new item modal when snapshot option is selected', () => {
        const { getByTestId, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        expect(queryByText('Add Item:')).toBeTruthy();

        fireEvent.press(getByTestId('add-new-snapshot-button'));
        expect(queryByText('Add Item:')).toBeNull();
    });

    it('should reset folder name when add folder modal is closed', async () => {
        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'Test Folder');

        fireEvent.press(getByTestId('add-folder-cancel-button'));

        // Open modal again to check if input was reset
        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const newNameInput = getByPlaceholderText('Folder Name');
        expect(newNameInput.props.value).toBe('');
    });

    it('should navigate to Folder screen with correct params when folder is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        fireEvent.press(getByText('Test Folder'));
        expect(mockNavigate).toHaveBeenCalledWith('Folder', {
            folderId: 1,
            folderName: 'Test Folder',
            spaceId: 1,
            spaceName: 'Test Space'
        });
    });

    it('should only display root folders (parentId is null)', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Root Folder', parentId: null },
                    { id: 2, name: 'Nested Folder', parentId: 1 }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Root Folder')).toBeTruthy();
            expect(queryByText('Nested Folder')).toBeNull();
        });
    });

    it('should open edit folder modal with correct folder data', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        // Get all edit buttons and click the first one
        const editButtons = getAllByTestId('edit-folder-button');
        fireEvent.press(editButtons[0]);

        expect(getByPlaceholderText('Folder Name').props.value).toBe('Test Folder');
    });

    it('should successfully edit a folder', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Updated Folder' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Updated Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const editButtons = getAllByTestId('edit-folder-button');
        fireEvent.press(editButtons[0]);

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'Updated Folder');

        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/1', 'PUT', {
                name: 'Updated Folder',
                lastUpdatedOn: expect.any(String)
            });

            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Folder Updated Successfully'
            );

            expect(getByText('Updated Folder')).toBeTruthy();
        });
    });

    it('should cancel edit operation correctly', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, getByPlaceholderText, queryByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const editButtons = getAllByTestId('edit-folder-button');
        fireEvent.press(editButtons[0]);

        const nameInput = getByPlaceholderText('Folder Name');
        expect(nameInput.props.value).toBe('Test Folder');

        fireEvent.press(getByTestId('add-folder-cancel-button'));

        await waitFor(() => {
            expect(queryByPlaceholderText('Folder Name')).toBeNull();

            expect(getByText('Test Folder')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const newNameInput = getByPlaceholderText('Folder Name');
        expect(newNameInput.props.value).toBe('');
    });

    it('should successfully delete a folder', async () => {
        // Mock the date
        const mockDate = new Date('2024-12-17T07:19:09.984Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Initial snapshots
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { success: true }  // Delete response
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed snapshots
            }));

        const { getByText, getAllByTestId, queryByText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const deleteButtons = getAllByTestId('delete-folder-button');
        fireEvent.press(deleteButtons[0]);

        expect(getByText('Delete Folder?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-folder-confirm-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/1', 'PUT', {
                name: 'Test Folder',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });

            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Folder Deleted Successfully'
            );

            expect(queryByText('Test Folder')).toBeNull();
        });

        jest.restoreAllMocks();
    });

    it('should cancel folder deletion when cancel is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, queryByText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const deleteButtons = getAllByTestId('delete-folder-button');
        fireEvent.press(deleteButtons[0]);

        expect(getByText('Delete Folder?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-folder-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Delete Folder?')).toBeNull();
            expect(getByText('Test Folder')).toBeTruthy();
            expect(apiMock).toHaveBeenCalledTimes(2);
        });
    });

    it('should successfully delete a snapshot', async () => {
        // Mock the date
        const mockDate = new Date('2024-12-17T07:19:09.984Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Initial folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Snapshot', folderId: null }]  // Initial snapshots
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { success: true }  // Delete response
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed snapshots
            }));

        const { getByText, queryByText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Snapshot')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-snapshot-button'));

        expect(getByText('Delete Snapshot?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-snapshot-confirm-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', {
                name: 'Test Snapshot',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });

            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Snapshot Deleted Successfully'
            );

            expect(queryByText('Test Snapshot')).toBeNull();
        });

        jest.restoreAllMocks();
    });

    it('should cancel snapshot deletion when cancel is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Initial folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Snapshot', folderId: null }]  // Initial snapshots
            }));

        const { getByText, queryByText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Snapshot')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-snapshot-button'));

        expect(getByText('Delete Snapshot?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-snapshot-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Delete Snapshot?')).toBeNull();
            expect(getByText('Test Snapshot')).toBeTruthy();
            expect(apiMock).toHaveBeenCalledTimes(2);
        });
    });

    it('should handle search and display search results', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Initial folders fetch
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Initial snapshots fetch
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Search results
                success: true,
                data: [
                    { id: 2, name: 'Test Folder', episode: null },
                    { id: 3, name: 'Test Snapshot', episode: '1' }
                ]
            }));

        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(getByText('Root Folder')).toBeTruthy();
        });

        // Perform search
        fireEvent.changeText(getByTestId('search-input'), 'Test');
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            // Root items should be hidden
            expect(queryByText('Root Folder')).toBeNull();

            // Search results should be visible
            expect(getByText('Test Folder')).toBeTruthy();
            expect(getByText('Test Snapshot')).toBeTruthy();

            // Verify search API was called
            expect(apiMock).toHaveBeenCalledWith(
                `/space/1/search?query=Test`,
                'GET'
            );
        });
    });

    it('should handle empty search results', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Empty search results
            }));

        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Root Folder')).toBeTruthy();
        });

        fireEvent.changeText(getByTestId('search-input'), 'NonExistent');
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            expect(queryByText('Root Folder')).toBeNull();
            expect(getByText('No matches found')).toBeTruthy();
            expect(getByText('Try different search terms or clear search to show all items')).toBeTruthy();
        });
    });

    it('should clear search and return to root items view', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Initial folders
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Initial snapshots
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Search results
                success: true,
                data: [{ id: 2, name: 'Test Item', episode: '1' }]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Refresh folders after clear
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Refresh snapshots after clear
                success: true,
                data: []
            }));

        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        // Wait for initial load
        await waitFor(() => {
            expect(getByText('Root Folder')).toBeTruthy();
        });

        // Perform search
        fireEvent.changeText(getByTestId('search-input'), 'Test');
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            expect(getByText('Test Item')).toBeTruthy();
        });

        // Clear search
        fireEvent.press(getByTestId('clear-search-button'));

        await waitFor(() => {
            // Search results should be gone
            expect(queryByText('Test Item')).toBeNull();

            // Root items should be back
            expect(getByText('Root Folder')).toBeTruthy();

            // Search input should be empty
            expect(getByTestId('search-input').props.value).toBe('');
        });
    });

    it('should not make search API call with empty query', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        fireEvent.changeText(getByTestId('search-input'), '   ');  // Only spaces
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            // Verify only initial API calls were made, no search call
            expect(apiMock).toHaveBeenCalledTimes(2);
        });
    });

    it('should handle search API error', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Root Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Search failed'
            }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Root Folder')).toBeTruthy();
        });

        fireEvent.changeText(getByTestId('search-input'), 'Test');
        fireEvent.press(getByTestId('search-button'));

        // Wait for the API call to complete and the toast to be called
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                `/space/1/search?query=Test`,
                'GET'
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Search failed'
            );
        });
    });

    it('should sort items by date newest first by default', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Initial folders fetch
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Older Folder',
                        parentId: null,
                        createdOn: '2024-01-01T00:00:00Z'
                    },
                    {
                        id: 2,
                        name: 'Newer Folder',
                        parentId: null,
                        createdOn: '2024-01-03T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Initial snapshots fetch
                success: true,
                data: [
                    {
                        id: 3,
                        name: 'Older Snapshot',
                        folderId: null,
                        createdOn: '2024-01-02T00:00:00Z'
                    },
                    {
                        id: 4,
                        name: 'Newer Snapshot',
                        folderId: null,
                        createdOn: '2024-01-04T00:00:00Z'
                    }
                ]
            }));

        const { getByText, getAllByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Get all elements content
            const items = getAllByText(/^(Newer|Older)/);

            // Verify order: Folders first, then Snapshots, each group sorted by date newest first
            expect(items[0]).toHaveTextContent('Newer Folder');
            expect(items[1]).toHaveTextContent('Older Folder');
            expect(items[2]).toHaveTextContent('Newer Snapshot');
            expect(items[3]).toHaveTextContent('Older Snapshot');
        });
    });

    it('should apply different sort options when selected', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Initial folders fetch
                success: true,
                data: [
                    {
                        id: 1,
                        name: 'Beta Folder',
                        parentId: null,
                        createdOn: '2024-01-01T00:00:00Z'
                    },
                    {
                        id: 2,
                        name: 'Alpha Folder',
                        parentId: null,
                        createdOn: '2024-01-03T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Initial snapshots fetch
                success: true,
                data: [
                    {
                        id: 3,
                        name: 'Delta Snapshot',
                        folderId: null,
                        createdOn: '2024-01-02T00:00:00Z'
                    },
                    {
                        id: 4,
                        name: 'Charlie Snapshot',
                        folderId: null,
                        createdOn: '2024-01-04T00:00:00Z'
                    }
                ]
            }));

        const { getByText, getAllByText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        // Wait for initial render (newest first by default)
        await waitFor(() => {
            const items = getAllByText(/^(Alpha|Beta|Charlie|Delta)/);
            expect(items[0]).toHaveTextContent('Alpha Folder');
            expect(items[1]).toHaveTextContent('Beta Folder');
            expect(items[2]).toHaveTextContent('Charlie Snapshot');
            expect(items[3]).toHaveTextContent('Delta Snapshot');
        });

        // Test Date: Oldest First
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByText('Date: Oldest First'));
        await waitFor(() => {
            const items = getAllByText(/^(Alpha|Beta|Charlie|Delta)/);
            expect(items[0]).toHaveTextContent('Beta Folder');
            expect(items[1]).toHaveTextContent('Alpha Folder');
            expect(items[2]).toHaveTextContent('Delta Snapshot');
            expect(items[3]).toHaveTextContent('Charlie Snapshot');
        });

        // Test Name: A to Z
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByText('Name: A to Z'));
        await waitFor(() => {
            const items = getAllByText(/^(Alpha|Beta|Charlie|Delta)/);
            expect(items[0]).toHaveTextContent('Alpha Folder');
            expect(items[1]).toHaveTextContent('Beta Folder');
            expect(items[2]).toHaveTextContent('Charlie Snapshot');
            expect(items[3]).toHaveTextContent('Delta Snapshot');
        });

        // Test Name: Z to A
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByText('Name: Z to A'));
        await waitFor(() => {
            const items = getAllByText(/^(Alpha|Beta|Charlie|Delta)/);
            expect(items[0]).toHaveTextContent('Beta Folder');
            expect(items[1]).toHaveTextContent('Alpha Folder');
            expect(items[2]).toHaveTextContent('Delta Snapshot');
            expect(items[3]).toHaveTextContent('Charlie Snapshot');
        });

        // Test Date: Newest First (back to default)
        fireEvent.press(getByTestId('sort-button'));
        fireEvent.press(getByText('Date: Newest First'));
        await waitFor(() => {
            const items = getAllByText(/^(Alpha|Beta|Charlie|Delta)/);
            expect(items[0]).toHaveTextContent('Alpha Folder');
            expect(items[1]).toHaveTextContent('Beta Folder');
            expect(items[2]).toHaveTextContent('Charlie Snapshot');
            expect(items[3]).toHaveTextContent('Delta Snapshot');
        });
    });

    // Initial data loading errors
    it('should show error toast when folders fetch API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to fetch folders'
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to fetch folders'
            );
        });
    });

    it('should show error toast when snapshots fetch API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to fetch snapshots'
            }));

        render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to fetch snapshots'
            );
        });
    });

    it('should show error toast when initial data fetch throws network error', async () => {
        apiMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to load items'
            );
        });
    });

    // Folder operations errors
    it('should show error toast when create folder API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to create folder'
            }));

        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('add-item-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'New Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to create folder'
            );
        });
    });

    it('should show error toast when create folder throws network error', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('add-item-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'New Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to add folder'
            );
        });
    });

    it('should show error toast when update folder API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to update folder'
            }));

        const { getAllByTestId, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getAllByTestId('edit-folder-button')[0]).toBeTruthy();
        });

        fireEvent.press(getAllByTestId('edit-folder-button')[0]);

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'Updated Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to update folder'
            );
        });
    });

    it('should show error toast when update folder throws network error', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getAllByTestId, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getAllByTestId('edit-folder-button')[0]).toBeTruthy();
        });

        fireEvent.press(getAllByTestId('edit-folder-button')[0]);

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'Updated Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to update folder'
            );
        });
    });

    it('should show error toast when delete folder API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to delete folder'
            }));

        const { getAllByTestId, getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getAllByTestId('delete-folder-button')[0]).toBeTruthy();
        });

        fireEvent.press(getAllByTestId('delete-folder-button')[0]);
        expect(getByText('Delete Folder?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-folder-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to delete folder'
            );
        });
    });

    it('should show error toast when delete folder throws network error', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getAllByTestId, getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getAllByTestId('delete-folder-button')[0]).toBeTruthy();
        });

        fireEvent.press(getAllByTestId('delete-folder-button')[0]);
        expect(getByText('Delete Folder?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-folder-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to delete folder'
            );
        });
    });

    // Snapshot operations errors
    it('should show error toast when delete snapshot API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Snapshot', folderId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to delete snapshot'
            }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('delete-snapshot-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-snapshot-button'));
        expect(getByText('Delete Snapshot?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-snapshot-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to delete snapshot'
            );
        });
    });

    it('should show error toast when delete snapshot throws network error', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Snapshot', folderId: null }]
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('delete-snapshot-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-snapshot-button'));
        expect(getByText('Delete Snapshot?')).toBeTruthy();

        fireEvent.press(getByTestId('delete-snapshot-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to delete snapshot'
            );
        });
    });

    // Search errors
    it('should show error toast when search API returns unsuccessful response', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Search failed'
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('search-input')).toBeTruthy();
        });

        fireEvent.changeText(getByTestId('search-input'), 'test');
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Search failed'
            );
        });
    });

    it('should show error toast when search throws network error', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('search-input')).toBeTruthy();
        });

        fireEvent.changeText(getByTestId('search-input'), 'test');
        fireEvent.press(getByTestId('search-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to load search results'
            );
        });
    });

    // Error during refresh after operations
    it('should handle errors during data refresh after folder operations', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Folder', parentId: null }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 2, name: 'New Folder' }
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('add-item-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'New Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            // First success notification for creating folder
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Folder Added Successfully'
            );

            // Then error notification for refresh failure
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to load items'
            );
        });
    });

    // Edge cases
    it('should handle empty data arrays gracefully', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Items Yet')).toBeTruthy();
            expect(getByText('Get started by pressing the + button below to add your first item.')).toBeTruthy();
        });
    });

    it('should handle non-array data response gracefully', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: null
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {}
            }));

        const { getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Items Yet')).toBeTruthy();
        });
    });
});