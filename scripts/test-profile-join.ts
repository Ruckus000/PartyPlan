#!/usr/bin/env tsx

/**
 * Test script to verify profile join syntax
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

async function testProfileJoin() {
  console.log('🧪 Testing Profile Join Syntax\n');
  console.log('='.repeat(60));

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test different join syntaxes
  const syntaxes = [
    'profiles!created_by(emoji, display_name)',
    'profiles!plans_created_by_fkey(emoji, display_name)',
    'profiles(*)',
    'created_by:profiles(emoji, display_name)',
  ];

  for (const syntax of syntaxes) {
    console.log(`\n📝 Testing: select('*, ${syntax}')`);
    console.log('-'.repeat(60));
    
    try {
      const { data, error } = await client
        .from('plans')
        .select(`*, ${syntax}`)
        .is('squad_id', null)
        .limit(3);

      if (error) {
        console.log(`❌ ERROR: ${error.message}`);
      } else {
        console.log(`✅ Success! Got ${data?.length || 0} plans`);
        if (data && data.length > 0) {
          const first = data[0];
          console.log(`   First plan keys: ${Object.keys(first).join(', ')}`);
          
          // Check for profile data in various possible locations
          if (first.profiles) {
            console.log(`   ✅ Found 'profiles' field:`, first.profiles);
          } else if (first.profile) {
            console.log(`   ✅ Found 'profile' field:`, first.profile);
          } else if (first.created_by_profile) {
            console.log(`   ✅ Found 'created_by_profile' field:`, first.created_by_profile);
          } else {
            console.log(`   ❌ No profile data found`);
            console.log(`   Sample plan:`, JSON.stringify(first, null, 2).substring(0, 500));
          }
        }
      }
    } catch (error: any) {
      console.log(`❌ Exception: ${error.message}`);
    }
  }
}

testProfileJoin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

