import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GamePanel } from './GamePanel';
import { palette } from './palette';

function RewardRow({ icon, label, value, tone }) {
  return (
    <View style={styles.row}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: tone }]}>{value}</Text>
    </View>
  );
}

export function ResultRewardCard({ result = 'Victory', score = 0, scrap = 0, coreBits = 0 }) {
  const victory = result.toLowerCase() === 'victory';
  return (
    <GamePanel title="Reward Cache" rightBadge={result.toUpperCase()} tone={victory ? 'player' : 'enemy'}>
      <RewardRow icon="🏆" label="Score" value={score} tone={palette.textMain} />
      <RewardRow icon="🔩" label="Scrap" value={`+${scrap}`} tone={palette.warning} />
      <RewardRow icon="🔋" label="Core Bits" value={`+${coreBits}`} tone={palette.playerA} />
    </GamePanel>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 22,
    fontSize: 13,
  },
  label: {
    flex: 1,
    color: palette.textDim,
    fontSize: 11,
    fontWeight: '800',
  },
  value: {
    fontSize: 13,
    fontWeight: '900',
  },
});
