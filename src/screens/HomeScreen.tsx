import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ActionTile } from '../components/game/ActionTile';
import { HudResourceBar } from '../components/game/HudResourceBar';
import { UnitCard } from '../components/game/UnitCard';
import { ScreenShell } from '../components/ScreenShell';
import { waves } from '../data/waves';
import { RootStackParamList } from '../navigation/routes';
import { useGame } from '../state/GameProvider';
import { getSquadCombatUnits, getSquadPower } from '../state/selectors';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { state } = useGame();
  const squadUnits = getSquadCombatUnits(state);
  const squadPower = getSquadPower(state);

  return (
    <ScreenShell>
      <HudResourceBar scrap={state.player.scrap} coreBits={state.player.coreBits} rightBadge="BASE-01" />

      <View style={styles.heroCard}>
        <View style={styles.heroBadge}>
          <Text style={styles.heroBadgeText}>IDLE ARTILLERY</Text>
        </View>
        <Text style={styles.title}>Tiny Barrage</Text>
        <Text style={styles.heroSub}>Squad PWR {squadPower}</Text>
        <ActionTile label="Deploy Mission" caption="Auto-battle ready" icon="🚀" tone="battle" onPress={() => navigation.navigate('Battle')} />
      </View>

      <View style={styles.grid}>
        <View style={styles.tileWrap}>
          <ActionTile label="Hangar" caption="Units" icon="🛠️" onPress={() => navigation.replace('Hangar')} />
        </View>
        <View style={styles.tileWrap}>
          <ActionTile label="Assembly" caption="Parts" icon="🧩" onPress={() => navigation.navigate('Assembly')} />
        </View>
        <View style={styles.tileWrap}>
          <ActionTile label="Squad" caption="Formation" icon="🎯" onPress={() => navigation.navigate('Squad')} />
        </View>
        <View style={styles.tileWrap}>
          <ActionTile label="Upgrade" caption="Tech" icon="⬆️" tone="accent" onPress={() => navigation.navigate('Upgrade')} />
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Squad Preview</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {squadUnits.map((unit, index) => (
          <UnitCard key={unit.id} name={unit.name} role={unit.roleIdentity} power={Math.round(unit.stats.attack * unit.stats.fireRate * 10)} badge={index === 0 ? 'LEAD' : undefined} compact />
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Stage Lane</Text>
      </View>
      <View style={styles.stageRow}>
        {waves.map((wave, index) => {
          const unlocked = state.progression.unlockedWaveIds.includes(wave.id);
          return (
            <Pressable key={wave.id} onPress={() => unlocked && navigation.navigate('Battle')} style={[styles.stageNode, unlocked ? styles.stageNodeOn : styles.stageNodeOff]}>
              <Text style={styles.stageId}>S-{index + 1}</Text>
              <Text style={styles.stagePower}>{wave.recommendedPower}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
    backgroundColor: '#103041',
  },
  heroBadgeText: {
    color: colors.accent2,
    fontWeight: '800',
    fontSize: 10,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 3,
  },
  heroSub: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 10,
  },
  tileWrap: {
    width: '50%',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  horizontalList: {
    gap: 8,
    paddingBottom: 8,
  },
  stageRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 8,
  },
  stageNode: {
    flex: 1,
    minHeight: 66,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageNodeOn: {
    borderColor: colors.accent,
    backgroundColor: colors.panelElev,
  },
  stageNodeOff: {
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    opacity: 0.6,
  },
  stageId: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  stagePower: {
    color: colors.textDim,
    fontSize: 11,
    marginTop: 3,
  },
});
