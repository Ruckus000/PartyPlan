#!/usr/bin/env tsx

/**
 * Test script to verify RLS policies allow reading all individual plans
 * This simulates what the app does when fetching plans
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

async function testRLSPolicies() {
  console.log('🧪 Testing RLS Policies for Individual Plans...\n');

  try {
    // Get a test user to simulate app behavior
    const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: users } = await adminClient.auth.admin.listUsers();
    const testUser = users?.users?.find(u => u.email?.startsWith('test-user-'));
    
    if (!testUser) {
      console.error('❌ No test user found');
      process.exit(1);
    }

    console.log(`Using test user: ${testUser.email}\n`);

    // Create a client as this user (simulating app behavior)
    // We'll sign in as the user to test RLS
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Sign in as the test user
    const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
      email: testUser.email!,
      password: `TestPassword${testUser.email?.match(/\d+/)?.[0]}!`,
    });

    if (signInError || !signInData.session) {
      console.error('❌ Failed to sign in as test user:', signInError);
      console.log('Trying to create a session manually...');
      
      // Try using admin to get user, then set session
      const { data: { user } } = await adminClient.auth.admin.getUserById(testUser.id);
      if (!user) {
        console.error('❌ Could not get user');
        process.exit(1);
      }
    } else {
      console.log('✅ Signed in as test user\n');
    }

    // Test 1: Query all individual plans (what the app does)
    console.log('Test 1: Querying ALL individual plans (squad_id IS NULL)...');
    const { data: allPlans, error: allPlansError } = await userClient
      .from('plans')
      .select('*')
      .is('squad_id', null);

    if (allPlansError) {
      console.error('  ❌ Error:', allPlansError);
      console.error('  This means RLS policies are blocking access!');
    } else {
      console.log(`  ✅ Success! Found ${allPlans?.length || 0} individual plans`);
      
      if (allPlans && allPlans.length > 0) {
        // Group by user to show distribution
        const plansByUser = allPlans.reduce((acc, plan) => {
          const userId = plan.created_by;
          if (!acc[userId]) acc[userId] = [];
          acc[userId].push(plan);
          return acc;
        }, {} as Record<string, any[]>);

        console.log(`  Plans from ${Object.keys(plansByUser).length} different users:`);
        Object.entries(plansByUser).forEach(([userId, plans]) => {
          console.log(`    User ${userId.substring(0, 8)}...: ${plans.length} plans`);
        });
      }
    }

    // Test 2: Verify we can see plans from other users
    console.log('\nTest 2: Verifying plans from other users are visible...');
    if (allPlans && allPlans.length > 0) {
      const otherUserPlans = allPlans.filter(p => p.created_by !== testUser.id);
      console.log(`  ✅ Found ${otherUserPlans.length} plans from other users`);
      
      if (otherUserPlans.length === 0) {
        console.log('  ⚠️  Warning: No plans from other users found');
      } else {
        console.log('  ✅ RLS policy correctly allows reading all individual plans');
      }
    }

    // Test 3: Check if we can still query our own plans (should work)
    console.log('\nTest 3: Verifying own plans are still accessible...');
    const { data: ownPlans, error: ownPlansError } = await userClient
      .from('plans')
      .select('*')
      .is('squad_id', null)
      .eq('created_by', testUser.id);

    if (ownPlansError) {
      console.error('  ❌ Error:', ownPlansError);
    } else {
      console.log(`  ✅ Found ${ownPlans?.length || 0} of own plans`);
    }

    console.log('\n✅ All tests complete!');
    
    if (allPlans && allPlans.length > 0 && allPlans.some(p => p.created_by !== testUser.id)) {
      console.log('\n🎉 SUCCESS: RLS policies are correctly configured!');
      console.log('   Users can see all individual plans from all users.');
    } else {
      console.log('\n⚠️  WARNING: May need to run the SQL update in Supabase');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

testRLSPolicies()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });


