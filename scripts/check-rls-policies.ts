#!/usr/bin/env tsx

/**
 * Check current RLS policies on plans table
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkPolicies() {
  console.log('🔍 Checking RLS Policies on plans table\n');

  // Check if RLS is enabled
  const { data: rlsEnabled, error: rlsError } = await adminClient.rpc('exec_sql', {
    sql: `
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND tablename = 'plans';
    `,
  });

  console.log('RLS Status:', rlsEnabled);

  // Get all policies
  const { data: policies, error: policiesError } = await adminClient.rpc('exec_sql', {
    sql: `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = 'plans'
      ORDER BY policyname;
    `,
  });

  if (policiesError) {
    console.error('Error fetching policies:', policiesError);
    // Try alternative query
    const { data: altPolicies, error: altError } = await adminClient
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'plans')
      .eq('schemaname', 'public');

    if (altError) {
      console.error('Alternative query also failed:', altError);
      return;
    }
    console.log('\nCurrent Policies:');
    console.log(JSON.stringify(altPolicies, null, 2));
  } else {
    console.log('\nCurrent Policies:');
    console.log(JSON.stringify(policies, null, 2));
  }
}

checkPolicies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });

