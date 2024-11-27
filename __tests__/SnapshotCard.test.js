import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SnapshotCard from '../components/SnapshotCard';

// Mock useWindowDimensions
const mockUseWindowDimensions = jest.fn();
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: () => mockUseWindowDimensions(),
}));

describe('SnapshotCard', () => {
    const mockOnPress = jest.fn();
    const mockOnDeletePress = jest.fn();
    const defaultProps = {
        snapshotName: 'Test Snapshot',
        images: [{ uri: 'image1.jpg' }, { uri: 'image2.jpg' }, { uri: 'image3.jpg' }],
        onPress: mockOnPress,
        onDeletePress: mockOnDeletePress,
    };

    describe('Wide screen (width >= 400)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 500, height: 800 });
        });

        it('should render correctly with default props', () => {
            const { getByText, queryByTestId } = render(<SnapshotCard {...defaultProps} />);
            expect(getByText('Test Snapshot')).toBeTruthy();
            expect(queryByTestId('snapshot-component')).toBeTruthy();
            expect(queryByTestId('main-image-contaner')).toBeTruthy();
            expect(queryByTestId('right-side-content-contaner')).toBeTruthy();
            expect(queryByTestId('compact-main-image-container')).toBeNull();
            expect(queryByTestId('compact-additional-images-icontaner')).toBeNull();
            expect(queryByTestId('compact-text')).toBeNull();
        });

        it('should display the correct number of images', () => {
            const { getAllByTestId } = render(<SnapshotCard {...defaultProps} />);
            const images = getAllByTestId('snapshot-image');
            expect(images.length).toBe(3);
        });

        // Can't test on the Ionicons here when mocking so instead the
        // testing is done on the component rendering if there are no images.
        it('should show the camera icon when no images are provided', () => {
            const { getByTestId } = render(<SnapshotCard {...defaultProps} images={[]} />);
            expect(getByTestId('snapshot-component')).toBeTruthy();
        });

        it('should display the "more images" indicator when there are more than 4 images', () => {
            const manyImages = [
                { uri: 'image1.jpg' },
                { uri: 'image2.jpg' },
                { uri: 'image3.jpg' },
                { uri: 'image4.jpg' },
                { uri: 'image5.jpg' },
            ];
            const { getByText } = render(<SnapshotCard {...defaultProps} images={manyImages} />);
            expect(getByText('+1')).toBeTruthy();
        });

        it('should call onPress when pressed', () => {
            const { getByTestId } = render(<SnapshotCard {...defaultProps} />);
            fireEvent.press(getByTestId('snapshot-component'));
            expect(mockOnPress).toHaveBeenCalled();
        });

        it('should call onDeletePress when delete button is pressed', () => {
            const { getByTestId } = render(<SnapshotCard {...defaultProps} />);
            fireEvent.press(getByTestId('delete-snapshot-button'));
            expect(mockOnDeletePress).toHaveBeenCalled();
        });
    
        it('should render delete button', () => {
            const { getByTestId } = render(<SnapshotCard {...defaultProps} />);
            expect(getByTestId('delete-snapshot-button')).toBeTruthy();
        });
    });

    describe('Narrow screen (width < 400)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 350, height: 800 });
        });

        it('should render in compact mode for narrow screens', () => {
            jest.doMock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
                __esModule: true,
                default: () => ({
                    width: 350,
                    height: 800,
                }),
            }));

            const { getByText, queryByTestId } = render(<SnapshotCard {...defaultProps} />);
            expect(getByText('Test Snapshot')).toBeTruthy();
            expect(queryByTestId('compact-main-image-container')).toBeTruthy();
            expect(queryByTestId('compact-additional-images-icontaner')).toBeTruthy();
            expect(queryByTestId('compact-text')).toBeTruthy();
            expect(queryByTestId('main-image-contaner')).toBeNull();
            expect(queryByTestId('right-side-content-contaner')).toBeNull();
        });
    });
});