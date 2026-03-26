import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function WaveIndicator({ wave, timeLeftSec, threat = 'normal' }) {
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = Math.floor(timeLeftSec % 60);
  const threatTone = threat === 'spike' ? palette.enemyA : palette.warning;

  return (
    <View style={styles.wrap}>
      <View style={styles.block}>
        <Text style={styles.key}>WAVE</Text>
        <Text style={styles.val}>W-{wave}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.key}>TIME</Text>
        <Text style={styles.val}>
          {minutes}:{String(seconds).padStart(2, '0')}
        </Text>
      </View>
      <View style={[styles.threat, { borderColor: threatTone }]}>
        <Text style={[styles.threatText, { color: threatTone }]}>{threat.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  block: {
    borderWidth: 1,
    borderColor: '#55739e',
    backgroundColor: '#182c4f',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 64,
  },
  key: {
    color: palette.textDim,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  val: {
    color: palette.textMain,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 1,
  },
  threat: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  threatText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
