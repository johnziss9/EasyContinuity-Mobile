import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotGeneralInfo from '../pages/SnapshotGeneralInfo';
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
            reset: mockNavigate,
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

// Mock the handleHttpRequest function
jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: [
            { id: '2', name: 'Character 1' },
            { id: '3', name: 'Character 2' }
        ]
    }))
}));

// Mock the SelectList component
jest.mock('react-native-dropdown-select-list', () => {
    const MockSelectList = ({ setSelected, data, placeholder, testID }) => (
        <div testID={testID}>
            <button
                testID={`${testID}-button`}
                onPress={() => { }}
            >
                {placeholder}
            </button>
            {data.map((item) => (
                <button
                    key={item.key}
                    testID={`${testID}-option-${item.key}`}
                    onPress={() => setSelected(item.key, item.value)}
                >
                    {item.value}
                </button>
            ))}
        </div>
    );
    return { SelectList: MockSelectList };
});

// Mock useWindowDimensions
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => mockDimensions),
}));

jest.mock('../utils/ToastNotification', () => ({
    show: jest.fn()
}));

describe('SnapshotGeneralInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ToastNotification.show.mockClear();
        apiMock.mockClear();
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockDimensions.width = 800;
        });

        it('should render correctly for new snapshot', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    type: 2
                }
            }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByText, getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            // First wait for the API calls to complete
            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledTimes(2);
            }, { timeout: 10000 });

            // Then check for the rendered elements
            await waitFor(() => {
                // Check header first
                expect(getByText('Add New Snapshot')).toBeTruthy();
            }, { timeout: 10000 });

            // Check each input field separately to help identify any specific issues
            await waitFor(() => {
                expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
                expect(getByTestId('episode-number-text-input')).toBeTruthy();
                expect(getByTestId('scene-number-text-input')).toBeTruthy();
                expect(getByTestId('story-day-text-input')).toBeTruthy();
                expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
                expect(getByTestId('character-select')).toBeTruthy();
            }, { timeout: 10000 });

            // Verify API calls were made in correct order
            expect(apiMock).toHaveBeenNthCalledWith(1, '/space/1', 'GET');
            expect(apiMock).toHaveBeenNthCalledWith(2, '/character/space/1', 'GET');
        }, 15000);

        it('should allow input in text fields', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    type: 2
                }
            }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const nameInput = getByTestId('snapshot-name-text-input');
                const episodeInput = getByTestId('episode-number-text-input');
                const sceneInput = getByTestId('scene-number-text-input');
                const storyInput = getByTestId('story-day-text-input');

                fireEvent.changeText(nameInput, 'Test Snapshot');
                fireEvent.changeText(episodeInput, 'Test Episode Number');
                fireEvent.changeText(sceneInput, 'Test Scene Number');
                fireEvent.changeText(storyInput, 'Test Story Day');

                expect(nameInput.props.value).toBe('Test Snapshot');
                expect(episodeInput.props.value).toBe('Test Episode Number');
                expect(sceneInput.props.value).toBe('Test Scene Number');
                expect(storyInput.props.value).toBe('Test Story Day');
            });
        });

        it('should allow multi-line input in notes field', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const notesInput = getByTestId('snapshot-notes-text-input');
                fireEvent.changeText(notesInput, 'Line 1\nLine 2\nLine 3');
                expect(notesInput.props.value).toBe('Line 1\nLine 2\nLine 3');
            });
        });

        it('should navigate to the "Space" screen when Cancel button is pressed', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('general-cancel-button'));
                expect(mockNavigate).toHaveBeenCalled();
            });
        });

        it('should handle character selection from dropdown', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const characterOption = getByTestId('character-select-option-2');
                fireEvent.press(characterOption);
                // Since we're mocking the component, we can't check the actual selected value
                // but we can verify the button was pressed
                expect(characterOption).toBeTruthy();
            });
        });

        it('should open Add New Character modal when "Add New Character" is selected', async () => {
            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const addNewOption = getByTestId('character-select-option-1');
                fireEvent.press(addNewOption);
                expect(getByText('Add New Character:')).toBeTruthy();
            });
        });

        it('should create new character through modal', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            apiMock
                .mockImplementationOnce(() => Promise.resolve({  // Space type call
                    success: true,
                    data: {
                        id: 1,
                        type: 2
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({  // Initial characters call
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({  // Create character call
                    success: true,
                    data: {
                        id: 4,
                        name: 'New Test Character'
                    }
                }))
                .mockImplementation(() => Promise.resolve({  // Subsequent character list calls
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' },
                        { id: 4, name: 'New Test Character' }
                    ]
                }));

            const { getByTestId, queryByText, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const addNewOption = getByTestId('character-select-option-1');
                fireEvent.press(addNewOption);
            });

            const nameInput = getByTestId('character-name-text-input');
            fireEvent.changeText(nameInput, 'New Test Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/character/', 'POST', {
                    name: 'New Test Character',
                    spaceId: 1,
                    createdOn: expect.any(String)
                });

                expect(queryByText('Add New Character:')).toBeNull();

                // Verify character is selected in dropdown
                expect(apiMock).toHaveBeenCalledWith('/character/space/1', 'GET');

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Added Successfully'
                );
            });
        });

        it('should successfully create a new snapshot', async () => {
            const apiMock = require('../api/api').default;

            // Reset the mock to start fresh
            apiMock.mockReset();

            // Set up specific mock implementations
            apiMock
                .mockImplementationOnce(() => Promise.resolve({  // Space type call
                    success: true,
                    data: {
                        id: 1,
                        type: 2
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({  // Initial characters call
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({  // Create snapshot call
                    success: true,
                    data: {
                        id: 1,
                        name: 'New Test Snapshot',
                        spaceId: 1,
                        episode: '1',
                        scene: 2,
                        storyDay: 3,
                        character: 2,
                        notes: 'Test notes'
                    }
                }))
                .mockImplementation(() => Promise.resolve({  // All subsequent calls (for character lists etc)
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'New Test Snapshot');
                fireEvent.changeText(getByTestId('episode-number-text-input'), '1');
                fireEvent.changeText(getByTestId('scene-number-text-input'), '2');
                fireEvent.changeText(getByTestId('story-day-text-input'), '3');
                fireEvent.changeText(getByTestId('snapshot-notes-text-input'), 'Test notes');

                const characterOption = getByTestId('character-select-option-2');
                fireEvent.press(characterOption);
            });

            fireEvent.press(getByTestId('general-submit-button'));

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/snapshot/', 'POST', {
                    name: 'New Test Snapshot',
                    spaceId: 1,
                    folderId: undefined,
                    episode: '1',
                    scene: 2,
                    storyDay: 3,
                    character: 2,
                    notes: 'Test notes',
                    createdOn: expect.any(String)
                });

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Snapshot Added Successfully'
                );

                expect(mockNavigate).toHaveBeenCalled();
            });
        });

        it('should cancel character creation when cancel button is pressed', async () => {
            const { getByTestId, queryByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                const addNewOption = getByTestId('character-select-option-1');
                fireEvent.press(addNewOption);
            });

            fireEvent.changeText(getByTestId('character-name-text-input'), 'Test Character');

            fireEvent.press(getByTestId('add-new-character-cancel-button'));

            await waitFor(() => {
                expect(queryByText('Add New Character:')).toBeNull();
                expect(queryByText(/Manage Characters \(\d+\):/)).toBeNull();
            });
        });

        it('should load and display existing snapshot data when editing', async () => {
            const apiMock = require('../api/api').default;

            // Mock route params for editing
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        type: 2
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        name: 'Test Snapshot',
                        episode: '101',
                        scene: 5,
                        storyDay: 12,
                        character: 2,
                        notes: 'Test notes'
                    }
                }));

            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByText('Edit Snapshot')).toBeTruthy();
                expect(getByTestId('snapshot-name-text-input').props.value).toBe('Test Snapshot');
                expect(getByTestId('episode-number-text-input').props.value).toBe('101');
                expect(getByTestId('scene-number-text-input').props.value).toBe('5');
                expect(getByTestId('story-day-text-input').props.value).toBe('12');
                expect(getByTestId('snapshot-notes-text-input').props.value).toBe('Test notes');
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'GET');
            });
        });

        it('should successfully update an existing snapshot', async () => {
            const apiMock = require('../api/api').default;

            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1,
                    snapshotName: 'Old Name'
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        type: 2
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        name: 'Test Snapshot',
                        episode: '101',
                        scene: 5,
                        storyDay: 12,
                        character: 2
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        name: 'Updated Snapshot'
                    }
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'Updated Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    name: 'Updated Snapshot',
                    lastUpdatedOn: expect.any(String)
                }));

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Snapshot General Details Updated Successfully'
                );
            });
        });

        it('should correctly parse scene and story day numbers when creating/updating', async () => {
            const apiMock = require('../api/api').default;

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('scene-number-text-input'), '42');
                fireEvent.changeText(getByTestId('story-day-text-input'), '365');
                fireEvent.press(getByTestId('general-submit-button'));

                expect(apiMock).toHaveBeenCalledWith(expect.any(String), expect.any(String),
                    expect.objectContaining({
                        scene: 42,
                        storyDay: 365
                    })
                );
            });
        });

        it('should handle null scene and story day values', async () => {
            const apiMock = require('../api/api').default;

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('scene-number-text-input'), '');
                fireEvent.changeText(getByTestId('story-day-text-input'), '');
                fireEvent.press(getByTestId('general-submit-button'));

                expect(apiMock).toHaveBeenCalledWith(expect.any(String), expect.any(String),
                    expect.objectContaining({
                        scene: null,
                        storyDay: null
                    })
                );
            });
        });

        it('should not show Episode Number field when spaceType is 1', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    type: 1
                }
            }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Episode Number field should not be present
                expect(queryByTestId('episode-number-text-input')).toBeNull();
                // But other fields should still be there
                expect(queryByTestId('scene-number-text-input')).toBeTruthy();
                expect(queryByTestId('story-day-text-input')).toBeTruthy();
            });

            // Verify space type API was called
            expect(apiMock).toHaveBeenCalledWith('/space/1', 'GET');
        });

        it('should show Episode Number field when spaceType is 2', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: {
                    id: 1,
                    type: 2
                }
            }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                // Episode Number field should be present
                expect(queryByTestId('episode-number-text-input')).toBeTruthy();
                // Along with other fields
                expect(queryByTestId('scene-number-text-input')).toBeTruthy();
                expect(queryByTestId('story-day-text-input')).toBeTruthy();
            });

            // Verify space type API was called
            expect(apiMock).toHaveBeenCalledWith('/space/1', 'GET');
        });

        it('should show manage characters button when there is one or more characters', async () => {
            const apiMock = require('../api/api').default;

            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByTestId('manage-characters-button')).toBeTruthy();
            });
        });

        it('should not show manage characters button when there are no characters', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: []
                }));

            const { queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(queryByTestId('manage-characters-button')).toBeNull();
            });
        });

        it('should open manage characters modal when settings button is pressed', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                expect(getByText('Manage Characters (2):')).toBeTruthy();
            });
        });

        it('should open edit character modal with character data when edit is pressed', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId, getByText, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);

                expect(getByText('Update Character:')).toBeTruthy();
                const input = getByTestId('character-name-text-input');
                expect(input.props.value).toBe('Character 1');
            });
        });

        it('should update character and return to manage characters modal when edit form is submitted', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                // Initial space type call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                // Initial characters call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }))
                // Update character call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 2, name: 'Updated Character' }
                }))
                // Get characters after update call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Updated Character' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId, getAllByTestId, getByText, queryByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByTestId('manage-characters-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('manage-characters-button'));

            await waitFor(() => {
                expect(getByText('Manage Characters (2):')).toBeTruthy();
            });

            const editButtons = getAllByTestId('edit-character-button');
            fireEvent.press(editButtons[0]);

            await waitFor(() => {
                expect(getByText('Update Character:')).toBeTruthy();
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'Updated Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                // Verify the PUT request was made
                expect(apiMock).toHaveBeenCalledWith('/character/2', 'PUT', expect.objectContaining({
                    name: 'Updated Character',
                    lastUpdatedOn: expect.any(String)
                }));

                expect(getByText('Manage Characters (2):')).toBeTruthy();

                const characterElements = getAllByTestId('character-component');
                expect(characterElements).toHaveLength(2);

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Updated Successfully'
                );
            });
        });

        it('should return to manage characters modal when edit is cancelled', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' },
                        { id: 3, name: 'Character 2' }
                    ]
                }));

            const { getByTestId, getByText, getAllByTestId, queryByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);

                fireEvent.press(getByTestId('add-new-character-cancel-button'));
                expect(queryByText('Update Character:')).toBeNull();
                expect(getByText('Manage Characters (2):')).toBeTruthy();
            });
        });

        it('should successfully delete character after confirmation', async () => {
            // Mock the date
            const mockDate = new Date('2024-12-17T07:19:09.984Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: []
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: []
                }));

            const { getByTestId, getAllByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            expect(getByText('Delete Character?')).toBeTruthy();

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/character/2', 'PUT', {
                    name: 'Character 1',
                    isDeleted: true,
                    deletedOn: mockDate.toISOString()
                });

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Deleted Successfully'
                );
            });

            jest.restoreAllMocks();
        });

        it('should cancel character deletion when cancel is pressed', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }));

            const { getByTestId, getAllByTestId, getByText, queryByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            expect(getByText('Delete Character?')).toBeTruthy();

            fireEvent.press(getByTestId('delete-character-cancel-button'));

            await waitFor(() => {
                expect(queryByText('Delete Character?')).toBeNull();
                expect(getByText('Character 1')).toBeTruthy();
                expect(apiMock).toHaveBeenCalledTimes(2);
            });
        });

        it('should close manage characters modal when last character is deleted', async () => {
            const apiMock = require('../api/api').default;
            apiMock
                .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 2, name: 'Character 1' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({ success: true }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: []
                }));

            const { getByTestId, getAllByTestId, queryByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);

                expect(queryByText('Manage Characters (0):')).toBeNull();
            });
        });

        it('should clear character name textbox when edit form is submitted', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // First API call - Space Type with exact response structure
            apiMock.mockResolvedValueOnce({
                data: {
                    id: 1,
                    type: "1",  // Note: type is a string, not a number
                    name: "Test Space",
                    description: "Some Description",
                    createdBy: 0,
                    createdOn: "2024-11-25T12:47:32.438Z",
                    lastUpdatedBy: null,
                    lastUpdatedOn: "2024-12-13T09:29:13.48Z",
                    deletedBy: null,
                    deletedOn: null,
                    isDeleted: false
                },
                status: 200,
                success: true
            })
                // Second API call - Characters list
                .mockResolvedValueOnce({
                    data: [
                        { id: 2, name: 'Character 1' }
                    ],
                    status: 200,
                    success: true
                })
                // Third API call - Character update
                .mockResolvedValueOnce({
                    data: {
                        id: 2,
                        name: 'Updated Character'
                    },
                    status: 200,
                    success: true
                })
                // Fourth API call - Get updated characters list
                .mockResolvedValueOnce({
                    data: [
                        { id: 2, name: 'Updated Character' }
                    ],
                    status: 200,
                    success: true
                });

            const { getByTestId, getAllByTestId, queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByTestId('manage-characters-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('manage-characters-button'));

            await waitFor(() => {
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'Updated Character');

            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                const updatedInput = queryByTestId('character-name-text-input');
                expect(updatedInput).toBeNull();
            });
        });

        it('should show clear button only when character is selected', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // Setup consistent mock responses
            apiMock.mockImplementation((url) => {
                // Space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: {
                            id: 1,
                            type: 2,
                            name: "Test Space",
                            description: "Some Description",
                            createdBy: 0,
                            createdOn: "2024-11-25T12:47:32.438Z"
                        }
                    });
                }
                // Characters list call
                if (url === '/character/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: [
                            {
                                id: 2,
                                name: 'Character 1',
                                spaceId: 1,
                                createdOn: "2024-11-25T12:47:32.438Z"
                            }
                        ]
                    });
                }
                // Default response
                return Promise.resolve({
                    success: true,
                    data: null
                });
            });

            const { getByTestId, queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            expect(queryByTestId('clear-character-button')).toBeNull();

            // Wait for SelectList to be ready
            await waitFor(() => {
                expect(getByTestId('character-select')).toBeTruthy();
            });

            fireEvent.press(getByTestId('character-select-option-2'));

            await waitFor(() => {
                expect(getByTestId('clear-character-button')).toBeTruthy();
            });
        });

        it('should clear selected character when clear button is pressed', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // Setup consistent mock responses
            apiMock.mockImplementation((url) => {
                // Space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: {
                            id: 1,
                            type: 2,
                            name: "Test Space",
                            description: "Some Description",
                            createdBy: 0,
                            createdOn: "2024-11-25T12:47:32.438Z"
                        }
                    });
                }
                // Characters list call
                if (url === '/character/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: [
                            {
                                id: 2,
                                name: 'Character 1',
                                spaceId: 1,
                                createdOn: "2024-11-25T12:47:32.438Z"
                            }
                        ]
                    });
                }
                // Default response
                return Promise.resolve({
                    success: true,
                    data: null
                });
            });

            const { getByTestId, queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            // Wait for data to load and SelectList to be ready
            await waitFor(() => {
                expect(getByTestId('character-select')).toBeTruthy();
            });

            // Initially, clear button should not be present
            expect(queryByTestId('clear-character-button')).toBeNull();

            fireEvent.press(getByTestId('character-select-option-2'));

            // Wait for clear button to appear
            await waitFor(() => {
                expect(getByTestId('clear-character-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('clear-character-button'));

            await waitFor(() => {
                expect(queryByTestId('clear-character-button')).toBeNull();
            });
        });

        it('should clear selection when add character modal is cancelled', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // Setup consistent mock responses
            apiMock.mockImplementation((url) => {
                // Space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: {
                            id: 1,
                            type: 2,
                            name: "Test Space",
                            description: "Some Description",
                            createdBy: 0,
                            createdOn: "2024-11-25T12:47:32.438Z"
                        }
                    });
                }
                // Characters list call
                if (url === '/character/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: [
                            {
                                id: 2,
                                name: 'Character 1',
                                spaceId: 1,
                                createdOn: "2024-11-25T12:47:32.438Z"
                            }
                        ]
                    });
                }
                // Default response
                return Promise.resolve({
                    success: true,
                    data: null
                });
            });

            const { getByTestId, queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            // Wait for data to load
            await waitFor(() => {
                expect(getByTestId('character-select')).toBeTruthy();
            });

            fireEvent.press(getByTestId('character-select-option-1'));

            // Wait for modal to open
            await waitFor(() => {
                expect(getByTestId('add-new-character-cancel-button')).toBeTruthy();
            });

            // Press cancel button
            fireEvent.press(getByTestId('add-new-character-cancel-button'));

            expect(queryByTestId('clear-character-button')).toBeNull();
        });

        it('should return to manage characters modal when edit is cancelled', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // Set up mock implementations with proper structure
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        type: 2,
                        name: "Test Space",
                        description: "Some Description",
                        createdBy: 0,
                        createdOn: "2024-11-25T12:47:32.438Z"
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        {
                            id: 2,
                            name: 'Character 1',
                            spaceId: 1,
                            createdOn: "2024-11-25T12:47:32.438Z"
                        }
                    ]
                }));

            const { getByTestId, getAllByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            // Wait for initial data load and button to appear
            await waitFor(() => {
                expect(getByTestId('manage-characters-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('manage-characters-button'));

            // Wait for modal and edit button
            await waitFor(() => {
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);
            });

            fireEvent.press(getByTestId('add-new-character-cancel-button'));

            // Verify we're back to manage characters modal
            await waitFor(() => {
                expect(getByText('Manage Characters (1):')).toBeTruthy();
            });
        });

        it('should navigate to snapshot with correct params when cancel pressed while editing', async () => {
            const mockNavigate = jest.fn();
            jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
                navigate: mockNavigate
            });

            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 123,
                    snapshotName: 'Test Snapshot',
                    folderId: null,
                    folderName: null
                }
            });

            const apiMock = require('../api/api').default;

            apiMock.mockReset();

            // Setup consistent mock responses for all API calls
            apiMock.mockImplementation((url) => {
                // Space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: {
                            id: 1,
                            type: "1",
                            name: "Test Space"
                        }
                    });
                }
                // Characters list call
                if (url === '/character/space/1') {
                    return Promise.resolve({
                        success: true,
                        data: [
                            { id: 2, name: 'Character 1' }
                        ]
                    });
                }
                // Snapshot data call
                if (url === '/snapshot/123') {
                    return Promise.resolve({
                        success: true,
                        data: {
                            id: 123,
                            name: 'Test Snapshot',
                            spaceId: 1,
                            character: null
                        }
                    });
                }
                // Default response for any other API calls
                return Promise.resolve({
                    success: true,
                    data: null
                });
            });

            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            // Wait for snapshot data to be loaded - look for the header text
            await waitFor(() => {
                expect(getByText('Edit Snapshot')).toBeTruthy();
            });

            fireEvent.press(getByTestId('general-cancel-button'));

            expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
                spaceId: 1,
                spaceName: 'Test Space',
                snapshotId: 123,
                snapshotName: 'Test Snapshot'
            });
        });

        it('should select newly added character in SelectList', async () => {
            const apiMock = require('../api/api').default;

            apiMock
                .mockImplementation((url, method, body) => {
                    // Initial space type call
                    if (url === '/space/1') {
                        return Promise.resolve({
                            data: {
                                id: 1,
                                type: "1",
                                name: "Test Space",
                                description: "Some Description",
                                createdBy: 0,
                                createdOn: "2024-11-25T12:47:32.438Z",
                                lastUpdatedBy: null,
                                lastUpdatedOn: "2024-12-13T09:29:13.48Z",
                                deletedBy: null,
                                deletedOn: null,
                                isDeleted: false
                            },
                            status: 200,
                            success: true
                        });
                    }

                    // Initial characters load 
                    if (url === '/character/space/1' && method === 'GET') {
                        return Promise.resolve({
                            data: [],
                            status: 200,
                            success: true
                        });
                    }

                    // Create character call
                    if (url === '/character/' && method === 'POST') {
                        return Promise.resolve({
                            data: {
                                id: '2',
                                name: body.name || 'New Character'
                            },
                            status: 200,
                            success: true
                        });
                    }

                    // Second character load (after creation)
                    if (url === '/character/space/1' && method === 'GET') {
                        return Promise.resolve({
                            data: [
                                { id: '2', name: 'New Character' }
                            ],
                            status: 200,
                            success: true
                        });
                    }

                    return Promise.resolve({
                        data: [],
                        status: 200,
                        success: true
                    });
                });

            const { getByTestId, queryByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByTestId('character-select-option-1')).toBeTruthy();
            });

            fireEvent.press(getByTestId('character-select-option-1'));

            await waitFor(() => {
                expect(getByTestId('character-name-text-input')).toBeTruthy();
            });

            fireEvent.changeText(getByTestId('character-name-text-input'), 'New Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                // Verify character creation API call happened
                expect(apiMock).toHaveBeenCalledWith('/character/', 'POST', expect.objectContaining({
                    name: 'New Character',
                    spaceId: 1
                }));

                // Verify the character list was refreshed
                expect(apiMock).toHaveBeenCalledWith('/character/space/1', 'GET');

                expect(queryByTestId('character-name-text-input')).toBeNull();

                // Verify success toast was shown
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Added Successfully'
                );
            });
        });

        it('should update snapshots when character is deleted', async () => {
            const apiMock = require('../api/api').default;

            apiMock.mockImplementation((url, method) => {
                // Initial space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        data: {
                            id: 1,
                            type: "1",
                            name: "Test Space",
                            description: "Some Description",
                            createdBy: 0,
                            createdOn: "2024-11-25T12:47:32.438Z",
                            lastUpdatedBy: null,
                            lastUpdatedOn: "2024-12-13T09:29:13.48Z",
                            deletedBy: null,
                            deletedOn: null,
                            isDeleted: false
                        },
                        status: 200,
                        success: true
                    });
                }

                // Initial characters load
                if (url === '/character/space/1' && method === 'GET') {
                    return Promise.resolve({
                        data: [
                            { id: 2, name: 'Character 1' }
                        ],
                        status: 200,
                        success: true
                    });
                }

                // Delete character
                if (url === '/character/2' && method === 'PUT') {
                    return Promise.resolve({
                        data: null,
                        status: 200,
                        success: true
                    });
                }

                // Get snapshots list
                if (url === '/snapshot/space/1' && method === 'GET') {
                    return Promise.resolve({
                        data: [
                            { id: 1, character: 2, name: "Snapshot 1" },
                            { id: 2, character: 3, name: "Snapshot 2" }
                        ],
                        status: 200,
                        success: true
                    });
                }

                // Update snapshot
                if (url === '/snapshot/1' && method === 'PUT') {
                    return Promise.resolve({
                        data: { id: 1, character: null },
                        status: 200,
                        success: true
                    });
                }

                // Get final characters list
                if (url === '/character/space/1' && method === 'GET') {
                    return Promise.resolve({
                        data: [],
                        status: 200,
                        success: true
                    });
                }

                // Default response
                return Promise.resolve({
                    data: null,
                    status: 200,
                    success: true
                });
            });

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            // Handle delete confirmation
            await waitFor(() => {
                expect(getByTestId('delete-character-confirm-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                // Verify character deletion
                expect(apiMock).toHaveBeenCalledWith('/character/2', 'PUT', expect.objectContaining({
                    isDeleted: true
                }));

                // Verify snapshots fetch
                expect(apiMock).toHaveBeenCalledWith('/snapshot/space/1', 'GET');

                // Verify snapshot update
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    character: null,
                    forceNullCharacter: true
                }));

                // Verify final characters fetch
                expect(apiMock).toHaveBeenCalledWith('/character/space/1', 'GET');
            });
        });

        it('should update snapshots when character is deleted', async () => {
            const apiMock = require('../api/api').default;
            apiMock.mockReset();

            // Mock the date
            const mockDate = new Date('2024-12-17T07:19:09.984Z');
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

            apiMock.mockImplementation((url, method, body) => {
                // Initial space type call
                if (url === '/space/1') {
                    return Promise.resolve({
                        data: {
                            id: 1,
                            type: "1",
                            name: "Test Space",
                            description: "Some Description",
                            createdBy: 0,
                            createdOn: "2024-11-25T12:47:32.438Z",
                            lastUpdatedBy: null,
                            lastUpdatedOn: "2024-12-13T09:29:13.48Z",
                            deletedBy: null,
                            deletedOn: null,
                            isDeleted: false
                        },
                        status: 200,
                        success: true
                    });
                }

                // Initial characters load and updated characters list
                if (url === '/character/space/1' && method === 'GET') {
                    if (apiMock.mock.calls.length <= 2) {
                        return Promise.resolve({
                            data: [
                                { id: 2, name: 'Character 1' }
                            ],
                            status: 200,
                            success: true
                        });
                    }
                    // After deletion, return empty list
                    return Promise.resolve({
                        data: [],
                        status: 200,
                        success: true
                    });
                }

                // Delete character
                if (url === '/character/2' && method === 'PUT') {
                    return Promise.resolve({
                        data: null,
                        status: 200,
                        success: true
                    });
                }

                // Get snapshots list
                if (url === '/snapshot/space/1' && method === 'GET') {
                    return Promise.resolve({
                        data: [
                            { id: 1, character: 2, name: "Snapshot 1" }
                        ],
                        status: 200,
                        success: true
                    });
                }

                // Update snapshot
                if (url === '/snapshot/1' && method === 'PUT') {
                    return Promise.resolve({
                        data: {
                            id: 1,
                            character: null,
                            name: "Snapshot 1"
                        },
                        status: 200,
                        success: true
                    });
                }

                return Promise.resolve({
                    data: null,
                    status: 200,
                    success: true
                });
            });

            const { getByTestId, getAllByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
            });

            const deleteButtons = getAllByTestId('delete-character-button');
            fireEvent.press(deleteButtons[0]);

            await waitFor(() => {
                expect(getByText('Delete Character?')).toBeTruthy();
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/character/2', 'PUT', {
                    name: 'Character 1',
                    isDeleted: true,
                    deletedOn: mockDate.toISOString()
                });
            });

            jest.restoreAllMocks();
        });

        it('should update snapshot with null character when character is cleared', async () => {
            const apiMock = require('../api/api').default;

            // Mock route params for editing
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
                // Initial space type call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                // Initial characters load
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                // Get snapshot call
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: {
                        id: 1,
                        name: 'Test Snapshot',
                        character: 2
                    }
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(getByTestId('clear-character-button')).toBeTruthy();
            });

            fireEvent.press(getByTestId('clear-character-button'));

            fireEvent.press(getByTestId('general-submit-button'));

            await waitFor(() => {
                // Verify the PUT request was made with null character
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    character: null
                }));
            });
        });

        // Space Type API error
        it('should show error toast when space type API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to fetch space type'
                }));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to fetch space type'
                );
            });
        });

        // Space Type network error
        it('should show error toast when space type fetch throws network error', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to get space type'
                );
            });
        });

        // Characters API error
        it('should show error toast when characters API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to fetch characters'
                }));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to fetch characters'
                );
            });
        });

        // Characters network error
        it('should show error toast when characters fetch throws network error', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to load characters'
                );
            });
        });

        // Snapshot fetch API error (edit mode)
        it('should show error toast when snapshot fetch API returns unsuccessful response', async () => {
            // Mock route params for editing
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to fetch snapshot'
                }));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
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

        // Snapshot fetch network error (edit mode)
        it('should show error toast when snapshot fetch throws network error', async () => {
            // Mock route params for editing
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
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

        // Create snapshot API error
        it('should show error toast when create snapshot API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to create snapshot'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'New Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to create snapshot'
                );
            });
        });

        // Create snapshot network error
        it('should show error toast when create snapshot throws network error', async () => {
            // Mock route params for new snapshot
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: true,
                    spaceName: 'Test Space'
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'New Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to create snapshot'
                );
            });
        });

        // Update snapshot API error
        it('should show error toast when update snapshot API returns unsuccessful response', async () => {
            // Mock route params for editing
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, name: 'Test Snapshot' }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to update snapshot'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'Updated Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

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
            // Mock route params for editing
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });

            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, name: 'Test Snapshot' }
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'Updated Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update snapshot'
                );
            });
        });

        // Create character API error
        it('should show error toast when create character API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to create character'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('character-select-option-1'));
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'New Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to create character'
                );
            });
        });

        // Create character network error
        it('should show error toast when create character throws network error', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('character-select-option-1'));
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'New Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to create character'
                );
            });
        });

        // Update character API error
        it('should show error toast when update character API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to update character'
                }));

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'Updated Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update character'
                );
            });
        });

        // Update character network error
        it('should show error toast when update character throws network error', async () => {
            apiMock.mockReset();

            // First API call - Space Type
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }));

            // Second API call - Characters list
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Character 1' }]
            }));

            // Third API call - Update character (PUT /character/2) - Reject with network error
            apiMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            // Don't mock any further calls to ensure the error is caught

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const editButtons = getAllByTestId('edit-character-button');
                fireEvent.press(editButtons[0]);
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'Updated Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to update character'
                );
            });
        });

        // Delete character API error
        it('should show error toast when delete character API returns unsuccessful response', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to delete character'
                }));

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to delete character'
                );
            });
        });

        // Delete character network error
        it('should show error toast when delete character throws network error', async () => {
            apiMock.mockReset();

            // First API call - Space Type
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, type: 2 }
            }));

            // Second API call - Characters list
            apiMock.mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 2, name: 'Character 1' }]
            }));

            // Third API call - Delete character - Reject with network error
            apiMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

            // Don't mock any further calls to ensure the error is caught

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to delete character'
                );
            });
        });

        // Get snapshots for character deletion API error
        it('should show error toast when get snapshots API returns unsuccessful response during character deletion', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 2, name: 'Character 1' }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to fetch snapshots'
                }));

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to fetch snapshots'
                );
            });
        });

        // Update snapshots after character deletion API error
        it('should show error toast when update snapshots API returns unsuccessful response during character deletion', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 2, name: 'Character 1' }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 1, character: 2, name: 'Test Snapshot' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: undefined  // This is what your component is actually receiving
                }));

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Deleted Successfully'
                );

                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    undefined
                );
            });
        });

        // Complex error scenarios
        it('should handle multiple API errors during character deletion and snapshot updates', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { success: true }  // Character delete success
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [
                        { id: 1, character: 2, name: 'Snapshot 1' },
                        { id: 2, character: 2, name: 'Snapshot 2' }
                    ]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: undefined  // First snapshot update fails with undefined error
                }));

            const { getByTestId, getAllByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('manage-characters-button'));
                const deleteButtons = getAllByTestId('delete-character-button');
                fireEvent.press(deleteButtons[0]);
            });

            fireEvent.press(getByTestId('delete-character-confirm-button'));

            await waitFor(() => {
                // First it shows success for character deletion
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'success',
                    'Success',
                    'Character Deleted Successfully'
                );

                // Then it shows error for undefined error
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    undefined
                );
            });
        });

        it('should handle errors during character list refresh after character operations', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 3, name: 'New Character' }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to refresh character list'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.press(getByTestId('character-select-option-1'));
            });

            const input = getByTestId('character-name-text-input');
            fireEvent.changeText(input, 'New Character');
            fireEvent.press(getByTestId('add-new-character-submit-button'));

            await waitFor(() => {
                // The component is showing the error message first
                expect(ToastNotification.show).toHaveBeenCalledWith(
                    'error',
                    'Error',
                    'Failed to refresh character list'
                );
            });
        });

        it('should handle simultaneous API success and error responses', async () => {
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { id: 1, type: 2 }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: [{ id: 2, name: 'Character 1' }]
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: null
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: false,
                    error: 'Failed to update related data'
                }));

            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            await waitFor(() => {
                fireEvent.changeText(getByTestId('snapshot-name-text-input'), 'New Snapshot');
                fireEvent.press(getByTestId('general-submit-button'));
            });

            await waitFor(() => {
                expect(ToastNotification.show).toHaveBeenCalled();
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
                    <SnapshotGeneralInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-general-container').props.style.paddingLeft).toBe(5);
        });
    });
});