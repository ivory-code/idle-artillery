import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function WATTBar({ value, max, regenPerSec, panelSource }) {
  const ratio = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  const content = (
    <>
      <View style={styles.row}>
        <Text style={styles.label}>WATT</Text>
        <Text style={styles.value}>
          {Math.round(value)}/{Math.round(max)}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.regen}>+{regenPerSec.toFixed(1)}/s</Text>
    </>
  );

  if (panelSource) {
    return (
      <ImageBackground source={panelSource} resizeMode="stretch" style={styles.wrap} imageStyle={styles.panelImage}>
        {content}
      </ImageBackground>
    );
  }

  return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderRadius: 8,
    padding: 6,
    gap: 4,
  },
  panelImage: {
    opacity: 0.26,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: palette.playerB,
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
    borderColor: '#4c7ca6',
    overflow: 'hidden',
    backgroundColor: '#0a1830',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: palette.playerA,
  },
  regen: {
    alignSelf: 'flex-end',
    color: palette.playerB,
    fontSize: 9,
    fontWeight: '800',
  },
});
