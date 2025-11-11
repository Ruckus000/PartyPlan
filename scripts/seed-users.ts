#!/usr/bin/env tsx

/**
 * Seed script to create 10 test users with unique emojis and set selections
 * Each user will have their own individual plans (no squads)
 * 
 * Usage: npx tsx scripts/seed-users.ts
 * Or: tsx scripts/seed-users.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { seedSets } from '../src/data/seedLineup';

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables.');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Use service role key for admin operations, or anon key if service key not available
// Admin operations require service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 10 unique emojis for the users
const userEmojis = ['🎵', '🎸', '🎹', '🎤', '🎧', '🎪', '🎭', '🎨', '🎯', '🎲'];

// User names
const userNames = [
  'Alex',
  'Sam',
  'Jordan',
  'Taylor',
  'Casey',
  'Morgan',
  'Riley',
  'Quinn',
  'Avery',
  'Blake'
];

// Color palette for profiles
const profileColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#6366f1', // indigo
];

// Helper function to generate a UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to get or create an auth user via Supabase Admin API
async function getOrCreateAuthUser(email: string, password: string): Promise<string | null> {
  try {
    // First, try to get the user by email
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && existingUsers?.users) {
      const existingUser = existingUsers.users.find(u => u.email === email);
      if (existingUser) {
        console.log(`  User ${email} already exists, using existing ID`);
        return existingUser.id;
      }
    }

    // User doesn't exist, create a new one
    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email confirmation
    });

    if (error) {
      // If error is that user already exists, try to find them
      if (error.code === 'email_exists' || error.message?.includes('already')) {
        console.log(`  User ${email} already exists, looking up...`);
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === email);
        if (existingUser) {
          return existingUser.id;
        }
      }
      console.error(`  Error details:`, error);
      throw error;
    }

    // The admin.createUser returns { data: { user: {...} } }
    return user?.user?.id || user?.id || null;
  } catch (error: any) {
    console.error(`Error creating auth user ${email}:`, error?.message || error);
    return null;
  }
}

// Group sets by day
function groupSetsByDay(): Record<string, typeof seedSets> {
  const grouped: Record<string, typeof seedSets> = {};
  seedSets.forEach(set => {
    if (!grouped[set.day]) {
      grouped[set.day] = [];
    }
    grouped[set.day].push(set);
  });
  return grouped;
}

// Popular sets that multiple users should select (for overlap)
// These are some well-known artists that would be popular choices
const popularSetIds = [
  'porterrobinson-fri-1726', // Porter Robinson
  'arminvanbuuren-fri-2223', // Armin van Buuren
  'gryffin-fri-1844', // Gryffin
  'chrislake-fri-2105', // Chris Lake
  'tiesto-sat-1726', // Tiësto
  'zedd-sat-2223', // Zedd
  'djsnake-sat-2105', // DJ Snake
  'domdolla-sun-2223', // Dom Dolla
  'subtronics-sun-2105', // Subtronics
  'excision-sat-2300', // Excision
];

// Helper function to select sets for a user with at least 5 per day and overlap
function selectSetsForUser(userIndex: number, allUsersCount: number): typeof seedSets {
  const setsByDay = groupSetsByDay();
  const selectedSets: typeof seedSets = [];
  const days = Object.keys(setsByDay).sort(); // Friday, Saturday, Sunday

  // Distribute popular sets across users to create overlap
  // Each popular set should be selected by 3-5 users
  popularSetIds.forEach((setId, idx) => {
    // Determine which users should get this popular set
    // Spread them out across all users
    const usersForThisSet = Math.floor(Math.random() * 3) + 3; // 3-5 users per popular set
    const startUser = (idx * Math.floor(allUsersCount / popularSetIds.length)) % allUsersCount;
    
    // Check if this user should get this popular set
    for (let i = 0; i < usersForThisSet; i++) {
      const targetUser = (startUser + i) % allUsersCount;
      if (targetUser === userIndex) {
        const set = seedSets.find(s => s.id === setId);
        if (set && !selectedSets.find(s => s.id === setId)) {
          selectedSets.push(set);
        }
        break;
      }
    }
  });

  // For each day, select at least 5 sets (more if we haven't reached 5 yet)
  days.forEach(day => {
    const daySets = setsByDay[day];
    const alreadySelectedForDay = selectedSets.filter(s => s.day === day).length;
    const neededForDay = Math.max(5 - alreadySelectedForDay, 0);
    
    if (neededForDay > 0) {
      // Get sets not already selected
      const availableSets = daySets.filter(s => !selectedSets.find(sel => sel.id === s.id));
      // Shuffle and select
      const shuffled = [...availableSets].sort(() => 0.5 - Math.random());
      const toAdd = shuffled.slice(0, neededForDay);
      selectedSets.push(...toAdd);
    }
  });

  // Add a few more random sets to vary it up (between 2-5 more per day)
  days.forEach(day => {
    const daySets = setsByDay[day];
    const alreadySelectedForDay = selectedSets.filter(s => s.day === day).length;
    const extraCount = Math.floor(Math.random() * 4) + 2; // 2-5 extra sets
    
    const availableSets = daySets.filter(s => !selectedSets.find(sel => sel.id === s.id));
    const shuffled = [...availableSets].sort(() => 0.5 - Math.random());
    const toAdd = shuffled.slice(0, Math.min(extraCount, availableSets.length));
    selectedSets.push(...toAdd);
  });

  return selectedSets;
}

async function seedUsers() {
  console.log('🌱 Starting user seed...\n');

  const createdProfiles: Array<{ id: string; display_name: string; emoji: string; color: string }> = [];

  try {
    // Create 10 auth users and profiles
    for (let i = 0; i < 10; i++) {
      const email = `test-user-${i + 1}@example.com`;
      const password = `TestPassword${i + 1}!`;

      console.log(`Creating auth user ${i + 1}/10: ${email}`);

      // Get or create auth user (handles existing users)
      const userId = await getOrCreateAuthUser(email, password);

      if (!userId) {
        console.error(`❌ Failed to create auth user for ${userNames[i]}`);
        continue;
      }

      console.log(`  ✅ Auth user created with ID: ${userId}`);

      // Create profile with the auth user ID
      const profile = {
        id: userId,
        display_name: userNames[i],
        emoji: userEmojis[i],
        color: profileColors[i],
        created_at: new Date().toISOString(),
      };

      console.log(`  Creating profile: ${profile.display_name} ${profile.emoji}`);

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (profileError) {
        console.error(`❌ Error creating profile ${profile.display_name}:`, profileError.message);
        continue;
      }

      createdProfiles.push(profile);

      // Select sets for this user (at least 5 per day with overlap)
      const selectedSets = selectSetsForUser(i, 10);
      
      // Count sets per day
      const setsByDay = selectedSets.reduce((acc, set) => {
        acc[set.day] = (acc[set.day] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`  Adding ${selectedSets.length} set selections:`);
      Object.entries(setsByDay).forEach(([day, count]) => {
        console.log(`    ${day}: ${count} sets`);
      });

      // Create plans for selected sets
      const plans = selectedSets.map(set => ({
        id: generateUUID(),
        squad_id: null, // Individual plans, no squad
        created_by: userId,
        type: 'set' as const,
        set_id: set.id,
        meet_time: null,
        meet_location: null,
        note: null,
        created_at: new Date().toISOString(),
      }));

      // Insert plans in batches
      const batchSize = 5;
      for (let j = 0; j < plans.length; j += batchSize) {
        const batch = plans.slice(j, j + batchSize);
        const { error: plansError } = await supabase
          .from('plans')
          .insert(batch);

        if (plansError) {
          console.error(`  ⚠️  Error inserting plans batch:`, plansError.message);
        }
      }

      console.log(`  ✅ Profile ${profile.display_name} created with ${selectedSets.length} set selections\n`);
    }

    console.log('\n✅ Seed complete!');
    console.log(`\nCreated ${createdProfiles.length} profiles:`);
    createdProfiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.emoji} ${profile.display_name} (${profile.color})`);
    });

  } catch (error) {
    console.error('❌ Fatal error during seed:', error);
    process.exit(1);
  }
}

// Run the seed
seedUsers()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });

