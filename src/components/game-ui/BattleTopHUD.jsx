import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GamePanel } from './GamePanel';
import { WATTBar } from './WATTBar';
import { BaseHPBar } from './BaseHPBar';
import { WaveIndicator } from './WaveIndicator';

export function BattleTopHUD({ wave, timeLeftSec, watt, wattMax, wattRegen, baseHp, baseMaxHp, threat = 'normal' }) {
  return (
    <GamePanel title="Survival HUD" rightBadge="LIVE" tone="player">
      <WaveIndicator wave={wave} timeLeftSec={timeLeftSec} threat={threat} />
      <View style={styles.row}>
        <View style={styles.half}>
          <WATTBar value={watt} max={wattMax} regenPerSec={wattRegen} />
        </View>
        <View style={styles.half}>
          <BaseHPBar hp={baseHp} maxHp={baseMaxHp} />
        </View>
      </View>
    </GamePanel>
  );
}

const styles = StyleSheet.create({
  row: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 8,
  },
  half: {
    flex: 1,
  },
});
