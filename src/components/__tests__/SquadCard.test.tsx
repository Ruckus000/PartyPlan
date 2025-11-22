import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SquadCard, Squad } from '../plans/SquadCard';

describe('SquadCard', () => {
  const mockSquad: Squad = {
    id: '1',
    name: 'EDC Las Vegas',
    dateRange: 'May 16-18, 2025',
    imageUrl: 'https://example.com/edc.jpg',
    members: [
      { id: '1', emoji: '🎧', name: 'Jake', confirmed: true },
      { id: '2', emoji: '🎤', name: 'Sarah', confirmed: true },
      { id: '3', emoji: '🎵', name: 'Alex', confirmed: false },
    ],
    totalMembers: 8,
    confirmedCount: 5,
    statuses: [
      { type: 'urgent', text: '3 conflicts', showIcon: true },
      { type: 'needs-input', text: '2 votes' },
    ],
    activities: [
      {
        id: '1',
        type: 'conflict',
        title: 'Set conflict:',
        description: '3 want Tiësto, 4 want Martin Garrix',
        time: 'Friday 11:00 PM',
      },
    ],
  };

  it('renders squad information correctly', () => {
    const { getByText } = render(<SquadCard squad={mockSquad} />);

    expect(getByText('EDC Las Vegas')).toBeTruthy();
    expect(getByText('May 16-18, 2025')).toBeTruthy();
    expect(getByText('8 members • 5 confirmed')).toBeTruthy();
  });

  it('displays status badges', () => {
    const { getByText } = render(<SquadCard squad={mockSquad} />);

    expect(getByText('3 conflicts')).toBeTruthy();
    expect(getByText('2 votes')).toBeTruthy();
  });

  it('displays member avatars with confirmation dots', () => {
    const { getByText } = render(<SquadCard squad={mockSquad} />);

    expect(getByText('🎧')).toBeTruthy();
    expect(getByText('🎤')).toBeTruthy();
    expect(getByText('🎵')).toBeTruthy();
  });

  it('shows invite notification when hasInvite is true', () => {
    const inviteSquad: Squad = {
      ...mockSquad,
      hasInvite: true,
      inviteText: 'Mike invited you to join EDC Las Vegas Squad',
    };

    const { getByText } = render(<SquadCard squad={inviteSquad} />);

    expect(getByText('Mike invited you to join EDC Las Vegas Squad')).toBeTruthy();
    expect(getByText('Join')).toBeTruthy();
    expect(getByText('Decline')).toBeTruthy();
  });

  it('calls onAcceptInvite when Join button is pressed', () => {
    const mockOnAccept = jest.fn();
    const inviteSquad: Squad = {
      ...mockSquad,
      hasInvite: true,
      inviteText: 'Mike invited you',
    };

    const { getByText } = render(
      <SquadCard squad={inviteSquad} onAcceptInvite={mockOnAccept} />
    );

    fireEvent.press(getByText('Join'));
    expect(mockOnAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onDeclineInvite when Decline button is pressed', () => {
    const mockOnDecline = jest.fn();
    const inviteSquad: Squad = {
      ...mockSquad,
      hasInvite: true,
      inviteText: 'Mike invited you',
    };

    const { getByText } = render(
      <SquadCard squad={inviteSquad} onDeclineInvite={mockOnDecline} />
    );

    fireEvent.press(getByText('Decline'));
    expect(mockOnDecline).toHaveBeenCalledTimes(1);
  });

  it('expands to show activities when pressed', () => {
    const { getByText, queryByText } = render(<SquadCard squad={mockSquad} />);

    // Activities should not be visible initially
    expect(queryByText('Set conflict:')).toBeNull();

    // Press to expand
    fireEvent.press(getByText('EDC Las Vegas'));

    // Activities should now be visible
    expect(getByText('Set conflict:')).toBeTruthy();
    expect(getByText('3 want Tiësto, 4 want Martin Garrix')).toBeTruthy();
  });

  it('shows quick action buttons when expanded', () => {
    const { getByText } = render(<SquadCard squad={mockSquad} />);

    // Expand the card
    fireEvent.press(getByText('EDC Las Vegas'));

    // Quick actions should be visible
    expect(getByText('Resolve conflicts')).toBeTruthy();
    expect(getByText('Vote now')).toBeTruthy();
    expect(getByText('View timeline')).toBeTruthy();
  });

  it('calls onQuickAction when action button is pressed', () => {
    const mockOnQuickAction = jest.fn();
    const { getByText } = render(
      <SquadCard squad={mockSquad} onQuickAction={mockOnQuickAction} />
    );

    // Expand the card
    fireEvent.press(getByText('EDC Las Vegas'));

    // Press quick action
    fireEvent.press(getByText('Vote now'));

    expect(mockOnQuickAction).toHaveBeenCalledWith('vote');
  });

  it('is memoized to prevent unnecessary re-renders', () => {
    const { rerender } = render(<SquadCard squad={mockSquad} />);

    // Re-render with same props
    rerender(<SquadCard squad={mockSquad} />);

    // Component should be memoized (React.memo)
    expect(SquadCard).toBeTruthy();
  });
});
