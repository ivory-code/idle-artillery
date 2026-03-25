import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface ActionTileProps {
  label: string;
  caption?: string;
  icon?: string;
  onPress: () => void;
  tone?: 'default' | 'battle' | 'accent';
  disabled?: boolean;
}

export function ActionTile({ label, caption, icon = '⚙️', onPress, tone = 'default', disabled = false }: ActionTileProps) {
  const toneStyle = tone === 'battle' ? styles.toneBattle : tone === 'accent' ? styles.toneAccent : null;

  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.tile, toneStyle, pressed ? styles.pressed : null, disabled ? styles.disabled : null]}>
      <View style={styles.iconBox}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toneBattle: {
    borderColor: colors.warning,
    backgroundColor: '#3b2f2a',
  },
  toneAccent: {
    borderColor: colors.accent2,
    backgroundColor: '#173745',
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 18,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 16,
  },
  caption: {
    color: colors.textDim,
    marginTop: 3,
    fontSize: 11,
  },
});
