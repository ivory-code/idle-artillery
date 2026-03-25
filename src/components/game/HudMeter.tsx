import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface HudMeterProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  compact?: boolean;
}

export function HudMeter({ label, value, max, color = colors.accent, compact = false }: HudMeterProps) {
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));

  return (
    <View style={compact ? styles.compactWrap : styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {Math.round(value)}/{Math.round(max)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  compactWrap: {
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
