import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SnapshotMakeupInfo from '../pages/SnapshotMakeupInfo';
import { NavigationContainer } from '@react-navigation/native';

const mockNavigate = jest.fn();
const mockUseWindowDimensions = jest.fn();

// Mock the entire @react-navigation/native module
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual('@react-navigation/native');
    return {
        ...actualNav,
        useNavigation: () => ({
            navigate: mockNavigate,
            goBack: jest.fn(),
        }),
        useRoute: () => ({
            params: {
                spaceId: 1,
                isNewSnapshot: true,
                spaceName: 'Test Space'
            }
        }),
    };
});

jest.mock('../api/api', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({
        success: true,
        data: {
            id: 1,
            skin: 'Test Skin Makeup',
            brows: 'Test Brows Makeup',
            eyes: 'Test Eyes Makeup',
            lips: 'Test Lips Makeup',
            effects: 'Test Effects Makeup',
            makeupNotes: 'Test Makeup Notes'
        }
    }))
}));

describe('SnapshotMakeupInfo', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 800, height: 800 });
        });

        it('should render with expanded padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-makeup-container').props.style.paddingLeft).toBe(15);
        });

        it('should render correctly for new snapshot', async () => {
            const { getByText, getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
    
            await waitFor(() => {
                expect(getByText('Add Makeup Details')).toBeTruthy();
                expect(getByTestId('makeup-skin-text-input')).toBeTruthy();
                expect(getByTestId('makeup-brows-text-input')).toBeTruthy();
                expect(getByTestId('makeup-eyes-text-input')).toBeTruthy();
                expect(getByTestId('makeup-lips-text-input')).toBeTruthy();
                expect(getByTestId('makeup-effects-text-input')).toBeTruthy();
                expect(getByTestId('makeup-notes-text-input')).toBeTruthy();
            });
        });
    
        it('should allow input in text fields', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
    
            await waitFor(() => {
                fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Test Skin Makeup');
                fireEvent.changeText(getByTestId('makeup-brows-text-input'), 'Test Brows Makeup');
                fireEvent.changeText(getByTestId('makeup-eyes-text-input'), 'Test Eyes Makeup');
                fireEvent.changeText(getByTestId('makeup-lips-text-input'), 'Test Lips Makeup');
                fireEvent.changeText(getByTestId('makeup-effects-text-input'), 'Test Effects Makeup');
                fireEvent.changeText(getByTestId('makeup-notes-text-input'), 'Test Makeup Notes');
    
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
                expect(getByTestId('makeup-brows-text-input').props.value).toBe('Test Brows Makeup');
                expect(getByTestId('makeup-eyes-text-input').props.value).toBe('Test Eyes Makeup');
                expect(getByTestId('makeup-lips-text-input').props.value).toBe('Test Lips Makeup');
                expect(getByTestId('makeup-effects-text-input').props.value).toBe('Test Effects Makeup');
                expect(getByTestId('makeup-notes-text-input').props.value).toBe('Test Makeup Notes');
            });
        });
    
        it('should allow multi-line input in notes field', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
    
            await waitFor(() => {
                const notesInput = getByTestId('makeup-notes-text-input');
                fireEvent.changeText(notesInput, 'Line 1\nLine 2\nLine 3');
                expect(notesInput.props.value).toBe('Line 1\nLine 2\nLine 3');
            });
        });
    
        it('should navigate back to Snapshot screen with correct params when Cancel is pressed', async () => {
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    spaceName: 'Test Space',
                    folderId: null,
                    folderName: null,
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                }
            });
    
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
    
            await waitFor(() => {
                fireEvent.press(getByTestId('makeup-cancel-button'));
                expect(mockNavigate).toHaveBeenCalledWith('Snapshot', {
                    spaceId: 1,
                    spaceName: 'Test Space',
                    folderId: null,
                    folderName: null,
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                });
            });
        });
    
        it('should load and display existing snapshot data when editing', async () => {
            const apiMock = require('../api/api').default;
            
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1
                }
            });
        
            const { getByTestId, getByText } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
        
            await waitFor(() => {
                expect(getByText('Edit Makeup Details')).toBeTruthy();
                expect(getByTestId('makeup-skin-text-input').props.value).toBe('Test Skin Makeup');
                expect(getByTestId('makeup-brows-text-input').props.value).toBe('Test Brows Makeup');
                expect(getByTestId('makeup-eyes-text-input').props.value).toBe('Test Eyes Makeup');
                expect(getByTestId('makeup-lips-text-input').props.value).toBe('Test Lips Makeup');
                expect(getByTestId('makeup-effects-text-input').props.value).toBe('Test Effects Makeup');
                expect(getByTestId('makeup-notes-text-input').props.value).toBe('Test Makeup Notes');
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'GET');
            });
        });
    
        it('should successfully update existing snapshot', async () => {
            const apiMock = require('../api/api').default;
            
            jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
                params: {
                    spaceId: 1,
                    isNewSnapshot: false,
                    spaceName: 'Test Space',
                    snapshotId: 1,
                    snapshotName: 'Test Snapshot'
                }
            });
        
            apiMock
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { 
                        id: 1,
                        skin: 'Old Skin Makeup',
                        brows: 'Old Brows Makeup',
                        eyes: 'Old Eyes Makeup',
                        lips: 'Old Lips Makeup',
                        effects: 'Old Effects Makeup',
                        makeupNotes: 'Old Notes'
                    }
                }))
                .mockImplementationOnce(() => Promise.resolve({
                    success: true,
                    data: { 
                        id: 1,
                        skin: 'Updated Skin Makeup'
                    }
                }));
        
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
        
            await waitFor(() => {
                fireEvent.changeText(getByTestId('makeup-skin-text-input'), 'Updated Skin Makeup');
                fireEvent.press(getByTestId('makeup-submit-button'));
            });
        
            await waitFor(() => {
                expect(apiMock).toHaveBeenCalledWith('/snapshot/1', 'PUT', expect.objectContaining({
                    skin: 'Updated Skin Makeup',
                    lastUpdatedOn: expect.any(String)
                }));
            });
        });
        
        it('should handle multi-line input in all fields', async () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );
    
            const multiLineText = 'Line 1\nLine 2\nLine 3';
            const fields = [
                'makeup-skin-text-input',
                'makeup-brows-text-input',
                'makeup-eyes-text-input',
                'makeup-lips-text-input',
                'makeup-effects-text-input'
            ];
    
            await waitFor(() => {
                fields.forEach(fieldId => {
                    const input = getByTestId(fieldId);
                    fireEvent.changeText(input, multiLineText);
                    expect(input.props.value).toBe(multiLineText);
                });
            });
        });
    });

    describe('Wide screen (width > 600)', () => {
        beforeAll(() => {
            mockUseWindowDimensions.mockReturnValue({ width: 800, height: 800 });
        });

        it('should render with expanded padding', () => {
            const { getByTestId } = render(
                <NavigationContainer>
                    <SnapshotMakeupInfo />
                </NavigationContainer>
            );

            expect(getByTestId('snapshot-makeup-container').props.style.paddingLeft).toBe(15);
        });
    });
});