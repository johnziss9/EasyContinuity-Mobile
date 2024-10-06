import React from 'react';
import { render } from '@testing-library/react-native';
import SnapshotImagesManage from '../pages/SnapshotImagesManage';

describe('SnapshotImagesManage', () => {
    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<SnapshotImagesManage />);

        expect(getByText('Manage Images')).toBeTruthy();
        expect(getByTestId('safe-area-view')).toBeTruthy();
        expect(getByTestId('header-container')).toBeTruthy();
        expect(getByTestId('header-text')).toBeTruthy();
    });
});