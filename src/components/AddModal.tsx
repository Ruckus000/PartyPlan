
import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { seedSets } from '../data/seedLineup';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Plan } from '../types';

const colors = {
  bgSecondary: '#0a0a0a',
  bgCard: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accentBlue: '#3b82f6',
};

type AddModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddModal({ visible, onClose }: AddModalProps) {
  const [activeTab, setActiveTab] = useState('Artist');
  const [searchQuery, setSearchQuery] = useState('');
  const [meetupTime, setMeetupTime] = useState('');
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupNote, setMeetupNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { profile, activeSquadId, addPlan, updatePlan, removePlan, editingPlan, setEditingPlan } = useStore();

  // Pre-fill form when editingPlan is set
  useEffect(() => {
    if (editingPlan && editingPlan.type === 'meetup') {
      setActiveTab('Meetup');
      setMeetupTime(editingPlan.meet_time || '');
      setMeetupLocation(editingPlan.meet_location || '');
      setMeetupNote(editingPlan.note || '');
    }
  }, [editingPlan]);

  // Filter artists based on search query
  // Optimize by calculating toLowerCase() once
  const lowercasedQuery = searchQuery.toLowerCase();
  const filteredSets = seedSets.filter(set =>
    set.artist.toLowerCase().includes(lowercasedQuery) ||
    set.stage.toLowerCase().includes(lowercasedQuery)
  );

  const handleAddArtist = async (setId: string) => {
    // Guard: prevent double submission
    if (isSubmitting) return;

    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    if (!activeSquadId) {
      Alert.alert('Error', 'No active squad. Please create or join a squad first.');
      return;
    }

    setIsSubmitting(true);

    // Create temporary plan for optimistic update
    const tempPlan: Plan = {
      id: `temp-${Date.now()}`,
      squad_id: activeSquadId,
      created_by: profile.id,
      type: 'set',
      set_id: setId,
      meet_time: null,
      meet_location: null,
      note: null,
      created_at: new Date().toISOString(),
    };

    // Optimistic: instant UI update
    addPlan(tempPlan);
    resetForm();
    onClose(); // Close modal immediately!

    // Background: sync to database
    try {
      const { data: plan, error } = await supabase
        .from('plans')
        .insert({
          squad_id: activeSquadId,
          created_by: profile.id,
          type: 'set',
          set_id: setId,
        })
        .select()
        .single();

      if (error) throw error;

      // Replace temp with real plan
      removePlan(tempPlan.id);
      addPlan(plan);
    } catch (error) {
      // Rollback on failure
      removePlan(tempPlan.id);
      const message = error instanceof Error ? error.message : 'Failed to add artist';
      Alert.alert('Failed to add', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMeetup = async () => {
    // Guard: prevent double submission
    if (isSubmitting || loading) return;

    if (!meetupTime || !meetupLocation) {
      Alert.alert('Error', 'Please fill in time and location');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    if (!activeSquadId) {
      Alert.alert('Error', 'No active squad. Please create or join a squad first.');
      return;
    }

    // Check if we're in edit mode
    if (editingPlan) {
      // UPDATE existing plan (not optimistic, shows loading state)
      setLoading(true);
      try {
        const { data: plan, error } = await supabase
          .from('plans')
          .update({
            meet_time: meetupTime,
            meet_location: meetupLocation,
            note: meetupNote || null,
          })
          .eq('id', editingPlan.id)
          .select()
          .single();

        if (error) throw error;

        // Update in local store - consistent pattern
        updatePlan(plan.id, plan);

        Alert.alert('Success', 'Meeting point updated!');
        resetForm();
        onClose();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to update meeting point';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    } else {
      // INSERT new plan - optimistic update
      setIsSubmitting(true);

      const tempPlan: Plan = {
        id: `temp-${Date.now()}`,
        squad_id: activeSquadId,
        created_by: profile.id,
        type: 'meetup',
        set_id: null,
        meet_time: meetupTime,
        meet_location: meetupLocation,
        note: meetupNote || null,
        created_at: new Date().toISOString(),
      };

      // Optimistic: instant UI update
      addPlan(tempPlan);
      resetForm();
      onClose(); // Close modal immediately!

      // Background: sync to database
      try {
        const { data: plan, error } = await supabase
          .from('plans')
          .insert({
            squad_id: activeSquadId,
            created_by: profile.id,
            type: 'meetup',
            meet_time: meetupTime,
            meet_location: meetupLocation,
            note: meetupNote || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Replace temp with real plan
        removePlan(tempPlan.id);
        addPlan(plan);
      } catch (error) {
        // Rollback on failure
        removePlan(tempPlan.id);
        const message = error instanceof Error ? error.message : 'Failed to add meeting point';
        Alert.alert('Failed to add', message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setMeetupTime('');
    setMeetupLocation('');
    setMeetupNote('');
    setEditingPlan(null);
    setActiveTab('Artist');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPlan ? 'Edit Meeting Point' : 'Add to Schedule'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Hide tabs in edit mode */}
          {!editingPlan && (
            <View style={styles.modalTabs}>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'Artist' && styles.activeTab]}
                onPress={() => setActiveTab('Artist')}
              >
                <Text style={[styles.modalTabText, activeTab === 'Artist' && styles.activeTabText]}>Artist</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTab, activeTab === 'Meetup' && styles.activeTab]}
                onPress={() => setActiveTab('Meetup')}
              >
                <Text style={[styles.modalTabText, activeTab === 'Meetup' && styles.activeTabText]}>Meeting Point</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* In edit mode, only show meetup form */}
          {editingPlan || activeTab === 'Meetup' ? (
            <View style={styles.tabContent}>
              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 9:00 PM"
                placeholderTextColor={colors.textSecondary}
                value={meetupTime}
                onChangeText={setMeetupTime}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Main entrance, by the ferris wheel"
                placeholderTextColor={colors.textSecondary}
                value={meetupLocation}
                onChangeText={setMeetupLocation}
              />

              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any additional details..."
                placeholderTextColor={colors.textSecondary}
                value={meetupNote}
                onChangeText={setMeetupNote}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={[styles.submitButton, (isSubmitting || loading) && styles.submitButtonDisabled]}
                onPress={handleAddMeetup}
                disabled={isSubmitting || loading}
              >
                <Text style={styles.submitButtonText}>
                  {(isSubmitting || loading)
                    ? (editingPlan ? 'Updating...' : 'Adding...')
                    : (editingPlan ? 'Update Meeting Point' : 'Add Meeting Point')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : activeTab === 'Artist' ? (
            <View style={styles.tabContent}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search artists or stages..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <ScrollView style={styles.artistList}>
                {filteredSets.map(set => (
                  <TouchableOpacity
                    key={set.id}
                    style={[styles.artistItem, isSubmitting && styles.artistItemDisabled]}
                    onPress={() => handleAddArtist(set.id)}
                    disabled={isSubmitting || loading}
                  >
                    <View style={styles.artistInfo}>
                      <Text style={styles.artistName}>{set.artist}</Text>
                      <Text style={styles.artistMeta}>
                        {set.stage} • {new Date(set.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.addButton}>+</Text>
                  </TouchableOpacity>
                ))}
                {filteredSets.length === 0 && (
                  <Text style={styles.emptyText}>No artists found</Text>
                )}
              </ScrollView>
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: colors.textSecondary,
    fontSize: 20,
    lineHeight: 24,
  },
  modalTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  modalTab: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.accentBlue,
    borderColor: colors.accentBlue,
  },
  modalTabText: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 14,
  },
  activeTabText: {
    color: colors.textPrimary,
  },
  tabContent: {
    flex: 1,
  },
  searchInput: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  artistList: {
    flex: 1,
  },
  artistItem: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artistMeta: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  addButton: {
    color: colors.accentBlue,
    fontSize: 28,
    fontWeight: '300',
    marginLeft: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.accentBlue,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#1e3a5f',
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  artistItemDisabled: {
    opacity: 0.5,
  },
});
