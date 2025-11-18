#!/usr/bin/env tsx

/**
 * Verification script to test RLS policies after running the SQL update
 * This simulates what the app does and verifies all individual plans are visible
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

async function verifyRLSAfterUpdate() {
  console.log('🔍 Verifying RLS Policies After Update...\n');

  try {
    // Get admin client to list users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: users } = await adminClient.auth.admin.listUsers();
    const testUsers = users?.users?.filter(u => u.email?.startsWith('test-user-')) || [];
    
    if (testUsers.length === 0) {
      console.error('❌ No test users found');
      process.exit(1);
    }

    console.log(`Found ${testUsers.length} test users\n`);

    // Test with first user
    const testUser = testUsers[0];
    console.log(`Testing as: ${testUser.email}\n`);

    // Create a client as this user (simulating app behavior)
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Sign in as the test user
    const userNum = testUser.email?.match(/\d+/)?.[0] || '1';
    const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testUser.email!,
      password: `TestPassword${userNum}!`,
    });

    if (signInError || !signInData.session) {
      console.error('❌ Failed to sign in:', signInError);
      console.log('\n⚠️  Note: You may need to reset the password or use admin to set session');
      process.exit(1);
    }

    console.log('✅ Signed in successfully\n');

    // Test 1: Query all individual plans (what the app does)
    console.log('Test 1: Querying ALL individual plans (squad_id IS NULL)...');
    const { data: allPlans, error: allPlansError } = await userClient
      .from('plans')
      .select('*')
      .is('squad_id', null);

    if (allPlansError) {
      console.error('  ❌ ERROR:', allPlansError);
      console.error('\n  This means RLS policies are still blocking access!');
      console.error('  Please run the SQL in supabase-rpc-update-plans-rls.sql');
      process.exit(1);
    }

    const totalPlans = allPlans?.length || 0;
    console.log(`  ✅ Success! Found ${totalPlans} individual plans`);

    if (totalPlans === 0) {
      console.error('\n  ⚠️  WARNING: No plans found!');
      console.error('  This could mean:');
      console.error('    1. Seed script did not create plans');
      console.error('    2. RLS policies are blocking access');
      process.exit(1);
    }

    // Test 2: Verify we can see plans from other users
    console.log('\nTest 2: Verifying plans from other users are visible...');
    const otherUserPlans = allPlans?.filter(p => p.created_by !== testUser.id) || [];
    const ownPlans = allPlans?.filter(p => p.created_by === testUser.id) || [];
    
    console.log(`  Own plans: ${ownPlans.length}`);
    console.log(`  Other users' plans: ${otherUserPlans.length}`);
    
    if (otherUserPlans.length === 0 && testUsers.length > 1) {
      console.error('\n  ❌ ERROR: Cannot see plans from other users!');
      console.error('  RLS policy is still restrictive.');
      console.error('  Please ensure the SQL update was run correctly.');
      process.exit(1);
    }

    // Test 3: Group by user to show distribution
    console.log('\nTest 3: Plans distribution by user...');
    const plansByUser = allPlans?.reduce((acc, plan) => {
      const userId = plan.created_by;
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(plan);
      return acc;
    }, {} as Record<string, any[]>) || {};

    const uniqueUsers = Object.keys(plansByUser).length;
    console.log(`  Plans from ${uniqueUsers} different users:`);
    
    // Get profiles to show names
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, display_name, emoji')
      .in('id', Object.keys(plansByUser));

    Object.entries(plansByUser).forEach(([userId, plans]) => {
      const profile = profiles?.find(p => p.id === userId);
      const name = profile?.display_name || userId.substring(0, 8);
      const emoji = profile?.emoji || '?';
      console.log(`    ${emoji} ${name}: ${plans.length} plans`);
    });

    // Test 4: Verify plans per day
    console.log('\nTest 4: Plans per day...');
    const { data: seedSets } = await import('../src/data/seedLineup');
    const plansByDay = allPlans?.reduce((acc, plan) => {
      const set = seedSets.find(s => s.id === plan.set_id);
      if (set) {
        acc[set.day] = (acc[set.day] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    Object.entries(plansByDay).forEach(([day, count]) => {
      console.log(`    ${day}: ${count} plans`);
    });

    // Final verification
    console.log('\n' + '='.repeat(50));
    if (totalPlans >= 300 && uniqueUsers >= 10 && otherUserPlans.length > 0) {
      console.log('✅ SUCCESS: RLS policies are correctly configured!');
      console.log('   ✓ All individual plans are visible');
      console.log('   ✓ Plans from all users are accessible');
      console.log('   ✓ App should now display all plans correctly');
    } else {
      console.log('⚠️  WARNING: Some issues detected');
      if (totalPlans < 300) {
        console.log(`   - Expected ~347 plans, found ${totalPlans}`);
      }
      if (uniqueUsers < 10) {
        console.log(`   - Expected 10 users, found ${uniqueUsers}`);
      }
      if (otherUserPlans.length === 0) {
        console.log('   - Cannot see plans from other users');
      }
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

verifyRLSAfterUpdate()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  });


