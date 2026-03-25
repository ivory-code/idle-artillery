import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { useGame } from '../state/GameProvider';
import { colors } from '../theme/colors';

export function ResultScreen({ navigation, route }: any) {
  const { state } = useGame();
  const result = route.params?.result || state.battle.lastResult;

  if (!result) {
    return (
      <ScreenShell>
        <Text style={styles.title}>Result</Text>
        <Text style={styles.emptyText}>No battle result yet. Run a battle first.</Text>
        <PixelButton label="Back to Hangar" onPress={() => navigation.navigate('Hangar')} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <Text style={styles.title}>Result</Text>

      <ListPanel
        title={result.victory ? 'Mission Clear' : 'Mission Failed'}
        items={[
          { id: 'line_0', label: 'Mode', value: result.mode === 'stage' ? 'Stage' : 'Survival' },
          { id: 'line_1', label: 'Wave', value: result.waveName },
          { id: 'line_2', label: 'Outcome', value: result.victory ? 'Victory' : 'Defeat' },
          { id: 'line_3', label: 'Duration', value: `${result.durationSec}s` },
          { id: 'line_4', label: 'Enemies Defeated', value: result.enemiesDefeated },
          { id: 'line_5', label: 'Squad HP Left', value: result.squadHpLeft },
          { id: 'line_6', label: 'Score', value: result.score },
          { id: 'line_7', label: 'Scrap', value: `+${result.rewards.scrap}` },
          { id: 'line_8', label: 'Core Bits', value: `+${result.rewards.coreBits}` },
          ...(result.mode === 'survival'
            ? [
                { id: 'line_9', label: 'Spikes Cleared', value: result.milestones.spikesCleared },
                { id: 'line_10', label: 'Elites Defeated', value: result.milestones.elitesDefeated },
                { id: 'line_11', label: 'Bosses Defeated', value: result.milestones.bossesDefeated },
                { id: 'line_12', label: '5-Min Clear', value: result.milestones.fiveMinuteClear ? 'Yes' : 'No' },
              ]
            : []),
        ]}
        renderItem={(item) => <InfoCard title={item.label} rightLabel={String(item.value)} />}
      />

      <View style={styles.row}>
        <PixelButton label="Replay" onPress={() => navigation.replace('Battle')} tone="success" style={styles.flexBtn} />
        <PixelButton label="To Hangar" onPress={() => navigation.navigate('Hangar')} style={styles.flexBtn} />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyText: {
    color: colors.textDim,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flexBtn: {
    flex: 1,
  },
});
