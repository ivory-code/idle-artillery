import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { StatRow } from '../components/StatRow';
import { waves } from '../data/waves';
import { SURVIVAL_DURATION_SEC, runBattleSimulation } from '../logic/battleSim';
import { getUpgradeEffects } from '../logic/upgrades';
import { useGame } from '../state/GameProvider';
import { getSelectedWave, getSquadCombatUnits, getSquadPower, getSquadStats, getUnlockedWaveIds } from '../state/selectors';
import { colors } from '../theme/colors';
import { BattleMode } from '../types/game';

export function BattleScreen({ navigation }: any) {
  const { state, dispatch } = useGame();

  const wave = getSelectedWave(state);
  const mode = state.battle.selectedMode ?? 'stage';
  const unlockedWaveIds = getUnlockedWaveIds(state);
  const unlockedWaveSet = new Set(unlockedWaveIds);
  const squadUnits = getSquadCombatUnits(state);
  const squadStats = getSquadStats(state);
  const squadPower = getSquadPower(state);
  const canStartBattle = squadUnits.length > 0 && (mode === 'survival' || unlockedWaveSet.has(wave.id));

  const modeItems: Array<{ id: BattleMode; title: string; subtitle: string }> = [
    { id: 'stage', title: 'Stage', subtitle: 'Clear selected enemy wave for fixed rewards.' },
    { id: 'survival', title: 'Survival', subtitle: 'Last 5 minutes against scaling enemy packs.' },
  ];

  const runBattle = () => {
    const effects = getUpgradeEffects(state.upgrades.levels);
    const result = runBattleSimulation({
      mode,
      squad: squadUnits,
      wave: mode === 'stage' ? wave : undefined,
      rewardPct: effects.rewardPct,
      seed: Math.floor(Date.now() % 1000000),
    });

    dispatch({ type: 'APPLY_BATTLE_RESULT', payload: result });
    navigation.navigate('Result', { result });
  };

  return (
    <ScreenShell>
      <Text style={styles.title}>Battle</Text>

      <ListPanel
        title="Mode"
        items={modeItems}
        renderItem={(item) => (
          <View>
            <InfoCard title={item.title} subtitle={item.subtitle} rightLabel={item.id === mode ? 'Selected' : ''} />
            <PixelButton label={`Use ${item.title}`} onPress={() => dispatch({ type: 'SET_BATTLE_MODE', payload: { mode: item.id } })} />
          </View>
        )}
      />

      {mode === 'stage' ? (
        <ListPanel
        title="Select Wave"
        items={waves}
        renderItem={(item) => (
          <View>
            <InfoCard
              title={item.stageName}
              subtitle={`Recommended ${item.recommendedPower}`}
              rightLabel={!unlockedWaveSet.has(item.id) ? 'Locked' : item.id === wave.id ? 'Selected' : ''}
            />
            <PixelButton
              label={unlockedWaveSet.has(item.id) ? `Use ${item.id}` : 'Locked'}
              onPress={() => dispatch({ type: 'SELECT_WAVE', payload: { waveId: item.id } })}
              disabled={!unlockedWaveSet.has(item.id)}
            />
          </View>
        )}
      />
      ) : (
        <ListPanel
          title="Survival Briefing"
          items={[{ id: 'survival_brief' }]}
          renderItem={() => (
            <View>
              <StatRow label="Run Time" value={`${SURVIVAL_DURATION_SEC}s`} />
              <StatRow label="Spike Window" value="Every minute: 45s-55s" />
              <StatRow label="Elite Timing" value="Every 60s" />
              <StatRow label="Boss Timing" value="150s and 270s" />
            </View>
          )}
        />
      )}

      <ListPanel
        title="Battle Preview"
        items={[{ id: 'preview' }]}
        renderItem={() => (
          <View>
            <StatRow label="Mode" value={mode === 'stage' ? 'Stage' : 'Survival'} />
            {mode === 'stage' ? <StatRow label="Stage" value={wave.stageName} /> : null}
            {mode === 'stage' ? <StatRow label="Recommended" value={wave.recommendedPower} /> : null}
            {mode === 'stage' ? <StatRow label="Unlocked Stages" value={`${unlockedWaveIds.length}/${waves.length}`} /> : null}
            <StatRow
              label="Squad Power"
              value={squadPower}
              valueColor={mode === 'stage' ? (squadPower >= wave.recommendedPower ? colors.good : colors.warning) : colors.accent}
            />
            <StatRow label="Units Active" value={squadUnits.length || squadStats.length} />
            <StatRow label="Base Scrap" value={mode === 'stage' ? wave.rewards.scrap : 'Time + kills + spikes'} />
          </View>
        )}
      />

      <View style={styles.row}>
        <PixelButton
          label={mode === 'stage' ? 'Run Stage Auto-Battle' : 'Run Survival (5m)'}
          onPress={runBattle}
          tone="success"
          style={styles.flexBtn}
          disabled={!canStartBattle}
        />
        <PixelButton label="Back" onPress={() => navigation.goBack()} style={styles.flexBtn} />
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  flexBtn: {
    flex: 1,
  },
});
