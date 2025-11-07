import React from 'react';
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
};

export default function SetDetailModal({
  visible,
  setDetail,
  onClose,
  onAddToSchedule,
  onRemoveFromSchedule,
}: SetDetailModalProps) {
  if (!setDetail) return null;

  const artistImage = getArtistImagePath(setDetail.artist);

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
});
