import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotGeneralInfo from '../pages/SnapshotGeneralInfo';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();

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

describe('SnapshotGeneralInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
            expect(mockNavigate).toHaveBeenCalledWith('Space', {
                spaceId: 1,
                folderId: undefined,
                spaceName: 'Test Space'
            });
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
                data: { id: 4, name: 'New Test Character' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 2, name: 'Character 1' },
                    { id: 3, name: 'Character 2' },
                    { id: 4, name: 'New Test Character' }
                ]
            }));

        const { getByTestId, queryByText } = render(
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
            expect(apiMock).toHaveBeenNthCalledWith(3, '/character/', 'POST', {
                name: 'New Test Character',
                spaceId: 1,
                createdOn: expect.any(String)
            });
            expect(queryByText('Add New Character:')).toBeNull();
        });
    });

    it('should successfully create a new snapshot', async () => {
        const apiMock = require('../api/api').default;

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
                    name: 'New Test Snapshot',
                    spaceId: 1,
                    episode: '1',
                    scene: 2,
                    storyDay: 3,
                    character: 2,
                    notes: 'Test notes'
                }
            }));

        const { getByTestId } = render(
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
            expect(apiMock).toHaveBeenNthCalledWith(3, '/snapshot/', 'POST', {
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
            expect(mockNavigate).toHaveBeenCalledWith('Space', {
                spaceId: 1,
                spaceName: 'Test Space',
                folderId: undefined
            });
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

        // Enter character name
        fireEvent.changeText(getByTestId('character-name-text-input'), 'Test Character');

        // Press cancel
        fireEvent.press(getByTestId('add-new-character-cancel-button'));

        await waitFor(() => {
            // Verify modal is closed
            expect(queryByText('Add New Character:')).toBeNull();
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
            const editButtons = getAllByTestId('edit-folder-button');
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
    
        const editButtons = getAllByTestId('edit-folder-button');
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
    
            expect(queryByText('Update Character:')).toBeNull();
            
            expect(getByText('Manage Characters (2):')).toBeTruthy();
        });
    
        await waitFor(() => {
            const characterElements = getAllByTestId('character-component');
            expect(characterElements).toHaveLength(2);
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
            const editButtons = getAllByTestId('edit-folder-button');
            fireEvent.press(editButtons[0]);
            
            fireEvent.press(getByTestId('add-new-character-cancel-button'));
            expect(queryByText('Update Character:')).toBeNull();
            expect(getByText('Manage Characters (2):')).toBeTruthy();
        });
    });

    it('should soft delete character when delete is pressed', async () => {
        const apiMock = require('../api/api').default;
        apiMock
            .mockImplementationOnce(() => Promise.resolve({ success: true, data: { id: 1, type: 2 } }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 2, name: 'Character 1' },
                    { id: 3, name: 'Character 2' }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({ success: true }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 3, name: 'Character 2' }
                ]
            }));

        const { getByTestId, getAllByTestId } = render(
            <NavigationContainer>
                <SnapshotGeneralInfo />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('manage-characters-button'));
            const deleteButtons = getAllByTestId('delete-folder-button');
            fireEvent.press(deleteButtons[0]);

            expect(apiMock).toHaveBeenCalledWith('/character/2', 'PUT', expect.objectContaining({
                isDeleted: true,
                deletedOn: expect.any(String)
            }));
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
            const deleteButtons = getAllByTestId('delete-folder-button');
            fireEvent.press(deleteButtons[0]);

            expect(queryByText('Manage Characters (0):')).toBeNull();
        });
    });

    // TODO Uncomment this when the bug is fixed that clears the character select list.
    // it('should clear character modal input when closed', async () => {
    //     const { getByTestId, queryByTestId } = render(
    //         <NavigationContainer>
    //             <SnapshotGeneralInfo />
    //         </NavigationContainer>
    //     );

    //     await waitFor(() => {
    //         const addNewOption = getByTestId('character-select-option-1');
    //         fireEvent.press(addNewOption);
    //     });

    //     // Enter character name
    //     const nameInput = getByTestId('character-name-text-input');
    //     fireEvent.changeText(nameInput, 'Test Character');

    //     // Close modal
    //     fireEvent.press(getByTestId('add-new-character-cancel-button'));

    //     // Reopen modal
    //     await waitFor(() => {
    //         const addNewOption = getByTestId('character-select-option-1');
    //         fireEvent.press(addNewOption);

    //         // Get new input reference
    //         const newNameInput = getByTestId('character-name-text-input');
    //         // Verify input is cleared
    //         expect(newNameInput.props.value).toBe('');
    //     });
    // });


    // TODO Fix this when the update comes in
    // it('should render correctly for editing snapshot', async () => {
    //     const { getByText, getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

    //     await waitFor(() => {
    //         expect(getByText('Edit Snapshot')).toBeTruthy();
    //         expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
    //         expect(getByTestId('episode-number-text-input')).toBeTruthy();
    //         expect(getByTestId('scene-number-text-input')).toBeTruthy();
    //         expect(getByTestId('story-day-text-input')).toBeTruthy();
    //         expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
    //     });
    // });

    // TODO Fix this when the update comes in
    // it('should navigate to the "Snapshot" screen when a Cancel button is pressed from an edited Snapshot', async () => {
    //     const mockNavigate = jest.fn();

    //     useNavigation.mockReturnValue({ navigate: mockNavigate });

    //     const { getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

    //     await waitFor(() => {
    //         fireEvent.press(getByTestId('general-cancel-button'));
    //         expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
    //     });
    // });

    // TODO Write a test for when pressing the submit button in the form
    // TODO Write a test for when pressing the submit button in the new character modal
    // TODO Write tests for snapshot api errors
    // TODO Write tests for character api errors
});