import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { HudMeter } from './HudMeter';

interface SurvivalHudProps {
  timeLeftSec: number;
  watt: number;
  wattMax: number;
  wattRegen: number;
  wave: number;
  baseHp: number;
  baseMaxHp: number;
}

export function SurvivalHud({ timeLeftSec, watt, wattMax, wattRegen, wave, baseHp, baseMaxHp }: SurvivalHudProps) {
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = Math.floor(timeLeftSec % 60);
  const timeLabel = `${minutes}:${String(seconds).padStart(2, '0')}`;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Text style={styles.pillKey}>TIME</Text>
          <Text style={styles.pillVal}>{timeLabel}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillKey}>WAVE</Text>
          <Text style={styles.pillVal}>{wave}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillKey}>REGEN</Text>
          <Text style={styles.pillVal}>+{wattRegen.toFixed(1)}/s</Text>
        </View>
      </View>

      <HudMeter label="WATT" value={watt} max={wattMax} color={colors.accent2} />
      <HudMeter label="Base HP" value={baseHp} max={baseMaxHp} color={colors.good} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    padding: 10,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  pill: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  pillKey: {
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pillVal: {
    color: colors.text,
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
  },
});
