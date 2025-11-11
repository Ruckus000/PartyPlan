#!/usr/bin/env tsx

/**
 * Diagnostic script to check if seed data was created correctly
 * and verify what the app can actually query
 */

import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

// Use service role key to bypass RLS for diagnostics
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function checkSeedData() {
  console.log('🔍 Checking seed data...\n');

  try {
    // 1. Check if users exist
    console.log('1. Checking auth users...');
    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      console.error('  ❌ Error listing users:', usersError);
    } else {
      const testUsers = users?.users?.filter(u => u.email?.startsWith('test-user-')) || [];
      console.log(`  ✅ Found ${testUsers.length} test users`);
      if (testUsers.length > 0) {
        console.log(`  Sample user: ${testUsers[0].email} (ID: ${testUsers[0].id})`);
      }
    }

    // 2. Check if profiles exist
    console.log('\n2. Checking profiles...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(10);
    
    if (profilesError) {
      console.error('  ❌ Error fetching profiles:', profilesError);
    } else {
      console.log(`  ✅ Found ${profiles?.length || 0} profiles`);
      if (profiles && profiles.length > 0) {
        console.log(`  Sample profile: ${profiles[0].display_name} (ID: ${profiles[0].id})`);
      }
    }

    // 3. Check if plans exist (with service role - bypasses RLS)
    console.log('\n3. Checking plans (admin view - bypasses RLS)...');
    const { data: allPlans, error: plansError } = await supabaseAdmin
      .from('plans')
      .select('*');
    
    if (plansError) {
      console.error('  ❌ Error fetching plans:', plansError);
    } else {
      console.log(`  ✅ Found ${allPlans?.length || 0} total plans`);
      
      const individualPlans = allPlans?.filter(p => p.squad_id === null) || [];
      const squadPlans = allPlans?.filter(p => p.squad_id !== null) || [];
      
      console.log(`  - Individual plans (squad_id: null): ${individualPlans.length}`);
      console.log(`  - Squad plans: ${squadPlans.length}`);
      
      if (individualPlans.length > 0) {
        console.log(`  Sample individual plan:`, {
          id: individualPlans[0].id,
          created_by: individualPlans[0].created_by,
          set_id: individualPlans[0].set_id,
          type: individualPlans[0].type,
        });
        
        // Group by user
        const plansByUser = individualPlans.reduce((acc, plan) => {
          const userId = plan.created_by;
          if (!acc[userId]) acc[userId] = [];
          acc[userId].push(plan);
          return acc;
        }, {} as Record<string, any[]>);
        
        console.log(`  Plans per user:`);
        Object.entries(plansByUser).forEach(([userId, plans]) => {
          console.log(`    User ${userId}: ${plans.length} plans`);
        });
      }
    }

    // 4. Test query as a specific user (simulating app behavior)
    if (users?.users && users.users.length > 0) {
      const testUser = users.users.find(u => u.email?.startsWith('test-user-'));
      if (testUser) {
        console.log(`\n4. Testing query as user: ${testUser.email}...`);
        
        // Create a client with the user's session (simulating app)
        // We'll use service role but filter by user ID to simulate RLS
        const { data: userPlans, error: userPlansError } = await supabaseAdmin
          .from('plans')
          .select('*')
          .is('squad_id', null)
          .eq('created_by', testUser.id);
        
        if (userPlansError) {
          console.error('  ❌ Error fetching user plans:', userPlansError);
        } else {
          console.log(`  ✅ User can see ${userPlans?.length || 0} individual plans`);
          if (userPlans && userPlans.length > 0) {
            console.log(`  Sample plans:`);
            userPlans.slice(0, 3).forEach((plan, idx) => {
              console.log(`    ${idx + 1}. Plan ID: ${plan.id}, Set ID: ${plan.set_id}`);
            });
          }
        }
      }
    }

    // 5. Check RLS policies (if possible via SQL)
    console.log('\n5. RLS Policy Check:');
    console.log('  ⚠️  Cannot directly query RLS policies via JS client');
    console.log('  📝 Please check Supabase Dashboard → Authentication → Policies');
    console.log('  📝 Or run this SQL in Supabase SQL Editor:');
    console.log('     SELECT * FROM pg_policies WHERE tablename = \'plans\';');

  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

checkSeedData()
  .then(() => {
    console.log('\n✨ Diagnostic complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Diagnostic failed:', error);
    process.exit(1);
  });

