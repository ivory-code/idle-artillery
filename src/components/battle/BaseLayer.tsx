import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { ASSET_KEYS, getBaseAsset } from '../../assets';

interface BaseLayerProps {
  isLandscape: boolean;
  groundTop: number;
  allyBaseTop: number;
  allyBaseWidth: number;
  allyBaseHeight: number;
  enemyBaseTop: number;
  enemyBaseWidth: number;
  enemyBaseHeight: number;
  baseFlash: number;
  spawnPulse: number;
  threat: 'normal' | 'spike';
}

export function BaseLayer({
  isLandscape,
  groundTop,
  allyBaseTop,
  allyBaseWidth,
  allyBaseHeight,
  enemyBaseTop,
  enemyBaseWidth,
  enemyBaseHeight,
  baseFlash,
  spawnPulse,
  threat,
}: BaseLayerProps) {
  return (
    <>
      <View style={[styles.playerBase, { left: isLandscape ? 14 : 10, top: allyBaseTop, width: allyBaseWidth, height: allyBaseHeight, borderWidth: isLandscape ? 3 : 2 }]}>
        <Image source={getBaseAsset(ASSET_KEYS.bases.playerMain)} style={styles.baseAsset} resizeMode="contain" />
        <View style={styles.baseHardPlate} />
        <View style={styles.baseTurretMount} />
        <View style={styles.baseTurretBarrel} />
        <View style={[styles.baseDamageFlash, { opacity: 0.08 + baseFlash * 0.58 }]} />
        <Text style={[styles.baseLabel, isLandscape ? styles.baseLabelLandscape : null]}>BASE</Text>
      </View>
      <View style={[styles.playerPad, { left: isLandscape ? 18 : 12, top: groundTop + 6, width: allyBaseWidth + 24 }]} />

      <View
        style={[styles.enemyGate, { right: isLandscape ? 14 : 10, top: enemyBaseTop, width: enemyBaseWidth, height: enemyBaseHeight, borderWidth: isLandscape ? 3 : 2 }]}
      >
        <Image source={getBaseAsset(ASSET_KEYS.bases.enemyMain)} style={styles.baseAsset} resizeMode="contain" />
        <View style={styles.enemyGatePlate} />
        <View style={styles.enemyGateJaw} />
        <View style={[styles.enemyAlertPulse, threat === 'spike' ? styles.enemyAlertPulseHot : null, { opacity: 0.12 + spawnPulse * 0.62 }]} />
        <Text style={[styles.gateLabel, isLandscape ? styles.gateLabelLandscape : null]}>ENTRY</Text>
      </View>
      <View style={[styles.enemyPad, { right: isLandscape ? 18 : 12, top: groundTop + 6, width: enemyBaseWidth + 24 }]} />
    </>
  );
}

const styles = StyleSheet.create({
  playerBase: {
    position: 'absolute',
    borderRadius: 2,
    borderColor: '#4dc3c8',
    overflow: 'hidden',
    backgroundColor: '#16324a',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  enemyGate: {
    position: 'absolute',
    borderRadius: 2,
    borderColor: '#c06d52',
    overflow: 'hidden',
    backgroundColor: '#43241e',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
  },
  baseAsset: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.84,
  },
  baseDamageFlash: {
    position: 'absolute',
    left: 3,
    right: 3,
    top: 3,
    bottom: 3,
    borderWidth: 1,
    borderColor: '#84e7ff',
    backgroundColor: 'rgba(83,182,207,0.18)',
  },
  baseLabel: {
    color: '#d6fcff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  baseLabelLandscape: {
    fontSize: 11,
  },
  gateLabel: {
    color: '#ffd9bf',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  gateLabelLandscape: {
    fontSize: 10,
  },
  playerPad: {
    position: 'absolute',
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(134,223,240,0.62)',
    backgroundColor: 'rgba(58,130,153,0.42)',
  },
  enemyPad: {
    position: 'absolute',
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: 'rgba(250,167,137,0.52)',
    backgroundColor: 'rgba(147,82,63,0.44)',
  },
  baseHardPlate: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 22,
    height: 18,
    borderWidth: 1,
    borderColor: 'rgba(154,227,243,0.45)',
    backgroundColor: 'rgba(18,64,89,0.46)',
  },
  baseTurretMount: {
    position: 'absolute',
    top: 14,
    left: '36%',
    width: '28%',
    height: 16,
    borderWidth: 1,
    borderColor: '#9ee9ff',
    backgroundColor: 'rgba(66,139,168,0.64)',
  },
  baseTurretBarrel: {
    position: 'absolute',
    top: 18,
    right: -2,
    width: 20,
    height: 6,
    borderWidth: 1,
    borderColor: '#bdefff',
    backgroundColor: 'rgba(97,171,199,0.68)',
  },
  enemyGatePlate: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 24,
    height: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,194,163,0.46)',
    backgroundColor: 'rgba(116,66,52,0.58)',
  },
  enemyGateJaw: {
    position: 'absolute',
    top: 18,
    left: '30%',
    right: '30%',
    height: 8,
    borderWidth: 1,
    borderColor: '#ffc29e',
    backgroundColor: 'rgba(170,94,72,0.74)',
  },
  enemyAlertPulse: {
    position: 'absolute',
    left: 4,
    right: 4,
    top: 4,
    bottom: 4,
    borderWidth: 1,
    borderColor: '#d07f62',
    backgroundColor: 'rgba(173,82,58,0.26)',
  },
  enemyAlertPulseHot: {
    borderColor: '#f08c67',
    backgroundColor: 'rgba(230,102,69,0.3)',
  },
});
