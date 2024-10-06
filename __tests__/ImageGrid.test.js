import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ImageGrid from '../components/ImageGrid';

describe('ImageGrid', () => {
    const mockOnImagePress = jest.fn();

    const createTestImages = (count) =>
        Array.from({ length: count }, (_, i) => ({ id: `${i}`, source: { uri: `test-image-${i}.jpg` } }));

    it('should render correctly with no images', () => {
        const { getByText, getByTestId } = render(<ImageGrid images={[]} onImagePress={mockOnImagePress} />);

        expect(getByTestId('no-photo-wrapper')).toBeTruthy();
        expect(getByText('No Images. Tap + to add.')).toBeTruthy();
    });

    it('should render correctly with one image', () => {
        const images = createTestImages(1);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
    });

    it('should render correctly with two images', () => {
        const images = createTestImages(2);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
        expect(getByTestId('image-wrapper-1')).toBeTruthy();
    });

    it('should render correctly with three images', () => {
        const images = createTestImages(3);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
        expect(getByTestId('image-wrapper-1')).toBeTruthy();
        expect(getByTestId('image-wrapper-2')).toBeTruthy();
    });

    it('should render correctly with four images', () => {
        const images = createTestImages(4);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
        expect(getByTestId('image-wrapper-1')).toBeTruthy();
        expect(getByTestId('image-wrapper-2')).toBeTruthy();
        expect(getByTestId('image-wrapper-3')).toBeTruthy();
    });

    it('should render correctly with five images', () => {
        const images = createTestImages(5);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
        expect(getByTestId('image-wrapper-1')).toBeTruthy();
        expect(getByTestId('image-wrapper-2')).toBeTruthy();
        expect(getByTestId('image-wrapper-3')).toBeTruthy();
        expect(getByTestId('image-wrapper-4')).toBeTruthy();
    });

    it('should render correctly with six images', () => {
        const images = createTestImages(6);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        expect(getByTestId('image-wrapper-0')).toBeTruthy();
        expect(getByTestId('image-wrapper-1')).toBeTruthy();
        expect(getByTestId('image-wrapper-2')).toBeTruthy();
        expect(getByTestId('image-wrapper-3')).toBeTruthy();
        expect(getByTestId('image-wrapper-4')).toBeTruthy();
        expect(getByTestId('image-wrapper-5')).toBeTruthy();
    });

    it('should call onImagePress with correct index when an image is pressed', () => {
        const images = createTestImages(3);
        const { getByTestId } = render(<ImageGrid images={images} onImagePress={mockOnImagePress} />);

        fireEvent.press(getByTestId('image-wrapper-1'));

        expect(mockOnImagePress).toHaveBeenCalledWith(1);
    });
});