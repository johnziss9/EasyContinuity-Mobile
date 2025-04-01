import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Dashboard from '../pages/Dashboard';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import ToastNotification from '../utils/ToastNotification';

// Mock the API handling
jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: [
            { id: 1, name: 'Goodfellas', type: 'Movie', description: 'Classic mob movie' },
            { id: 2, name: 'The Last of Us', type: 'Series', description: 'Post-apocalyptic drama' }
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

jest.mock('../utils/ToastNotification', () => ({
    show: jest.fn()
}));

describe('Dashboard', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ToastNotification.show.mockClear();
    });

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
            // Verify basic rendering
            const spaceCards = getAllByTestId('space-card-component');
            expect(spaceCards).toHaveLength(2);

            // Verify the space names are displayed
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
            expect(getByLabelText('Add Space:')).toBeTruthy();
            expect(getByTestId('space-name-text-input')).toBeTruthy();
            expect(getByTestId('space-description-text-input')).toBeTruthy();
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
            expect(getByLabelText('Add Space:')).toBeTruthy();
            expect(getByTestId('space-name-text-input')).toBeTruthy();
            expect(getByTestId('add-space-cancel-button')).toBeTruthy();
            expect(getByTestId('add-space-submit-button')).toBeTruthy();
            expect(getByTestId('space-type-select-dropdown').props['data-placeholder']).toBe('Type');
        });

        fireEvent.press(getByTestId('add-space-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Add Space:')).toBeNull();
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
                spaceId: 1,
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
                    { id: 1, name: 'Goodfellas', type: 'Movie', description: 'Classic mob movie' },
                    { id: 2, name: 'The Last of Us', type: 'Series', description: 'Post-apocalyptic drama' }
                ]
            });
        });
    });

    it('should successfully create a new space', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Goodfellas', type: '1', description: 'Old movie' },
                    { id: 2, name: 'The Last of Us', type: '2', description: 'New series' }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 3, name: 'Mr. Robot', type: '2', description: 'Hacker series' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Goodfellas', type: '1', description: 'Old movie' },
                    { id: 2, name: 'The Last of Us', type: '2', description: 'New series' },
                    { id: 3, name: 'Mr. Robot', type: '2', description: 'Hacker series' }
                ]
            }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        await waitFor(() => {
            const nameInput = getByTestId('space-name-text-input');
            const descriptionInput = getByTestId('space-description-text-input');
            fireEvent.changeText(nameInput, 'Mr. Robot');
            fireEvent.changeText(descriptionInput, 'Hacker series');

            const typeDropdown = getByTestId('space-type-select-dropdown');
            fireEvent.press(typeDropdown);
            const seriesOption = getByTestId('space-type-select-item-2');
            fireEvent.press(seriesOption);
        });

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/space/', 'POST', {
                name: 'Mr. Robot',
                type: '2',
                description: 'Hacker series',
                createdOn: expect.any(String)
            });

            expect(apiMock).toHaveBeenCalledWith('/space', 'GET');
            expect(getByText('Mr. Robot')).toBeTruthy();

            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Space Added Successfully'
            );
        });
    });

    it('should clear form inputs when modal is cancelled', async () => {
        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        const nameInput = getByTestId('space-name-text-input');
        const descriptionInput = getByTestId('space-description-text-input');

        fireEvent.changeText(nameInput, 'Test Space');
        fireEvent.changeText(descriptionInput, 'Test Description');

        fireEvent.press(getByTestId('add-space-cancel-button'));

        fireEvent.press(getByTestId('add-space-button'));
        const newNameInput = getByTestId('space-name-text-input');
        const newDescriptionInput = getByTestId('space-description-text-input');

        expect(newNameInput.props.value).toBe('');
        expect(newDescriptionInput.props.value).toBe('');
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
                type: '1',
                description: '',
                createdOn: expect.any(String)
            });
        });
    });

    it('should handle editing a space correctly', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Test Space', type: '1', description: 'Original description' }
                ]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { id: 1, name: 'Updated Space', type: '2', description: 'Updated description' }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [
                    { id: 1, name: 'Updated Space', type: '2', description: 'Updated description' }
                ]
            }));

        const { getByTestId, getByText, findByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        // Wait for initial render
        await waitFor(() => {
            expect(getByText('Test Space')).toBeTruthy();
        });

        fireEvent.press(getByTestId('edit-space-button'));

        // Verify initial form values
        await waitFor(() => {
            const nameInput = getByTestId('space-name-text-input');
            const descriptionInput = getByTestId('space-description-text-input');
            expect(nameInput.props.value).toBe('Test Space');
            expect(descriptionInput.props.value).toBe('Original description');
        });

        fireEvent.changeText(getByTestId('space-name-text-input'), 'Updated Space');
        fireEvent.changeText(getByTestId('space-description-text-input'), 'Updated description');

        fireEvent.press(getByTestId('add-space-submit-button'));

        // Verify the space was updated
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith('/space/1', 'PUT', {
                name: 'Updated Space',
                type: '1',
                description: 'Updated description',
                lastUpdatedOn: expect.any(String)
            });
            expect(getByText('Updated Space')).toBeTruthy();
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Space Updated Successfully'
            );
        });
    });

    it('should display correct type in edit mode', async () => {
        const apiMock = require('../api/api').default;

        apiMock.mockImplementationOnce(() => Promise.resolve({
            success: true,
            data: [
                { id: 1, name: 'Test Space', type: '1' }
            ]
        }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Test Space')).toBeTruthy();
        });

        fireEvent.press(getByTestId('edit-space-button'));

        await waitFor(() => {
            const movieOption = getByTestId('space-type-select-item-1');
            expect(Array.isArray(movieOption.children) ? movieOption.children[0] : movieOption.children).toBe('Movie');
        });
    });

    it('should cancel edit operation correctly', async () => {
        const apiMock = require('../api/api').default;

        apiMock.mockImplementationOnce(() => Promise.resolve({
            success: true,
            data: [
                { id: 1, name: 'Original Name', type: '1' }
            ]
        }));

        const { getByTestId, getByText, queryByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Original Name')).toBeTruthy();
        });

        fireEvent.press(getByTestId('edit-space-button'));

        fireEvent.changeText(getByTestId('space-name-text-input'), 'Changed Name');

        fireEvent.press(getByTestId('add-space-cancel-button'));

        await waitFor(() => {
            expect(queryByTestId('space-name-text-input')).toBeNull();
            expect(getByText('Original Name')).toBeTruthy();
            expect(apiMock).toHaveBeenCalledTimes(1);
        });
    });

    it('should handle deleting a space correctly', async () => {
        // Mock the date
        const mockDate = new Date('2024-12-17T07:19:09.984Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const apiMock = require('../api/api').default;

        const mockSpace = {
            id: 1,
            name: 'Space to Delete',
            type: '1'
        };

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [mockSpace]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: { ...mockSpace, isDeleted: true }
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }));

        const { getByTestId, queryByText, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Space to Delete')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-space-button'));
        expect(getByText('Delete Space?')).toBeTruthy();
        fireEvent.press(getByTestId('delete-space-confirm-button'));

        await waitFor(() => {
            expect(apiMock).toHaveBeenNthCalledWith(2, '/space/1', 'PUT', {
                name: 'Space to Delete',
                type: '1',
                isDeleted: true,
                deletedOn: mockDate.toISOString()
            });

            expect(queryByText('Space to Delete')).toBeNull();
            expect(getByText('No Spaces Yet')).toBeTruthy();
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Space Deleted Successfully'
            );
        });

        expect(apiMock).toHaveBeenCalledTimes(3);

        // Clean up
        jest.restoreAllMocks();
    });

    it('should cancel space deletion when cancel is pressed', async () => {
        // Mock the date
        const mockDate = new Date('2024-12-17T07:19:09.984Z');
        jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

        const apiMock = require('../api/api').default;

        const mockSpace = {
            id: 1,
            name: 'Space to Not Delete',
            type: '1'
        };

        apiMock.mockImplementationOnce(() => Promise.resolve({
            success: true,
            data: [mockSpace]
        }));

        const { getByTestId, queryByText, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Space to Not Delete')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-space-button'));

        await waitFor(() => {
            expect(getByText('Delete Space?')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-space-cancel-button'));

        await waitFor(() => {
            expect(queryByText('Delete Space?')).toBeNull();
            expect(getByText('Space to Not Delete')).toBeTruthy();
            expect(apiMock).toHaveBeenCalledTimes(1);
        });

        jest.restoreAllMocks();
    });

    // Test for API error during initial load of spaces
    it('should show error toast when API returns unsuccessful response during fetch', async () => {
        const apiMock = require('../api/api').default;

        apiMock.mockImplementationOnce(() => Promise.resolve({
            success: false,
            error: 'Failed to fetch spaces'
        }));

        render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to fetch spaces'
            );
        });
    });

    // Test for network error during initial load of spaces
    it('should show error toast when fetch throws network error', async () => {
        const apiMock = require('../api/api').default;

        apiMock.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to load spaces'
            );
        });
    });

    // Test for API error when creating a new space
    it('should show error toast when create space API returns unsuccessful response', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Space creation failed'
            }));

        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        fireEvent.changeText(getByTestId('space-name-text-input'), 'New Space');

        const typeDropdown = getByTestId('space-type-select-dropdown');
        fireEvent.press(typeDropdown);
        const movieOption = getByTestId('space-type-select-item-1');
        fireEvent.press(movieOption);

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Space creation failed'
            );
        });
    });

    // Test for network error when creating a new space
    it('should show error toast when create space throws network error', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: []
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            fireEvent.press(getByTestId('add-space-button'));
        });

        fireEvent.changeText(getByTestId('space-name-text-input'), 'New Space');

        const typeDropdown = getByTestId('space-type-select-dropdown');
        fireEvent.press(typeDropdown);
        const movieOption = getByTestId('space-type-select-item-1');
        fireEvent.press(movieOption);

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to add space'
            );
        });
    });

    // Test for API error when updating a space
    it('should show error toast when update space API returns unsuccessful response', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Original Name', type: '1', description: 'Original description' }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Space update failed'
            }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Original Name')).toBeTruthy();
        });

        fireEvent.press(getByTestId('edit-space-button'));

        fireEvent.changeText(getByTestId('space-name-text-input'), 'Updated Name');

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Space update failed'
            );
        });
    });

    // Test for network error when updating a space
    it('should show error toast when update space throws network error', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Original Name', type: '1', description: 'Original description' }]
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Original Name')).toBeTruthy();
        });

        fireEvent.press(getByTestId('edit-space-button'));

        fireEvent.changeText(getByTestId('space-name-text-input'), 'Updated Name');

        fireEvent.press(getByTestId('add-space-submit-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to update space'
            );
        });
    });

    // Test for API error when deleting a space
    it('should show error toast when delete space API returns unsuccessful response', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Space to Delete', type: '1' }]
            }))
            .mockImplementationOnce(() => Promise.resolve({
                success: false,
                error: 'Space deletion failed'
            }));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Space to Delete')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-space-button'));

        fireEvent.press(getByTestId('delete-space-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Space deletion failed'
            );
        });
    });

    // Test for network error when deleting a space
    it('should show error toast when delete space throws network error', async () => {
        const apiMock = require('../api/api').default;

        apiMock
            .mockImplementationOnce(() => Promise.resolve({
                success: true,
                data: [{ id: 1, name: 'Space to Delete', type: '1' }]
            }))
            .mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        const { getByTestId, getByText } = render(
            <NavigationContainer>
                <Dashboard />
            </NavigationContainer>
        );

        await waitFor(() => {
            expect(getByText('Space to Delete')).toBeTruthy();
        });

        fireEvent.press(getByTestId('delete-space-button'));

        fireEvent.press(getByTestId('delete-space-confirm-button'));

        await waitFor(() => {
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Failed to delete space'
            );
        });
    });
})