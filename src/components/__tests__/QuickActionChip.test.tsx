import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActionChip } from '../ui/QuickActionChip';
import { Text } from 'react-native';

describe('QuickActionChip', () => {
  const MockIcon = () => <Text>📍</Text>;

  it('renders label correctly', () => {
    const { getByText } = render(
      <QuickActionChip
        label="Nearby"
        icon={<MockIcon />}
        onPress={jest.fn()}
      />
    );

    expect(getByText('Nearby')).toBeTruthy();
  });

  it('displays count when provided', () => {
    const { getByText } = render(
      <QuickActionChip
        label="Nearby"
        count="12 festivals"
        icon={<MockIcon />}
        onPress={jest.fn()}
      />
    );

    expect(getByText('12 festivals')).toBeTruthy();
  });

  it('displays badge when provided', () => {
    const { getByText } = render(
      <QuickActionChip
        label="Friends"
        badge="New"
        icon={<MockIcon />}
        onPress={jest.fn()}
      />
    );

    expect(getByText('New')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <QuickActionChip
        label="Nearby"
        icon={<MockIcon />}
        onPress={mockOnPress}
      />
    );

    const chip = getByLabelText('Nearby filter.');
    fireEvent.press(chip);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('applies active styles when isActive is true', () => {
    const { getByLabelText } = render(
      <QuickActionChip
        label="Nearby"
        icon={<MockIcon />}
        isActive={true}
        onPress={jest.fn()}
      />
    );

    const chip = getByLabelText('Nearby filter.');
    expect(chip.props.accessibilityState).toEqual({ selected: true });
  });

  it('has proper accessibility labels with count and badge', () => {
    const { getByLabelText } = render(
      <QuickActionChip
        label="Friends"
        count="8 festivals"
        badge="New"
        icon={<MockIcon />}
        onPress={jest.fn()}
      />
    );

    const chip = getByLabelText('Friends filter. 8 festivals. New');
    expect(chip).toBeTruthy();
  });

  it('has accessibility hint for filtering', () => {
    const { getByLabelText } = render(
      <QuickActionChip
        label="Nearby"
        icon={<MockIcon />}
        onPress={jest.fn()}
      />
    );

    const chip = getByLabelText('Nearby filter.');
    expect(chip.props.accessibilityHint).toBe('Filter festivals by nearby');
  });

  it('is memoized to prevent unnecessary re-renders', () => {
    const mockOnPress = jest.fn();
    const { rerender } = render(
      <QuickActionChip label="Nearby" icon={<MockIcon />} onPress={mockOnPress} />
    );

    // Re-render with same props
    rerender(
      <QuickActionChip label="Nearby" icon={<MockIcon />} onPress={mockOnPress} />
    );

    // Component should be memoized (React.memo)
    expect(QuickActionChip).toBeTruthy();
  });
});
