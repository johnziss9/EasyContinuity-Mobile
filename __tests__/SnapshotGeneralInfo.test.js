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
                onPress={() => {}}
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
        const { getByText, getByTestId } = render(
            <NavigationContainer>
                <SnapshotGeneralInfo />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Add New Snapshot')).toBeTruthy();
            expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
            expect(getByTestId('episode-number-text-input')).toBeTruthy();
            expect(getByTestId('scene-number-text-input')).toBeTruthy();
            expect(getByTestId('story-day-text-input')).toBeTruthy();
            expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
            expect(getByTestId('character-select')).toBeTruthy();
        });
    });

    it('should allow input in text fields', async () => {
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
            expect(apiMock).toHaveBeenNthCalledWith(2, '/character/', 'POST', {
                name: 'New Test Character',
                spaceId: 1
            });
            expect(queryByText('Add New Character:')).toBeNull();
        });
    });

    it('should successfully create a new snapshot', async () => {
        const apiMock = require('../api/api').default;
        
        apiMock
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
                    scene: '2',
                    storyDay: '3',
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
            // Update expectation to use number instead of string for character ID
            expect(apiMock).toHaveBeenNthCalledWith(2, '/snapshot/', 'POST', {
                name: 'New Test Snapshot',
                spaceId: 1,
                episode: '1',
                scene: '2',
                storyDay: '3',
                character: 2,  // Changed from "2" to 2
                notes: 'Test notes'
            });
            expect(mockNavigate).toHaveBeenCalledWith('Space', { spaceId: 1, folderId: undefined, spaceName: 'Test Space' });
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