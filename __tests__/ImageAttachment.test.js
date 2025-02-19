import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import ImageAttachment from '../components/ImageAttachment';
import handleHttpRequest from '../api/api';
import useFileBrowser from '../hooks/useFileBrowser';

// Mock the API request handler
jest.mock('../api/api', () => jest.fn());

// Mock the useFileBrowser hook
const mockBrowseFiles = jest.fn();
const mockClearFiles = jest.fn();

jest.mock('../hooks/useFileBrowser', () => {
    return jest.fn(() => ({
        browseFiles: mockBrowseFiles,
        clearFiles: mockClearFiles
    }));
});

const mockFile = {
    uri: 'file://test-image.jpg',
    name: 'test-image.jpg',
    mimeType: 'image/jpeg'
};

describe('ImageAttachment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBrowseFiles.mockResolvedValue([mockFile]);
        handleHttpRequest.mockResolvedValue({
            success: true,
            data: [{
                id: '123',
                name: 'test-image.jpg',
                source: { uri: 'file://test-image.jpg' }
            }]
        });
    });

    it('should render all necessary UI elements', () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        // Check for the add button
        expect(rendered.getByTestId('add-image-button')).toBeTruthy();
        
        // Check for the "No Images" message container
        expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
    });

    it('should show "No Images" message when no files are present', () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        // Check initial state
        expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        
        // Ensure upload button is not present
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
        
        // Check that the FlatList is empty (no images)
        const noImageElements = rendered.queryAllByTestId('attachment-container');
        expect(noImageElements.length).toBe(0);
    });

    it('should handle successful upload', async () => {
        const rendered = render(<ImageAttachment spaceId="123" folderId="456" />);

        // Add file to selectedFiles
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Verify file is in preview
        expect(rendered.getByText('test-image.jpg')).toBeTruthy();

        // Upload the file
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
            await handleHttpRequest();
        });

        expect(handleHttpRequest).toHaveBeenCalledWith(
            '/attachment/',
            'POST',
            expect.any(FormData),
            {
                'Content-Type': 'multipart/form-data'
            }
        );
    });

    it('should clear files after successful upload', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add file to selectedFiles
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Verify file is in preview
        expect(rendered.getByText('test-image.jpg')).toBeTruthy();

        // Upload the file
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
            await handleHttpRequest();
        });

        // After successful upload:
        // 1. clearFiles should be called
        // 2. file should move from selectedFiles to attachments
        // 3. Upload button should disappear
        expect(mockClearFiles).toHaveBeenCalled();
        expect(rendered.getByText('test-image.jpg')).toBeTruthy();
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
    });

    it('should show preview after selecting files', async () => {
        const rendered = render(<ImageAttachment />);

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        expect(rendered.getByText('test-image.jpg')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();
    });
});