import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotHairInfo from '../pages/SnapshotHairInfo';
import { NavigationContainer } from '@react-navigation/native';
import ToastNotification from '../utils/ToastNotification';

const mockNavigate = jest.fn();
const mockDimensions = { width: 800, height: 800 };
const apiMock = require('../api/api').default;

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

// Mock useWindowDimensions
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => mockDimensions),
}));

jest.mock('../utils/ToastNotification', () => ({
    show: jest.fn()
}));


describe('SnapshotHairInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ToastNotification.show.mockClear();
        apiMock.mockClear();
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockDimensions.width = 800;
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

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Snapshot Hair Details Updated Successfully'
                );

                expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
                    spaceId: 1,
                    spaceName: 'Test Space',
                    folderId: undefined,
                    folderName: undefined,
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                });
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

        // Snapshot fetch API error
        it('should show error toast when snapshot fetch API returns unsuccessful response', async () => {
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Failed to fetch snapshot'
            }));

            render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to fetch snapshot'
                );
            });
        });

        // Snapshot fetch network error
        it('should show error toast when snapshot fetch throws network error', async () => {
            apiMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to load snapshot'
                );
            });
        });

        // Update snapshot API error
        it('should show error toast when update snapshot API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
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
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to update snapshot'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('hair-prep-text-input').props.value).toBe('Test Hair Prep');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Updated Hair Prep');
            fireEvent.press(getByTestId('hair-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update snapshot'
                );
            });
        });

        // Update snapshot network error
        it('should show error toast when update snapshot throws network error', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
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
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('hair-prep-text-input').props.value).toBe('Test Hair Prep');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Updated Hair Prep');
            fireEvent.press(getByTestId('hair-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update snapshot'
                );
            });
        });

        // Handle empty or null response data
        it('should handle empty or null response data gracefully', async () => {
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: null
            }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Fields should be empty but not crash
                expect(getByTestId('hair-prep-text-input').props.value).toBe('');
                expect(getByTestId('hair-method-text-input').props.value).toBe('');
                expect(getByTestId('hair-styling-tools-text-input').props.value).toBe('');
                expect(getByTestId('hair-products-text-input').props.value).toBe('');
                expect(getByTestId('hair-notes-text-input').props.value).toBe('');
            });
        });

        // Validate all fields are properly updated in PUT request
        it('should include all fields in the update request', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1
                    }
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            // Set values for all fields
            fireEvent.changeText(getByTestId('hair-prep-text-input'), 'New Hair Prep');
            fireEvent.changeText(getByTestId('hair-method-text-input'), 'New Hair Method');
            fireEvent.changeText(getByTestId('hair-styling-tools-text-input'), 'New Hair Tools');
            fireEvent.changeText(getByTestId('hair-products-text-input'), 'New Hair Products');
            fireEvent.changeText(getByTestId('hair-notes-text-input'), 'New Hair Notes');

            // Submit the form
            fireEvent.press(getByTestId('hair-submit-button'));

            await waitFor(() => {
                // Verify that the API was called with all fields
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    prep: 'New Hair Prep',
                    method: 'New Hair Method',
                    stylingTools: 'New Hair Tools',
                    products: 'New Hair Products',
                    hairNotes: 'New Hair Notes',
                    lastUpdatedOn: expect.any(String)
                }));
            });
        });

        // Test preserving original values for fields not being updated
        it('should preserve original values for fields not being updated', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        prep: 'Original Prep',
                        method: 'Original Method',
                        stylingTools: 'Original Tools',
                        products: 'Original Products',
                        hairNotes: 'Original Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1
                    }
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('hair-prep-text-input').props.value).toBe('Original Prep');
            });

            // Only update one field
            fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Updated Prep');

            // Submit the form
            fireEvent.press(getByTestId('hair-submit-button'));

            await waitFor(() => {
                // Verify that the API was called with all fields, preserving original values
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    prep: 'Updated Prep',
                    method: 'Original Method',
                    stylingTools: 'Original Tools',
                    products: 'Original Products',
                    hairNotes: 'Original Notes'
                }));
            });
        });

        // Test navigation on error
        it('should not navigate on update error', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        prep: 'Test Hair Prep'
                    }
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('hair-prep-text-input').props.value).toBe('Test Hair Prep');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('hair-prep-text-input'), 'Updated Hair Prep');
            fireEvent.press(getByTestId('hair-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update snapshot'
                );

                // Navigation should not have been called
                expect(mockNavigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('Narrower screen (width < 600)', () => {
        beforeEach(() => {
            mockDimensions.width = 500;
        });

        it('should render with reduced padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotHairInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-hair-container').props.style.paddingLeft).toBe(5);
        });
    });
});