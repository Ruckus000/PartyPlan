import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Share } from 'react-native';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Squad, SquadMember, Profile } from '../types';
import { generateInviteCode, isValidInviteCode } from '../utils/inviteCode';

const colors = {
  bgSecondary: '#0a0a0a',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accentBlue: '#3b82f6',
  accentGreen: '#10b981',
};

export default function SquadScreen() {
  const { profile, squads, activeSquadId, setActiveSquadId, addSquad } = useStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedSquadId, setExpandedSquadId] = useState<string | null>(null);
  const [squadMembers, setSquadMembers] = useState<Record<string, SquadMember[]>>({});

  // Load members for a squad
  const loadSquadMembers = async (squadId: string) => {
    const { data, error } = await supabase
      .from('squad_members')
      .select('*, profiles(*)')
      .eq('squad_id', squadId);

    if (!error && data) {
      setSquadMembers(prev => ({
        ...prev,
        [squadId]: data.map((m: SquadMember & { profiles: Profile | null }) => ({
          ...m,
          profile: m.profiles,
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
    try {
      // Generate unique invite code
      let inviteCode = generateInviteCode();

      // Check if code is unique (retry if collision)
      let attempts = 0;
      while (attempts < 5) {
        const { data: existing } = await supabase
          .from('squads')
          .select('id')
          .eq('invite_code', inviteCode)
          .single();

        if (!existing) break;
        inviteCode = generateInviteCode();
        attempts++;
      }

      // Create squad and add member atomically using RPC
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('create_squad_with_member', {
          squad_name: newSquadName.trim(),
          invite_code_param: inviteCode,
          creator_id: profile.id,
        });

      if (rpcError) throw rpcError;

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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create squad';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Squads</Text>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 20,
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
});
