import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share } from 'react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Squad, SquadMember, Profile, Plan } from '../types';
import { generateInviteCode, isValidInviteCode } from '../utils/inviteCode';
import { colors } from '../constants/colors';
import EditProfileModal from '../components/EditProfileModal';
import { seedSets } from '../data/seedLineup';

export default function SquadScreen() {
  const { profile, squads, activeSquadId, setActiveSquadId, addSquad, setProfile, plans } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSquadId, setExpandedSquadId] = useState<string | null>(null);
  const [squadMembers, setSquadMembers] = useState<Record<string, SquadMember[]>>({});
  const [activeSquadMemberCount, setActiveSquadMemberCount] = useState<number>(0);

  // Load members for a squad
  const loadSquadMembers = async (squadId: string) => {
    const { data, error } = await supabase
      .from('squad_members')
      .select('*, profiles(*)')
      .eq('squad_id', squadId);

    if (!error && data) {
      // Map Supabase result (with 'profiles') to SquadMember (with 'profile')
      type SupabaseMember = {
        squad_id: string;
        profile_id: string;
        role: 'owner' | 'member';
        profiles: Profile | null;
      };

      setSquadMembers(prev => ({
        ...prev,
        [squadId]: data.map((m: SupabaseMember): SquadMember => ({
          squad_id: m.squad_id,
          profile_id: m.profile_id,
          role: m.role,
          profile: m.profiles || undefined,
        })),
      }));
    }
  };

  const handleCreateSquad = async () => {
    if (!newSquadName.trim()) {
      Alert.alert('Error', 'Please enter a squad name');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Please sign in');
      return;
    }

    setLoading(true);

    // Retry squad creation up to 5 times in case of invite code collision
    let attempts = 0;
    const MAX_ATTEMPTS = 5;

    while (attempts < MAX_ATTEMPTS) {
      try {
        // Generate unique invite code
        const inviteCode = generateInviteCode();

        // Create squad and add member atomically using RPC
        const { data: rpcResult, error: rpcError } = await supabase
          .rpc('create_squad_with_member', {
            squad_name: newSquadName.trim(),
            invite_code_param: inviteCode,
            creator_id: profile.id,
          });

        if (rpcError) {
          // Check if error is due to unique constraint violation on invite_code
          // PostgreSQL error code 23505 = unique_violation
          if (rpcError.code === '23505' && rpcError.message.includes('invite_code')) {
            // Invite code collision - retry with new code
            attempts++;
            if (attempts < MAX_ATTEMPTS) {
              console.warn(`Invite code collision (attempt ${attempts}/${MAX_ATTEMPTS}), retrying...`);
              continue; // Continue to the next iteration of the while loop
            }
          }
          // For any other error, or if max attempts are reached, throw to be caught by the outer catch block.
          throw rpcError;
        }

        if (!rpcResult || rpcResult.length === 0) {
          throw new Error('Failed to create squad');
        }

        // Map RPC result to Squad type
        const newSquad: Squad = {
          id: rpcResult[0].squad_id,
          name: rpcResult[0].squad_name,
          invite_code: rpcResult[0].squad_invite_code,
          created_by: rpcResult[0].squad_created_by,
          created_at: rpcResult[0].squad_created_at,
        };

        // Add to local store
        addSquad(newSquad);

        Alert.alert('Success', `Squad "${newSquadName}" created!\nInvite code: ${inviteCode}`);
        setNewSquadName('');
        setShowCreateModal(false);
        return; // Success - exit the function
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create squad';
        Alert.alert('Error', message);
        break; // Exit the loop on failure
      } finally {
        setLoading(false);
      }
    }
  };

  const handleJoinSquad = async () => {
    const code = joinCode.trim().toUpperCase();

    if (!isValidInviteCode(code)) {
      Alert.alert('Error', 'Invalid invite code. Codes are 6 characters.');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Please sign in');
      return;
    }

    setLoading(true);
    try {
      // Find squad by invite code
      const { data: squad, error: squadError } = await supabase
        .from('squads')
        .select('*')
        .eq('invite_code', code)
        .single();

      if (squadError || !squad) {
        Alert.alert('Error', 'Squad not found. Check your invite code.');
        return;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('squad_members')
        .select('*')
        .eq('squad_id', squad.id)
        .eq('profile_id', profile.id)
        .single();

      if (existing) {
        Alert.alert('Already a member', `You're already in "${squad.name}"`);
        setJoinCode('');
        setShowJoinModal(false);
        return;
      }

      // Join squad
      const { error: joinError } = await supabase
        .from('squad_members')
        .insert({
          squad_id: squad.id,
          profile_id: profile.id,
          role: 'member',
        });

      if (joinError) throw joinError;

      // Add to local store
      addSquad(squad);

      Alert.alert('Success', `Joined squad "${squad.name}"!`);
      setJoinCode('');
      setShowJoinModal(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join squad';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchSquad = async (squadId: string) => {
    setActiveSquadId(squadId);

    // Load plans for new squad
    const { data: plansData } = await supabase
      .from('plans')
      .select('*')
      .eq('squad_id', squadId);

    if (plansData) {
      useStore.getState().setPlans(plansData);
    }

    Alert.alert('Switched', 'Squad changed. Check your timeline!');
  };

  const handleShareInvite = async (squad: Squad) => {
    if (!squad.invite_code) return;

    try {
      await Share.share({
        message: `Join my PartyPlan squad "${squad.name}"!\n\nInvite code: ${squad.invite_code}\n\nUse this code in the app to join.`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleExpand = (squadId: string) => {
    if (expandedSquadId === squadId) {
      setExpandedSquadId(null);
    } else {
      setExpandedSquadId(squadId);
      if (!squadMembers[squadId]) {
        loadSquadMembers(squadId);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            setProfile(null);
          },
        },
      ]
    );
  };

  // Load active squad members count
  useEffect(() => {
    if (activeSquadId) {
      loadSquadMembers(activeSquadId);
    } else {
      setActiveSquadMemberCount(0);
    }
  }, [activeSquadId]);

  // Update member count when squadMembers changes
  useEffect(() => {
    if (activeSquadId && squadMembers[activeSquadId]) {
      setActiveSquadMemberCount(squadMembers[activeSquadId].length);
    }
  }, [activeSquadId, squadMembers]);

  // Calculate next meetup
  const nextMeetup = useMemo(() => {
    if (!profile) return null;
    
    const now = new Date();
    // Show squad meetups if in a squad, otherwise show individual meetups
    const meetups = plans.filter((plan): plan is Plan => 
      plan.type === 'meetup' && 
      plan.meet_time !== null && 
      plan.meet_time !== undefined &&
      (activeSquadId ? plan.squad_id === activeSquadId : plan.squad_id === null)
    );

    if (meetups.length === 0) return null;

    // Parse meetup times and find the next one
    const parsedMeetups = meetups
      .map(meetup => {
        const timeStr = meetup.meet_time!;
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeParts) return null;

        const hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const isPM = timeParts[3].toUpperCase() === 'PM';
        
        // Create a date for today with the parsed time
        const meetupDate = new Date();
        meetupDate.setHours(isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours);
        meetupDate.setMinutes(minutes);
        meetupDate.setSeconds(0);
        meetupDate.setMilliseconds(0);

        // If the time has passed today, assume it's for tomorrow
        if (meetupDate < now) {
          meetupDate.setDate(meetupDate.getDate() + 1);
        }

        return {
          plan: meetup,
          date: meetupDate,
        };
      })
      .filter((item): item is { plan: Plan; date: Date } => item !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return parsedMeetups.length > 0 ? parsedMeetups[0].plan : null;
  }, [plans, activeSquadId, profile]);

  // Calculate individual status and next activity
  const individualStatus = useMemo(() => {
    if (!profile) return null;

    // Default status to "online"
    const status: 'online' | 'busy' | 'offline' | 'lost' = 'online';

    // Find next planned set or meetup
    const userPlans = plans.filter(p => p.created_by === profile.id);
    const nextSetPlan = userPlans
      .filter(p => p.type === 'set' && p.set_id)
      .map(p => {
        const set = seedSets.find(s => s.id === p.set_id);
        return set ? { plan: p, set, startTime: new Date(set.start) } : null;
      })
      .filter((item): item is { plan: Plan; set: typeof seedSets[0]; startTime: Date } => item !== null)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())[0];

    const nextMeetupPlan = userPlans
      .filter(p => p.type === 'meetup' && p.meet_time)
      .map(p => {
        const timeStr = p.meet_time!;
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!timeParts) return null;

        const hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const isPM = timeParts[3].toUpperCase() === 'PM';
        
        const meetupDate = new Date();
        meetupDate.setHours(isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours);
        meetupDate.setMinutes(minutes);
        meetupDate.setSeconds(0);
        meetupDate.setMilliseconds(0);

        if (meetupDate < new Date()) {
          meetupDate.setDate(meetupDate.getDate() + 1);
        }

        return { plan: p, date: meetupDate };
      })
      .filter((item): item is { plan: Plan; date: Date } => item !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    let nextActivity: string | null = null;
    if (nextSetPlan && nextMeetupPlan) {
      nextActivity = nextSetPlan.startTime < nextMeetupPlan.date
        ? `${nextSetPlan.set.artist} at ${new Date(nextSetPlan.set.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : `Meetup at ${nextMeetupPlan.plan.meet_time} - ${nextMeetupPlan.plan.meet_location}`;
    } else if (nextSetPlan) {
      nextActivity = `${nextSetPlan.set.artist} at ${new Date(nextSetPlan.set.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    } else if (nextMeetupPlan) {
      nextActivity = `Meetup at ${nextMeetupPlan.plan.meet_time} - ${nextMeetupPlan.plan.meet_location}`;
    }

    return {
      status,
      nextActivity,
    };
  }, [profile, plans]);

  // Calculate squad status
  const squadStatus = useMemo(() => {
    if (!activeSquadId) return null;

    const activeSquad = squads.find(s => s.id === activeSquadId);
    if (!activeSquad) return null;

    const squadPlans = plans.filter(p => p.squad_id === activeSquadId);
    const memberCount = activeSquadMemberCount || 0;

    return {
      name: activeSquad.name,
      memberCount,
      planCount: squadPlans.length,
    };
  }, [activeSquadId, squads, plans, activeSquadMemberCount]);

  return (
    <ScrollView style={styles.container}>
      {/* Header with Title and Profile Actions */}
      <View style={styles.header}>
        <Text style={styles.title}>Status</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={styles.headerButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={[styles.headerButtonText, styles.logoutButtonText]}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Individual Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>INDIVIDUAL STATUS</Text>
        <View style={styles.statusContent}>
          {profile ? (
            <>
              <View style={styles.statusHeader}>
                <Text style={styles.profileEmoji}>{profile.emoji}</Text>
                <View style={styles.statusInfo}>
                  <Text style={styles.statusName}>{profile.display_name}</Text>
                  <View style={styles.statusRow}>
                    <View style={[
                      styles.statusDot,
                      individualStatus?.status === 'busy' ? styles.statusDotBusy :
                      individualStatus?.status === 'offline' ? styles.statusDotOffline :
                      individualStatus?.status === 'lost' ? styles.statusDotLost :
                      styles.statusDotOnline
                    ]} />
                    <Text style={styles.statusText}>{individualStatus?.status || 'online'}</Text>
                  </View>
                </View>
              </View>
              {individualStatus?.nextActivity ? (
                <Text style={styles.nextActivity}>Next: {individualStatus.nextActivity}</Text>
              ) : (
                <Text style={styles.emptyStateText}>No upcoming activities</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyStateText}>Not signed in</Text>
          )}
        </View>
      </View>

      {/* Squad Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>SQUAD STATUS</Text>
        <View style={styles.statusContent}>
          {squadStatus ? (
            <>
              <Text style={styles.squadStatusName}>{squadStatus.name}</Text>
              <View style={styles.squadStats}>
                <Text style={styles.squadStat}>{squadStatus.memberCount} {squadStatus.memberCount === 1 ? 'member' : 'members'}</Text>
                <Text style={styles.squadStatSeparator}>•</Text>
                <Text style={styles.squadStat}>{squadStatus.planCount} {squadStatus.planCount === 1 ? 'plan' : 'plans'}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyStateText}>No active squad</Text>
          )}
        </View>
      </View>

      {/* Next Meetup Card */}
      <View style={styles.statusCard}>
        <Text style={styles.sectionTitle}>NEXT MEETUP</Text>
        <View style={styles.statusContent}>
          {nextMeetup ? (
            <>
              <Text style={styles.meetupTime}>{nextMeetup.meet_time}</Text>
              <Text style={styles.meetupLocation}>{nextMeetup.meet_location}</Text>
              {nextMeetup.note && (
                <Text style={styles.meetupNote}>{nextMeetup.note}</Text>
              )}
            </>
          ) : (
            <Text style={styles.emptyStateText}>No upcoming meetups</Text>
          )}
        </View>
      </View>

      {/* Squad Management Section */}
      <View style={styles.managementSection}>
        <Text style={styles.managementTitle}>Squad Management</Text>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCreateModal(!showCreateModal)}
          >
            <Text style={styles.actionButtonText}>+ Create Squad</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() => setShowJoinModal(!showJoinModal)}
          >
            <Text style={styles.actionButtonText}>Join Squad</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create Squad Form */}
      {showCreateModal && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Create New Squad</Text>
          <TextInput
            style={styles.input}
            placeholder="Squad name (e.g., Festival Crew)"
            placeholderTextColor={colors.textSecondary}
            value={newSquadName}
            onChangeText={setNewSquadName}
            autoCapitalize="words"
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                setShowCreateModal(false);
                setNewSquadName('');
              }}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateSquad}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Join Squad Form */}
      {showJoinModal && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Join Squad</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-character invite code"
            placeholderTextColor={colors.textSecondary}
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="characters"
            maxLength={6}
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => {
                setShowJoinModal(false);
                setJoinCode('');
              }}
            >
              <Text style={styles.buttonSecondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={handleJoinSquad}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Joining...' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Squad List */}
      {squads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No squads yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Create a squad or join one with an invite code
          </Text>
        </View>
      ) : (
        squads.map(squad => {
          const isActive = squad.id === activeSquadId;
          const isExpanded = expandedSquadId === squad.id;
          const members = squadMembers[squad.id] || [];

          return (
            <View key={squad.id} style={[styles.squadCard, isActive && styles.activeSquadCard]}>
              <TouchableOpacity
                onPress={() => toggleExpand(squad.id)}
                activeOpacity={0.7}
              >
                <View style={styles.squadHeader}>
                  <View style={styles.squadInfo}>
                    <Text style={styles.squadName}>{squad.name}</Text>
                    {isActive && <Text style={styles.activeLabel}>ACTIVE</Text>}
                  </View>
                  <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</Text>
                </View>

                {squad.invite_code && (
                  <View style={styles.inviteCodeRow}>
                    <Text style={styles.inviteLabel}>Invite code:</Text>
                    <Text style={styles.inviteCode}>{squad.invite_code}</Text>
                    <TouchableOpacity onPress={() => handleShareInvite(squad)}>
                      <Text style={styles.shareButton}>Share</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.squadDetails}>
                  {/* Members */}
                  <Text style={styles.sectionTitle}>Members ({members.length})</Text>
                  {members.map(member => (
                    <View key={member.profile_id} style={styles.memberRow}>
                      <Text style={styles.memberEmoji}>{member.profile?.emoji || '👤'}</Text>
                      <Text style={styles.memberName}>{member.profile?.display_name || 'Unknown'}</Text>
                      {member.role === 'owner' && (
                        <Text style={styles.roleLabel}>Owner</Text>
                      )}
                    </View>
                  ))}

                  {/* Switch Squad Button */}
                  {!isActive && (
                    <TouchableOpacity
                      style={styles.switchButton}
                      onPress={() => handleSwitchSquad(squad.id)}
                    >
                      <Text style={styles.switchButtonText}>Switch to this squad</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })
      )}

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.bgCard,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerButtonText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statusContent: {
    gap: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileEmoji: {
    fontSize: 32,
  },
  statusInfo: {
    flex: 1,
  },
  statusName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusDotOnline: {
    backgroundColor: colors.statusOnline,
  },
  statusDotBusy: {
    backgroundColor: colors.statusBusy,
  },
  statusDotOffline: {
    backgroundColor: colors.statusOffline,
  },
  statusDotLost: {
    backgroundColor: colors.statusLost,
  },
  statusText: {
    fontSize: 14,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  nextActivity: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  squadStatusName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  squadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  squadStat: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  squadStatSeparator: {
    fontSize: 14,
    color: colors.textMuted,
  },
  meetupTime: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  meetupLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  meetupNote: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  managementSection: {
    marginTop: 8,
    marginBottom: 20,
  },
  managementTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondaryText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  squadCard: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  activeSquadCard: {
    borderColor: colors.accentGreen,
    borderWidth: 2,
  },
  squadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  squadInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  squadName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accentGreen,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expandIcon: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  inviteLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  inviteCode: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.accentBlue,
    fontFamily: 'monospace',
  },
  shareButton: {
    fontSize: 14,
    color: colors.accentBlue,
    fontWeight: '600',
  },
  squadDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  memberEmoji: {
    fontSize: 24,
  },
  memberName: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  roleLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  switchButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  switchButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  logoutButton: {
    borderColor: colors.accentRed,
  },
  logoutButtonText: {
    color: colors.accentRed,
  },
});
