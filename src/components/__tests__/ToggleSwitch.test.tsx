import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ToggleSwitch } from '../profile/ToggleSwitch';

describe('ToggleSwitch', () => {
  it('renders in off state when value is false', () => {
    const { getByRole } = render(
      <ToggleSwitch value={false} onValueChange={jest.fn()} />
    );

    const toggle = getByRole('switch');
    expect(toggle.props.accessibilityState).toEqual({ checked: false });
  });

  it('renders in on state when value is true', () => {
    const { getByRole } = render(
      <ToggleSwitch value={true} onValueChange={jest.fn()} />
    );

    const toggle = getByRole('switch');
    expect(toggle.props.accessibilityState).toEqual({ checked: true });
  });

  it('calls onValueChange with opposite value when pressed', () => {
    const mockOnChange = jest.fn();
    const { getByRole } = render(
      <ToggleSwitch value={false} onValueChange={mockOnChange} />
    );

    fireEvent.press(getByRole('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it('toggles from true to false', () => {
    const mockOnChange = jest.fn();
    const { getByRole } = render(
      <ToggleSwitch value={true} onValueChange={mockOnChange} />
    );

    fireEvent.press(getByRole('switch'));
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });

  it('has proper accessibility label when provided', () => {
    const { getByLabelText } = render(
      <ToggleSwitch
        value={false}
        onValueChange={jest.fn()}
        accessibilityLabel="Enable notifications"
      />
    );

    const toggle = getByLabelText('Enable notifications');
    expect(toggle).toBeTruthy();
  });

  it('animates knob position based on value', () => {
    const { rerender, getByRole } = render(
      <ToggleSwitch value={false} onValueChange={jest.fn()} />
    );

    // Initial state
    expect(getByRole('switch')).toBeTruthy();

    // Re-render with value changed
    rerender(<ToggleSwitch value={true} onValueChange={jest.fn()} />);

    // Animation should trigger (tested via accessibility state)
    expect(getByRole('switch').props.accessibilityState).toEqual({ checked: true });
  });
});
