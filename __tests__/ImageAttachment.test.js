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
        // Default mock for handleHttpRequest
        handleHttpRequest.mockResolvedValue({
            success: true,
            data: []
        });
    });

    it('should render all necessary UI elements', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        }, { timeout: 2000 });
        
        expect(rendered.getByTestId('add-image-button')).toBeTruthy();
    });

    it('should show "No Images" message when no files are present', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        // Wait for loading to complete
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
        
        // Ensure upload button is not present
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
        
        // Check that the FlatList is empty (no images)
        const noImageElements = rendered.queryAllByTestId('attachment-container');
        expect(noImageElements.length).toBe(0);
    });

    it('should handle successful upload', async () => {
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [] }) // Initial fetch
            .mockResolvedValueOnce({ // Upload response
                success: true,
                data: [{
                    id: '123',
                    name: 'test-image.jpg',
                    url: 'file://test-image.jpg'
                }]
            })
            .mockResolvedValueOnce({ // Fetch after upload
                success: true,
                data: [{
                    id: '123',
                    name: 'test-image.jpg',
                    url: 'file://test-image.jpg'
                }]
            });
    
        const rendered = render(<ImageAttachment spaceId="123" folderId="456" />);
    
        // Wait for initial load
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
    
        // Add file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        // Upload the file
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });
    
        // Check that the POST request was made with correct parameters
        const uploadCall = handleHttpRequest.mock.calls[1]; // Second call should be the upload
        expect(uploadCall).toEqual([
            '/attachment/',
            'POST',
            expect.any(FormData),
            {
                'Content-Type': 'multipart/form-data'
            }
        ]);
    });

    it('should clear files after successful upload', async () => {
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [] }) // Initial fetch
            .mockResolvedValueOnce({ // Upload response
                success: true,
                data: [{
                    id: '123',
                    name: 'test-image.jpg',
                    url: 'file://test-image.jpg'
                }]
            });

        const rendered = render(<ImageAttachment spaceId="123" />);

        // Wait for initial load
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });

        // Add file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Upload the file
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });

        expect(mockClearFiles).toHaveBeenCalled();
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
    });

    it('should show preview after selecting files', async () => {
        handleHttpRequest.mockResolvedValue({ success: true, data: [] });

        const rendered = render(<ImageAttachment />);

        // Wait for initial load
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        expect(rendered.getByText('test-image.jpg')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();
    });

    it('should show loading state when fetching attachments', async () => {
        // Mock with delayed response that matches expected structure
        handleHttpRequest.mockImplementationOnce(() => 
            new Promise(resolve => 
                setTimeout(() => 
                    resolve({ 
                        success: true, 
                        data: [] 
                    }), 
                    100
                )
            )
        );
        
        const rendered = render(<ImageAttachment spaceId="123" snapshotId="456" />);
        expect(rendered.getByText('Loading...')).toBeTruthy();
    
        // Verify loading state goes away
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
    });

    it('should clean file names when uploading', async () => {
        const fileWithSpecialChars = {
            uri: 'file://test-image (1).jpg',
            name: 'test-image (1).jpg',
            mimeType: 'image/jpeg'
        };
        
        mockBrowseFiles.mockResolvedValueOnce([fileWithSpecialChars]);
        
        // Create a spy for FormData.append
        const appendSpy = jest.spyOn(FormData.prototype, 'append');
        
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [] }) // Initial fetch
            .mockResolvedValueOnce({ // Upload response
                success: true, 
                data: [{
                    id: '123',
                    name: 'test_image_1_.jpg',
                    url: 'file://test-image.jpg'
                }]
            })
            .mockResolvedValueOnce({ success: true, data: [] }); // Final fetch
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
    
        // Add file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        // Upload
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });
    
        // Check that the file name was cleaned
        const filesAppendCall = appendSpy.mock.calls.find(call => call[0] === 'files');
        expect(filesAppendCall[1].name).toBe('test_image_1_.jpg');
    
        // Clean up
        appendSpy.mockRestore();
    });

    it('should disable upload button while uploading', async () => {
        // Create a promise we can control
        let resolveUpload;
        const uploadPromise = new Promise(resolve => {
            resolveUpload = resolve;
        });
    
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [] })
            .mockImplementationOnce(() => uploadPromise);
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
    
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        act(() => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });
    
        await waitFor(() => {
            expect(rendered.getByText('Uploading...')).toBeTruthy();
        });
    
        resolveUpload({ success: true, data: [] });
    });

    it('should clear preview images when cancel is pressed', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Verify preview exists
        expect(rendered.getByText('test-image.jpg')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();

        // Press cancel
        fireEvent.press(rendered.getByText('Cancel'));

        // Verify preview is cleared
        expect(rendered.queryByText('test-image.jpg')).toBeNull();
        expect(rendered.queryByText('Cancel')).toBeNull();
        expect(mockClearFiles).toHaveBeenCalled();
    });

    it('should show overlay on uploaded images only when previews exist', async () => {
        handleHttpRequest.mockResolvedValue({
            success: true,
            data: [{
                id: '123',
                name: 'uploaded-image.jpg',
                url: 'file://uploaded-image.jpg'
            }]
        });

        const rendered = render(<ImageAttachment spaceId="123" />);

        // Wait for uploaded image to load
        await waitFor(() => {
            expect(rendered.getByText('uploaded-image.jpg')).toBeTruthy();
        });

        // Initially there should be no element with the uploadedOverlay style
        expect(rendered.queryByTestId('uploaded-overlay')).toBeNull();

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Now we should have an overlay element on the uploaded image
        expect(rendered.getByTestId('uploaded-overlay')).toBeTruthy();

        // Preview image should not have overlay
        const previewCardOverlay = rendered.queryAllByTestId('uploaded-overlay');
        expect(previewCardOverlay.length).toBe(1); // Only one overlay for the uploaded image

        fireEvent.press(rendered.getByText('Cancel'));

        // Verify overlay is removed
        expect(rendered.queryByTestId('uploaded-overlay')).toBeNull();
    });
});

// Add these tests to the existing ImageAttachment.test.js file

describe('Image View Modal', () => {
    const mockAttachment = {
        id: '123',
        name: 'test-image.jpg',
        source: { uri: 'file://test-image.jpg' },
        url: 'file://test-image.jpg',
        isEdit: false,
        editName: '',
        isPreview: false,
        mimeType: 'image/jpeg'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        handleHttpRequest.mockResolvedValue({
            success: true,
            data: [mockAttachment]
        });
    });

    it('should open modal when view button is pressed', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);

        // Wait for the attachment to load
        await waitFor(() => {
            expect(rendered.getByTestId('view-image-button')).toBeTruthy();
        });

        fireEvent.press(rendered.getByTestId('view-image-button'));

        const modal = rendered.getByTestId('image-modal');
        expect(modal.props.visible).toBe(true);

        const modalImage = rendered.getByTestId('modal-image');
        expect(modalImage.props.source).toEqual({ uri: 'file://test-image.jpg' });
    });

    it('should close modal when close button is pressed', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        // Wait for the attachment to load
        await waitFor(() => {
            expect(rendered.getByTestId('view-image-button')).toBeTruthy();
        });
        
        fireEvent.press(rendered.getByTestId('view-image-button'));
        
        const modalImage = rendered.getByTestId('modal-image');
        expect(modalImage).toBeTruthy();
        expect(modalImage.props.source).toEqual({ uri: 'file://test-image.jpg' });
        
        fireEvent.press(rendered.getByTestId('modal-close-button'));
        
        await waitFor(() => {
            expect(rendered.queryByTestId('modal-image')).toBeNull();
        });
    });

    it('should close modal when clicking outside (Android back button)', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
        
        // Wait for the attachment to load
        await waitFor(() => {
            expect(rendered.getByTestId('view-image-button')).toBeTruthy();
        });
        
        fireEvent.press(rendered.getByTestId('view-image-button'));
        
        const modalImage = rendered.getByTestId('modal-image');
        expect(modalImage).toBeTruthy();
        
        // Simulate Android back button
        act(() => {
            rendered.getByTestId('image-modal').props.onRequestClose();
        });
        
        await waitFor(() => {
            expect(rendered.queryByTestId('modal-image')).toBeNull();
        });
    });
});