import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Home from '../pages/Home';

describe('Home Component', () => {
    it('renders initial buttons', () => {
        const { getByText } = render(<Home />);
        expect(getByText('Sign In')).toBeTruthy();
        expect(getByText('Create an Account')).toBeTruthy();
    });

    it('shows login form when Sign In is pressed', () => {
        const { getByText, getByPlaceholderText } = render(<Home />);
        fireEvent.press(getByText('Sign In'));
        expect(getByPlaceholderText('Email Address')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    it('shows create account form when Create an Account is pressed', () => {
        const { getByText, getByPlaceholderText } = render(<Home />);
        fireEvent.press(getByText('Create an Account'));
        expect(getByPlaceholderText('First Name')).toBeTruthy();
        expect(getByPlaceholderText('Last Name')).toBeTruthy();
        expect(getByPlaceholderText('Email Address')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
        expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    });

    it('hides login form when Cancel is pressed', () => {
        const { getByText, queryByPlaceholderText } = render(<Home />);
        fireEvent.press(getByText('Sign In'));
        fireEvent.press(getByText('Cancel'));
        expect(queryByPlaceholderText('Email Address')).toBeNull();
        expect(queryByPlaceholderText('Password')).toBeNull();
    });

    it('hides create account form when Cancel is pressed', () => {
        const { getByText, queryByPlaceholderText } = render(<Home />);
        fireEvent.press(getByText('Create an Account'));
        fireEvent.press(getByText('Cancel'));
        expect(queryByPlaceholderText('First Name')).toBeNull();
        expect(queryByPlaceholderText('Last Name')).toBeNull();
        expect(queryByPlaceholderText('Email Address')).toBeNull();
        expect(queryByPlaceholderText('Password')).toBeNull();
        expect(queryByPlaceholderText('Confirm Password')).toBeNull();
    });

    // TODO Test for successfully logging in
    // TODO Test for unsuccessfully logging in
    // TODO Test for successfully creating an account
    // TODO Test for unsuccessfully creating an account
});
