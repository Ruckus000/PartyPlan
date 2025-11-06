
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, ScrollView, Alert } from 'react-native';
import { seedSets } from '../data/seedLineup';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';

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

  const { profile, addPlan } = useStore();

  // Filter artists based on search query
  const filteredSets = seedSets.filter(set =>
    set.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.stage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get or create default squad for the user
  const getDefaultSquad = async (userId: string) => {
    // Check if user has a default squad
    const { data: existingSquad } = await supabase
      .from('squads')
      .select('*')
      .eq('created_by', userId)
      .eq('name', 'My Schedule')
      .single();

    if (existingSquad) {
      return existingSquad.id;
    }

    // Create a default personal squad
    const { data: newSquad, error } = await supabase
      .from('squads')
      .insert({
        name: 'My Schedule',
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating squad:', error);
      throw error;
    }

    return newSquad.id;
  };

  const handleAddArtist = async (setId: string) => {
    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    setLoading(true);
    try {
      const squadId = await getDefaultSquad(profile.id);

      const { data: plan, error } = await supabase
        .from('plans')
        .insert({
          squad_id: squadId,
          created_by: profile.id,
          type: 'set',
          set_id: setId,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local store
      addPlan(plan);

      Alert.alert('Success', 'Artist added to schedule!');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add artist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeetup = async () => {
    if (!meetupTime || !meetupLocation) {
      Alert.alert('Error', 'Please fill in time and location');
      return;
    }

    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    setLoading(true);
    try {
      const squadId = await getDefaultSquad(profile.id);

      const { data: plan, error } = await supabase
        .from('plans')
        .insert({
          squad_id: squadId,
          created_by: profile.id,
          type: 'meetup',
          meet_time: meetupTime,
          meet_location: meetupLocation,
          note: meetupNote || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local store
      addPlan(plan);

      Alert.alert('Success', 'Meeting point added!');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add meeting point');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setMeetupTime('');
    setMeetupLocation('');
    setMeetupNote('');
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
            <Text style={styles.modalTitle}>Add to Schedule</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

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

          {activeTab === 'Artist' ? (
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
                    style={styles.artistItem}
                    onPress={() => handleAddArtist(set.id)}
                    disabled={loading}
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
          ) : (
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
                style={styles.submitButton}
                onPress={handleAddMeetup}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Adding...' : 'Add Meeting Point'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
