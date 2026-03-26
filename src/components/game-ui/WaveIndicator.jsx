import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

function MetricBlock({ label, value, panelSource }) {
  const inner = (
    <>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.val}>{value}</Text>
    </>
  );

  if (panelSource) {
    return (
      <ImageBackground source={panelSource} resizeMode="stretch" style={styles.block} imageStyle={styles.blockImage}>
        {inner}
      </ImageBackground>
    );
  }

  return <View style={styles.block}>{inner}</View>;
}

export function WaveIndicator({ wave, timeLeftSec, threat = 'normal', panelSource }) {
  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = Math.floor(timeLeftSec % 60);
  const threatTone = threat === 'spike' ? palette.enemyA : palette.warning;

  return (
    <View style={styles.wrap}>
      <MetricBlock label="WAVE" value={`W-${wave}`} panelSource={panelSource} />
      <MetricBlock label="TIME" value={`${minutes}:${String(seconds).padStart(2, '0')}`} panelSource={panelSource} />
      <View style={[styles.threat, panelSource ? styles.threatWithPanel : null, { borderColor: threatTone }]}>
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
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#55739e',
    backgroundColor: '#182c4f',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minWidth: 64,
  },
  blockImage: {
    opacity: 0.34,
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
    backgroundColor: '#182a45',
  },
  threatWithPanel: {
    borderColor: '#5a7ba7',
    backgroundColor: '#193152',
  },
  threatText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
