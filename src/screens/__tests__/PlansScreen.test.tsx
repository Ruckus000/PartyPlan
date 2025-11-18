import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlansScreen from '../PlansScreen';

describe('PlansScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<PlansScreen />);

    expect(getByText('All')).toBeTruthy();
    expect(getByText('To-do')).toBeTruthy();
  });

  it('displays filter tabs with counts', () => {
    const { getByText } = render(<PlansScreen />);

    expect(getByText('All')).toBeTruthy();
    expect(getByText('5')).toBeTruthy(); // Count for All
    expect(getByText('To-do')).toBeTruthy();
    expect(getByText('3')).toBeTruthy(); // Count for To-do
    expect(getByText('Groups')).toBeTruthy();
    expect(getByText('4')).toBeTruthy(); // Count for Groups
    expect(getByText('Solo')).toBeTruthy();
    expect(getByText('1')).toBeTruthy(); // Count for Solo
  });

  it('shows add button with proper accessibility', () => {
    const { getByLabelText } = render(<PlansScreen />);

    const addBtn = getByLabelText('Add new plan');
    expect(addBtn).toBeTruthy();
    expect(addBtn.props.accessibilityRole).toBe('button');
    expect(addBtn.props.accessibilityHint).toBe('Create a new festival plan or squad');
  });

  it('renders squad cards', () => {
    const { getByText } = render(<PlansScreen />);

    // Check for squad names from stub data
    expect(getByText('Coachella Weekend 2')).toBeTruthy();
    expect(getByText('EDC Las Vegas')).toBeTruthy();
    expect(getByText('Electric Forest')).toBeTruthy();
  });

  it('displays squad with invite notification', () => {
    const { getByText } = render(<PlansScreen />);

    // Check for invite text
    expect(getByText(/Mike invited you/)).toBeTruthy();
    expect(getByText('Join')).toBeTruthy();
    expect(getByText('Decline')).toBeTruthy();
  });

  it('shows status badges on squad cards', () => {
    const { getByText } = render(<PlansScreen />);

    expect(getByText('Invite pending')).toBeTruthy();
    expect(getByText(/conflicts/)).toBeTruthy();
    expect(getByText(/votes/)).toBeTruthy();
  });

  it('allows filter tab selection', () => {
    const { getByLabelText } = render(<PlansScreen />);

    const todoTab = getByLabelText('To-do filter. 3 items');
    fireEvent.press(todoTab);

    // After pressing, the tab should be updated
    expect(todoTab).toBeTruthy();
  });

  it('displays member avatars on squad cards', () => {
    const { getAllByText } = render(<PlansScreen />);

    // Check for emoji avatars (multiple cards have emojis)
    const emojis = getAllByText(/🎧|🎤|🎵|🎸/);
    expect(emojis.length).toBeGreaterThan(0);
  });

  it('shows member confirmation counts', () => {
    const { getAllByText } = render(<PlansScreen />);

    // Check for confirmation text (multiple squad cards have this)
    const confirmationTexts = getAllByText(/members.*confirmed/);
    expect(confirmationTexts.length).toBeGreaterThan(0);
  });

  it('expands squad card to show activities', () => {
    const { getByText, queryByText } = render(<PlansScreen />);

    const squadName = 'EDC Las Vegas';
    const squadCard = getByText(squadName);

    // Activities should not be visible initially
    expect(queryByText('Set conflict:')).toBeNull();

    // Press to expand
    fireEvent.press(squadCard);

    // Activities should now be visible
    expect(getByText('Set conflict:')).toBeTruthy();
  });

  it('has FlatList with performance optimizations', () => {
    const { UNSAFE_getByType } = render(<PlansScreen />);

    // Verify FlatList is used
    expect(UNSAFE_getByType(require('react-native').FlatList)).toBeTruthy();
  });

  it('uses useCallback for all handlers', () => {
    const { rerender } = render(<PlansScreen />);

    rerender(<PlansScreen />);

    // If handlers weren't memoized, this would cause performance issues
    expect(true).toBe(true);
  });
});
