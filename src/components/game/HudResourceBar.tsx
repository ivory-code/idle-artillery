import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface HudResourceBarProps {
  scrap: number;
  coreBits: number;
  rightBadge?: string;
}

function ResourceChip({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.icon}>{icon}</Text>
      <View>
        <Text style={styles.chipLabel}>{label}</Text>
        <Text style={styles.chipValue}>{value}</Text>
      </View>
    </View>
  );
}

export function HudResourceBar({ scrap, coreBits, rightBadge }: HudResourceBarProps) {
  return (
    <View style={styles.wrap}>
      <ResourceChip icon="🔩" label="Scrap" value={scrap} />
      <ResourceChip icon="🔋" label="Core" value={coreBits} />
      {rightBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{rightBadge}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
    minHeight: 50,
    backgroundColor: colors.panelElev,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  chipLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  chipValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: colors.panelElev,
    borderColor: colors.accent2,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeText: {
    color: colors.accent2,
    fontWeight: '800',
    fontSize: 12,
  },
});
