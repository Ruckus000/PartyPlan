#!/usr/bin/env tsx

/**
 * Simple diagnostic to test a specific UPDATE operation
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

// TypeScript now knows these are strings after the check above
const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function diagnose() {
  // Get two test users
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const testUsers = usersData?.users?.filter(u => u.email?.startsWith('test-user-')) || [];

  if (testUsers.length < 2) {
    console.error('❌ Need at least 2 test users');
    process.exit(1);
  }

  const [user1, user2] = testUsers.slice(0, 2);
  console.log(`User1: ${user1.email} (${user1.id})`);
  console.log(`User2: ${user2.email} (${user2.id})\n`);

  // Create clients - TypeScript knows supabaseUrl and supabaseAnonKey are strings here
  const client1 = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const client2 = createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Sign in
  const user1Num = user1.email?.match(/\d+/)?.[0] || '1';
  const user2Num = user2.email?.match(/\d+/)?.[0] || '2';

  await client1.auth.signInWithPassword({
    email: user1.email!,
    password: `TestPassword${user1Num}!`,
  });
  await client2.auth.signInWithPassword({
    email: user2.email!,
    password: `TestPassword${user2Num}!`,
  });

  // Create a plan as user2
  const { seedSets } = await import('../src/data/seedLineup');
  const testSet = seedSets?.[0];

  if (!testSet) {
    console.error('❌ No test set found');
    return;
  }

  console.log('Creating plan as user2...');
  const { data: plan, error: createError } = await client2.from('plans').insert({
    squad_id: null,
    created_by: user2.id,
    type: 'set',
    set_id: testSet.id,
    note: 'Original note from user2',
  }).select().single();

  if (createError || !plan) {
    console.error('Failed to create plan:', createError);
    return;
  }

  console.log(`✅ Created plan ${plan.id}`);
  console.log(`   created_by: ${plan.created_by}`);
  console.log(`   squad_id: ${plan.squad_id}`);
  console.log(`   note: ${plan.note}\n`);

  // Try to update as user1 (should fail)
  console.log('Attempting to update as user1 (should fail)...');
  const { data: updatedPlan, error: updateError } = await client1
    .from('plans')
    .update({ note: 'Hacked by user1!' })
    .eq('id', plan.id)
    .select()
    .single();

  if (updateError) {
    console.log(`✅ UPDATE BLOCKED (as expected): ${updateError.message}`);
  } else if (updatedPlan) {
    console.log(`❌ UPDATE SUCCEEDED (should have failed!)`);
    console.log(`   Updated plan:`, updatedPlan);
    console.log(`   New note: ${updatedPlan.note}`);
    console.log(`\n⚠️  RLS policy is not working correctly!`);
  }
}

diagnose()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

