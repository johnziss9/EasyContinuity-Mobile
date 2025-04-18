import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CharacterCard from '../components/CharacterCard';

describe('CharacterCard', () => {
    const mockProps = {
        characterName: 'Test Character',
        onEditPress: jest.fn(),
        onDeletePress: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<CharacterCard {...mockProps} />);

        expect(getByText(mockProps.characterName)).toBeTruthy();
        expect(getByTestId('character-component')).toBeTruthy();
        expect(getByTestId('edit-character-button')).toBeTruthy();
        expect(getByTestId('delete-character-button')).toBeTruthy();
    });

    it('should call onEditPress when edit button is pressed', () => {
        const { getByTestId } = render(<CharacterCard {...mockProps} />);
        fireEvent.press(getByTestId('edit-character-button'));
        expect(mockProps.onEditPress).toHaveBeenCalled();
    });

    it('should call onDeletePress when delete button is pressed', () => {
        const { getByTestId } = render(<CharacterCard {...mockProps} />);
        fireEvent.press(getByTestId('delete-character-button'));
        expect(mockProps.onDeletePress).toHaveBeenCalled();
    });

    it('should render the character icon', () => {
        const { UNSAFE_getByProps } = render(<CharacterCard {...mockProps} />);
        const icon = UNSAFE_getByProps({ name: 'person-sharp' });
        expect(icon).toBeTruthy();
    });

    it('should have correct text truncation props', () => {
        const { getByText } = render(<CharacterCard {...mockProps} />);
        const textElement = getByText(mockProps.characterName);
        
        expect(textElement.props.numberOfLines).toBe(1);
        expect(textElement.props.ellipsizeMode).toBe('tail');
    });

    it('should truncate long character names', () => {
        const longNameProps = {
            ...mockProps,
            characterName: 'This is a very long character name that should be truncated'
        };
        const { getByText } = render(<CharacterCard {...longNameProps} />);
        const textElement = getByText(longNameProps.characterName);
        expect(textElement.props.style).toMatchObject({ maxWidth: 170 });
    });

    it('should truncate text with ellipsis when name is too long', () => {
        const longNameProps = {
            ...mockProps,
            characterName: 'This is a very long character name that should definitely be truncated with an ellipsis at the end'
        };
        const { getByText } = render(<CharacterCard {...longNameProps} />);
        const textElement = getByText(longNameProps.characterName);
        
        expect(textElement.props.style).toMatchObject({ maxWidth: 170 });
        expect(textElement.props.numberOfLines).toBe(1);
        expect(textElement.props.ellipsizeMode).toBe('tail');
    });
});