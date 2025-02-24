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

// Mocks for navigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({
        navigate: jest.fn(),
    }),
    useRoute: () => ({
        params: {
            spaceId: '123',
            folderId: '456',
            snapshotId: '789',
        }
    }),
}));

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

        expect(rendered.getByText('test-image')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();

        // Verify that the full name with extension is NOT visible
        expect(rendered.queryByText('test-image.jpg')).toBeNull();
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
            uri: 'file://test-image_(1).jpg',
            name: 'test-image_(1).jpg',
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
                    name: 'test-image_(1).jpg', // Match the expected format
                    url: 'file://test-image.jpg'
                }]
            })
            .mockResolvedValueOnce({ success: true, data: [] }); // Final fetch

        const rendered = render(<ImageAttachment spaceId="123" />);

        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });

        // Check that the file name was cleaned
        const filesAppendCall = appendSpy.mock.calls.find(call => call[0] === 'files');
        expect(filesAppendCall[1].name).toBe('test-image_(1).jpg');

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

        // Verify preview exists (without extension)
        expect(rendered.getByText('test-image')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();

        // Press cancel
        fireEvent.press(rendered.getByText('Cancel'));

        // Verify preview is cleared
        expect(rendered.queryByText('test-image')).toBeNull();
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

        // Wait for uploaded image to load (without extension)
        await waitFor(() => {
            expect(rendered.getByText('uploaded-image')).toBeTruthy();
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

    it('should open edit modal with correct initial value', async () => {
        const mockAttachment = {
            id: '123',
            name: 'test-image.jpg',
            source: { uri: 'file://test-image.jpg' },
            url: 'file://test-image.jpg',
            mimeType: 'image/jpeg'
        };

        handleHttpRequest.mockResolvedValue({
            success: true,
            data: [mockAttachment]
        });

        const rendered = render(<ImageAttachment spaceId="123" />);

        await waitFor(() => {
            expect(rendered.getByTestId('edit-image-button')).toBeTruthy();
        });

        fireEvent.press(rendered.getByTestId('edit-image-button'));

        const modal = rendered.getByTestId('edit-image-modal');
        expect(modal.props.visible).toBe(true);

        const input = rendered.getByTestId('image-name-text-input');
        expect(input.props.value).toBe('test-image');
    });

    it('should handle successful image name update', async () => {
        const mockAttachment = {
            id: '123',
            name: 'test-image.jpg',
            source: { uri: 'file://test-image.jpg' },
            url: 'file://test-image.jpg',
            mimeType: 'image/jpeg'
        };

        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [mockAttachment] }) // Initial fetch
            .mockResolvedValueOnce({ success: true }); // Update response

        const rendered = render(<ImageAttachment spaceId="123" />);

        await waitFor(() => {
            expect(rendered.getByTestId('edit-image-button')).toBeTruthy();
        });

        fireEvent.press(rendered.getByTestId('edit-image-button'));

        const input = rendered.getByTestId('image-name-text-input');
        fireEvent.changeText(input, 'new-name');

        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        await waitFor(() => {
            expect(rendered.getByText('Image Name Updated Successfully')).toBeTruthy();
        });
    });

    it('should close edit modal when cancel is pressed', async () => {
        const mockAttachment = {
            id: '123',
            name: 'test-image.jpg',
            source: { uri: 'file://test-image.jpg' },
            url: 'file://test-image.jpg',
            mimeType: 'image/jpeg'
        };

        handleHttpRequest.mockResolvedValue({
            success: true,
            data: [mockAttachment]
        });

        const rendered = render(<ImageAttachment spaceId="123" />);

        await waitFor(() => {
            expect(rendered.getByTestId('edit-image-button')).toBeTruthy();
        });

        fireEvent.press(rendered.getByTestId('edit-image-button'));

        const modal = rendered.getByTestId('edit-image-modal');
        expect(modal.props.visible).toBe(true);

        fireEvent.press(rendered.getByTestId('edit-image-name-cancel-button'));

        await waitFor(() => {
            expect(rendered.queryByTestId('edit-image-modal')).toBeNull();
        });
    });

    it('should handle fetch attachments error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        handleHttpRequest.mockRejectedValueOnce(new Error('Network error'));

        const rendered = render(<ImageAttachment spaceId="123" snapshotId="456" />);

        await waitFor(() => {
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
    });

    it('should handle upload error', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [] })
            .mockRejectedValueOnce(new Error('Upload failed'));

        const rendered = render(<ImageAttachment spaceId="123" />);

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(rendered.queryByText('Uploading...')).toBeNull();
        consoleErrorSpy.mockRestore();
    });

    it('should handle empty file browser result', async () => {
        mockBrowseFiles.mockResolvedValueOnce([]);

        const rendered = render(<ImageAttachment spaceId="123" />);

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
        });

        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
    });

    it('should handle invalid file browser result', async () => {
        mockBrowseFiles.mockResolvedValueOnce(null);

        const rendered = render(<ImageAttachment spaceId="123" />);

        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
        });

        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
    });

    it('should allow editing preview image name before upload', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add preview file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Verify preview exists
        expect(rendered.getByText('test-image')).toBeTruthy();

        fireEvent.press(rendered.getByTestId('edit-image-button'));

        // Check initial value in edit modal
        const input = rendered.getByTestId('image-name-text-input');
        expect(input.props.value).toBe('test-image');

        fireEvent.changeText(input, 'new-preview-name');

        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        expect(rendered.getByText('new-preview-name')).toBeTruthy();

        // Verify the HTTP request was NOT made
        expect(handleHttpRequest).not.toHaveBeenCalledWith(
            expect.stringContaining('/attachment/'),
            'PUT',
            expect.any(Object)
        );
    });

    it('should maintain file extension when editing preview image name', async () => {
        // Setup FormData spy before any actions
        const formDataAppend = jest.spyOn(FormData.prototype, 'append');

        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add preview file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        fireEvent.press(rendered.getByTestId('edit-image-button'));

        const input = rendered.getByTestId('image-name-text-input');
        fireEvent.changeText(input, 'new-name');

        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        // Wait for name update
        await waitFor(() => {
            expect(rendered.getByText('new-name')).toBeTruthy();
        });

        // Upload the file
        await act(async () => {
            fireEvent.press(rendered.getByText('Upload Selected Files'));
        });

        // Check the FormData
        expect(formDataAppend).toHaveBeenCalledWith(
            'files',
            expect.objectContaining({
                name: expect.stringContaining('new-name')
            })
        );

        // Clean up
        formDataAppend.mockRestore();
    });

    it('should handle multiple preview image name edits', async () => {
        // Mock multiple files
        mockBrowseFiles.mockResolvedValueOnce([
            { ...mockFile, name: 'preview1.jpg' },
            { ...mockFile, name: 'preview2.jpg' }
        ]);

        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add preview files
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Edit first preview
        const editButtons = rendered.getAllByTestId('edit-image-button');
        fireEvent.press(editButtons[0]);

        let input = rendered.getByTestId('image-name-text-input');
        fireEvent.changeText(input, 'renamed-preview1');
        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        // Edit second preview
        fireEvent.press(editButtons[1]);
        input = rendered.getByTestId('image-name-text-input');
        fireEvent.changeText(input, 'renamed-preview2');
        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        // Verify both names were updated
        expect(rendered.getByText('renamed-preview1')).toBeTruthy();
        expect(rendered.getByText('renamed-preview2')).toBeTruthy();
    });

    it('should not show confirmation modal when editing preview image names', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);

        // Add preview file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });

        // Edit preview
        fireEvent.press(rendered.getByTestId('edit-image-button'));
        const input = rendered.getByTestId('image-name-text-input');
        fireEvent.changeText(input, 'new-name');
        fireEvent.press(rendered.getByTestId('edit-image-name-submit-button'));

        // Verify no confirmation modal is shown
        expect(rendered.queryByText('Image Name Updated Successfully')).toBeNull();
    });

    it('should remove a preview image when delete button is pressed', async () => {
        // Mock multiple files
        mockBrowseFiles.mockResolvedValueOnce([
            { ...mockFile, name: 'preview1.jpg' },
            { ...mockFile, name: 'preview2.jpg' }
        ]);
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        // Add preview files
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        expect(rendered.getByText('preview1')).toBeTruthy();
        expect(rendered.getByText('preview2')).toBeTruthy();
    
        const deleteButtons = rendered.getAllByTestId('delete-image-button');
        fireEvent.press(deleteButtons[0]);
    
        expect(rendered.queryByText('preview1')).toBeNull();
        expect(rendered.getByText('preview2')).toBeTruthy();
    });
    
    it('should clear preview state when last preview image is deleted', async () => {
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        // Add preview file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        expect(rendered.getByText('test-image')).toBeTruthy();
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();
    
        fireEvent.press(rendered.getByTestId('delete-image-button'));
    
        expect(rendered.queryByText('test-image')).toBeNull();
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
        expect(mockClearFiles).toHaveBeenCalled();
    });
    
    it('should remove overlay from uploaded images when all previews are deleted', async () => {
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
            expect(rendered.getByText('uploaded-image')).toBeTruthy();
        });
    
        // Add preview file
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        expect(rendered.getByTestId('uploaded-overlay')).toBeTruthy();
    
        const deleteButtons = rendered.getAllByTestId('delete-image-button');
        fireEvent.press(deleteButtons[0]);
    
        expect(rendered.queryByTestId('uploaded-overlay')).toBeNull();
    });
    
    it('should maintain upload button state when some previews remain after deletion', async () => {
        // Mock multiple files
        mockBrowseFiles.mockResolvedValueOnce([
            { ...mockFile, name: 'preview1.jpg' },
            { ...mockFile, name: 'preview2.jpg' }
        ]);
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        // Add preview files
        await act(async () => {
            fireEvent.press(rendered.getByTestId('add-image-button'));
            await mockBrowseFiles();
        });
    
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();
    
        const deleteButtons = rendered.getAllByTestId('delete-image-button');
        fireEvent.press(deleteButtons[0]);
    
        expect(rendered.getByText('Upload Selected Files')).toBeTruthy();
    
        fireEvent.press(deleteButtons[1]);
    
        expect(rendered.queryByText('Upload Selected Files')).toBeNull();
    });

    it('should handle delete for uploaded image with confirmation', async () => {
        const mockAttachment = {
            id: '123',
            name: 'test-image.jpg',
            source: { uri: 'file://test-image.jpg' },
            url: 'file://test-image.jpg',
            isPreview: false,
            mimeType: 'image/jpeg'
        };
    
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [mockAttachment] })  // Initial fetch
            .mockResolvedValueOnce({ success: true })  // Delete request
            .mockResolvedValueOnce({ success: true, data: [] });  // Fetch after delete
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        // Wait for the image to load
        await waitFor(() => {
            expect(rendered.getByText('test-image')).toBeTruthy();
        });
    
        await act(async () => {
            fireEvent.press(rendered.getByTestId('delete-image-button'));
        });
    
        // Verify API call was made with correct parameters
        expect(handleHttpRequest).toHaveBeenCalledWith(
            '/attachment/123',
            'PUT',
            {
                isDeleted: true,
                deletedOn: expect.any(String)
            }
        );
    
        await waitFor(() => {
            expect(rendered.getByText('Image Deleted Successfully')).toBeTruthy();
        });
    
        await act(async () => {
            fireEvent.press(rendered.getByTestId('deleted-image-name-confirm-button'));
        });
    
        await waitFor(() => {
            expect(rendered.queryByText('test-image')).toBeNull();
            expect(rendered.getByText('No Images. Tap + to add.')).toBeTruthy();
        });
    });
    
    it('should handle API error when deleting uploaded image', async () => {
        const mockAttachment = {
            id: '123',
            name: 'test-image.jpg',
            source: { uri: 'file://test-image.jpg' },
            url: 'file://test-image.jpg',
            isPreview: false,
            mimeType: 'image/jpeg'
        };
    
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
        handleHttpRequest
            .mockResolvedValueOnce({ success: true, data: [mockAttachment] })  // Initial fetch
            .mockRejectedValueOnce(new Error('Delete failed'));  // Delete request fails
    
        const rendered = render(<ImageAttachment spaceId="123" />);
    
        await waitFor(() => {
            expect(rendered.getByText('test-image')).toBeTruthy();
        });
    
        await act(async () => {
            fireEvent.press(rendered.getByTestId('delete-image-button'));
        });
    
        // Verify error was logged
        expect(consoleErrorSpy).toHaveBeenCalled();
    
        expect(rendered.queryByText('Image Deleted Successfully')).toBeNull();
    
        expect(rendered.getByText('test-image')).toBeTruthy();
    
        consoleErrorSpy.mockRestore();
    });
});

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