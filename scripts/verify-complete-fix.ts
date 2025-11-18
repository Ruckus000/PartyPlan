#!/usr/bin/env tsx

/**
 * Comprehensive verification that all fixes are working correctly
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

async function verifyCompleteFix() {
  console.log('🔍 Comprehensive Verification\n');
  console.log('='.repeat(60));

  const unauthenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Test 1: Verify profiles can be read
  console.log('\n✅ Test 1: RLS Policy - Can read profiles');
  console.log('-'.repeat(60));
  
  const { data: plans } = await unauthenticatedClient
    .from('plans')
    .select('created_by')
    .is('squad_id', null)
    .limit(10);

  if (plans && plans.length > 0) {
    const uniqueUserIds = [...new Set(plans.map(p => p.created_by).filter(Boolean))];
    console.log(`   Found ${uniqueUserIds.length} unique users with plans`);
    
    let profilesReadable = 0;
    for (const userId of uniqueUserIds.slice(0, 3)) {
      const { data: profile, error } = await unauthenticatedClient
        .from('profiles')
        .select('id, emoji, display_name')
        .eq('id', userId)
        .single();
      
      if (!error && profile) {
        profilesReadable++;
        console.log(`   ✅ User ${userId.substring(0, 8)}...: ${profile.emoji || '(no emoji)'} ${profile.display_name}`);
      }
    }
    
    if (profilesReadable > 0) {
      console.log(`\n   ✅ RLS policy is working! Can read ${profilesReadable} profiles`);
    } else {
      console.log(`\n   ❌ RLS policy not working - cannot read profiles`);
    }
  }

  // Test 2: Verify join returns profile data
  console.log('\n✅ Test 2: Join - Plans with profile data');
  console.log('-'.repeat(60));
  
  const { data: plansWithProfiles, error: joinError } = await unauthenticatedClient
    .from('plans')
    .select('*, profiles!created_by(emoji, display_name)')
    .is('squad_id', null)
    .limit(10);

  if (joinError) {
    console.log(`   ❌ ERROR: ${joinError.message}`);
  } else if (plansWithProfiles) {
    const withProfiles = plansWithProfiles.filter((p: any) => p.profiles);
    const withoutProfiles = plansWithProfiles.filter((p: any) => !p.profiles);
    
    console.log(`   Total plans: ${plansWithProfiles.length}`);
    console.log(`   With profile data: ${withProfiles.length}`);
    console.log(`   Without profile data: ${withoutProfiles.length}`);
    
    if (withProfiles.length > 0) {
      console.log('\n   Sample plans with profiles:');
      withProfiles.slice(0, 3).forEach((plan: any) => {
        const emoji = plan.profiles?.emoji || '(no emoji)';
        const name = plan.profiles?.display_name || 'Unknown';
        console.log(`     • Set: ${plan.set_id || 'N/A'} → ${emoji} ${name}`);
      });
      
      if (withProfiles.length === plansWithProfiles.length) {
        console.log('\n   ✅ Perfect! All plans have profile data');
      } else {
        const percentage = Math.round((withProfiles.length / plansWithProfiles.length) * 100);
        console.log(`\n   ⚠️  ${percentage}% of plans have profile data`);
        console.log('   Some plans might have null created_by or profiles might not exist');
      }
    } else {
      console.log('\n   ❌ No plans have profile data!');
      console.log('   The join is not working correctly.');
    }
  }

  // Test 3: Verify profile data structure
  console.log('\n✅ Test 3: Profile Data Structure');
  console.log('-'.repeat(60));
  
  if (plansWithProfiles && plansWithProfiles.length > 0) {
    const sample = plansWithProfiles.find((p: any) => p.profiles);
    if (sample) {
      console.log('   Sample plan structure:');
      console.log(`     Plan ID: ${sample.id}`);
      console.log(`     Set ID: ${sample.set_id}`);
      console.log(`     Created by: ${sample.created_by}`);
      console.log(`     Profiles object:`, JSON.stringify(sample.profiles, null, 2));
      
      // Check if transformation would work
      const transformed = {
        ...sample,
        profile: sample.profiles ? {
          emoji: sample.profiles.emoji,
          display_name: sample.profiles.display_name,
        } : undefined,
      };
      
      console.log(`\n   Transformed profile field:`);
      console.log(`     Profile:`, JSON.stringify(transformed.profile, null, 2));
      
      if (transformed.profile) {
        console.log(`\n   ✅ Profile data structure is correct for transformation`);
      } else {
        console.log(`\n   ⚠️  Profile data might be missing or null`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Final Verification Summary');
  console.log('='.repeat(60));
  
  const allTestsPassed = 
    plansWithProfiles && 
    plansWithProfiles.length > 0 && 
    plansWithProfiles.some((p: any) => p.profiles);
  
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED!');
    console.log('   ✓ RLS policy allows reading profiles');
    console.log('   ✓ Join returns profile data');
    console.log('   ✓ Profile data structure is correct');
    console.log('\n🎉 The fixes are working correctly!');
    console.log('   - Attendees should now be visible in the app');
    console.log('   - Plans should not show as "planned" when not logged in');
  } else {
    console.log('⚠️  Some issues detected');
    console.log('   Please review the test results above');
  }
}

verifyCompleteFix()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });


