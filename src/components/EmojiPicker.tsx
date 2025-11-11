import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

type EmojiPickerProps = {
  selectedEmoji: string;
  onEmojiSelect: (emoji: string) => void;
};

const EMOJIS = [
  ['😀', '😎', '🥳', '🔥', '💯', '⭐', '💜', '🎵'],
  ['🎉', '🌈', '💎', '👑', '🎊', '🎁', '🌟', '✨'],
];

export default function EmojiPicker({ selectedEmoji, onEmojiSelect }: EmojiPickerProps) {
  return (
    <View style={styles.container}>
      {EMOJIS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((emoji) => {
            const isSelected = emoji === selectedEmoji;
            return (
              <TouchableOpacity
                key={emoji}
                style={[styles.emojiButton, isSelected && styles.emojiButtonSelected]}
                onPress={() => onEmojiSelect(emoji)}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSecondary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  emojiButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  emojiButtonSelected: {
    backgroundColor: colors.accentBlue,
  },
  emojiText: {
    fontSize: 22,
  },
});
