import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import Snapshot from '../pages/Snapshot';
import useFileBrowser from '../hooks/useFileBrowser';

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

jest.mock('../hooks/useFileBrowser', () => jest.fn());

jest.mock('react-native/Libraries/Alert/Alert', () => ({
    alert: jest.fn(),
}));

describe('Snapshot', () => {
    beforeEach(() => {
        useFileBrowser.mockReturnValue({
            filesInfo: [],
            browseFiles: jest.fn().mockResolvedValue([]),
            clearFiles: jest.fn(),
        });
        jest.clearAllMocks();
    });

    it('should render the component with all sections and fields', async () => {
        apiMock.mockImplementationOnce(() => Promise.resolve({
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
        }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    name: 'Test Character'
                }
            }));
    
        const { getByText, getByTestId, getAllByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            // Check for section headers
            expect(getByText('Images')).toBeTruthy();
            expect(getByText('General')).toBeTruthy();
            expect(getByText('Makeup')).toBeTruthy();
            expect(getByText('Hair')).toBeTruthy();
    
            // Check for content in General section with their labels
            const generalFields = getAllByTestId(/^edit-general-button-field-/);
            expect(generalFields[0]).toHaveTextContent('Episode Number:');
            expect(generalFields[0]).toHaveTextContent('1');
            expect(generalFields[1]).toHaveTextContent('Scene Number:');
            expect(generalFields[1]).toHaveTextContent('1');
            expect(generalFields[2]).toHaveTextContent('Story Day:');
            expect(generalFields[2]).toHaveTextContent('1');
            expect(generalFields[3]).toHaveTextContent('Character:');
            expect(generalFields[3]).toHaveTextContent('Test Character');
    
            // Check for content in Makeup section
            const makeupFields = getAllByTestId(/^edit-makeup-button-field-/);
            expect(makeupFields[0]).toHaveTextContent('Skin:');
            expect(makeupFields[0]).toHaveTextContent('Test skin');
    
            // Check for content in Hair section
            const hairFields = getAllByTestId(/^edit-hair-button-field-/);
            expect(hairFields[0]).toHaveTextContent('Prep:');
            expect(hairFields[0]).toHaveTextContent('Test prep');
    
            // Check for edit buttons
            expect(getByTestId('edit-edit-general-button-button')).toBeTruthy();
            expect(getByTestId('edit-edit-makeup-button-button')).toBeTruthy();
            expect(getByTestId('edit-edit-hair-button-button')).toBeTruthy();
        });
    });

    it('should display the correct number of dummy images', () => {
        const { getAllByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        const imageWrappers = getAllByTestId(/^image-wrapper-/);
        expect(imageWrappers).toHaveLength(4);
    });

    it('should open the image modal when an image is pressed', () => {
        const { getAllByTestId, getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        fireEvent.press(getAllByTestId(/^image-wrapper-/)[0]);
        expect(getByTestId('image-modal')).toBeTruthy();
    });

    it('should navigate to SnapshotImagesManage when edit images is pressed', () => {
        const mockNavigate = jest.fn();

        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('edit-images-button'));

        expect(mockNavigate).toHaveBeenCalledWith('SnapshotImagesManage', { isNewSnapshot: false });
    });

    it('should navigate to correct screens when edit buttons are pressed', () => {
        const mockNavigate = jest.fn();
        jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({ navigate: mockNavigate });

        const { getByTestId, getAllByTestId } = render(
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
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotMakeupInfo', { isNewSnapshot: false });

        fireEvent.press(getByTestId('edit-edit-hair-button-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotHairInfo', { isNewSnapshot: false });
    });

    it('should call browseFiles when add images button is pressed', async () => {
        const mockBrowseFiles = jest.fn().mockResolvedValue([]);

        useFileBrowser.mockReturnValue({
            filesInfo: [],
            browseFiles: mockBrowseFiles,
            clearFiles: jest.fn(),
        });

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot testImages={[]} />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-images-button'));
        await waitFor(() => {
            expect(mockBrowseFiles).toHaveBeenCalled();
        });
    });

    it('should display an alert when maximum images are reached', async () => {
        const mockBrowseFiles = jest.fn().mockResolvedValue([{}, {}, {}, {}, {}, {}, {}]); // 7 images
        useFileBrowser.mockReturnValue({
            filesInfo: [{}, {}, {}, {}, {}], // 5 existing images
            browseFiles: mockBrowseFiles,
            clearFiles: jest.fn(),
        });

        const { getByTestId } = render(
            <NavigationContainer>
                <Snapshot testImages={[]} />
            </NavigationContainer>
        );

        fireEvent.press(getByTestId('add-images-button'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Maximum Images Reached",
                "Only 6 image(s) were added to reach the maximum of 6 images.",
                [{ text: "OK" }]
            );
        });
    });

    it('should fetch and display snapshot data on mount', async () => {
        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    name: 'Test Snapshot',
                    episode: '101',
                    scene: '5',
                    storyDay: '12',
                    character: 2,
                    notes: 'Snapshot test notes'
                }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 2,
                    name: 'John Smith'
                }
            }));
    
        const { getByText } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );
    
        await waitFor(() => {
            expect(getByText('101')).toBeTruthy(); // Episode number
            expect(getByText('5')).toBeTruthy(); // Scene number
            expect(getByText('12')).toBeTruthy(); // Story day
            expect(getByText('John Smith')).toBeTruthy(); // Character name
            expect(getByText('Snapshot test notes')).toBeTruthy(); // Notes
    
            expect(apiMock).toHaveBeenNthCalledWith(1, '/snapshot/1', 'GET');
            expect(apiMock).toHaveBeenNthCalledWith(2, '/character/2', 'GET');
        });
    });
});