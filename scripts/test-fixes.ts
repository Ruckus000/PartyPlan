#!/usr/bin/env tsx

/**
 * Test script to verify the fixes work correctly
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

async function testFixes() {
    console.log('🧪 Testing Fixes\n');
    console.log('='.repeat(60));

    // Test 1: Can we read profiles without authentication (after RLS update)?
    console.log('\n📖 Test 1: Can we read profiles without authentication?');
    console.log('-'.repeat(60));

    const unauthenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    // Get a plan first
    const { data: plans } = await unauthenticatedClient
        .from('plans')
        .select('id, created_by')
        .is('squad_id', null)
        .limit(1)
        .single();

    if (plans && plans.created_by) {
        const { data: profile, error } = await unauthenticatedClient
            .from('profiles')
            .select('id, emoji, display_name')
            .eq('id', plans.created_by)
            .single();

        if (error) {
            console.log(`❌ ERROR: ${error.message}`);
            console.log('   ⚠️  RLS policy still blocking! Run supabase-fix-profiles-rls.sql');
        } else if (profile) {
            console.log(`✅ Success! Can read profile:`);
            console.log(`   Emoji: ${profile.emoji}`);
            console.log(`   Name: ${profile.display_name}`);
        }
    }

    // Test 2: Can we join profiles with plans?
    console.log('\n📖 Test 2: Can we join profiles with plans?');
    console.log('-'.repeat(60));

    const { data: plansWithProfiles, error: joinError } = await unauthenticatedClient
        .from('plans')
        .select('*, profiles!created_by(emoji, display_name)')
        .is('squad_id', null)
        .limit(5);

    if (joinError) {
        console.log(`❌ ERROR: ${joinError.message}`);
    } else if (plansWithProfiles) {
        const withProfiles = plansWithProfiles.filter((p: any) => p.profiles);
        const withoutProfiles = plansWithProfiles.filter((p: any) => !p.profiles);

        console.log(`✅ Success! Got ${plansWithProfiles.length} plans`);
        console.log(`   Plans with profile data: ${withProfiles.length}`);
        console.log(`   Plans without profile data: ${withoutProfiles.length}`);

        if (withProfiles.length > 0) {
            console.log('\n   Sample plan with profile:');
            const sample = withProfiles[0];
            console.log(`     Set ID: ${sample.set_id}`);
            console.log(`     Profile: ${sample.profiles.emoji} ${sample.profiles.display_name}`);
        } else {
            console.log('\n   ⚠️  No plans have profile data!');
            console.log('   This means the RLS policy update is needed.');
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary');
    console.log('='.repeat(60));
    console.log('If Test 1 failed: Run supabase-fix-profiles-rls.sql');
    console.log('If Test 2 shows 0 profiles: RLS policy needs to be updated');
}

testFixes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });


