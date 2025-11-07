import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { colors } from '../constants/colors';
import { getArtistImagePath } from '../utils/artistImages';

type SetDetail = {
  artist: string;
  stage: string;
  timeRange: string;
  day: string;
  setId: string;
  isPlanned: boolean;
};

type SetDetailModalProps = {
  visible: boolean;
  setDetail: SetDetail | null;
  onClose: () => void;
  onAddToSchedule?: (setId: string) => void;
  onRemoveFromSchedule?: (setId: string) => void;
  availableDays?: string[]; // Array of day strings, e.g., ["Friday, Nov 7", "Saturday, Nov 8"]
  availableStages?: string[]; // Array of stage IDs
  onDayChange?: (day: string) => void;
  onStageChange?: (stage: string) => void;
};

export default function SetDetailModal({
  visible,
  setDetail,
  onClose,
  onAddToSchedule,
  onRemoveFromSchedule,
  availableDays = [],
  availableStages = [],
  onDayChange,
  onStageChange,
}: SetDetailModalProps) {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [showDayDropdown, setShowDayDropdown] = useState(false);
  const [showStageDropdown, setShowStageDropdown] = useState(false);

  // Update selected values when setDetail changes
  useEffect(() => {
    if (setDetail) {
      setSelectedDay(setDetail.day);
      setSelectedStage(setDetail.stage);
    }
  }, [setDetail]);

  if (!setDetail) return null;

  const artistImage = getArtistImagePath(setDetail.artist);

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
    setShowDayDropdown(false);
    onDayChange?.(day);
  };

  const handleStageSelect = (stage: string) => {
    setSelectedStage(stage);
    setShowStageDropdown(false);
    onStageChange?.(stage);
  };

  const handleToggleSchedule = () => {
    if (setDetail.isPlanned) {
      Alert.alert(
        'Remove from Schedule',
        `Remove ${setDetail.artist} from your schedule?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              onRemoveFromSchedule?.(setDetail.setId);
              onClose();
            },
          },
        ]
      );
    } else {
      onAddToSchedule?.(setDetail.setId);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView style={styles.modalContent}>
            {/* Close Button */}
            <View style={styles.closeButtonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Filter Dropdowns */}
            {(availableDays.length > 0 || availableStages.length > 0) && (
              <View style={styles.filtersContainer}>
                {/* Day Dropdown */}
                {availableDays.length > 0 && (
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.dropdownLabel}>DAY</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowDayDropdown(!showDayDropdown)}
                    >
                      <Text style={styles.dropdownText}>{selectedDay}</Text>
                      <Text style={styles.dropdownArrow}>{showDayDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showDayDropdown && (
                      <View style={styles.dropdownMenu}>
                        {availableDays.map((day) => (
                          <TouchableOpacity
                            key={day}
                            style={[
                              styles.dropdownItem,
                              selectedDay === day && styles.dropdownItemSelected,
                            ]}
                            onPress={() => handleDaySelect(day)}
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
                      </View>
                    )}
                  </View>
                )}

                {/* Stage Dropdown */}
                {availableStages.length > 0 && (
                  <View style={styles.dropdownWrapper}>
                    <Text style={styles.dropdownLabel}>STAGE</Text>
                    <TouchableOpacity
                      style={styles.dropdown}
                      onPress={() => setShowStageDropdown(!showStageDropdown)}
                    >
                      <Text style={styles.dropdownText}>{selectedStage}</Text>
                      <Text style={styles.dropdownArrow}>{showStageDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    {showStageDropdown && (
                      <View style={styles.dropdownMenu}>
                        {availableStages.map((stage) => (
                          <TouchableOpacity
                            key={stage}
                            style={[
                              styles.dropdownItem,
                              selectedStage === stage && styles.dropdownItemSelected,
                            ]}
                            onPress={() => handleStageSelect(stage)}
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
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* Artist Image */}
            {artistImage && (
              <View style={styles.imageContainer}>
                <Image
                  source={artistImage}
                  style={styles.artistImage}
                  resizeMode="cover"
                />
              </View>
            )}

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.artistName}>{setDetail.artist.toUpperCase()}</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📅</Text>
                <Text style={styles.detailText}>{setDetail.day}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>🕐</Text>
                <Text style={styles.detailText}>{setDetail.timeRange}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📍</Text>
                <Text style={styles.detailText}>{setDetail.stage}</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleToggleSchedule}
              >
                <Text style={styles.primaryButtonText}>
                  {setDetail.isPlanned ? '✓ In Schedule' : '+ Add to Schedule'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Placeholder sections for future enhancement */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SQUAD ATTENDANCE</Text>
              <Text style={styles.placeholderText}>
                Squad attendance will appear here
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>NOTES</Text>
              <Text style={styles.placeholderText}>
                Add notes about this set...
              </Text>
            </View>
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.bgSecondary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalContent: {
    padding: 20,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
  },
  header: {
    marginBottom: 20,
  },
  artistName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  actions: {
    marginBottom: 24,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accentBlue,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.textMuted,
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
