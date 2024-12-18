import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Folder from '../pages/Folder';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();
const apiMock = require('../api/api').default;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: mockNavigate,
        setParams: jest.fn(),
    }),
    useRoute: () => ({
        params: {
            folderId: 1,
            folderName: 'Test Folder',
            spaceId: 1,
            spaceName: 'Test Space'
        }
    }),
}));

jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ success: true, data: [] }))
}));

describe('Folder Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        apiMock.mockClear();
        apiMock.mockImplementation(() => Promise.resolve({
            success: true,
            data: []
        }));
    });

    it('should render the component', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Test Folder', parentId: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByTestId, getByText, queryByTestId } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        expect(queryByTestId('activity-indicator')).toBeTruthy();

        await waitFor(() => {
            expect(queryByTestId('activity-indicator')).toBeNull();
        }, { timeout: 10000 });

        await waitFor(() => {
            expect(getByTestId('add-item-button')).toBeTruthy();
            expect(getByText('No Items In Folder Yet')).toBeTruthy();
            expect(getByText('Get started by pressing the + button below to add your first item.')).toBeTruthy();
        }, { timeout: 10000 });
    }, 15000);

    it('should navigate to nested folder with correct params', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Nested Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }));

        const { getByText, queryByTestId } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(queryByTestId('activity-indicator')).toBeNull();
            expect(getByText('Nested Folder')).toBeTruthy();
        });

        fireEvent.press(getByText('Nested Folder'));
        expect(mockNavigate).toHaveBeenCalledWith('Folder', {
            folderId: 2,
            folderName: 'Nested Folder',
            spaceId: 1,
            spaceName: 'Test Space'
        });
    });

    it('should navigate to Snapshot screen when snapshot card is pressed', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Test Snapshot', folderId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }));

        const { getByText, queryByTestId } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(queryByTestId('activity-indicator')).toBeNull();
            expect(getByText('Test Snapshot')).toBeTruthy();
        });

        fireEvent.press(getByText('Test Snapshot'));
        expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: 1,
            folderName: 'Test Folder',
            snapshotId: 1,
            snapshotName: 'Test Snapshot'
        });
    });

    it('should create a new folder with parentId', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 2, name: 'New Nested Folder' }
            }));
    
        const { getByTestId, getByPlaceholderText, getByText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );
    
        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
    
        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'New Nested Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));
    
        await waitFor(() => {
            expect(getByText('Folder Added Successfully')).toBeTruthy();
        });
    
        fireEvent.press(getByTestId('added-folder-confirm-button'));
    
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Nested Folder',
                spaceId: 1,
                parentId: 1,
                createdOn: expect.any(String)
            });
        });
    
        // Should initiate refresh after confirmation
        expect(apiMock).toHaveBeenCalledWith('/folder/1', 'GET');
    });

    it('should show no items message when folder is empty', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Empty Folder', parentId: null }
            }))
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
                <Folder />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Items In Folder Yet')).toBeTruthy();
        });
    });

    it('should open add new item modal', () => {
        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        expect(getByText('Add Item:')).toBeTruthy();
    });

    it('should open the add new item modal, select folder button and add new folder', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Existing Folder' }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 3, name: 'New Folder' }
            }));
    
        const { getByTestId, getByPlaceholderText, queryByText, getByText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );
    
        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
    
        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'New Folder');
        fireEvent.press(getByTestId('add-folder-submit-button'));
    
        await waitFor(() => {
            expect(getByText('Folder Added Successfully')).toBeTruthy();
        });
    
        fireEvent.press(getByTestId('added-folder-confirm-button'));
    
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Folder',
                spaceId: 1,
                parentId: 1,
                createdOn: expect.any(String)
            });
            expect(queryByText('Enter Folder Name:')).toBeNull();
        });
    });

    it('should open the add new item modal, select folder and cancel', async () => {
        const { getByTestId, getByPlaceholderText, queryByText, queryByPlaceholderText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));
        fireEvent.changeText(getByPlaceholderText('Folder Name'), 'Test Folder');
        fireEvent.press(getByTestId('add-folder-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Add Item:')).toBeNull();
            expect(queryByPlaceholderText('Folder Name')).toBeNull();
        });
    });

    it('should open the add new item modal, select Snapshot and navigate to SnapshotGeneralInfo', async () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-snapshot-button'));

        expect(mockNavigate).toHaveBeenCalledWith('SnapshotGeneralInfo', {
            isNewSnapshot: true,
            spaceId: 1,
            folderId: 1,
            folderName: 'Test Folder'
        });
    });

    it('should close add new item modal when folder option is selected', () => {
        const { getByTestId, queryByText } = render(
            <NavigationContainer>
                <Folder />
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
                <Folder />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        expect(queryByText('Add Item:')).toBeTruthy();

        fireEvent.press(getByTestId('add-new-snapshot-button'));
        expect(queryByText('Add Item:')).toBeNull();
    });

    it('should reset folder name when add folder modal is closed', () => {
        const { getByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const nameInput = getByPlaceholderText('Folder Name');
        fireEvent.changeText(nameInput, 'Test Folder');

        fireEvent.press(getByTestId('add-folder-cancel-button'));

        fireEvent.press(getByTestId('add-item-button'));
        fireEvent.press(getByTestId('add-new-folder-button'));

        const newNameInput = getByPlaceholderText('Folder Name');
        expect(newNameInput.props.value).toBe('');
    });

    it('should open edit folder modal with correct folder data', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, getByPlaceholderText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Folder')).toBeTruthy();
        });

        const editButtons = getAllByTestId('edit-folder-button');
        fireEvent.press(editButtons[0]);

        expect(getByPlaceholderText('Folder Name').props.value).toBe('Test Folder');
    });

    it('should successfully edit a folder', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 2, name: 'Updated Folder' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Updated Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }));
    
        const { getByText, getAllByTestId, getByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Folder />
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
            expect(apiMock).toHaveBeenCalledWith('/folder/2', 'PUT', expect.objectContaining({
                name: 'Updated Folder',
                lastUpdatedOn: expect.any(String)
            }));
        });
    
        await waitFor(() => {
            expect(getByText('Updated Folder')).toBeTruthy();
        });
    
        expect(apiMock).toHaveBeenNthCalledWith(1, '/folder/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(2, '/folder/parent/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(3, '/snapshot/folder/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(4, '/space/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(5, '/folder/2', 'PUT', expect.objectContaining({
            name: 'Updated Folder',
            lastUpdatedOn: expect.any(String)
        }));

        expect(apiMock).toHaveBeenNthCalledWith(6, '/folder/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(7, '/folder/parent/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(8, '/snapshot/folder/1', 'GET');
        expect(apiMock).toHaveBeenNthCalledWith(9, '/space/1', 'GET');
    });

    it('should cancel edit operation correctly', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByText, getAllByTestId, getByPlaceholderText, queryByPlaceholderText, getByTestId } = render(
            <NavigationContainer>
                <Folder />
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
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { success: true }  // Delete response
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
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
                <Folder />
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
            expect(apiMock).toHaveBeenCalledWith('/folder/2', 'PUT', {
                name: 'Test Folder',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });
            expect(queryByText('Test Folder')).toBeNull();
        });
    
        jest.restoreAllMocks();
    });
    
    it('should cancel folder deletion when cancel is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Folder', parentId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }));
    
        const { getByText, getAllByTestId, queryByText, getByTestId } = render(
            <NavigationContainer>
                <Folder />
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
            expect(apiMock).toHaveBeenCalledTimes(4);
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
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // No nested folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Snapshot', folderId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { success: true }  // Delete response
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // Refreshed snapshots
            }));
        
        const { getByText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );
        
        await waitFor(() => {
            expect(getByText('Test Snapshot')).toBeTruthy();
        });
        
        fireEvent.press(getByTestId('delete-snapshot-button'));
     
        expect(getByText('Delete Snapshot?')).toBeTruthy();
     
        fireEvent.press(getByTestId('delete-snapshot-confirm-button'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/snapshot/2', 'PUT', {
                name: 'Test Snapshot',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });
            expect(queryByText('Test Snapshot')).toBeNull();
        });
     
        jest.restoreAllMocks();
     });
     
     it('should cancel snapshot deletion when cancel is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []  // No nested folders
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Test Snapshot', folderId: 1 }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { name: 'Test Space' }
            }));
     
        const { getByText, getByTestId, queryByText } = render(
            <NavigationContainer>
                <Folder />
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
            expect(apiMock).toHaveBeenCalledTimes(4);
        });
     });

    it('should sort items by date newest first by default', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Current folder fetch
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Nested folders fetch
                success: true,
                data: [
                    { 
                        id: 1, 
                        name: 'Older Folder', 
                        parentId: 1,
                        createdOn: '2024-01-01T00:00:00Z'
                    },
                    { 
                        id: 2, 
                        name: 'Newer Folder', 
                        parentId: 1,
                        createdOn: '2024-01-03T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Snapshots fetch
                success: true,
                data: [
                    {
                        id: 3,
                        name: 'Older Snapshot',
                        folderId: 1,
                        createdOn: '2024-01-02T00:00:00Z'
                    },
                    {
                        id: 4,
                        name: 'Newer Snapshot',
                        folderId: 1,
                        createdOn: '2024-01-04T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Space fetch
                success: true,
                data: { name: 'Test Space' }
            }));
    
        const { getByText, getAllByText } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Get all elements content
            const items = getAllByText(/^(Newer|Older)/);
            
            // Verify order: Newer Folder, Older Folder, Newer Snapshot, Older Snapshot
            expect(items[0]).toHaveTextContent('Newer Folder');
            expect(items[1]).toHaveTextContent('Older Folder');
            expect(items[2]).toHaveTextContent('Newer Snapshot');
            expect(items[3]).toHaveTextContent('Older Snapshot');
        });
    });

    it('should apply different sort options when selected', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({  // Current folder fetch
                success: true,
                data: { id: 1, name: 'Current Folder', parentId: null }
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Nested folders fetch
                success: true,
                data: [
                    { 
                        id: 1, 
                        name: 'Beta Folder', 
                        parentId: 1,
                        createdOn: '2024-01-01T00:00:00Z'
                    },
                    { 
                        id: 2, 
                        name: 'Alpha Folder', 
                        parentId: 1,
                        createdOn: '2024-01-03T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Snapshots fetch
                success: true,
                data: [
                    {
                        id: 3,
                        name: 'Delta Snapshot',
                        folderId: 1,
                        createdOn: '2024-01-02T00:00:00Z'
                    },
                    {
                        id: 4,
                        name: 'Charlie Snapshot',
                        folderId: 1,
                        createdOn: '2024-01-04T00:00:00Z'
                    }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({  // Space fetch
                success: true,
                data: { name: 'Test Space' }
            }));
    
        const { getByText, getAllByText, getByTestId } = render(
            <NavigationContainer>
                <Folder />
            </NavigationContainer>
        );
    
        // Wait for initial render
        await waitFor(() => {
            expect(getByText('Alpha Folder')).toBeTruthy();
        });
    
        // Open sort modal
        fireEvent.press(getByTestId('sort-button'));
    
        // Test Date: Oldest First
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
});