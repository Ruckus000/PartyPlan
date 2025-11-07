import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { seedSets } from '../data/seedLineup';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Plan } from '../types';
import { colors } from '../constants/colors';
import TimePicker from './TimePicker';

type AddModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AddModal({ visible, onClose }: AddModalProps) {
  const [activeTab, setActiveTab] = useState('Artist');
  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [meetupTime, setMeetupTime] = useState(new Date());
  const [meetupLocation, setMeetupLocation] = useState('');
  const [meetupNote, setMeetupNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { profile, activeSquadId, addPlan, updatePlan, removePlan, editingPlan, setEditingPlan } = useStore();

  // Pre-fill form when editingPlan is set
  useEffect(() => {
    if (editingPlan && editingPlan.type === 'meetup') {
      setActiveTab('Meetup');
      // Parse the time string (e.g., "9:00 PM") to a Date object
      if (editingPlan.meet_time) {
        const timeParts = editingPlan.meet_time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeParts) {
          const hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const isPM = timeParts[3].toUpperCase() === 'PM';
          const date = new Date();
          date.setHours(isPM && hours !== 12 ? hours + 12 : !isPM && hours === 12 ? 0 : hours);
          date.setMinutes(minutes);
          setMeetupTime(date);
        }
      }
      setMeetupLocation(editingPlan.meet_location || '');
      setMeetupNote(editingPlan.note || '');
    }
  }, [editingPlan]);

  // Get unique days and stages
  const uniqueDays = Array.from(new Set(seedSets.map(set => {
    const date = new Date(set.start);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}`;
  })));
  const availableDays = ['All', ...uniqueDays];

  const uniqueStages = Array.from(new Set(seedSets.map(set => set.stage)));
  const availableStages = ['All', ...uniqueStages];

  // Filter artists based on day and stage selections
  const filteredSets = seedSets.filter(set => {
    const setDate = new Date(set.start);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const setDay = `${dayNames[setDate.getDay()]}, ${monthNames[setDate.getMonth()]} ${setDate.getDate()}`;

    const dayMatch = selectedDay === 'All' || setDay === selectedDay;
    const stageMatch = selectedStage === 'All' || set.stage === selectedStage;

    return dayMatch && stageMatch;
  });

  const handleAddArtist = async (setId: string) => {
    // Guard: prevent double submission
    if (isSubmitting) return;

    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    // Plans don't require a squad - they can be personal/individual plans
    setIsSubmitting(true);

    // Create temporary plan for optimistic update
    const tempPlan: Plan = {
      id: `temp-${Date.now()}`,
      squad_id: activeSquadId || null,
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
          squad_id: activeSquadId || null,
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
    if (isSubmitting) return;

    if (!meetupLocation) {
      Alert.alert('Error', 'Please fill in time and location');
      return;
    }

    const hours = meetupTime.getHours();
    const minutes = meetupTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    const formattedTime = `${displayHours}:${displayMinutes} ${ampm}`;

    if (!profile) {
      Alert.alert('Error', 'Please sign in to add plans');
      return;
    }

    // Meeting points don't require a squad - they can be personal plans
    // Check if we're in edit mode
    if (editingPlan) {
      // UPDATE existing plan - optimistic update
      setIsSubmitting(true);

      // Save original plan for rollback
      const originalPlan = { ...editingPlan };

      // Optimistic: instant UI update
      updatePlan(editingPlan.id, {
        meet_time: formattedTime,
        meet_location: meetupLocation,
        note: meetupNote || null,
      });
      resetForm();
      onClose(); // Close modal immediately!

      // Background: sync to database
      try {
        const { data: plan, error } = await supabase
          .from('plans')
          .update({
            meet_time: formattedTime,
            meet_location: meetupLocation,
            note: meetupNote || null,
          })
          .eq('id', editingPlan.id)
          .select()
          .single();

        if (error) throw error;

        // Update with server response
        updatePlan(plan.id, plan);
      } catch (error) {
        // Rollback on failure
        updatePlan(originalPlan.id, originalPlan);
        const message = error instanceof Error ? error.message : 'Failed to update meeting point';
        Alert.alert('Failed to update', message);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // INSERT new plan - optimistic update
      setIsSubmitting(true);

      const tempPlan: Plan = {
        id: `temp-${Date.now()}`,
        squad_id: activeSquadId || null,
        created_by: profile.id,
        type: 'meetup',
        set_id: null,
        meet_time: formattedTime,
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
            squad_id: activeSquadId || null,
            created_by: profile.id,
            type: 'meetup',
            meet_time: formattedTime,
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
    setSelectedDay('All');
    setSelectedStage('All');
    setShowDayDropdown(false);
    setShowStageDropdown(false);
    setMeetupTime(new Date());
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
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                <View style={styles.timePickerContainer}>
                  <TimePicker
                    value={meetupTime}
                    onChange={setMeetupTime}
                  />
                </View>

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
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleAddMeetup}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting
                      ? (editingPlan ? 'Updating...' : 'Adding...')
                      : (editingPlan ? 'Update Meeting Point' : 'Add Meeting Point')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : activeTab === 'Artist' ? (
              <View style={styles.tabContent}>
                {/* Filter Dropdowns */}
                <View style={styles.filtersContainer}>
                  {/* Day Dropdown */}
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.dropdownLabel}>DAY</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => {
                        setShowDayDropdown(!showDayDropdown);
                        setShowStageDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{selectedDay}</Text>
                      <Text style={styles.dropdownArrow}>{showDayDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showDayDropdown && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView style={styles.dropdownScrollView}>
                          {availableDays.map((day) => (
                            <TouchableOpacity
                              key={day}
                              style={[
                                styles.dropdownItem,
                                selectedDay === day && styles.dropdownItemSelected,
                              ]}
                              onPress={() => {
                                setSelectedDay(day);
                                setShowDayDropdown(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedDay === day && styles.dropdownItemTextSelected,
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  {/* Stage Dropdown */}
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.dropdownLabel}>STAGE</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => {
                        setShowStageDropdown(!showStageDropdown);
                        setShowDayDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownText}>{selectedStage}</Text>
                      <Text style={styles.dropdownArrow}>{showStageDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showStageDropdown && (
                      <View style={styles.dropdownMenu}>
                        <ScrollView style={styles.dropdownScrollView}>
                          {availableStages.map((stage) => (
                            <TouchableOpacity
                              key={stage}
                              style={[
                                styles.dropdownItem,
                                selectedStage === stage && styles.dropdownItemSelected,
                              ]}
                              onPress={() => {
                                setSelectedStage(stage);
                                setShowStageDropdown(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  selectedStage === stage && styles.dropdownItemTextSelected,
                                ]}
                              >
                                {stage}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                </View>

                <ScrollView style={styles.artistList}>
                  {filteredSets.map(set => (
                    <TouchableOpacity
                      key={set.id}
                      style={[styles.artistItem, isSubmitting && styles.artistItemDisabled]}
                      onPress={() => handleAddArtist(set.id)}
                      disabled={isSubmitting}
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
      </TouchableWithoutFeedback>
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
  timePickerContainer: {
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
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: colors.bgHover,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  dropdownItemTextSelected: {
    color: colors.accentBlue,
    fontWeight: '600',
  },
});
