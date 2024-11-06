import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotGeneralInfo from '../pages/SnapshotGeneralInfo';
import { useNavigation } from '@react-navigation/native';

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

// Mock the route prop that checkes is snapshot is getting added or edited
const mockRoute = {
    params: {
        isNewSnapshot: true
    }
};

// Mock the SelectList component
jest.mock('react-native-dropdown-select-list', () => ({
    SelectList: ({ setSelected, data, placeholder, testID }) => (
        <MockSelectList setSelected={setSelected} data={data} placeholder={placeholder} testID={testID} />
    ),
}));

// Updated mock implementation of SelectList
const MockSelectList = ({ setSelected, data, placeholder, testID }) => (
    <div>
        <button testID={`${testID}-dropdown`} data-placeholder={placeholder}>
            {placeholder}
        </button>
        {data.map((item) => (
            <button
                key={item.key}
                testID={`${testID}-item-${item.key}`}
                onPress={() => setSelected(item.key, item.value)}
            >
                {item.value}
            </button>
        ))}
    </div>
);

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    NavigationContainer: ({ children }) => children
}));

describe('SnapshotGeneralInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly for new snapshot', async () => {
        const { getByText, getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);

        await waitFor(() => {
            expect(getByText('Add New Snapshot')).toBeTruthy();
            expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
            expect(getByTestId('episode-number-text-input')).toBeTruthy();
            expect(getByTestId('scene-number-text-input')).toBeTruthy();
            expect(getByTestId('story-day-text-input')).toBeTruthy();
            expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
        });
    });

    it('should render correctly for editing snapshot', async () => {
        const { getByText, getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

        await waitFor(() => {
            expect(getByText('Edit Snapshot')).toBeTruthy();
            expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
            expect(getByTestId('episode-number-text-input')).toBeTruthy();
            expect(getByTestId('scene-number-text-input')).toBeTruthy();
            expect(getByTestId('story-day-text-input')).toBeTruthy();
            expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
        });
    });

    it('should allow input in text fields', async () => {

        await waitFor(() => {
            const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
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
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);

        await waitFor(() => {
            fireEvent.changeText(getByTestId('snapshot-notes-text-input'), 'Line 1\nLine 2\nLine 3');
            expect(getByTestId('snapshot-notes-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
        });
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from a new Snapshot', async () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);

        await waitFor(() => {
            fireEvent.press(getByTestId('general-cancel-button'));
            expect(mockNavigate).toHaveBeenCalledWith('Space');
        });
    });

    it('should navigate to the "Snapshot" screen when a Cancel button is pressed from an edited Snapshot', async () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

        await waitFor(() => {
            fireEvent.press(getByTestId('general-cancel-button'));
            expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
        });
    });

    // TODO Write a test for when pressing the submit button in the form
    // TODO Write a test for when pressing the submit button in the new character modal

    // Dropdown Tests
    it('should render the Character SelectList and handle selection', async () => {
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
        
        await waitFor(() => {
            // Check if dropdown button is present and has correct placeholder
            const dropdownButton = getByTestId('character-select-dropdown');
            expect(dropdownButton.props['data-placeholder']).toBe('Character');
            
            // Check if first item is present (Add New Character option)
            const addNewCharacterOption = getByTestId('character-select-item-1');
            expect(addNewCharacterOption).toBeTruthy();
        });
    });
    
    it('should handle character selection', async () => {
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
        
        await waitFor(() => {
            const dropdownButton = getByTestId('character-select-dropdown');
            expect(dropdownButton).toBeTruthy();
            
            // Select a character
            const characterOption = getByTestId('character-select-item-2');
            fireEvent.press(characterOption);
            
            // Verify the selection
            expect(dropdownButton.props['data-placeholder']).toBe('Character');
        });
    });

    it('should open Add New Character modal when selected', async () => {
        const { getByTestId, getByText } = render(<SnapshotGeneralInfo route={mockRoute} />);
        
        await waitFor(() => {
            const dropdownButton = getByTestId('character-select-dropdown');
            expect(dropdownButton).toBeTruthy();
        });
    
        // Select "Add New Character" option
        const addNewOption = getByTestId('character-select-item-1');
        fireEvent.press(addNewOption);
    
        await waitFor(() => {
            // Verify modal is shown
            expect(getByText('Add New Character:')).toBeTruthy();
        });
    });

    it('should open the add new character modal, select the Add New Character option and create new character', async () => {
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
    
        const { getByTestId, getByText, queryByText, getByLabelText } = render(
            <SnapshotGeneralInfo route={mockRoute} />
        );
        
        // Wait for the dropdown to be loaded with initial data
        await waitFor(() => {
            const dropdownButton = getByTestId('character-select-dropdown');
            expect(dropdownButton).toBeTruthy();
        });
    
        fireEvent.press(getByTestId('character-select-dropdown'));
        fireEvent.press(getByTestId('character-select-item-1'));
    
        // Wait for modal to be visible and verify
        await waitFor(() => {
            expect(getByLabelText('Add New Character:')).toBeTruthy();
        });
    
        const nameInput = getByTestId('character-name-text-input');
        fireEvent.changeText(nameInput, 'New Test Character');
    
        fireEvent.press(getByTestId('add-new-character-submit-button'));
    
        await waitFor(() => {
            // Verify initial characters load
            expect(apiMock).toHaveBeenNthCalledWith(1, '/character/space/1', 'GET');
            
            // Verify character creation API call
            expect(apiMock).toHaveBeenNthCalledWith(2, '/character/', 'POST', {
                name: 'New Test Character',
                spaceId: 1
            });
    
            // Verify refresh characters call
            expect(apiMock).toHaveBeenNthCalledWith(3, '/character/space/1', 'GET');
    
            // Verify modal is closed
            expect(queryByText('Add New Character:')).toBeNull();
        });
    });

    // TODO Add test for when character is selected?

    it('should successfully create a new snapshot', async () => {
        const apiMock = require('../api/api').default;

        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });
        
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
                    episode: '1',
                    scene: '2',
                    storyDay: '3',
                    character: 2,
                    notes: 'Test notes'
                }
            }));
    
        const { getByTestId, getByText } = render(
            <SnapshotGeneralInfo route={mockRoute} />
        );
        
        await waitFor(() => {
            expect(getByText('Add New Snapshot')).toBeTruthy();
        });
    
        const nameInput = getByTestId('snapshot-name-text-input');
        const episodeInput = getByTestId('episode-number-text-input');
        const sceneInput = getByTestId('scene-number-text-input');
        const storyDayInput = getByTestId('story-day-text-input');
        const notesInput = getByTestId('snapshot-notes-text-input');
    
        fireEvent.changeText(nameInput, 'New Test Snapshot');
        fireEvent.changeText(episodeInput, '1');
        fireEvent.changeText(sceneInput, '2');
        fireEvent.changeText(storyDayInput, '3');
        fireEvent.changeText(notesInput, 'Test notes');
    
        await waitFor(() => {
            const dropdownButton = getByTestId('character-select-dropdown');
            fireEvent.press(dropdownButton);
        });
    
        fireEvent.press(getByTestId('character-select-item-2'));
    
        fireEvent.press(getByTestId('general-submit-button'));
    
        await waitFor(() => {
            expect(apiMock).toHaveBeenNthCalledWith(1, '/character/space/1', 'GET');
            
            expect(apiMock).toHaveBeenNthCalledWith(2, '/snapshot/', 'POST', {
                name: 'New Test Snapshot',
                episode: '1',
                scene: '2',
                storyDay: '3',
                character: 2,
                notes: 'Test notes'
            });
    
            expect(mockNavigate).toHaveBeenCalledWith('Space');
        });
    });
});