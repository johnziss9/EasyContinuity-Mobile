import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../pages/Dashboard';
import { NavigationContainer, useNavigation } from '@react-navigation/native';

// Mock the API handling
jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: [
            { id: 1, name: 'Goodfellas', type: 'Movie' },
            { id: 2, name: 'The Last of Us', type: 'Series' }
        ]
    }))
}));

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

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TODO Add test for api error 
    // TODO Add test for network error
    // TODO Add test for errro when creating a new space

    it('should render the component and have an "Add New" button', async () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>);

        await waitFor(() => {
            expect(getByTestId('add-space-button')).toBeTruthy();
        });
    });

    it('should render space components from API data', async () => {
        const { getAllByTestId, queryByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getAllByTestId('space-card-component')).toHaveLength(2);
            expect(queryByText('Goodfellas')).toBeTruthy();
            expect(queryByText('The Last of Us')).toBeTruthy();
        });
    });

    it('should show "No Spaces" message when API returns empty array', async () => {
        // Override the API mock for this test
        const apiMock = require('../api/api').default;
        apiMock.mockImplementationOnce(() =>
            Promise.resolve({
                success: true,
                data: []
            })
        );

        const { getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('No Spaces Yet')).toBeTruthy();
            expect(getByText('Get started by pressing the + button below to create your first space.')).toBeTruthy();
        });
    });

    it('should open the add new space modal when the "Add New" button is pressed', async () => {
        const { getByTestId, getByLabelText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        await waitFor(() => {
            expect(getByLabelText('Enter Space Name:')).toBeTruthy();
            expect(getByTestId('space-name-text-input')).toBeTruthy();
            expect(getByTestId('add-space-cancel-button')).toBeTruthy();
            expect(getByTestId('add-space-submit-button')).toBeTruthy();
            expect(getByTestId('space-type-select-dropdown').props['data-placeholder']).toBe('Type');
        });
    });

    it('should handle modal open and close on cancel', async () => {
        const { getByTestId, getByLabelText, queryByText, queryByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

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

    it('should navigate to the "Space" screen when a Space component is pressed', async () => {
        const mockNavigate = jest.fn();
        useNavigation.mockReturnValue({ navigate: mockNavigate });

        const { getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByText('Goodfellas'));
            expect(mockNavigate).toHaveBeenCalledWith('Space', {
                id: 1,
                spaceName: 'Goodfellas'
            });
        });
    });

    it('should fetch and display spaces data on component mount', async () => {
        const apiMock = require('../api/api').default;

        const { getAllByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            // Verify API was called with correct parameters
            expect(apiMock).toHaveBeenCalledWith('/space', 'GET');
            expect(apiMock).toHaveBeenCalledTimes(1);

            // Verify data was rendered
            const spaceCards = getAllByTestId('space-card-component');
            expect(spaceCards).toHaveLength(2);

            // Verify correct data was passed to the API mock
            const mockResponse = apiMock.mock.results[0].value;
            expect(mockResponse).resolves.toEqual({
                success: true,
                data: [
                    { id: 1, name: 'Goodfellas', type: 'Movie' },
                    { id: 2, name: 'The Last of Us', type: 'Series' }
                ]
            });
        });
    });

    // TODO this needs to be modified to fetch folders by space id
    it('should successfully create a new space', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Goodfellas', type: 'Movie' },
                    { id: 2, name: 'The Last of Us', type: 'Series' }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 3, name: 'Mr. Robot', type: 'Series' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Goodfellas', type: 'Movie' },
                    { id: 2, name: 'The Last of Us', type: 'Series' },
                    { id: 3, name: 'Mr. Robot', type: 'Series' }
                ]
            }));

        const { getByTestId, getByText, queryByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        await waitFor(() => {
            const nameInput = getByTestId('space-name-text-input');
            fireEvent.changeText(nameInput, 'Mr. Robot');

            const typeDropdown = getByTestId('space-type-select-dropdown');
            fireEvent.press(typeDropdown);
            const movieOption = getByTestId('space-type-select-item-2');
            fireEvent.press(movieOption);
        });

        // Submit form
        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/space/', 'POST', {
                name: 'Mr. Robot',
                type: 'Series'
            });

            expect(apiMock).toHaveBeenCalledWith('/space', 'GET');
            expect(queryByText('Enter Space Name:')).toBeNull();
            expect(getByText('Mr. Robot')).toBeTruthy();
        });
    });

    it('should clear form inputs when modal is cancelled', async () => {
        const { getByTestId, queryByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        const nameInput = getByTestId('space-name-text-input');
        fireEvent.changeText(nameInput, 'Test Space');

        fireEvent.press(getByTestId('add-space-cancel-button'));

        fireEvent.press(getByTestId('add-space-button'));
        const newNameInput = getByTestId('space-name-text-input');
        expect(newNameInput.props.value).toBe('');
    });


    it('should correctly select space type from dropdown', async () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        const typeDropdown = getByTestId('space-type-select-dropdown');
        fireEvent.press(typeDropdown);

        const movieOption = getByTestId('space-type-select-item-1');
        fireEvent.press(movieOption);

        const nameInput = getByTestId('space-name-text-input');
        fireEvent.changeText(nameInput, 'Test Movie');

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            const apiMock = require('../api/api').default;
            expect(apiMock).toHaveBeenCalledWith('/space/', 'POST', {
                name: 'Test Movie',
                type: 'Movie'
            });
        });
    });
})