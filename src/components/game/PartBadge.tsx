import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PartRarity } from '../../types/game';
import { colors } from '../../theme/colors';

interface PartBadgeProps {
  slot: string;
  level: number;
  rarity: PartRarity;
}

function getRarityColor(rarity: PartRarity): string {
  if (rarity === 'epic') return colors.rarityEpic;
  if (rarity === 'rare') return colors.rarityRare;
  return colors.rarityCommon;
}

export function PartBadge({ slot, level, rarity }: PartBadgeProps) {
  const tone = getRarityColor(rarity);

  return (
    <View style={[styles.wrap, { borderColor: tone }]}>
      <Text style={styles.slot}>{slot}</Text>
      <Text style={[styles.level, { color: tone }]}>Lv.{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 9,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: colors.panelAlt,
  },
  slot: {
    color: colors.textDim,
    textTransform: 'uppercase',
    fontSize: 10,
    fontWeight: '700',
  },
  level: {
    fontSize: 11,
    fontWeight: '800',
  },
});
