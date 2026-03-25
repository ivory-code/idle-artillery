import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PartRarity, RoleIdentity } from '../../types/game';
import { colors } from '../../theme/colors';
import { HudMeter } from './HudMeter';
import { RarityFrame } from './RarityFrame';

interface UnitCardProps {
  name: string;
  role: RoleIdentity;
  power: number;
  rarity?: PartRarity;
  hpPct?: number;
  badge?: string;
  compact?: boolean;
  onPress?: () => void;
}

export function UnitCard({ name, role, power, rarity = 'common', hpPct = 1, badge, compact = false, onPress }: UnitCardProps) {
  const content = (
    <RarityFrame rarity={rarity}>
      <View style={styles.topRow}>
        <View style={styles.spriteBox}>
          <View style={styles.spriteInner} />
        </View>
        <View style={styles.infoWrap}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.role}>{role}</Text>
        </View>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <HudMeter label="Armor" value={Math.round(hpPct * 100)} max={100} color={colors.good} compact />
      <Text style={styles.power}>PWR {power}</Text>
    </RarityFrame>
  );

  if (!onPress) {
    return <View style={compact ? styles.compactWrap : undefined}>{content}</View>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [compact ? styles.compactWrap : undefined, pressed ? styles.pressed : null]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  compactWrap: {
    width: 174,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spriteBox: {
    width: 46,
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDeep,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spriteInner: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.panelElev,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoWrap: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  role: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    color: colors.warning,
    fontWeight: '800',
    fontSize: 10,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  power: {
    marginTop: 8,
    color: colors.accent2,
    fontWeight: '800',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.86,
  },
});
