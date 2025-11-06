
import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add to Schedule</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
            <View>
              <Text style={styles.textPrimary}>Artist Content</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.textPrimary}>Meetup Content</Text>
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
    maxHeight: '80vh',
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
  textPrimary: {
    color: colors.textPrimary,
  },
});
