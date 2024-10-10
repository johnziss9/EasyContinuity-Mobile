import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotGeneralInfo from '../pages/SnapshotGeneralInfo';
import { useNavigation } from '@react-navigation/native';

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

afterEach(() => {
    jest.clearAllMocks();
});

describe('SnapshotGeneralInfo', () => {
    it('should render correctly for new snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);

        expect(getByText('Add New Snapshot')).toBeTruthy();
        expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
        expect(getByTestId('episode-number-text-input')).toBeTruthy();
        expect(getByTestId('scene-number-text-input')).toBeTruthy();
        expect(getByTestId('story-day-text-input')).toBeTruthy();
        expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
    });

    it('should render correctly for editing snapshot', () => {
        const { getByText, getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

        expect(getByText('Edit Snapshot')).toBeTruthy();
        expect(getByTestId('snapshot-name-text-input')).toBeTruthy();
        expect(getByTestId('episode-number-text-input')).toBeTruthy();
        expect(getByTestId('scene-number-text-input')).toBeTruthy();
        expect(getByTestId('story-day-text-input')).toBeTruthy();
        expect(getByTestId('snapshot-notes-text-input')).toBeTruthy();
    });

    it('should allow input in text fields', () => {
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

    it('should allow multi-line input in notes field', () => {
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
        fireEvent.changeText(getByTestId('snapshot-notes-text-input'), 'Line 1\nLine 2\nLine 3');
        expect(getByTestId('snapshot-notes-text-input').props.value).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from a new Snapshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);

        fireEvent.press(getByTestId('general-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Space');
    });

    it('should navigate to the "Space" screen when a Cancel button is pressed from an edited Snapshot', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByTestId } = render(<SnapshotGeneralInfo route={{ params: { isNewSnapshot: false } }} />);

        fireEvent.press(getByTestId('general-cancel-button'));

        expect(mockNavigate).toHaveBeenCalledWith('Snapshot');
    });

    // TODO Write a test for when pressing the submit button in the form
    // TODO Write a test for when pressing the submit button in the new actor modal
    // TODO Write a test for when pressing the submit button in the new character modal

    // Dropdown Tests
    it('should render the Actor SelectList with correct placeholder', () => {
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
        const actorSelectDropdown = getByTestId('actor-select-dropdown');
        expect(actorSelectDropdown.props['data-placeholder']).toBe('Actor Name');
    });

    it('should render the Character SelectList with correct placeholder', () => {
        const { getByTestId } = render(<SnapshotGeneralInfo route={mockRoute} />);
        const characterSelectDropdown = getByTestId('character-select-dropdown');
        expect(characterSelectDropdown.props['data-placeholder']).toBe('Character');
    });

    it('should open the Add New Actor modal when "Add New Actor" is selected', async () => {
        const { getByTestId, getByText } = render(<SnapshotGeneralInfo route={mockRoute} />);

        fireEvent.press(getByTestId('actor-select-dropdown'));

        await waitFor(() => {
            fireEvent.press(getByTestId('actor-select-item-1'));
        });

        expect(getByText('Add New Actor:')).toBeTruthy();
    });

    it('should open the Add New Character modal when "Add New Character" is selected', async () => {
        const { getByTestId, getByText } = render(<SnapshotGeneralInfo route={mockRoute} />);

        fireEvent.press(getByTestId('character-select-dropdown'));

        await waitFor(() => {
            fireEvent.press(getByTestId('character-select-item-1'));
        });

        expect(getByText('Add New Character:')).toBeTruthy();
    });

    it('should open the Add New Actor modal when "Add New Actor" is selected and close it when "Cancel is pressed', async () => {
        const { getByTestId, getByText, queryByText } = render(<SnapshotGeneralInfo route={mockRoute} />);

        fireEvent.press(getByTestId('actor-select-dropdown'));

        await waitFor(() => {
            fireEvent.press(getByTestId('actor-select-item-1'));
        });

        expect(getByText('Add New Actor:')).toBeTruthy();

        fireEvent.press(getByTestId('add-new-actor-cancel-button'));

        expect(queryByText('Add New Actor:')).toBeNull();
    });

    it('should open the Add New Character modal when "Add New Character" is selected and close it when "Cancel is pressed', async () => {
        const { getByTestId, getByText, queryByText } = render(<SnapshotGeneralInfo route={mockRoute} />);

        fireEvent.press(getByTestId('character-select-dropdown'));

        await waitFor(() => {
            fireEvent.press(getByTestId('character-select-item-1'));
        });

        expect(getByText('Add New Character:')).toBeTruthy();

        fireEvent.press(getByTestId('add-new-character-cancel-button'));

        expect(queryByText('Add New Character:')).toBeNull();
    });

    // TODO Add test for when actor is selected?
    // TODO Add test for when character is selected?
});