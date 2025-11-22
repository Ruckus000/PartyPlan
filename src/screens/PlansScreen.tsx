import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppScreen } from '../components/ui/AppScreen';
import { FilterTabs, FilterTab } from '../components/plans/FilterTabs';
import { SquadCard, Squad } from '../components/plans/SquadCard';
import { PlusIcon } from '../components/icons/TabIcons';
import { colors, gradients } from '../theme/tokens';

type FilterType = 'all' | 'todo' | 'groups' | 'solo';

/**
 * PlansScreen - Squad and plan management
 * Matches plan.html mockup
 */
export default function PlansScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filterTabs: FilterTab[] = [
    { key: 'all', label: 'All', count: 5 },
    { key: 'todo', label: 'To-do', count: 3 },
    { key: 'groups', label: 'Groups', count: 4 },
    { key: 'solo', label: 'Solo', count: 1 },
  ];

  const filteredSquads = STUB_SQUADS.filter((squad) => {
    if (activeFilter === 'all') return true;
    // TODO: Implement real filtering logic based on squad properties
    return true;
  });

  const handleTabChange = useCallback((key: string) => {
    setActiveFilter(key as FilterType);
  }, []);

  const renderSquadItem = useCallback(
    ({ item }: { item: Squad }) => (
      <SquadCard
        squad={item}
        onAcceptInvite={() => console.log('Accept invite', item.id)}
        onDeclineInvite={() => console.log('Decline invite', item.id)}
        onQuickAction={(action) => console.log('Quick action', action, item.id)}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: Squad) => item.id, []);

  const getItemLayout = useCallback(
    (_data: unknown, index: number) => ({
      length: 160, // Estimated height of SquadCard (collapsed state)
      offset: (160 + 12) * index, // Include gap
      index,
    }),
    []
  );

  return (
    <AppScreen scrollable={false}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[...gradients.header.colors]}
          locations={gradients.header.locations}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerRow}>
          <FilterTabs
            tabs={filterTabs}
            activeTab={activeFilter}
            onTabChange={handleTabChange}
          />

          <Pressable
            style={styles.addButton}
            accessibilityLabel="Add new plan"
            accessibilityRole="button"
            accessibilityHint="Create a new festival plan or squad"
          >
            <PlusIcon size={18} />
          </Pressable>
        </View>
      </View>

      {/* Squad List */}
      <FlatList
        data={filteredSquads}
        renderItem={renderSquadItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        contentContainerStyle={styles.squadList}
        showsVerticalScrollIndicator={false}
      />
    </AppScreen>
  );
}

// Stub data - TODO: Replace with real data from Supabase
const STUB_SQUADS: Squad[] = [
  {
    id: '1',
    name: 'Coachella Weekend 2',
    dateRange: 'April 18 – 20, 2025',
    imageUrl: 'https://placehold.co/200x200/00A0FF/111?text=Coachella',
    members: [
      { id: '1', emoji: '🎧', name: 'Mike', confirmed: false },
      { id: '2', emoji: '🎤', name: 'Lisa', confirmed: false },
      { id: '3', emoji: '🎵', name: 'Jake', confirmed: false },
    ],
    totalMembers: 6,
    confirmedCount: 0,
    statuses: [
      { type: 'needs-input', text: 'Invite pending' },
    ],
    hasInvite: true,
    inviteText: 'Mike invited you to join Coachella Weekend 2 Squad',
    inviterName: 'Mike',
    activities: [],
  },
  {
    id: '2',
    name: 'EDC Las Vegas',
    dateRange: 'May 16 – 18, 2025',
    imageUrl: 'https://placehold.co/200x200/FF3B4F/111?text=EDC',
    members: [
      { id: '1', emoji: '🎧', name: 'Jake', confirmed: true },
      { id: '2', emoji: '🎤', name: 'Sarah', confirmed: true },
      { id: '3', emoji: '🎵', name: 'Alex', confirmed: false },
      { id: '4', emoji: '🎸', name: 'Ryan', confirmed: true },
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
        time: 'Friday 11:00 PM • Main Stage vs Circuit Grounds',
      },
      {
        id: '2',
        type: 'vote',
        title: 'Vote needed:',
        description: 'Friday meetup spot',
        time: '3 voted • Waiting for your input',
      },
      {
        id: '3',
        type: 'update',
        title: 'Jake marked interested in Illenium',
        description: '',
        time: '2 hours ago',
      },
    ],
  },
  {
    id: '3',
    name: 'Coachella Weekend 1',
    dateRange: 'April 11 – 13, 2025',
    imageUrl: 'https://placehold.co/200x200/00A0FF/111?text=Coachella',
    members: [
      { id: '1', emoji: '🌴', name: 'Kate', confirmed: true },
      { id: '2', emoji: '🌵', name: 'Dan', confirmed: false },
      { id: '3', emoji: '☀️', name: 'Lisa', confirmed: false },
    ],
    totalMembers: 5,
    confirmedCount: 2,
    statuses: [
      { type: 'needs-input', text: 'Vote open' },
    ],
    activities: [
      {
        id: '1',
        type: 'vote',
        title: 'Vote:',
        description: 'Camping or hotel?',
        time: '2 voted camping, 1 voted hotel',
      },
      {
        id: '2',
        type: 'update',
        title: 'Kate invited Dan and Lisa',
        description: '',
        time: '4 hours ago',
      },
    ],
  },
  {
    id: '4',
    name: 'Electric Forest',
    dateRange: 'June 19 – 22, 2025',
    imageUrl: 'https://placehold.co/200x200/43e97b/111?text=EF',
    members: [
      { id: '1', emoji: '🌲', name: 'Tom', confirmed: true },
      { id: '2', emoji: '🏕️', name: 'Ben', confirmed: true },
      { id: '3', emoji: '🎪', name: 'Nina', confirmed: true },
    ],
    totalMembers: 4,
    confirmedCount: 4,
    statuses: [
      { type: 'active', text: 'All confirmed' },
    ],
    activities: [
      {
        id: '1',
        type: 'update',
        title: 'Ben shared camping gear checklist',
        description: '',
        time: '1 day ago',
      },
    ],
  },
  {
    id: '5',
    name: 'Ultra Miami • Solo',
    dateRange: 'March 28 – 30, 2025',
    imageUrl: 'https://placehold.co/200x200/b794f6/111?text=Ultra',
    members: [
      { id: '1', emoji: '🎹', name: 'Me', confirmed: true },
    ],
    totalMembers: 1,
    confirmedCount: 1,
    statuses: [
      { type: 'pending', text: 'Personal plan' },
    ],
    activities: [
      {
        id: '1',
        type: 'update',
        title: 'You marked Carl Cox as must-see',
        description: '',
        time: 'This morning',
      },
      {
        id: '2',
        type: 'update',
        title: 'Meeting spot set: Main Stage VIP entrance',
        description: 'For connecting with festival friends',
      },
    ],
  },
];

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  squadList: {
    padding: 20,
    gap: 12,
    paddingBottom: 20,
  },
});
