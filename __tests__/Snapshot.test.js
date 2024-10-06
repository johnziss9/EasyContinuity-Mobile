import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Alert } from 'react-native';
import Snapshot from '../pages/Snapshot';
import useFileBrowser from '../hooks/useFileBrowser';

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
        navigate: jest.fn(),
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

    it('should render the component with all sections and fields', () => {
        const { getByText, getByTestId, getAllByTestId } = render(
            <NavigationContainer>
                <Snapshot />
            </NavigationContainer>
        );

        // Check for section headers
        expect(getByText('Images')).toBeTruthy();
        expect(getByText('General')).toBeTruthy();
        expect(getByText('Makeup')).toBeTruthy();
        expect(getByText('Hair')).toBeTruthy();

        // Check for section containers
        expect(getByTestId('section-general')).toBeTruthy();
        expect(getByTestId('section-makeup')).toBeTruthy();
        expect(getByTestId('section-hair')).toBeTruthy();

        // Check for fields in each section
        const expectedGeneralFieldsCount = 7;
        const expectedMakeupFieldsCount = 6;
        const expectedHairFieldsCount = 5;

        expect(getAllByTestId(/^general-field-/)).toHaveLength(expectedGeneralFieldsCount);
        expect(getAllByTestId(/^makeup-field-/)).toHaveLength(expectedMakeupFieldsCount);
        expect(getAllByTestId(/^hair-field-/)).toHaveLength(expectedHairFieldsCount);

        // Check for edit buttons
        expect(getByTestId('edit-general-button')).toBeTruthy();
        expect(getByTestId('edit-makeup-button')).toBeTruthy();
        expect(getByTestId('edit-hair-button')).toBeTruthy();
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

        fireEvent.press(getByTestId('edit-general-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotGeneralInfo', { isNewSnapshot: false });

        fireEvent.press(getByTestId('edit-makeup-button'));
        expect(mockNavigate).toHaveBeenCalledWith('SnapshotMakeupInfo', { isNewSnapshot: false });

        fireEvent.press(getByTestId('edit-hair-button'));
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
});