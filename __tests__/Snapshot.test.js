import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Snapshot from '../pages/Snapshot';

const apiMock = require('../api/api').default;

jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({ success: true, data: [] }))
}));

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
        setParams: jest.fn(),
    }),
    useRoute: () => ({
        params: {
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: 1,
            folderName: 'Test Folder',
            snapshotId: 1,
            snapshotName: 'Test Snapshot'
        }
    }),
}));

describe('Snapshot', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with all sections and fields', async () => {
        // Mock response data with proper structure for all API calls
        const spaceResponse = {
            success: true,
            data: {
                id: 1,
                type: 2
            }
        };

        const snapshotResponse = {
            success: true,
            data: {
                id: 1,
                name: 'Test Snapshot',
                episode: '1',
                scene: '1',
                storyDay: '1',
                character: 1,
                notes: 'Test notes',
                skin: 'Test skin',
                brows: 'Test brows',
                eyes: 'Test eyes',
                lips: 'Test lips',
                effects: 'Test effects',
                makeupNotes: 'Test makeup notes',
                prep: 'Test prep',
                method: 'Test method',
                stylingTools: 'Test styling tools',
                products: 'Test products',
                hairNotes: 'Test hair notes'
            }
        };

        const characterResponse = {
            success: true,
            data: {
                id: 1,
                name: 'Test Character'
            }
        };

        const attachmentsResponse = {
            success: true,
            data: [{
                id: 1,
                name: 'test.jpg',
                url: 'http://test.com/test.jpg'
            }]
        };

        // Create a mock implementation that returns different responses based on the URL
        apiMock.mockImplementation((url) => {
            switch (url) {
                case '/space/1':
                    return Promise.resolve(spaceResponse);
                case '/snapshot/1':
                    return Promise.resolve(snapshotResponse);
                case '/character/1':
                    return Promise.resolve(characterResponse);
                case '/attachment/snapshot/1':
                    return Promise.resolve(attachmentsResponse);
                default:
                    return Promise.reject(new Error('Invalid URL'));
            }
        });

        const { getByText, getByTestId, getAllByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        // Wait for all content to load
        await waitFor(() => {
            expect(getByText('General')).toBeTruthy();
            expect(getByText('Test Character')).toBeTruthy();
        }, { timeout: 3000 });

        // Now check all the fields
        const generalFields = getAllByTestId(/^edit-general-button-field-/);

        // Verify fields content
        expect(generalFields[0]).toHaveTextContent('Episode Number:1');
        expect(generalFields[1]).toHaveTextContent('Scene Number:1');
        expect(generalFields[2]).toHaveTextContent('Story Day:1');
        expect(generalFields[3]).toHaveTextContent('Character:Test Character');

        // Verify Makeup section
        const makeupFields = getAllByTestId(/^edit-makeup-button-field-/);
        expect(makeupFields[0]).toHaveTextContent('Skin:Test skin');

        // Verify Hair section
        const hairFields = getAllByTestId(/^edit-hair-button-field-/);
        expect(hairFields[0]).toHaveTextContent('Prep:Test prep');

        // Verify buttons
        expect(getByTestId('edit-edit-general-button-button')).toBeTruthy();
        expect(getByTestId('edit-edit-makeup-button-button')).toBeTruthy();
        expect(getByTestId('edit-edit-hair-button-button')).toBeTruthy();

        // Verify all API calls were made
        expect(apiMock).toHaveBeenCalledWith('/space/1', 'GET');
        expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'GET');
        expect(apiMock).toHaveBeenCalledWith('/character/1', 'GET');
        expect(apiMock).toHaveBeenCalledWith('/attachment/snapshot/1', 'GET');
    });

    it('should navigate to correct screens when edit buttons are pressed', () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('@react-navigation/native'), 'useNavigation')
            .mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('edit-edit-general-button-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotGeneralInfo', {
            isNewSnapshot: false,
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: 1,
            folderName: 'Test Folder',
            snapshotId: 1,
            snapshotName: 'Test Snapshot'
        });

        fireEvent.press(getByTestId('edit-edit-makeup-button-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotMakeupInfo', {
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: 1,
            folderName: 'Test Folder',
            snapshotId: 1,
            snapshotName: 'Test Snapshot'
        });

        fireEvent.press(getByTestId('edit-edit-hair-button-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotHairInfo', {
            spaceId: 1,
            spaceName: 'Test Space',
            folderId: 1,
            folderName: 'Test Folder',
            snapshotId: 1,
            snapshotName: 'Test Snapshot'
        });
    });

    it('should handle attachments correctly', async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('@react-navigation/native'), 'useNavigation')
            .mockReturnValue({ navigate: mockNavigate });

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Test Snapshot' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'image1.jpg', url: 'file://image1.jpg' },
                    { id: 2, name: 'image2.jpg', url: 'file://image2.jpg' }
                ]
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        // Wait for attachments to load and show edit button
        await waitFor(() => {
            expect(getByTestId('edit-images-button')).toBeTruthy();
        });

        // Test edit navigation
        fireEvent.press(getByTestId('edit-images-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotImagesManage', {
            spaceId: 1,
            folderId: 1,
            snapshotId: 1
        });

        // Verify API calls
        expect(apiMock).toHaveBeenCalledWith('/attachment/snapshot/1', 'GET');
    });

    it('should show add images button when no attachments exist', async () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('@react-navigation/native'), 'useNavigation')
            .mockReturnValue({ navigate: mockNavigate });

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Test Snapshot' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByTestId('add-images-button')).toBeTruthy();
        });

        fireEvent.press(getByTestId('add-images-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotImagesManage', {
            spaceId: 1,
            folderId: 1,
            snapshotId: 1,
            shouldOpenFileBrowser: true
        });
    });

    it('should delete snapshot and navigate correctly', async () => {
        const mockDate = new Date('2024-12-17T07:19:09.984Z');
        const mockNavigate = jest.fn();

        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
        jest.spyOn(require('@react-navigation/native'), 'useNavigation')
            .mockReturnValue({ navigate: mockNavigate });

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Test Snapshot' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('delete-snapshot-button'));
        fireEvent.press(getByTestId('delete-snapshot-confirm-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', {
                name: 'Test Snapshot',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });

            expect(mockNavigate).toHaveBeenCalledWith('Folder', {
                spaceId: 1,
                spaceName: 'Test Space',
                folderId: 1,
                folderName: 'Test Folder'
            });
        });

        jest.restoreAllMocks();
    });

    it('should handle image modal visibility', async () => {
        // Setup mock with attachment
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Test Snapshot' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{
                    id: 1,
                    name: 'test.jpg',
                    url: 'http://test.com/test.jpg'
                }]
            }));
    
        const { getByTestId, debug } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );
    
        // Wait for image to load and log debug info
        await waitFor(() => {
            // Check the image wrapper
            expect(getByTestId('image-wrapper-0')).toBeTruthy();
            
            // Check the image inside the wrapper
            expect(getByTestId('image-0')).toBeTruthy();
        }, { timeout: 5000 });
    
        // Click image
        fireEvent.press(getByTestId('image-wrapper-0'));
    
        expect(getByTestId('image-modal')).toBeTruthy();
    });

    it('should handle multiple image scenarios', async () => {
        const imageScenarios = [
            { count: 1, testId: 'image-wrapper-0' },
            { count: 2, testId: 'image-wrapper-1' },
            { count: 3, testId: 'image-wrapper-2' },
            { count: 4, testId: 'image-wrapper-3' },
            { count: 5, testId: 'image-wrapper-4' },
            { count: 6, testId: 'image-wrapper-5' }
        ];
    
        for (const scenario of imageScenarios) {
            // Create mock data with specific number of images
            const mockAttachments = Array.from({ length: scenario.count }, (_, index) => ({
                id: index + 1,
                name: `test-image-${index + 1}.jpg`,
                url: `http://test.com/image-${index + 1}.jpg`
            }));
    
            // Reset mocks before each scenario
            jest.clearAllMocks();
    
            // Setup mock API calls
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, name: 'Test Snapshot' }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: mockAttachments
                }));
    
            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <Snapshot />
                </NavigationContainer>
            );
    
            // Wait for images to load
            await waitFor(() => {
                // Check that the expected number of image wrappers are rendered
                const imageWrappers = getAllByTestId(/image-wrapper-/);
                expect(imageWrappers.length).toBe(scenario.count);
            }, { timeout: 3000 });
    
            // Verify edit images button is present
            expect(getByTestId('edit-images-button')).toBeTruthy();
    
            // Try to open image modal
            fireEvent.press(getByTestId(`image-wrapper-${scenario.count - 1}`));
            expect(getByTestId('image-modal')).toBeTruthy();
    
            // Navigate through images if multiple exist
            if (scenario.count > 1) {
                // Test next image button
                fireEvent.press(getByTestId('modalNextButton'));
                
                // Test previous image button
                fireEvent.press(getByTestId('modalPrevButton'));
            }
        }
    });

    it('should handle empty fields gracefully', async () => {
        // Mock with empty data
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    name: 'Test Snapshot',
                    episode: '',
                    scene: '',
                    storyDay: '',
                    character: null,
                    notes: '',
                    skin: '',
                    brows: '',
                    eyes: '',
                    lips: '',
                    effects: '',
                    makeupNotes: '',
                    prep: '',
                    method: '',
                    stylingTools: '',
                    products: '',
                    hairNotes: ''
                }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getAllByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        // Wait for fields to load
        await waitFor(() => {
            const generalFields = getAllByTestId(/^edit-general-button-field-/);
            expect(generalFields[0]).toBeTruthy();
        });

        // Check that empty fields are rendered without crashing
        const generalFields = getAllByTestId(/^edit-general-button-field-/);
        const makeupFields = getAllByTestId(/^edit-makeup-button-field-/);
        const hairFields = getAllByTestId(/^edit-hair-button-field-/);

        expect(generalFields.length).toBeGreaterThan(0);
        expect(makeupFields.length).toBeGreaterThan(0);
        expect(hairFields.length).toBeGreaterThan(0);
    });
});