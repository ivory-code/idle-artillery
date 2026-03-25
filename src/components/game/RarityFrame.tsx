import React, { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { PartRarity } from '../../types/game';
import { colors } from '../../theme/colors';

interface RarityFrameProps extends PropsWithChildren {
  rarity?: PartRarity;
}

function getRarityColor(rarity: PartRarity) {
  if (rarity === 'epic') return colors.rarityEpic;
  if (rarity === 'rare') return colors.rarityRare;
  return colors.rarityCommon;
}

export function RarityFrame({ rarity = 'common', children }: RarityFrameProps) {
  const borderColor = getRarityColor(rarity);

  return (
    <View style={[styles.frameOuter, { borderColor }]}>
      <View style={[styles.frameInner, { borderColor }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  frameOuter: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 2,
  },
  frameInner: {
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.panel,
    padding: 10,
  },
});
