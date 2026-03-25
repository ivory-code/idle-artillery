import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { CurrencyBar } from '../components/CurrencyBar';
import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { unitMap } from '../data/units';
import { waves } from '../data/waves';
import { RootStackParamList } from '../navigation/routes';
import { useGame } from '../state/GameProvider';
import { getSquadPower } from '../state/selectors';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Hangar'>;

export function HangarScreen({ navigation }: Props) {
  const { state } = useGame();
  const squadPower = getSquadPower(state);
  const squadSlots = state.squad.slots.map((buildId, index) => ({ id: `slot_${index}`, index, buildId }));

  return (
    <ScreenShell>
      <Text style={styles.title}>Hangar</Text>

      <CurrencyBar scrap={state.player.scrap} coreBits={state.player.coreBits} />

      <InfoCard title="Squad Power" subtitle="Combined from assembled units" rightLabel={String(squadPower)} />
      <InfoCard
        title="Stage Progress"
        subtitle={`Highest Clear: Stage ${state.progression.highestStageCleared}`}
        rightLabel={`${state.progression.unlockedWaveIds.length}/${waves.length} unlocked`}
      />
      <InfoCard
        title="Survival Record"
        subtitle={`Best Time: ${state.survival.bestTimeSec}s`}
        rightLabel={`Best Score ${state.survival.bestScore}`}
      />

      <ListPanel
        title="Current Squad"
        items={squadSlots}
        renderItem={(slot) => {
          const build = slot.buildId ? state.builds[slot.buildId] : null;
          const unitName = build ? unitMap[build.unitId]?.name || build.unitId : 'Empty';
          return <InfoCard title={`Slot ${slot.index + 1}`} subtitle={unitName} rightLabel={slot.buildId || '-'} />;
        }}
      />

      <PixelButton label="Assembly" onPress={() => navigation.navigate('Assembly')} />
      <PixelButton label="Squad" onPress={() => navigation.navigate('Squad')} />
      <PixelButton label="Battle" onPress={() => navigation.navigate('Battle')} />
      <PixelButton label="Upgrade" onPress={() => navigation.navigate('Upgrade')} />
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
});
