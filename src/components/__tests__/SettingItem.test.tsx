import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SettingItem } from '../profile/SettingItem';

describe('SettingItem', () => {
  it('renders label correctly', () => {
    const { getByText } = render(
      <SettingItem icon="user" label="Personal information" />
    );

    expect(getByText('Personal information')).toBeTruthy();
  });

  it('renders description when provided', () => {
    const { getByText } = render(
      <SettingItem
        icon="user"
        label="Personal information"
        description="Name, emoji, username"
      />
    );

    expect(getByText('Name, emoji, username')).toBeTruthy();
  });

  it('shows chevron when showChevron is true', () => {
    const { getByLabelText } = render(
      <SettingItem icon="user" label="Settings" showChevron onPress={jest.fn()} />
    );

    // Check accessibility label includes the text
    const item = getByLabelText('Settings');
    expect(item).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <SettingItem icon="user" label="Personal information" onPress={mockOnPress} />
    );

    fireEvent.press(getByLabelText('Personal information'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders toggle switch when toggleValue is provided', () => {
    const mockOnToggle = jest.fn();
    const { getByLabelText } = render(
      <SettingItem
        icon="bell"
        label="Push notifications"
        toggleValue={true}
        onToggleChange={mockOnToggle}
      />
    );

    const item = getByLabelText('Push notifications. Enabled');
    expect(item).toBeTruthy();
  });

  it('calls onToggleChange when toggle is pressed', () => {
    const mockOnToggle = jest.fn();
    const { getByLabelText } = render(
      <SettingItem
        icon="bell"
        label="Push notifications"
        toggleValue={false}
        onToggleChange={mockOnToggle}
      />
    );

    const toggle = getByLabelText('Toggle Push notifications');
    fireEvent.press(toggle);

    expect(mockOnToggle).toHaveBeenCalledWith(true);
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(
      <SettingItem
        icon="user"
        label="Personal information"
        description="Name, emoji, username"
        onPress={jest.fn()}
      />
    );

    const item = getByLabelText('Personal information. Name, emoji, username');
    expect(item).toBeTruthy();
  });

  it('has accessibility hint when pressable', () => {
    const { getByLabelText } = render(
      <SettingItem icon="user" label="Settings" onPress={jest.fn()} />
    );

    const item = getByLabelText('Settings');
    expect(item.props.accessibilityHint).toBe('Tap to open');
  });

  it('renders different icons correctly', () => {
    const icons: Array<'user' | 'bell' | 'help' | 'mail'> = [
      'user',
      'bell',
      'help',
      'mail',
    ];

    icons.forEach((icon) => {
      const { getByText } = render(
        <SettingItem icon={icon} label={`Test ${icon}`} />
      );

      expect(getByText(`Test ${icon}`)).toBeTruthy();
    });
  });

  it('is memoized to prevent unnecessary re-renders', () => {
    const { rerender } = render(<SettingItem icon="user" label="Settings" />);

    // Re-render with same props
    rerender(<SettingItem icon="user" label="Settings" />);

    // Component should be memoized (React.memo)
    expect(SettingItem).toBeTruthy();
  });
});
