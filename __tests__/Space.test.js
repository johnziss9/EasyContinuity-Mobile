import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import Space from '../pages/Space';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();

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
    default: jest.fn()
        .mockImplementationOnce(() => Promise.resolve({
            success: true,
            data: [
                { id: 1, name: 'Folder-1', spaceId: 1, parentId: null },
                { id: 2, name: 'Folder-2', spaceId: 1, parentId: null }
            ]
        }))
        .mockImplementationOnce(() => Promise.resolve({
            success: true,
            data: [
                { id: 3, name: 'Snapshot-1', spaceId: 1, folderId: null },
                { id: 4, name: 'Snapshot-2', spaceId: 1, folderId: null }
            ]
        }))
}));

describe('Space Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset API mock before each test
        const apiMock = require('../api/api').default;
        apiMock.mockImplementation(() => Promise.resolve({
            success: true,
            data: []
        }));
    });

    it('should render the component', async () => {
        const { getByTestId, getByText, queryByTestId } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        expect(queryByTestId('activity-indicator')).toBeTruthy();

        await waitFor(() => {
            expect(queryByTestId('activity-indicator')).toBeNull();
        }, { timeout: 10000 });

        await waitFor(() => {
            expect(getByTestId('search-input')).toBeTruthy();
            expect(getByTestId('add-item-button')).toBeTruthy();
            expect(getByText('Folder-1')).toBeTruthy();
            expect(getByText('Folder-2')).toBeTruthy();
            expect(getByText('Snapshot-1')).toBeTruthy();
            expect(getByText('Snapshot-2')).toBeTruthy();
        }, { timeout: 10000 });

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
            id: 1,
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

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: '1', name: 'Folder 1', parentId: null },
                    { id: '2', name: 'Folder 2', parentId: null }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [] // Initial snapshots
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: '3', name: 'New Folder' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: '1', name: 'Folder 1' },
                    { id: '2', name: 'Folder 2' },
                    { id: '3', name: 'New Folder' }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [] // Refreshed snapshots
            }));

        const { getByTestId, queryByText, getByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Folder 1')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByTestId('folder-name-text-input');
        fireEvent.changeText(nameInput, 'New Folder');

        fireEvent.press(getByTestId('add-folder-submit-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Folder',
                spaceId: 1,
                createdOn: expect.any(String)
            });

            expect(queryByText('Enter Folder Name:')).toBeNull();

            expect(apiMock).toHaveBeenNthCalledWith(1, '/folder/space/1', 'GET');
            expect(apiMock).toHaveBeenNthCalledWith(2, '/snapshot/space/1', 'GET');
            expect(apiMock).toHaveBeenNthCalledWith(3, '/folder/', 'POST', {
                name: 'New Folder',
                spaceId: 1,
                createdOn: expect.any(String)
            });
            expect(apiMock).toHaveBeenNthCalledWith(4, '/folder/space/1', 'GET');
            expect(apiMock).toHaveBeenNthCalledWith(5, '/snapshot/space/1', 'GET');
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

    // TODO This test should be modified when the search bar is fixed. Check the test below too.
    // it('should filter items when using the search bar', async () => {
    //     const { getByTestId, getByText, queryByText } = render(
    //         <NavigationContainer>
    //             <Space />
    //         </NavigationContainer>
    //     );

    //     expect(getByText('Folder 1')).toBeTruthy();
    //     expect(getByText('Folder 2')).toBeTruthy();
    //     expect(getByText('Rhaenyra')).toBeTruthy();

    //     fireEvent.changeText(getByTestId('search-input'), 'Folder 1');

    //     await waitFor(() => {
    //         expect(getByText('Folder 1')).toBeTruthy();
    //         expect(queryByText('Folder 2')).toBeNull();
    //         expect(queryByText('Rhaenyra')).toBeNull();
    //     });

    //     fireEvent.changeText(getByTestId('search-input'), '');

    //     await waitFor(() => {
    //         expect(getByText('Folder 1')).toBeTruthy();
    //         expect(getByText('Folder 2')).toBeTruthy();
    //         expect(getByText('Rhaenyra')).toBeTruthy();
    //     });

    //     fireEvent.changeText(getByTestId('search-input'), 'Rhaenyra');

    //     await waitFor(() => {
    //         expect(getByText('Rhaenyra')).toBeTruthy();
    //         expect(queryByText('Folder 1')).toBeNull();
    //         expect(queryByText('Folder 2')).toBeNull();
    //     });
    // });


    // TODO This is a similar test to above. It might be more accurate. Base it more on this.
    // it('should filter folders and snapshots based on search query', async () => {
    //     const apiMock = require('../api/api').default;

    //     apiMock
    //         .mockImplementationOnce(() => Promise.resolve({
    //             success: true,
    //             data: [
    //                 { id: 1, name: 'Test Folder', spaceId: 1 },
    //                 { id: 2, name: 'Another Folder', spaceId: 1 }
    //             ]
    //         }))
    //         .mockImplementationOnce(() => Promise.resolve({
    //             success: true,
    //             data: [
    //                 { id: 3, name: 'Test Snapshot', spaceId: 1 },
    //                 { id: 4, name: 'Another Snapshot', spaceId: 1 }
    //             ]
    //         }));

    //     const { getByTestId, queryByText } = render(
    //         <NavigationContainer>
    //             <Space />
    //         </NavigationContainer>
    //     );

    //     await waitFor(() => {
    //         fireEvent.changeText(getByTestId('search-input'), 'Test');

    //         // Should show matching items
    //         expect(queryByText('Test Folder')).toBeTruthy();
    //         expect(queryByText('Test Snapshot')).toBeTruthy();

    //         // Should hide non-matching items
    //         expect(queryByText('Another Folder')).toBeNull();
    //         expect(queryByText('Another Snapshot')).toBeNull();
    //     });
    // });

    // it('should clear search and show all items when search is cleared', async () => {
    //     // Similar to above test but testing the clear functionality
    // });

    // TODO This test should be modified when the search bar is fixed.
    // it('should clear search bar', () => {
    //     const { getByTestId, getByText } = render(
    //         <NavigationContainer>
    //             <Space />
    //         </NavigationContainer>);

    //     fireEvent.changeText(getByTestId('search-input'), 'Folder 1');
    //     fireEvent.press(getByTestId('clear-search-button'));

    //     expect(getByTestId('search-input').props.value).toBe('');
    //     expect(getByText('Folder 1')).toBeTruthy();
    //     expect(getByText('Folder 2')).toBeTruthy();
    // });

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
                data: { success: true }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, queryByText } = render(
            <NavigationContainer>
                <Space />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const deleteButtons = getAllByTestId('delete-folder-button');
        fireEvent.press(deleteButtons[0]);

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/1', 'PUT', {
                name: 'Test Folder',
                isDeleted: true,
                deletedOn: expect.any(String)
            });
            expect(queryByText('Test Folder')).toBeNull();
        });
    });

    // TODO Add api errors tests for folders
    // TODO Add api errors tests for fetching items

});