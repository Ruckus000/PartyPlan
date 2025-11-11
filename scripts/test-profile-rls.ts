#!/usr/bin/env tsx

/**
 * Test script to check if RLS on profiles is blocking the join
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

async function testProfileRLS() {
  console.log('🧪 Testing Profile RLS Impact on Joins\n');
  console.log('='.repeat(60));

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get a plan with created_by
  console.log('\n📝 Step 1: Get a plan');
  console.log('-'.repeat(60));
  const { data: plans, error: plansError } = await client
    .from('plans')
    .select('id, created_by')
    .is('squad_id', null)
    .limit(1);

  if (plansError || !plans || plans.length === 0) {
    console.log('❌ Could not get plans');
    return;
  }

  const plan = plans[0];
  console.log(`✅ Got plan: ${plan.id}`);
  console.log(`   created_by: ${plan.created_by}`);

  // Try to read the profile directly
  console.log('\n📝 Step 2: Try to read profile directly');
  console.log('-'.repeat(60));
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('id, emoji, display_name')
    .eq('id', plan.created_by!)
    .single();

  if (profileError) {
    console.log(`❌ ERROR reading profile: ${profileError.message}`);
    console.log(`   Code: ${profileError.code}`);
    console.log(`   Details: ${profileError.details}`);
    console.log('\n⚠️  RLS policy on profiles is blocking unauthenticated reads!');
    console.log('   The policy "auth read own profile" only allows reading own profile.');
    console.log('   This is why the join returns null!');
  } else if (profile) {
    console.log(`✅ Success! Profile exists:`);
    console.log(`   Emoji: ${profile.emoji}`);
    console.log(`   Name: ${profile.display_name}`);
    console.log('\n⚠️  Profile exists but join still returns null.');
    console.log('   This suggests the foreign key relationship might not be set up correctly.');
  } else {
    console.log('❌ Profile not found (might not exist)');
  }

  // Check if foreign key exists
  console.log('\n📝 Step 3: Summary');
  console.log('-'.repeat(60));
  console.log('The issue is likely:');
  console.log('1. RLS policy on profiles blocks reading other users\' profiles');
  console.log('2. The join fails silently when RLS blocks the related table');
  console.log('3. Solution: Need to update RLS policy to allow reading profiles');
  console.log('   for users who have created plans (or allow public read)');
}

testProfileRLS()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

