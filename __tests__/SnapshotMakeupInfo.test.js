import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotMakeupInfo from '../pages/SnapshotMakeupInfo';
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
            skin: 'Test Skin Makeup',
            brows: 'Test Brows Makeup',
            eyes: 'Test Eyes Makeup',
            lips: 'Test Lips Makeup',
            effects: 'Test Effects Makeup',
            makeupNotes: 'Test Makeup Notes'
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

describe('SnapshotMakeupInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        apiMock.mockClear();
        ToastNotification.show.mockClear();
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockDimensions.width = 800;
        });

        it('should render with expanded padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-makeup-container').props.style.paddingLeft).toBe(15);
        });

        it('should render correctly for new snapshot', async () => {
            const { getByText, getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByText('Add Makeup Details')).toBeTruthy();
                expect(getByTestId('makeup-skin-text-input')).toBeTruthy();
                expect(getByTestId('makeup-brows-text-input')).toBeTruthy();
                expect(getByTestId('makeup-eyes-text-input')).toBeTruthy();
                expect(getByTestId('makeup-lips-text-input')).toBeTruthy();
                expect(getByTestId('makeup-effects-text-input')).toBeTruthy();
                expect(getByTestId('makeup-notes-text-input')).toBeTruthy();
            });
        });

        it('should allow input in text fields', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Test Skin Makeup');
                fireEvent.changeText(getByTestId('makeup-brows-text-input'), 'Test Brows Makeup');
                fireEvent.changeText(getByTestId('makeup-eyes-text-input'), 'Test Eyes Makeup');
                fireEvent.changeText(getByTestId('makeup-lips-text-input'), 'Test Lips Makeup');
                fireEvent.changeText(getByTestId('makeup-effects-text-input'), 'Test Effects Makeup');
                fireEvent.changeText(getByTestId('makeup-notes-text-input'), 'Test Makeup Notes');

                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
                expect(getByTestId('makeup-brows-text-input').props.value).toBe('Test Brows Makeup');
                expect(getByTestId('makeup-eyes-text-input').props.value).toBe('Test Eyes Makeup');
                expect(getByTestId('makeup-lips-text-input').props.value).toBe('Test Lips Makeup');
                expect(getByTestId('makeup-effects-text-input').props.value).toBe('Test Effects Makeup');
                expect(getByTestId('makeup-notes-text-input').props.value).toBe('Test Makeup Notes');
            });
        });

        it('should allow multi-line input in notes field', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const notesInput = getByTestId('makeup-notes-text-input');
                fireEvent.changeText(notesInput, 'Line 1\nLine 2\nLine 3');
                expect(notesInput.props.value).toBe('Line 1\nLine 2\nLine 3');
            });
        });

        it('should navigate back to Snapshot screen with correct params when Cancel is pressed', async () => {
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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('makeup-cancel-button'));
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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByText('Edit Makeup Details')).toBeTruthy();
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
                expect(getByTestId('makeup-brows-text-input').props.value).toBe('Test Brows Makeup');
                expect(getByTestId('makeup-eyes-text-input').props.value).toBe('Test Eyes Makeup');
                expect(getByTestId('makeup-lips-text-input').props.value).toBe('Test Lips Makeup');
                expect(getByTestId('makeup-effects-text-input').props.value).toBe('Test Effects Makeup');
                expect(getByTestId('makeup-notes-text-input').props.value).toBe('Test Makeup Notes');
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
                        skin: 'Old Skin Makeup',
                        brows: 'Old Brows Makeup',
                        eyes: 'Old Eyes Makeup',
                        lips: 'Old Lips Makeup',
                        effects: 'Old Effects Makeup',
                        makeupNotes: 'Old Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        skin: 'Updated Skin Makeup'
                    }
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin Makeup');
                fireEvent.press(getByTestId('makeup-submit-button'));
            });

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    skin: 'Updated Skin Makeup',
                    lastUpdatedOn: expect.any(String)
                }));

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Snapshot Makeup Details Updated Successfully'
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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            const multiLineText = 'Line 1\nLine 2\nLine 3';
            const fields = [
                'makeup-skin-text-input',
                'makeup-brows-text-input',
                'makeup-eyes-text-input',
                'makeup-lips-text-input',
                'makeup-effects-text-input'
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
                    <SnapshotMakeupInfo />
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
                    <SnapshotMakeupInfo />
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
                        skin: 'Test Skin Makeup',
                        brows: 'Test Brows Makeup',
                        eyes: 'Test Eyes Makeup',
                        lips: 'Test Lips Makeup',
                        effects: 'Test Effects Makeup',
                        makeupNotes: 'Test Makeup Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to update snapshot'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin Makeup');
            fireEvent.press(getByTestId('makeup-submit-button'));

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
                        skin: 'Test Skin Makeup',
                        brows: 'Test Brows Makeup',
                        eyes: 'Test Eyes Makeup',
                        lips: 'Test Lips Makeup',
                        effects: 'Test Effects Makeup',
                        makeupNotes: 'Test Makeup Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin Makeup');
            fireEvent.press(getByTestId('makeup-submit-button'));

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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Fields should be empty but not crash
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('');
                expect(getByTestId('makeup-brows-text-input').props.value).toBe('');
                expect(getByTestId('makeup-eyes-text-input').props.value).toBe('');
                expect(getByTestId('makeup-lips-text-input').props.value).toBe('');
                expect(getByTestId('makeup-effects-text-input').props.value).toBe('');
                expect(getByTestId('makeup-notes-text-input').props.value).toBe('');
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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            // Set values for all fields
            fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'New Skin Makeup');
            fireEvent.changeText(getByTestId('makeup-brows-text-input'), 'New Brows Makeup');
            fireEvent.changeText(getByTestId('makeup-eyes-text-input'), 'New Eyes Makeup');
            fireEvent.changeText(getByTestId('makeup-lips-text-input'), 'New Lips Makeup');
            fireEvent.changeText(getByTestId('makeup-effects-text-input'), 'New Effects Makeup');
            fireEvent.changeText(getByTestId('makeup-notes-text-input'), 'New Makeup Notes');

            // Submit the form
            fireEvent.press(getByTestId('makeup-submit-button'));

            await waitFor(() => {
                // Verify that the API was called with all fields
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    skin: 'New Skin Makeup',
                    brows: 'New Brows Makeup',
                    eyes: 'New Eyes Makeup',
                    lips: 'New Lips Makeup',
                    effects: 'New Effects Makeup',
                    makeupNotes: 'New Makeup Notes',
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
                        skin: 'Original Skin',
                        brows: 'Original Brows',
                        eyes: 'Original Eyes',
                        lips: 'Original Lips',
                        effects: 'Original Effects',
                        makeupNotes: 'Original Notes'
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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Original Skin');
            });

            // Only update one field
            fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin');

            // Submit the form
            fireEvent.press(getByTestId('makeup-submit-button'));

            await waitFor(() => {
                // Verify that the API was called with all fields, preserving original values
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    skin: 'Updated Skin',
                    brows: 'Original Brows',
                    eyes: 'Original Eyes',
                    lips: 'Original Lips',
                    effects: 'Original Effects',
                    makeupNotes: 'Original Notes'
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
                        skin: 'Test Skin Makeup'
                    }
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Wait for initial data to load
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
            });

            // Update a field and submit
            fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin Makeup');
            fireEvent.press(getByTestId('makeup-submit-button'));

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
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-makeup-container').props.style.paddingLeft).toBe(5);
        });
    });
});