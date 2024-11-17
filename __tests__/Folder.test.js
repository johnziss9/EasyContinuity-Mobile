import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Folder from '../pages/Folder';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ success: true, data: [] }))
}));

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
            expect(getByTestId('add-item-button')).toBeTruthy();
            expect(getByText('No Items In This Folder Yet')).toBeTruthy();
            expect(getByText('Get started by pressing the + button below to add your first item.')).toBeTruthy();
        });
    });

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
            id: 1,
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

        const { getByTestId, getByPlaceholderText } = render(
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
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Nested Folder',
                spaceId: 1,
                parentId: 1,
            });
        });
    });

    it('should show no items message when folder is empty', async () => {
        const apiMock = require('../api/api').default;
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
            expect(getByText('No Items In This Folder Yet')).toBeTruthy();
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
        const apiMock = require('../api/api').default;
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
                data: { id: 3, name: 'New Folder' }
            }));

        const { getByTestId, getByPlaceholderText, queryByText } = render(
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
            expect(apiMock).toHaveBeenCalledWith('/folder/', 'POST', {
                name: 'New Folder',
                spaceId: 1,
                parentId: 1
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

    it('should navigate to SnapshotGeneralInfo when add snapshot is pressed', async () => {
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
});