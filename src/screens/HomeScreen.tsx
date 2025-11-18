import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppScreen } from '../components/ui/AppScreen';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { QuickActionChip } from '../components/ui/QuickActionChip';
import { FestivalFeedCard, FestivalFeed } from '../components/home/FestivalFeedCard';
import { MyFestivalCard, MyFestival } from '../components/home/MyFestivalCard';
import { SearchIcon } from '../components/icons/TabIcons';
import {
  LocationIcon,
  UsersIcon,
  CalendarIcon,
  MusicIcon,
  SpeakerIcon,
  TechnoIcon,
  CampingIcon,
} from '../components/icons/QuickActionIcons';
import { colors, radii, typography, gradients } from '../theme/tokens';

type ViewMode = 'discover' | 'my';
type FilterType = 'nearby' | 'friends' | 'month' | 'edm' | 'house' | 'techno' | 'camping';

/**
 * HomeScreen - Festival discovery and my festivals
 * Matches home.html mockup
 */
export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('discover');
  const [activeFilter, setActiveFilter] = useState<FilterType>('nearby');

  return (
    <AppScreen scrollable={false}>
      {/* Sticky Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={gradients.header.colors as string[]}
          locations={gradients.header.locations}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        <View style={styles.headerRow}>
          <SegmentedControl
            options={['Discover', 'My festivals']}
            selectedIndex={viewMode === 'discover' ? 0 : 1}
            onChange={(index) => setViewMode(index === 0 ? 'discover' : 'my')}
          />

          <Pressable style={styles.searchBtn}>
            <SearchIcon size={18} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {viewMode === 'discover' ? (
          <DiscoverView
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        ) : (
          <MyFestivalsView />
        )}
      </View>
    </AppScreen>
  );
}

/**
 * Discover View - Feed of festivals
 */
function DiscoverView({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}) {
  return (
    <>
      {/* Quick Actions Scroll */}
      <View style={styles.quickActionsWrapper}>
        <View style={styles.fadeLeft} pointerEvents="none" />
        <View style={styles.fadeRight} pointerEvents="none" />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickActions}
          snapToInterval={150}
          decelerationRate="fast"
        >
          <QuickActionChip
            label="Nearby"
            count="12 festivals"
            icon={<LocationIcon />}
            isActive={activeFilter === 'nearby'}
            onPress={() => onFilterChange('nearby')}
          />

          <QuickActionChip
            label="Friends are going"
            count="24 friends • 8 festivals"
            icon={<UsersIcon />}
            isActive={activeFilter === 'friends'}
            isFeatured
            badge="New"
            onPress={() => onFilterChange('friends')}
          />

          <QuickActionChip
            label="This month"
            count="6 festivals"
            icon={<CalendarIcon />}
            isActive={activeFilter === 'month'}
            onPress={() => onFilterChange('month')}
          />

          <QuickActionChip
            label="EDM"
            count="18 festivals"
            icon={<MusicIcon />}
            isActive={activeFilter === 'edm'}
            onPress={() => onFilterChange('edm')}
          />

          <QuickActionChip
            label="House"
            count="14 festivals"
            icon={<SpeakerIcon />}
            isActive={activeFilter === 'house'}
            onPress={() => onFilterChange('house')}
          />

          <QuickActionChip
            label="Techno"
            count="9 festivals"
            icon={<TechnoIcon />}
            isActive={activeFilter === 'techno'}
            onPress={() => onFilterChange('techno')}
          />

          <QuickActionChip
            label="Camping"
            count="7 festivals"
            icon={<CampingIcon />}
            isActive={activeFilter === 'camping'}
            onPress={() => onFilterChange('camping')}
          />
        </ScrollView>
      </View>

      {/* Section Header */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionLabel}>
              Showing: {getFilterLabel(activeFilter)}
            </Text>
            <Text style={styles.sectionTitle}>Upcoming festivals</Text>
          </View>
        </View>

        {/* Feed List */}
        <FlatList
          data={STUB_FESTIVALS}
          renderItem={({ item }) => <FestivalFeedCard festival={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.feedList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </>
  );
}

/**
 * My Festivals View - Compact list
 */
function MyFestivalsView() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionLabel}>Your plans</Text>
          <Text style={styles.sectionTitle}>Upcoming festivals</Text>
        </View>
      </View>

      <FlatList
        data={STUB_MY_FESTIVALS}
        renderItem={({ item }) => <MyFestivalCard festival={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.myList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

// Helper function
function getFilterLabel(filter: FilterType): string {
  const labels: Record<FilterType, string> = {
    nearby: 'Nearby',
    friends: 'Friends are going',
    month: 'This month',
    edm: 'EDM',
    house: 'House',
    techno: 'Techno',
    camping: 'Camping',
  };
  return labels[filter];
}

// Stub data - TODO: Replace with real data from Supabase
const STUB_FESTIVALS: FestivalFeed[] = [
  {
    id: '1',
    title: 'EDC Las Vegas',
    location: 'Las Vegas Motor Speedway',
    genre: 'Electronic',
    dateRange: 'May 16 – 18',
    imageUrl: 'https://placehold.co/600x400/FF3B4F/111?text=EDC+Las+Vegas',
    friendsGoing: [
      { emoji: '🎧' },
      { emoji: '🎤' },
      { emoji: '🎵' },
      { emoji: '🎹' },
      { emoji: '🎸' },
    ],
    totalFriends: 8,
  },
  {
    id: '2',
    title: 'Coachella Weekend 1',
    location: 'Indio, California',
    genre: 'Multi-genre',
    dateRange: 'Apr 11 – 13',
    imageUrl: 'https://placehold.co/600x400/00A0FF/111?text=Coachella',
    friendsGoing: [
      { emoji: '🌴' },
      { emoji: '🌵' },
      { emoji: '☀️' },
    ],
    totalFriends: 5,
  },
  {
    id: '3',
    title: 'Electric Forest',
    location: 'Rothbury, Michigan',
    genre: 'Camping',
    dateRange: 'Jun 19 – 22',
    imageUrl: 'https://placehold.co/600x400/43e97b/111?text=Electric+Forest',
    friendsGoing: [
      { emoji: '🌲' },
      { emoji: '🏕️' },
    ],
    totalFriends: 3,
  },
];

const STUB_MY_FESTIVALS: MyFestival[] = [
  {
    id: '1',
    name: 'EDC Las Vegas',
    dateRange: 'May 16 – 18',
    location: 'Las Vegas',
    friendsCount: 8,
    imageUrl: 'https://placehold.co/300x200/FF3B4F/111?text=EDC',
    status: 'open',
  },
  {
    id: '2',
    name: 'Coachella Weekend 1',
    dateRange: 'Apr 11 – 13',
    location: 'Indio, CA',
    friendsCount: 5,
    imageUrl: 'https://placehold.co/300x200/00A0FF/111?text=Coachella',
    status: 'planning',
  },
];

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    paddingTop: 18,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 52,
  },
  searchBtn: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -18,
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  quickActionsWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 8,
    width: 60,
    zIndex: 2,
    backgroundColor: 'transparent',
    // Gradient overlay would go here
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 8,
    width: 60,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 10,
  },
  section: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: typography.size.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.14,
    color: colors.textMuted,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.semibold,
    letterSpacing: -0.02,
    color: colors.textPrimary,
  },
  feedList: {
    gap: 18,
    paddingBottom: 20,
  },
  myList: {
    gap: 14,
    paddingBottom: 20,
  },
});
