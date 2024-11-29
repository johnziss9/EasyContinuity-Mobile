import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotHairInfo from '../pages/SnapshotHairInfo';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();
const mockUseWindowDimensions = jest.fn();

// Mock the entire @react-navigation/native module
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: {
                spaceId: 1,
                isNewSnapshot: true,
                spaceName: 'Test Space'
            }
        }),
    };
});

jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: {
            id: 1,
            prep: 'Test Hair Prep',
            method: 'Test Hair Method',
            stylingTools: 'Test Hair Tools',
            products: 'Test Hair Products',
            hairNotes: 'Test Hair Notes'
        }
    }))
}));

describe('SnapshotHairInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 800, height: 800 });
        });

        it('should render with expanded padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-hair-container').props.style.paddingLeft).toBe(15);
        });

        it('should render correctly for new snapshot', async () => {
            const { getByText, getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByText('Add Hair Details')).toBeTruthy();
                expect(getByTestId('hair-prep-text-input')).toBeTruthy();
                expect(getByTestId('hair-method-text-input')).toBeTruthy();
                expect(getByTestId('hair-styling-tools-text-input')).toBeTruthy();
                expect(getByTestId('hair-products-text-input')).toBeTruthy();
                expect(getByTestId('hair-notes-text-input')).toBeTruthy();
            });
        });

        it('should allow input in text fields', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Test Hair Prep');
                fireEvent.changeText(getByTestId('hair-method-text-input'), 'Test Hair Method');
                fireEvent.changeText(getByTestId('hair-styling-tools-text-input'), 'Test Hair Tools');
                fireEvent.changeText(getByTestId('hair-products-text-input'), 'Test Hair Products');
                fireEvent.changeText(getByTestId('hair-notes-text-input'), 'Test Hair Notes');

                expect(getByTestId('hair-prep-text-input').props.value).toBe('Test Hair Prep');
                expect(getByTestId('hair-method-text-input').props.value).toBe('Test Hair Method');
                expect(getByTestId('hair-styling-tools-text-input').props.value).toBe('Test Hair Tools');
                expect(getByTestId('hair-products-text-input').props.value).toBe('Test Hair Products');
                expect(getByTestId('hair-notes-text-input').props.value).toBe('Test Hair Notes');
            });
        });

        it('should allow multi-line input in notes field', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const notesInput = getByTestId('hair-notes-text-input');
                fireEvent.changeText(notesInput, 'Line 1\nLine 2\nLine 3');
                expect(notesInput.props.value).toBe('Line 1\nLine 2\nLine 3');
            });
        });

        it('should navigate back to Snapshot screen with correct params when Cancel is pressed', async () => {
            // Mock route params
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    spaceName: 'Test Space',
                    folderId: null,
                    folderName: null,
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                }
            });

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('hair-cancel-button'));
                expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
                    spaceId: 1,
                    spaceName: 'Test Space',
                    folderId: null,
                    folderName: null,
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                });
            });
        });

        it('should load and display existing snapshot data when editing', async () => {
            const apiMock = require('../api/api').default;
            
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });
        
            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );
        
            await waitFor(() => {
                expect(getByText('Edit Hair Details')).toBeTruthy();
                expect(getByTestId('hair-prep-text-input').props.value).toBe('Test Hair Prep');
                expect(getByTestId('hair-method-text-input').props.value).toBe('Test Hair Method');
                expect(getByTestId('hair-styling-tools-text-input').props.value).toBe('Test Hair Tools');
                expect(getByTestId('hair-products-text-input').props.value).toBe('Test Hair Products');
                expect(getByTestId('hair-notes-text-input').props.value).toBe('Test Hair Notes');
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'GET');
            });
        });

        it('should successfully update existing snapshot', async () => {
            const apiMock = require('../api/api').default;
            
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                }
            });
        
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { 
                        id: 1,
                        prep: 'Old Hair Prep',
                        method: 'Old Hair Method',
                        stylingTools: 'Old Hair Tools',
                        products: 'Old Hair Products',
                        hairNotes: 'Old Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { 
                        id: 1,
                        prep: 'Updated Hair Prep'
                    }
                }));
        
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );
        
            await waitFor(() => {
                fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Updated Hair Prep');
                fireEvent.press(getByTestId('hair-submit-button'));
            });
        
            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    prep: 'Updated Hair Prep',
                    lastUpdatedOn: expect.any(String)
                }));
            });
        });

        it('should handle multi-line input in all fields', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            const multiLineText = 'Line 1\nLine 2\nLine 3';
            const fields = [
                'hair-prep-text-input',
                'hair-method-text-input',
                'hair-styling-tools-text-input',
                'hair-products-text-input'
            ];

            await waitFor(() => {
                fields.forEach(fieldId => {
                    const input = getByTestId(fieldId);
                    fireEvent.changeText(input, multiLineText);
                    expect(input.props.value).toBe(multiLineText);
                });
            });
        });
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 800, height: 800 });
        });

        it('should render with expanded padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-hair-container').props.style.paddingLeft).toBe(15);
        });
    });
});