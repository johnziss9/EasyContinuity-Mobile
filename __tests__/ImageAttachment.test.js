import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ImageAttachment from '../components/ImageAttachment';

describe('ImageAttachment', () => {

    it('should render the component with initial attachments', () => {
        const { getAllByText } = render(<ImageAttachment />);

        expect(getAllByText(/Image \d/)).toHaveLength(4);
    });

    it('should allow editing the image name', async () => {
        const { getByText, getByTestId, getByPlaceholderText, getAllByTestId } = render(<ImageAttachment />);

        expect(getByText('Image 1')).toBeTruthy();

        fireEvent.press(getAllByTestId('edit-image-button')[0]);

        expect(getByPlaceholderText('Image Name')).toBeTruthy();

        fireEvent.changeText(getByPlaceholderText('Image Name'), 'Image 01');
        fireEvent.press(getByTestId('save-image-button'));

        await waitFor(() => {
            expect(getByText('Image 01')).toBeTruthy();
        });
    });

    it('should allow deleting an image', async () => {
        const { getByText, getAllByTestId, queryByText } = render(<ImageAttachment />);

        expect(getByText('Image 1')).toBeTruthy();

        fireEvent.press(getAllByTestId('delete-image-button')[0]);

        await waitFor(() => {
            expect(queryByText('Image 1')).toBeNull();
        });
    });

    it('should add new image', async () => {
        const { getByTestId, getByText, getAllByText } = render(<ImageAttachment />);

        fireEvent.press(getByTestId('add-image-button'));

        await waitFor(() => {
            expect(getByText('Image 5')).toBeTruthy();
            expect(getAllByText(/Image \d/)).toHaveLength(5);
        });
    });

    it('should show "No Images" message when all images are deleted', async () => {
        const { getAllByTestId, getByText, queryByText } = render(<ImageAttachment />);
        
        // Delete all images
        for (let i = 0; i < 4; i++) {
            fireEvent.press(getAllByTestId('delete-image-button')[0]);
        }

        await waitFor(() => {
            expect(getByText('No Images. Tap + to add.')).toBeTruthy();
            expect(queryByText(/Image \d/)).toBeNull();
        });
    });
});