import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

interface PixelButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'default' | 'success' | 'danger';
  style?: StyleProp<ViewStyle>;
}

export function PixelButton({ label, onPress, disabled = false, tone = 'default', style }: PixelButtonProps) {
  const toneStyle = tone === 'danger' ? styles.danger : tone === 'success' ? styles.success : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, toneStyle, pressed && !disabled ? styles.pressed : null, disabled ? styles.disabled : null, style]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#263d63',
    borderColor: '#8ab5ff',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  success: {
    backgroundColor: '#225039',
    borderColor: '#8ce39a',
  },
  danger: {
    backgroundColor: '#5a2c37',
    borderColor: '#ff8d8d',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 14,
  },
});
