import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { unitMap } from '../data/units';
import { useGame } from '../state/GameProvider';
import { colors } from '../theme/colors';
import { FormationId } from '../types/game';

const formationOptions: FormationId[] = ['line', 'triangle', 'focus'];

export function SquadScreen() {
  const { state, dispatch } = useGame();
  const buildIds = Object.keys(state.builds);

  return (
    <ScreenShell>
      <Text style={styles.title}>Squad</Text>

      <ListPanel
        title="Squad Slots"
        items={state.squad.slots.map((buildId, index) => ({ id: `slot_${index}`, buildId, index }))}
        renderItem={({ buildId, index }) => {
          const unitName = buildId ? unitMap[state.builds[buildId]?.unitId]?.name || buildId : 'Empty';
          return (
            <View>
              <InfoCard title={`Slot ${index + 1}`} subtitle={unitName} rightLabel={buildId || '-'} />
              <View style={styles.rowWrap}>
                <PixelButton label="Clear" onPress={() => dispatch({ type: 'SET_SQUAD_SLOT', payload: { index, buildId: null } })} style={styles.smallBtn} />
                {buildIds.map((id) => (
                  <PixelButton
                    key={`${index}_${id}`}
                    label={id}
                    onPress={() => dispatch({ type: 'SET_SQUAD_SLOT', payload: { index, buildId: id } })}
                    style={styles.smallBtn}
                  />
                ))}
              </View>
            </View>
          );
        }}
      />

      <ListPanel
        title="Formation"
        items={formationOptions.map((id) => ({ id }))}
        renderItem={(item) => (
          <View>
            <InfoCard
              title={item.id.toUpperCase()}
              subtitle="Line: balanced, Triangle: offense, Focus: burst"
              rightLabel={state.squad.formationId === item.id ? 'Active' : ''}
            />
            <PixelButton label={`Use ${item.id}`} onPress={() => dispatch({ type: 'SET_FORMATION', payload: { formationId: item.id } })} />
          </View>
        )}
      />
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
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  smallBtn: {
    marginRight: 6,
  },
});
