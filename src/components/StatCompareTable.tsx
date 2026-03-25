import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { UnitStats } from '../types/game';
import { colors } from '../theme/colors';

interface StatCompareTableProps {
  baseStats: UnitStats;
  assembledStats: UnitStats;
  statDelta: UnitStats;
}

const statRows: Array<keyof UnitStats> = ['hp', 'attack', 'defense', 'fireRate', 'crit'];

export function StatCompareTable({ baseStats, assembledStats, statDelta }: StatCompareTableProps) {
  return (
    <View>
      {statRows.map((key) => {
        const delta = statDelta[key];
        const deltaColor = delta > 0 ? colors.good : delta < 0 ? colors.bad : colors.textDim;

        return (
          <View key={key} style={styles.row}>
            <Text style={styles.label}>{key.toUpperCase()}</Text>
            <Text style={styles.value}>{String(baseStats[key])}</Text>
            <Text style={styles.arrow}>{'→'}</Text>
            <Text style={styles.value}>{String(assembledStats[key])}</Text>
            <Text style={[styles.delta, { color: deltaColor }]}>{delta >= 0 ? `+${delta}` : delta}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    width: 72,
    color: colors.textDim,
    fontSize: 12,
  },
  value: {
    width: 56,
    textAlign: 'right',
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  arrow: {
    width: 24,
    textAlign: 'center',
    color: colors.textDim,
    fontSize: 12,
  },
  delta: {
    width: 56,
    textAlign: 'right',
    fontWeight: '700',
    fontSize: 12,
  },
});
