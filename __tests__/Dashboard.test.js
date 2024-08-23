import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../pages/Dashboard';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
    NavigationContainer: ({ children }) => children
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('Dashboard Component', () => {
    it('should render the component', () => {
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
        expect(getAllByTestId('space-component')).toHaveLength(2);
    });

    it('should have an "Add New" button', () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        expect(getByTestId('add-space-button')).toBeTruthy();
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
        });
    });

    it('should close the add new space modal when the "Cancel" button is pressed', () => {
        const { getByTestId, queryByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);
        fireEvent.press(getByTestId('add-space-button'));
        fireEvent.press(getByTestId('add-space-cancel-button'));
        expect(queryByText('Enter Space Name:')).toBeNull();
    });

    it('should navigate to the "Home" screen when a Space component is pressed', () => {
        const mockNavigate = jest.fn();

        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);

        fireEvent.press(getByText('House of the Dragons'));

        expect(mockNavigate).toHaveBeenCalledWith('Home');
    });
})