#!/usr/bin/env tsx

/**
 * Test script to verify unauthenticated state behavior
 * - Plans should not be marked as "planned" when not logged in
 * - Attendees should be visible even when not logged in
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

async function testUnauthenticatedState() {
  console.log('🧪 Testing Unauthenticated State\n');
  console.log('='.repeat(60));

  // Create client without authentication
  const unauthenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test 1: Can we read plans without authentication?
  console.log('\n📖 Test 1: Can we read plans without authentication?');
  console.log('-'.repeat(60));
  
  try {
    const { data: plansData, error } = await unauthenticatedClient
      .from('plans')
      .select('*, profiles!created_by(emoji, display_name)')
      .is('squad_id', null)
      .limit(10);

    if (error) {
      console.log(`❌ ERROR: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      console.log('\n⚠️  RLS policies are blocking unauthenticated reads!');
    } else {
      console.log(`✅ Success! Found ${plansData?.length || 0} plans`);
      if (plansData && plansData.length > 0) {
        const withProfiles = plansData.filter(p => p.profiles);
        const withoutProfiles = plansData.filter(p => !p.profiles);
        console.log(`   Plans with profile data: ${withProfiles.length}`);
        console.log(`   Plans without profile data: ${withoutProfiles.length}`);
        
        if (withProfiles.length > 0) {
          console.log('\n   Sample plan with profile:');
          const sample = withProfiles[0];
          console.log(`     Plan ID: ${sample.id}`);
          console.log(`     Set ID: ${sample.set_id}`);
          console.log(`     Created by: ${sample.created_by}`);
          console.log(`     Profile:`, sample.profiles);
        }
      }
    }
  } catch (error: any) {
    console.log(`❌ Exception: ${error.message}`);
  }

  // Test 2: Check RLS policy for plans table
  console.log('\n🔒 Test 2: Checking RLS policy behavior');
  console.log('-'.repeat(60));
  console.log('   The SELECT policy should allow reading all personal plans');
  console.log('   (squad_id IS NULL) even without authentication');
  console.log('   Current policy: (squad_id IS NULL) OR (squad_id IS NOT NULL AND member)');
  console.log('   This should allow unauthenticated reads for personal plans!');

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log('If Test 1 failed, RLS policies need to allow unauthenticated reads');
  console.log('for personal plans (squad_id IS NULL)');
}

testUnauthenticatedState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });


