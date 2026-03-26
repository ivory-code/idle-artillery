import React from 'react';
import { StyleSheet, View } from 'react-native';

import { GamePanel } from './GamePanel';
import { WATTBar } from './WATTBar';
import { BaseHPBar } from './BaseHPBar';
import { WaveIndicator } from './WaveIndicator';

export function BattleTopHUD({
  wave,
  timeLeftSec,
  watt,
  wattMax,
  wattRegen,
  baseHp,
  baseMaxHp,
  threat = 'normal',
  frameSource,
  backgroundSource,
  wattPanelSource,
  hpPanelSource,
}) {
  return (
    <GamePanel title="Survival HUD" rightBadge="LIVE" tone="player" frameSource={frameSource} backgroundSource={backgroundSource} backgroundOpacity={0.26} frameOpacity={0.6}>
      <WaveIndicator wave={wave} timeLeftSec={timeLeftSec} threat={threat} panelSource={hpPanelSource} />
      <View style={styles.row}>
        <View style={styles.half}>
          <WATTBar value={watt} max={wattMax} regenPerSec={wattRegen} panelSource={wattPanelSource} />
        </View>
        <View style={styles.half}>
          <BaseHPBar hp={baseHp} maxHp={baseMaxHp} panelSource={hpPanelSource} />
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
