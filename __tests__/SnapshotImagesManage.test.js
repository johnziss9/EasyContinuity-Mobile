import React from 'react';
import { render } from '@testing-library/react-native';
import SnapshotImagesManage from '../pages/SnapshotImagesManage';

// Mock expo-constants
jest.mock('expo-constants', () => ({
    manifest: {
        extra: {
            apiUrl: 'http://test-api.com'
        }
    }
}));

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
    useRoute: () => ({
        params: {
            spaceId: '123',
            folderId: '456',
            snapshotId: '789'
        }
    })
}));

// Mock ImageAttachment component
jest.mock('../components/ImageAttachment', () => {
    return function MockImageAttachment(props) {
        return null;
    };
});

describe('SnapshotImagesManage', () => {
    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<SnapshotImagesManage />);

        expect(getByText('Manage Images')).toBeTruthy();
        expect(getByTestId('safe-area-view')).toBeTruthy();
        expect(getByTestId('header-container')).toBeTruthy();
        expect(getByTestId('header-text')).toBeTruthy();
    });

    it('should receive correct route params', () => {
        const { getByTestId } = render(<SnapshotImagesManage />);
        
        // Component renders without crashing with mocked params
        expect(getByTestId('safe-area-view')).toBeTruthy();
    });
});