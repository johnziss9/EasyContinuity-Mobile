import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SearchBar from '../components/SearchBar';

describe('SearchBar Component', () => {
    const defaultProps = {
        value: '',
        onChangeText: jest.fn(),
        onSearch: jest.fn(),
        onClear: jest.fn(),
        width: 500
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with default placeholder', () => {
        const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);
        expect(getByPlaceholderText('Search space...')).toBeTruthy();
    });

    it('should handle text input changes', () => {
        const { getByTestId } = render(<SearchBar {...defaultProps} />);
        const input = getByTestId('search-input');

        fireEvent.changeText(input, 'test');
        expect(defaultProps.onChangeText).toHaveBeenCalledWith('test');
    });

    it('should show clear button only when there is text', () => {
        const { queryByTestId, rerender } = render(<SearchBar {...defaultProps} />);

        // Initially clear button should not be visible
        expect(queryByTestId('clear-search-button')).toBeNull();

        // Show clear button when there is text
        rerender(<SearchBar {...defaultProps} value="test" />);
        expect(queryByTestId('clear-search-button')).toBeTruthy();
    });

    it('should handle clear button press', () => {
        const { getByTestId } = render(<SearchBar {...defaultProps} value="test" />);

        const clearButton = getByTestId('clear-search-button');
        fireEvent.press(clearButton);

        expect(defaultProps.onClear).toHaveBeenCalled();
    });

    it('should handle search button press', () => {
        const { getByTestId } = render(<SearchBar {...defaultProps} value="test" />);

        const searchButton = getByTestId('search-button');
        fireEvent.press(searchButton);

        expect(defaultProps.onSearch).toHaveBeenCalled();
    });

    it('should disable search button when input is empty or only whitespace', () => {
        const { getByTestId, rerender } = render(<SearchBar {...defaultProps} />);

        // Empty input
        let searchButton = getByTestId('search-button');
        fireEvent.press(searchButton);
        expect(defaultProps.onSearch).not.toHaveBeenCalled();

        // Only whitespace
        rerender(<SearchBar {...defaultProps} value="   " />);
        searchButton = getByTestId('search-button');
        fireEvent.press(searchButton);
        expect(defaultProps.onSearch).not.toHaveBeenCalled();
    });

    it('should set correct button colors based on input state', () => {
        const { getByTestId, rerender } = render(<SearchBar {...defaultProps} />);

        // Empty input - disabled state
        let searchIcon = getByTestId('search-button').findByProps({
            name: 'search'
        });
        expect(searchIcon.props.color).toBe('#6F7F8F');

        // With valid input - enabled state
        rerender(<SearchBar {...defaultProps} value="test" />);
        searchIcon = getByTestId('search-button').findByProps({
            name: 'search'
        });
        expect(searchIcon.props.color).toBe('#CDA7AF');
    });

    describe('Small screen (width < 420)', () => {
        it('should render with compact width', () => {
            const { getByTestId } = render(
                <SearchBar {...defaultProps} width={400} />
            );
            const container = getByTestId('search-container');
            expect(container.props.style.width).toBe(300);
        });
    });

    describe('Medium screen (420 <= width <= 600)', () => {
        it('should render with medium width', () => {
            const { getByTestId } = render(
                <SearchBar {...defaultProps} width={500} />
            );
            const container = getByTestId('search-container');
            expect(container.props.style.width).toBe(350);
        });
    });

    describe('Wide screen (width > 600)', () => {
        it('should render with expanded width', () => {
            const { getByTestId } = render(
                <SearchBar {...defaultProps} width={700} />
            );
            const container = getByTestId('search-container');
            expect(container.props.style.width).toBe(500);
        });
    });
});