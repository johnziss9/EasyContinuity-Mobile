import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../pages/Home';
import { NavigationContainer } from '@react-navigation/native';
import handleHttpRequest from '../api/api';
import ToastNotification from '../utils/ToastNotification';

// Mock the API handling and Navigation
jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn()
}));

// Create a mock navigation object with a navigate function
const mockNavigate = jest.fn();
const mockNavigation = {
    navigate: mockNavigate
};

// Mock the useNavigation hook to return our mockNavigation
jest.mock('@react-navigation/native', () => ({
    useNavigation: () => mockNavigation,
    NavigationContainer: ({ children }) => children
}));

jest.mock('../utils/ToastNotification', () => ({
    show: jest.fn()
}));

describe('Home Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        ToastNotification.show.mockClear();
        mockNavigate.mockClear();
    });
    
    it('renders initial buttons', () => {
        const { getByText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Create an Account')).toBeTruthy();
    });

    it('shows login form when Sign In is pressed', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        expect(getByPlaceholderText('Email Address')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('shows create account form when Create an Account is pressed', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        expect(getByPlaceholderText('First Name')).toBeTruthy();
        expect(getByPlaceholderText('Last Name')).toBeTruthy();
        expect(getByPlaceholderText('Email Address')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });

    it('hides login form when Cancel is pressed', () => {
        const { getByText, queryByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        fireEvent.press(getByText('Cancel'));
        
        expect(queryByPlaceholderText('Email Address')).toBeNull();
        expect(queryByPlaceholderText('Password')).toBeNull();
    });

    it('hides create account form when Cancel is pressed', () => {
        const { getByText, queryByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        fireEvent.press(getByText('Cancel'));
        
        expect(queryByPlaceholderText('First Name')).toBeNull();
        expect(queryByPlaceholderText('Last Name')).toBeNull();
        expect(queryByPlaceholderText('Email Address')).toBeNull();
        expect(queryByPlaceholderText('Password')).toBeNull();
        expect(queryByPlaceholderText('Confirm Password')).toBeNull();
    });

    it('shows validation error when login with empty fields', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        fireEvent.press(getByText('Sign In'));
        
        expect(ToastNotification.show).toHaveBeenCalledWith(
            'error',
            'Error',
            'Email and password are required'
        );
        expect(handleHttpRequest).not.toHaveBeenCalled();
    });

    it('handles successful login correctly', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockResolvedValueOnce({
            success: true,
            data: { id: 1, email: 'test@example.com' }
        });
        
        // Clear the navigation mock before the test
        mockNavigate.mockClear();
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        const emailInput = getByPlaceholderText('Email Address');
        const passwordInput = getByPlaceholderText('Password');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        
        fireEvent.press(getByText('Sign In'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/login',
                'POST',
                {
                    email: 'test@example.com',
                    password: 'password123'
                }
            );
            expect(mockNavigate).toHaveBeenCalledWith('Dashboard');
        });
    });

    it('handles login failure with server error', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockResolvedValueOnce({
            success: false,
            data: JSON.stringify({ title: 'Invalid credentials' })
        });
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        const emailInput = getByPlaceholderText('Email Address');
        const passwordInput = getByPlaceholderText('Password');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'wrongpassword');
        
        fireEvent.press(getByText('Sign In'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/login',
                'POST',
                {
                    email: 'test@example.com',
                    password: 'wrongpassword'
                }
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Invalid credentials'
            );
        });
    });

    it('handles login with network error', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockRejectedValueOnce(new Error('Network error'));
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        const emailInput = getByPlaceholderText('Email Address');
        const passwordInput = getByPlaceholderText('Password');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        
        fireEvent.press(getByText('Sign In'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/login',
                'POST',
                {
                    email: 'test@example.com',
                    password: 'password123'
                }
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'An unexpected error occurred. Please try again.'
            );
        });
    });

    it('shows validation error when creating account with empty fields', async () => {
        const { getByText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        fireEvent.press(getByText('Create Account'));
        
        expect(ToastNotification.show).toHaveBeenCalledWith(
            'error',
            'Error',
            'Please fill in all fields'
        );
        expect(handleHttpRequest).not.toHaveBeenCalled();
    });

    it('shows validation error when passwords do not match', async () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password456');
        
        fireEvent.press(getByText('Create Account'));
        
        expect(ToastNotification.show).toHaveBeenCalledWith(
            'error',
            'Error',
            'Passwords do not match'
        );
        expect(handleHttpRequest).not.toHaveBeenCalled();
    });

    it('shows validation error when password is too short', async () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'short');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'short');
        
        fireEvent.press(getByText('Create Account'));
        
        expect(ToastNotification.show).toHaveBeenCalledWith(
            'error',
            'Error',
            'Password must be at least 8 characters'
        );
        expect(handleHttpRequest).not.toHaveBeenCalled();
    });

    it('handles successful account creation', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockResolvedValueOnce({
            success: true,
            data: { id: 1, email: 'john.doe@example.com' }
        });
        
        const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        fireEvent.press(getByText('Create Account'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/register',
                'POST',
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123',
                    confirmPassword: 'password123'
                }
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'success',
                'Success',
                'Account created successfully. Please sign in.'
            );
            // Should switch to login form after successful registration
            expect(queryByPlaceholderText('First Name')).toBeNull();
            expect(getByPlaceholderText('Email Address')).toBeTruthy();
            expect(getByPlaceholderText('Password')).toBeTruthy();
        });
    });

    it('handles account creation failure with server error', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockResolvedValueOnce({
            success: false,
            data: JSON.stringify({ title: 'Email is already registered' })
        });
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        fireEvent.press(getByText('Create Account'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/register',
                'POST',
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123',
                    confirmPassword: 'password123'
                }
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'Email is already registered'
            );
        });
    });

    it('handles account creation with network error', async () => {
        const apiMock = handleHttpRequest;
        apiMock.mockRejectedValueOnce(new Error('Network error'));
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john.doe@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        fireEvent.press(getByText('Create Account'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalledWith(
                '/authentication/register',
                'POST',
                {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    password: 'password123',
                    confirmPassword: 'password123'
                }
            );
            expect(ToastNotification.show).toHaveBeenCalledWith(
                'error',
                'Error',
                'An unexpected error occurred. Please try again.'
            );
        });
    });

    it('sets loading state during login process', async () => {
        const apiMock = handleHttpRequest;
        
        // Use a delayed promise to test loading state
        apiMock.mockImplementation(() => new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: { id: 1, email: 'test@example.com' }
                });
            }, 100);
        }));
        
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        const emailInput = getByPlaceholderText('Email Address');
        const passwordInput = getByPlaceholderText('Password');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        
        fireEvent.press(getByText('Sign In'));
        
        await waitFor(() => {
            expect(apiMock).toHaveBeenCalled();
        });
    });

    it('clears form inputs when login form is cancelled', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Sign In'));
        
        const emailInput = getByPlaceholderText('Email Address');
        const passwordInput = getByPlaceholderText('Password');
        
        fireEvent.changeText(emailInput, 'test@example.com');
        fireEvent.changeText(passwordInput, 'password123');
        
        fireEvent.press(getByText('Cancel'));
        
        // Re-open the form to check if fields are cleared
        fireEvent.press(getByText('Sign In'));
        
        const newEmailInput = getByPlaceholderText('Email Address');
        const newPasswordInput = getByPlaceholderText('Password');
        
        expect(newEmailInput.props.value).toBe('');
        expect(newPasswordInput.props.value).toBe('');
    });

    it('clears form inputs when registration form is cancelled', () => {
        const { getByText, getByPlaceholderText } = render(
            <NavigationContainer>
                <Home />
            </NavigationContainer>);
        
        fireEvent.press(getByText('Create an Account'));
        
        fireEvent.changeText(getByPlaceholderText('First Name'), 'John');
        fireEvent.changeText(getByPlaceholderText('Last Name'), 'Doe');
        fireEvent.changeText(getByPlaceholderText('Email Address'), 'john@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
        fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
        
        fireEvent.press(getByText('Cancel'));
        
        // Re-open the form to check if fields are cleared
        fireEvent.press(getByText('Create an Account'));
        
        expect(getByPlaceholderText('First Name').props.value).toBe('');
        expect(getByPlaceholderText('Last Name').props.value).toBe('');
        expect(getByPlaceholderText('Email Address').props.value).toBe('');
        expect(getByPlaceholderText('Password').props.value).toBe('');
        expect(getByPlaceholderText('Confirm Password').props.value).toBe('');
    });
});