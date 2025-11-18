import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useStore } from '../lib/store';
import { Profile } from '../types';
import { colors } from '../constants/colors';
import EmojiPicker from './EmojiPicker';

type EditProfileModalProps = {
    visible: boolean;
    onClose: () => void;
};

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
    const { profile, setProfile } = useStore();
    const [displayName, setDisplayName] = useState('');
    const [emoji, setEmoji] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPasswordReset, setShowPasswordReset] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Initialize form with current profile data
    useEffect(() => {
        if (profile) {
            setDisplayName(profile.display_name || '');
            setEmoji(profile.emoji || '');
        }
        // Reset password fields when modal opens/closes
        setShowPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
    }, [profile, visible]);

    const handleSave = async () => {
        if (!profile) return;

        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name is required');
            return;
        }

        if (!emoji.trim()) {
            Alert.alert('Error', 'Emoji is required');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({
                    display_name: displayName.trim(),
                    emoji: emoji.trim(),
                })
                .eq('id', profile.id)
                .select()
                .single();

            if (error) throw error;

            // Update local store
            setProfile(data as Profile);
            Alert.alert('Success', 'Profile updated successfully');
            onClose();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in both password fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) throw error;

            Alert.alert('Success', 'Password updated successfully');
            setShowPasswordReset(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update password';
            Alert.alert('Error', message);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleCancelPasswordReset = () => {
        setShowPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <SafeAreaView style={styles.modalOverlay} edges={['bottom']}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Edit Profile</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Display Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your display name"
                                placeholderTextColor={colors.textMuted}
                                value={displayName}
                                onChangeText={setDisplayName}
                                autoCapitalize="words"
                                editable={!loading}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Emoji</Text>
                            <EmojiPicker
                                selectedEmoji={emoji}
                                onEmojiSelect={setEmoji}
                            />
                            <Text style={styles.helperText}>
                                This emoji will appear next to your name in squads
                            </Text>
                        </View>

                        <View style={styles.divider} />

                        {!showPasswordReset ? (
                            <TouchableOpacity
                                style={styles.passwordResetButton}
                                onPress={() => setShowPasswordReset(true)}
                                disabled={loading}
                            >
                                <Text style={styles.passwordResetButtonText}>Reset Password</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.passwordResetSection}>
                                <Text style={styles.sectionTitle}>Reset Password</Text>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>New Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.textMuted}
                                        value={newPassword}
                                        onChangeText={setNewPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        editable={!passwordLoading}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.textMuted}
                                        value={confirmPassword}
                                        onChangeText={setConfirmPassword}
                                        secureTextEntry
                                        autoCapitalize="none"
                                        editable={!passwordLoading}
                                    />
                                </View>

                                <View style={styles.passwordButtonRow}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.buttonSecondary, { flex: 1 }]}
                                        onPress={handleCancelPasswordReset}
                                        disabled={passwordLoading}
                                    >
                                        <Text style={styles.buttonSecondaryText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.button, styles.buttonPrimary, { flex: 1 }]}
                                        onPress={handlePasswordReset}
                                        disabled={passwordLoading}
                                    >
                                        <Text style={styles.buttonPrimaryText}>
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSecondary]}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.buttonSecondaryText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonPrimary]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            <Text style={styles.buttonPrimaryText}>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: colors.bgCard,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        letterSpacing: 0.3,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.bgSecondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
        color: colors.textSecondary,
        fontWeight: '300',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    input: {
        backgroundColor: colors.bgSecondary,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 12,
        color: colors.textPrimary,
        fontSize: 16,
        minHeight: 44,
    },
    helperText: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 6,
        lineHeight: 16,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    button: {
        flex: 1,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 44,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonPrimary: {
        backgroundColor: colors.accentBlue,
    },
    buttonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    passwordResetButton: {
        backgroundColor: colors.bgSecondary,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        minHeight: 44,
    },
    passwordResetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.accentBlue,
    },
    passwordResetSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 16,
        letterSpacing: 0.3,
    },
    passwordButtonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
});


