import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../pages/Dashboard';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

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

describe('Dashboard', () => {

    // TODO Add tests for the actual space cards that will come from the database or just mock some for testing
    // TODO Add test for what the Submit button does on the modal
    // TODO Add test for where the space card takes the user when pressed.

    it('should render the component and have an "Add New" button', () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        
        expect(getByTestId('add-space-button')).toBeTruthy();
    });

    it('should render two Space components', () => {
        const { getAllByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        
        expect(getAllByTestId('space-card-component')).toHaveLength(2);
    });

    it('should open the add new space modal when the "Add New" button is pressed', async () => {
        const { getByTestId, getByLabelText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        
        fireEvent.press(getByTestId('add-space-button'));

        await waitFor(() => {
            expect(getByLabelText('Enter Space Name:')).toBeTruthy();
            expect(getByTestId('space-name-text-input')).toBeTruthy();
            expect(getByTestId('add-space-cancel-button')).toBeTruthy();
            expect(getByTestId('add-space-submit-button')).toBeTruthy();
            expect(getByTestId('space-type-select-dropdown').props['data-placeholder']).toBe('Type');
        });
    });

    it('should open the add new space modal when the "Add New" button is pressed and close it when "Cancel" is pressed', async () => {
        const { getByTestId, getByLabelText, queryByText, queryByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        
        fireEvent.press(getByTestId('add-space-button'));

        await waitFor(() => {
            expect(getByLabelText('Enter Space Name:')).toBeTruthy();
            expect(getByTestId('space-name-text-input')).toBeTruthy();
            expect(getByTestId('add-space-cancel-button')).toBeTruthy();
            expect(getByTestId('add-space-submit-button')).toBeTruthy();
            expect(getByTestId('space-type-select-dropdown').props['data-placeholder']).toBe('Type');
        });

        fireEvent.press(getByTestId('add-space-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Enter Space Name:')).toBeNull();
            expect(queryByTestId('space-name-text-input')).toBeNull();
            expect(queryByTestId('add-space-cancel-button')).toBeNull();
            expect(queryByTestId('add-space-submit-button')).toBeNull();
            expect(queryByTestId('space-type-select-dropdown')).toBeNull();
        });
    });

    // TODO Add test for when the submit button is pressed inside the modal

    it('should close the add new space modal when the "Cancel" button is pressed', () => {
        const { getByTestId, queryByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);

        fireEvent.press(getByTestId('add-space-button'));
        fireEvent.press(getByTestId('add-space-cancel-button'));
        
        expect(queryByText('Enter Space Name:')).toBeNull();
    });

    it('should navigate to the "Space" screen when a Space component is pressed', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);

        fireEvent.press(getByText('House of the Dragons'));

        expect(mockNavigate).toHaveBeenCalledWith('Space');
    });
})