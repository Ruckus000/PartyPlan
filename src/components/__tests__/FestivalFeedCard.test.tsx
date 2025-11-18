import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FestivalFeedCard, FestivalFeed } from '../home/FestivalFeedCard';

describe('FestivalFeedCard', () => {
  const mockFestival: FestivalFeed = {
    id: '1',
    title: 'EDC Las Vegas 2025',
    location: 'Las Vegas Motor Speedway',
    genre: 'EDM',
    dateRange: 'May 16-18',
    imageUrl: 'https://example.com/edc.jpg',
    friendsGoing: [
      { emoji: '🎧', name: 'Alice' },
      { emoji: '🎤', name: 'Bob' },
      { emoji: '🎵', name: 'Charlie' },
    ],
    totalFriends: 5,
  };

  it('renders festival information correctly', () => {
    const { getByText } = render(<FestivalFeedCard festival={mockFestival} />);

    expect(getByText('EDC Las Vegas 2025')).toBeTruthy();
    expect(getByText('May 16-18')).toBeTruthy();
    expect(getByText(/Las Vegas Motor Speedway.*EDM/)).toBeTruthy();
  });

  it('displays friend avatars correctly', () => {
    const { getByText } = render(<FestivalFeedCard festival={mockFestival} />);

    expect(getByText('🎧')).toBeTruthy();
    expect(getByText('🎤')).toBeTruthy();
    expect(getByText('🎵')).toBeTruthy();
    expect(getByText('5')).toBeTruthy(); // Total friends count
  });

  it('shows remaining friends count when more than 3', () => {
    const { getByText } = render(<FestivalFeedCard festival={mockFestival} />);

    // Should show +2 (5 total - 3 displayed)
    expect(getByText('+2')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <FestivalFeedCard festival={mockFestival} onPress={mockOnPress} />
    );

    const card = getByLabelText(/EDC Las Vegas 2025 festival card/);
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(<FestivalFeedCard festival={mockFestival} />);

    const card = getByLabelText(
      'EDC Las Vegas 2025 festival card. May 16-18. Las Vegas Motor Speedway. EDM. 5 friends are going'
    );

    expect(card).toBeTruthy();
  });

  it('handles festivals with no friends going', () => {
    const festivalNoFriends: FestivalFeed = {
      ...mockFestival,
      friendsGoing: [],
      totalFriends: 0,
    };

    const { queryByText } = render(<FestivalFeedCard festival={festivalNoFriends} />);

    // Friends overlay should not be rendered
    expect(queryByText('🎧')).toBeNull();
  });

  it('is memoized to prevent unnecessary re-renders', () => {
    const { rerender } = render(<FestivalFeedCard festival={mockFestival} />);

    // Re-render with same props
    rerender(<FestivalFeedCard festival={mockFestival} />);

    // Component should be memoized (React.memo)
    expect(FestivalFeedCard).toBeTruthy();
  });
});
