import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function BaseHPBar({ hp, maxHp }) {
  const ratio = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
  const tone = ratio > 0.5 ? palette.good : ratio > 0.25 ? palette.warning : palette.enemyB;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>BASE HP</Text>
        <Text style={styles.value}>
          {Math.round(hp)}/{Math.round(maxHp)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: tone }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: palette.textDim,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  value: {
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '800',
  },
  track: {
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#6a5474',
    overflow: 'hidden',
    backgroundColor: '#20122c',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
