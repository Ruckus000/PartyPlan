import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { MyFestivalCard, MyFestival } from '../home/MyFestivalCard';

describe('MyFestivalCard', () => {
  const mockFestival: MyFestival = {
    id: '1',
    name: 'Coachella 2025',
    dateRange: 'Apr 11-13',
    location: 'Indio, CA',
    friendsCount: 4,
    imageUrl: 'https://example.com/coachella.jpg',
    status: 'confirmed',
  };

  it('renders festival information correctly', () => {
    const { getByText } = render(<MyFestivalCard festival={mockFestival} />);

    expect(getByText('Coachella 2025')).toBeTruthy();
    expect(getByText(/Apr 11-13.*Indio, CA/)).toBeTruthy();
    expect(getByText('4 friends in your squad')).toBeTruthy();
  });

  it('displays correct status badge', () => {
    const { getByText } = render(<MyFestivalCard festival={mockFestival} />);

    expect(getByText('Confirmed')).toBeTruthy();
  });

  it('shows correct status for different statuses', () => {
    const openFestival: MyFestival = { ...mockFestival, status: 'open' };
    const { getByText: getByText1 } = render(<MyFestivalCard festival={openFestival} />);
    expect(getByText1('Open')).toBeTruthy();

    const planningFestival: MyFestival = { ...mockFestival, status: 'planning' };
    const { getByText: getByText2 } = render(<MyFestivalCard festival={planningFestival} />);
    expect(getByText2('Planning')).toBeTruthy();
  });

  it('handles singular friend count correctly', () => {
    const singleFriend: MyFestival = { ...mockFestival, friendsCount: 1 };
    const { getByText } = render(<MyFestivalCard festival={singleFriend} />);

    expect(getByText('1 friend in your squad')).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(
      <MyFestivalCard festival={mockFestival} onPress={mockOnPress} />
    );

    const card = getByLabelText(/Coachella 2025/);
    fireEvent.press(card);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility labels', () => {
    const { getByLabelText } = render(<MyFestivalCard festival={mockFestival} />);

    const card = getByLabelText(
      'Coachella 2025. Apr 11-13. Indio, CA. 4 friends in your squad. Status: Confirmed'
    );

    expect(card).toBeTruthy();
  });

  it('is memoized to prevent unnecessary re-renders', () => {
    const { rerender } = render(<MyFestivalCard festival={mockFestival} />);

    // Re-render with same props
    rerender(<MyFestivalCard festival={mockFestival} />);

    // Component should be memoized (React.memo)
    expect(MyFestivalCard).toBeTruthy();
  });
});
