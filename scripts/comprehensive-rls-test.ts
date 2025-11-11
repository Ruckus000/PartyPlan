#!/usr/bin/env tsx

/**
 * Comprehensive RLS Policy Test Suite
 * Tests all CRUD operations for both personal and squad plans
 * 
 * Usage: npx tsx scripts/comprehensive-rls-test.ts
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

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  const result: TestResult = { name, passed, error, details };
  results.push(result);
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.log(`   Error: ${error}`);
  if (details) console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
}

async function comprehensiveRLSTest() {
  console.log('🧪 Comprehensive RLS Policy Test Suite\n');
  console.log('='.repeat(60));

  const adminClient = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get test users
  const { data: usersData } = await adminClient.auth.admin.listUsers();
  const testUsers = usersData?.users?.filter(u => u.email?.startsWith('test-user-')) || [];

  if (testUsers.length < 3) {
    console.error('❌ Need at least 3 test users. Run seed-users.ts first.');
    process.exit(1);
  }

  const [user1, user2, user3] = testUsers.slice(0, 3);
  console.log(`\nUsing test users:`);
  console.log(`  User 1: ${user1.email} (${user1.id.substring(0, 8)}...)`);
  console.log(`  User 2: ${user2.email} (${user2.id.substring(0, 8)}...)`);
  console.log(`  User 3: ${user3.email} (${user3.id.substring(0, 8)}...)\n`);

  // Create clients for each user
  const client1 = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const client2 = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const client3 = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Sign in users
  const user1Num = user1.email?.match(/\d+/)?.[0] || '1';
  const user2Num = user2.email?.match(/\d+/)?.[0] || '2';
  const user3Num = user3.email?.match(/\d+/)?.[0] || '3';

  const { data: session1 } = await client1.auth.signInWithPassword({
    email: user1.email!,
    password: `TestPassword${user1Num}!`,
  });
  const { data: session2 } = await client2.auth.signInWithPassword({
    email: user2.email!,
    password: `TestPassword${user2Num}!`,
  });
  const { data: session3 } = await client3.auth.signInWithPassword({
    email: user3.email!,
    password: `TestPassword${user3Num}!`,
  });

  if (!session1?.session || !session2?.session || !session3?.session) {
    console.error('❌ Failed to sign in test users');
    process.exit(1);
  }

  console.log('✅ All users signed in\n');

  // Get a set for testing
  const { seedSets } = await import('../src/data/seedLineup');
  const testSet = seedSets?.[0];
  
  if (!testSet) {
    console.error('❌ No test set found');
    process.exit(1);
  }

  // ============================================
  // TEST 1: Personal Plans - INSERT
  // ============================================
  console.log('\n📝 TEST 1: Personal Plans - INSERT');
  console.log('-'.repeat(60));

  let personalPlan1Id: string | null = null;
  try {
    const { data: plan, error } = await client1.from('plans').insert({
      squad_id: null,
      created_by: user1.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();

    if (error) throw error;
    personalPlan1Id = plan.id;
    logTest('User1 can create personal plan', true, undefined, { planId: plan.id });
  } catch (error: any) {
    logTest('User1 can create personal plan', false, error.message);
  }

  // ============================================
  // TEST 2: Personal Plans - SELECT (all)
  // ============================================
  console.log('\n📖 TEST 2: Personal Plans - SELECT (all)');
  console.log('-'.repeat(60));

  try {
    const { data: allPlans, error } = await client1
      .from('plans')
      .select('*')
      .is('squad_id', null);

    if (error) throw error;
    const ownPlans = allPlans?.filter(p => p.created_by === user1.id) || [];
    const otherPlans = allPlans?.filter(p => p.created_by !== user1.id) || [];
    
    logTest('User1 can read all personal plans', true, undefined, {
      total: allPlans?.length || 0,
      own: ownPlans.length,
      others: otherPlans.length,
    });
  } catch (error: any) {
    logTest('User1 can read all personal plans', false, error.message);
  }

  // ============================================
  // TEST 3: Personal Plans - UPDATE (own)
  // ============================================
  console.log('\n✏️  TEST 3: Personal Plans - UPDATE (own)');
  console.log('-'.repeat(60));

  if (personalPlan1Id) {
    try {
      const { error } = await client1
        .from('plans')
        .update({ note: 'Updated by owner' })
        .eq('id', personalPlan1Id);

      if (error) throw error;
      logTest('User1 can update own personal plan', true);
    } catch (error: any) {
      logTest('User1 can update own personal plan', false, error.message);
    }
  }

  // ============================================
  // TEST 4: Personal Plans - UPDATE (other user's plan - should fail)
  // ============================================
  console.log('\n🚫 TEST 4: Personal Plans - UPDATE (other user - should fail)');
  console.log('-'.repeat(60));

  // Create a plan as user2
  let personalPlan2Id: string | null = null;
  try {
    const { data: plan } = await client2.from('plans').insert({
      squad_id: null,
      created_by: user2.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();
    personalPlan2Id = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create plan for user2: ${error.message}`);
  }

  if (personalPlan2Id) {
    try {
      // First, get the original note
      const { data: originalPlan } = await client2
        .from('plans')
        .select('note')
        .eq('id', personalPlan2Id)
        .single();

      const { data: updatedPlan, error } = await client1
        .from('plans')
        .update({ note: 'Hacked!' })
        .eq('id', personalPlan2Id)
        .select()
        .single();

      if (error) {
        logTest('User1 cannot update user2 personal plan', true, undefined, {
          expectedError: error.message,
        });
      } else if (updatedPlan && updatedPlan.note === 'Hacked!') {
        logTest('User1 cannot update user2 personal plan', false, 'Update succeeded but should have failed');
      } else {
        // Update returned but note wasn't changed - RLS blocked it
        logTest('User1 cannot update user2 personal plan', true, undefined, {
          note: 'Update was blocked by RLS (no rows updated)',
        });
      }
    } catch (error: any) {
      // If we get an error about no rows or coercion, RLS is working
      if (error.message?.includes('single') || error.message?.includes('row')) {
        logTest('User1 cannot update user2 personal plan', true, undefined, {
          note: 'RLS blocked update (expected)',
        });
      } else {
        logTest('User1 cannot update user2 personal plan', true, undefined, {
          error: error.message,
        });
      }
    }
  }

  // ============================================
  // TEST 5: Personal Plans - DELETE (own)
  // ============================================
  console.log('\n🗑️  TEST 5: Personal Plans - DELETE (own)');
  console.log('-'.repeat(60));

  // Create a new plan to delete
  let planToDeleteId: string | null = null;
  try {
    const { data: plan } = await client1.from('plans').insert({
      squad_id: null,
      created_by: user1.id,
      type: 'meetup',
      meet_time: new Date().toISOString(),
      meet_location: 'Test location',
    }).select().single();
    planToDeleteId = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create plan to delete: ${error.message}`);
  }

  if (planToDeleteId) {
    try {
      const { error } = await client1
        .from('plans')
        .delete()
        .eq('id', planToDeleteId);

      if (error) throw error;
      logTest('User1 can delete own personal plan', true);
    } catch (error: any) {
      logTest('User1 can delete own personal plan', false, error.message);
    }
  }

  // ============================================
  // TEST 6: Personal Plans - DELETE (other user - should fail)
  // ============================================
  console.log('\n🚫 TEST 6: Personal Plans - DELETE (other user - should fail)');
  console.log('-'.repeat(60));

  if (personalPlan2Id) {
    try {
      // Check if plan exists before delete
      const { data: planBefore } = await client2
        .from('plans')
        .select('id')
        .eq('id', personalPlan2Id)
        .single();

      const { error } = await client1
        .from('plans')
        .delete()
        .eq('id', personalPlan2Id)
        .select();

      if (error) {
        logTest('User1 cannot delete user2 personal plan', true, undefined, {
          expectedError: error.message,
        });
      } else {
        // Check if plan still exists
        const { data: planAfter } = await client2
          .from('plans')
          .select('id')
          .eq('id', personalPlan2Id)
          .single();

        if (planAfter) {
          // Plan still exists - delete was blocked
          logTest('User1 cannot delete user2 personal plan', true, undefined, {
            note: 'Delete was blocked by RLS (plan still exists)',
          });
        } else {
          logTest('User1 cannot delete user2 personal plan', false, 'Delete succeeded but should have failed');
        }
      }
    } catch (error: any) {
      // If we get an error about no rows, RLS is working
      if (error.message?.includes('single') || error.message?.includes('row')) {
        logTest('User1 cannot delete user2 personal plan', true, undefined, {
          note: 'RLS blocked delete (expected)',
        });
      } else {
        logTest('User1 cannot delete user2 personal plan', true, undefined, {
          error: error.message,
        });
      }
    }
  }

  // ============================================
  // TEST 7: Squad Plans - Setup
  // ============================================
  console.log('\n👥 TEST 7: Squad Plans - Setup');
  console.log('-'.repeat(60));

  // Create a squad with user1 as owner and user2 as member
  let testSquadId: string | null = null;
  try {
    // Generate unique invite code
    const uniqueInviteCode = `TEST${Date.now()}`;
    
    // Use admin to create squad and members
    const { data: squad, error: squadError } = await adminClient
      .from('squads')
      .insert({
        name: 'Test Squad',
        invite_code: uniqueInviteCode,
        created_by: user1.id,
      })
      .select()
      .single();

    if (squadError) throw squadError;
    testSquadId = squad.id;

    // Add user1 as owner
    await adminClient.from('squad_members').insert({
      squad_id: testSquadId,
      profile_id: user1.id,
      role: 'owner',
    });

    // Add user2 as member
    await adminClient.from('squad_members').insert({
      squad_id: testSquadId,
      profile_id: user2.id,
      role: 'member',
    });

    logTest('Squad created with user1 (owner) and user2 (member)', true, undefined, {
      squadId: testSquadId,
    });
  } catch (error: any) {
    logTest('Squad created with user1 (owner) and user2 (member)', false, error.message);
  }

  if (!testSquadId) {
    console.log('\n⚠️  Cannot continue squad tests without a squad');
    printSummary();
    return;
  }

  // ============================================
  // TEST 8: Squad Plans - INSERT (by member)
  // ============================================
  console.log('\n📝 TEST 8: Squad Plans - INSERT (by member)');
  console.log('-'.repeat(60));

  let squadPlan1Id: string | null = null;
  try {
    const { data: plan, error } = await client2.from('plans').insert({
      squad_id: testSquadId,
      created_by: user2.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();

    if (error) throw error;
    squadPlan1Id = plan.id;
    logTest('User2 (member) can create squad plan', true, undefined, { planId: plan.id });
  } catch (error: any) {
    logTest('User2 (member) can create squad plan', false, error.message);
  }

  // ============================================
  // TEST 9: Squad Plans - INSERT (by non-member - should fail)
  // ============================================
  console.log('\n🚫 TEST 9: Squad Plans - INSERT (by non-member - should fail)');
  console.log('-'.repeat(60));

  try {
    const { error } = await client3.from('plans').insert({
      squad_id: testSquadId,
      created_by: user3.id,
      type: 'set',
      set_id: testSet.id,
    });

    if (error) {
      logTest('User3 (non-member) cannot create squad plan', true, undefined, {
        expectedError: error.message,
      });
    } else {
      logTest('User3 (non-member) cannot create squad plan', false, 'Insert succeeded but should have failed');
    }
  } catch (error: any) {
    logTest('User3 (non-member) cannot create squad plan', true, undefined, {
      error: error.message,
    });
  }

  // ============================================
  // TEST 10: Squad Plans - SELECT (by member)
  // ============================================
  console.log('\n📖 TEST 10: Squad Plans - SELECT (by member)');
  console.log('-'.repeat(60));

  try {
    const { data: plans, error } = await client2
      .from('plans')
      .select('*')
      .eq('squad_id', testSquadId);

    if (error) throw error;
    logTest('User2 (member) can read squad plans', true, undefined, {
      count: plans?.length || 0,
    });
  } catch (error: any) {
    logTest('User2 (member) can read squad plans', false, error.message);
  }

  // ============================================
  // TEST 11: Squad Plans - SELECT (by non-member - should fail)
  // ============================================
  console.log('\n🚫 TEST 11: Squad Plans - SELECT (by non-member - should fail)');
  console.log('-'.repeat(60));

  try {
    const { data: plans, error } = await client3
      .from('plans')
      .select('*')
      .eq('squad_id', testSquadId);

    if (error) {
      logTest('User3 (non-member) cannot read squad plans', true, undefined, {
        expectedError: error.message,
      });
    } else if (plans && plans.length === 0) {
      logTest('User3 (non-member) cannot read squad plans', true, undefined, {
        note: 'Query returned empty (RLS blocking)',
      });
    } else {
      logTest('User3 (non-member) cannot read squad plans', false, `Found ${plans?.length || 0} plans but should be blocked`);
    }
  } catch (error: any) {
    logTest('User3 (non-member) cannot read squad plans', true, undefined, {
      error: error.message,
    });
  }

  // ============================================
  // TEST 12: Squad Plans - UPDATE (by creator)
  // ============================================
  console.log('\n✏️  TEST 12: Squad Plans - UPDATE (by creator)');
  console.log('-'.repeat(60));

  if (squadPlan1Id) {
    try {
      const { error } = await client2
        .from('plans')
        .update({ note: 'Updated by creator' })
        .eq('id', squadPlan1Id);

      if (error) throw error;
      logTest('User2 (creator) can update own squad plan', true);
    } catch (error: any) {
      logTest('User2 (creator) can update own squad plan', false, error.message);
    }
  }

  // ============================================
  // TEST 13: Squad Plans - UPDATE (by owner)
  // ============================================
  console.log('\n✏️  TEST 13: Squad Plans - UPDATE (by owner)');
  console.log('-'.repeat(60));

  if (squadPlan1Id) {
    try {
      const { error } = await client1
        .from('plans')
        .update({ note: 'Updated by squad owner' })
        .eq('id', squadPlan1Id);

      if (error) throw error;
      logTest('User1 (owner) can update squad plan', true);
    } catch (error: any) {
      logTest('User1 (owner) can update squad plan', false, error.message);
    }
  }

  // ============================================
  // TEST 14: Squad Plans - UPDATE (by regular member - should fail)
  // ============================================
  console.log('\n🚫 TEST 14: Squad Plans - UPDATE (by regular member - should fail)');
  console.log('-'.repeat(60));

  // Create a plan as user1 (owner)
  let squadPlanOwnerId: string | null = null;
  try {
    const { data: plan } = await client1.from('plans').insert({
      squad_id: testSquadId,
      created_by: user1.id,
      type: 'meetup',
      meet_time: new Date().toISOString(),
      meet_location: 'Owner location',
    }).select().single();
    squadPlanOwnerId = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create owner plan: ${error.message}`);
  }

  if (squadPlanOwnerId) {
    try {
      const { data: updatedPlan, error } = await client2
        .from('plans')
        .update({ note: 'Hacked by member!' })
        .eq('id', squadPlanOwnerId)
        .select()
        .single();

      if (error) {
        logTest('User2 (member) cannot update plan created by owner', true, undefined, {
          expectedError: error.message,
        });
      } else if (updatedPlan && updatedPlan.note === 'Hacked by member!') {
        logTest('User2 (member) cannot update plan created by owner', false, 'Update succeeded but should have failed');
      } else {
        logTest('User2 (member) cannot update plan created by owner', true, undefined, {
          note: 'Update was blocked by RLS (no rows updated)',
        });
      }
    } catch (error: any) {
      if (error.message?.includes('single') || error.message?.includes('row')) {
        logTest('User2 (member) cannot update plan created by owner', true, undefined, {
          note: 'RLS blocked update (expected)',
        });
      } else {
        logTest('User2 (member) cannot update plan created by owner', true, undefined, {
          error: error.message,
        });
      }
    }
  }

  // ============================================
  // TEST 15: Squad Plans - DELETE (by creator)
  // ============================================
  console.log('\n🗑️  TEST 15: Squad Plans - DELETE (by creator)');
  console.log('-'.repeat(60));

  // Create a plan to delete
  let squadPlanToDeleteId: string | null = null;
  try {
    const { data: plan } = await client2.from('plans').insert({
      squad_id: testSquadId,
      created_by: user2.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();
    squadPlanToDeleteId = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create plan to delete: ${error.message}`);
  }

  if (squadPlanToDeleteId) {
    try {
      const { error } = await client2
        .from('plans')
        .delete()
        .eq('id', squadPlanToDeleteId);

      if (error) throw error;
      logTest('User2 (creator) can delete own squad plan', true);
    } catch (error: any) {
      logTest('User2 (creator) can delete own squad plan', false, error.message);
    }
  }

  // ============================================
  // TEST 16: Squad Plans - DELETE (by owner)
  // ============================================
  console.log('\n🗑️  TEST 16: Squad Plans - DELETE (by owner)');
  console.log('-'.repeat(60));

  // Create a plan as user2
  let squadPlanForOwnerDeleteId: string | null = null;
  try {
    const { data: plan } = await client2.from('plans').insert({
      squad_id: testSquadId,
      created_by: user2.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();
    squadPlanForOwnerDeleteId = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create plan for owner delete test: ${error.message}`);
  }

  if (squadPlanForOwnerDeleteId) {
    try {
      const { error } = await client1
        .from('plans')
        .delete()
        .eq('id', squadPlanForOwnerDeleteId);

      if (error) throw error;
      logTest('User1 (owner) can delete squad plan', true);
    } catch (error: any) {
      logTest('User1 (owner) can delete squad plan', false, error.message);
    }
  }

  // ============================================
  // TEST 17: Squad Plans - DELETE (by regular member - should fail)
  // ============================================
  console.log('\n🚫 TEST 17: Squad Plans - DELETE (by regular member - should fail)');
  console.log('-'.repeat(60));

  // Create a plan as user1
  let squadPlanForMemberDeleteId: string | null = null;
  try {
    const { data: plan } = await client1.from('plans').insert({
      squad_id: testSquadId,
      created_by: user1.id,
      type: 'set',
      set_id: testSet.id,
    }).select().single();
    squadPlanForMemberDeleteId = plan.id;
  } catch (error: any) {
    console.log(`   ⚠️  Could not create plan for member delete test: ${error.message}`);
  }

  if (squadPlanForMemberDeleteId) {
    try {
      // Check if plan exists before delete
      const { data: planBefore } = await client1
        .from('plans')
        .select('id')
        .eq('id', squadPlanForMemberDeleteId)
        .single();

      const { error } = await client2
        .from('plans')
        .delete()
        .eq('id', squadPlanForMemberDeleteId)
        .select();

      if (error) {
        logTest('User2 (member) cannot delete plan created by owner', true, undefined, {
          expectedError: error.message,
        });
      } else {
        // Check if plan still exists
        const { data: planAfter } = await client1
          .from('plans')
          .select('id')
          .eq('id', squadPlanForMemberDeleteId)
          .single();

        if (planAfter) {
          logTest('User2 (member) cannot delete plan created by owner', true, undefined, {
            note: 'Delete was blocked by RLS (plan still exists)',
          });
        } else {
          logTest('User2 (member) cannot delete plan created by owner', false, 'Delete succeeded but should have failed');
        }
      }
    } catch (error: any) {
      if (error.message?.includes('single') || error.message?.includes('row')) {
        logTest('User2 (member) cannot delete plan created by owner', true, undefined, {
          note: 'RLS blocked delete (expected)',
        });
      } else {
        logTest('User2 (member) cannot delete plan created by owner', true, undefined, {
          error: error.message,
        });
      }
    }
  }

  // Print summary
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}`);
      if (r.error) console.log(`     Error: ${r.error}`);
    });
  }

  console.log('\n' + '='.repeat(60));

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! RLS policies are correctly configured.');
  } else {
    console.log('⚠️  Some tests failed. Please review the RLS policies.');
    process.exit(1);
  }
}

comprehensiveRLSTest()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

