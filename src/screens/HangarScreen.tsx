import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ActionTile } from '../components/game/ActionTile';
import { HudResourceBar } from '../components/game/HudResourceBar';
import { PartBadge } from '../components/game/PartBadge';
import { UnitCard } from '../components/game/UnitCard';
import { ScreenShell } from '../components/ScreenShell';
import { partMap } from '../data/parts';
import { unitMap } from '../data/units';
import { waves } from '../data/waves';
import { RootStackParamList } from '../navigation/routes';
import { useGame } from '../state/GameProvider';
import { getSquadCombatUnits, getSquadPower } from '../state/selectors';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Hangar'>;

export function HangarScreen({ navigation }: Props) {
  const { state } = useGame();
  const squadPower = getSquadPower(state);
  const squadUnits = getSquadCombatUnits(state);
  const parts = state.collection.ownedPartIds.map((id) => partMap[id]).filter(Boolean).slice(0, 6);
  const stagePercent = waves.length ? (state.progression.unlockedWaveIds.length / waves.length) * 100 : 0;

  return (
    <ScreenShell>
      <HudResourceBar scrap={state.player.scrap} coreBits={state.player.coreBits} rightBadge={`PWR ${squadPower}`} />

      <View style={styles.metaCard}>
        <View>
          <Text style={styles.metaLabel}>Stage Lane</Text>
          <Text style={styles.metaValue}>
            {state.progression.unlockedWaveIds.length}/{waves.length}
          </Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Survival Best</Text>
          <Text style={styles.metaValue}>{state.survival.bestTimeSec}s</Text>
        </View>
        <View>
          <Text style={styles.metaLabel}>Top Score</Text>
          <Text style={styles.metaValue}>{state.survival.bestScore}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(10, stagePercent)}%` }]} />
      </View>

      <Text style={styles.sectionTitle}>Squad Deck</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {squadUnits.map((unit, index) => {
          const build = state.builds[unit.id];
          const source = build ? unitMap[build.unitId] : null;
          const rarity = source?.archetypeId === 'arch_siege' ? 'rare' : source?.archetypeId === 'arch_guard' ? 'epic' : 'common';

          return (
            <UnitCard
              key={unit.id}
              name={unit.name}
              role={unit.roleIdentity}
              power={Math.round(unit.stats.attack * unit.stats.fireRate * 10)}
              rarity={rarity}
              badge={index === 0 ? 'LEAD' : undefined}
              compact
              onPress={() => navigation.navigate('Squad')}
            />
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <View style={styles.actionHalf}>
          <ActionTile label="Assembly" caption="Tune Parts" icon="🧩" onPress={() => navigation.navigate('Assembly')} />
        </View>
        <View style={styles.actionHalf}>
          <ActionTile label="Battle" caption="Run Auto" icon="⚔️" tone="battle" onPress={() => navigation.navigate('Battle')} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Parts Rack</Text>
      <View style={styles.partsGrid}>
        {parts.map((part) => (
          <View key={part.id} style={styles.partCard}>
            <View style={styles.partIconBox} />
            <Text numberOfLines={1} style={styles.partName}>
              {part.name}
            </Text>
            <PartBadge slot={part.slot} level={state.collection.partLevels[part.id] || 0} rarity={part.rarity} />
          </View>
        ))}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  metaCard: {
    backgroundColor: colors.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaLabel: {
    color: colors.textDim,
    fontSize: 10,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metaValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent2,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  horizontalList: {
    gap: 8,
    paddingBottom: 10,
    marginBottom: 2,
  },
  actions: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  actionHalf: {
    width: '50%',
    paddingHorizontal: 4,
  },
  partsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  partCard: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  partIconBox: {
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgMid,
    marginBottom: 8,
  },
  partName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 6,
  },
});
