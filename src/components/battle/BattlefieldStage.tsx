import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { ASSET_KEYS, getBackgroundAsset } from '../../assets';
import { BaseLayer } from './BaseLayer';
import { UnitLayer } from './UnitLayer';

interface LanePressure {
  allyFront: number;
  enemyFront: number;
  pressure: number;
  allyCount: number;
  enemyCount: number;
}

interface BattlefieldStageProps {
  runtime: any;
  isLandscape: boolean;
  laneHeight: number;
  groundTop: number;
  gridLineATop: number;
  gridLineBTop: number;
  lanePressure: LanePressure;
  pressureLabel: string;
  pressurePercent: number;
  threat: 'normal' | 'spike';
  unitSize: number;
  sparkCount: number;
  allyBaseTop: number;
  allyBaseWidth: number;
  allyBaseHeight: number;
  enemyBaseTop: number;
  enemyBaseWidth: number;
  enemyBaseHeight: number;
  baseFlash: number;
  spawnPulse: number;
}

export function BattlefieldStage({
  runtime,
  isLandscape,
  laneHeight,
  groundTop,
  gridLineATop,
  gridLineBTop,
  lanePressure,
  pressureLabel,
  pressurePercent,
  threat,
  unitSize,
  sparkCount,
  allyBaseTop,
  allyBaseWidth,
  allyBaseHeight,
  enemyBaseTop,
  enemyBaseWidth,
  enemyBaseHeight,
  baseFlash,
  spawnPulse,
}: BattlefieldStageProps) {
  return (
    <View style={styles.root}>
      <View style={styles.frontlineHud}>
        <View style={[styles.frontlineTrack, isLandscape ? styles.frontlineTrackLandscape : null]}>
          <View style={[styles.frontlineThreatFill, { width: `${lanePressure.pressure * 100}%` }]} />
          <View style={[styles.frontlineMarkerAlly, isLandscape ? styles.frontlineMarkerLandscape : null, { left: `${lanePressure.allyFront * 100}%` }]} />
          <View style={[styles.frontlineMarkerEnemy, isLandscape ? styles.frontlineMarkerLandscape : null, { left: `${lanePressure.enemyFront * 100}%` }]} />
          <View style={[styles.frontlineCenterLine, { left: `${((lanePressure.allyFront + lanePressure.enemyFront) / 2) * 100}%` }]} />
        </View>
        <Text style={[styles.pressureBadge, lanePressure.pressure > 0.7 ? styles.pressureBadgeHot : null]}>
          {pressureLabel} {pressurePercent}%
        </Text>
      </View>

      <ImageBackground source={getBackgroundAsset(ASSET_KEYS.backgrounds.battlefieldMain)} resizeMode="cover" style={[styles.lane, { height: laneHeight }]} imageStyle={styles.laneImage}>
        <View style={styles.edgeVignette} />
        <View style={[styles.enemyPressureFog, { opacity: 0.18 + lanePressure.pressure * 0.42, width: `${34 + lanePressure.pressure * 40}%` }]} />
        <View style={styles.playerBacklight} />
        <View style={styles.centerWarBand} />
        <View style={[styles.gridLine, { top: gridLineATop }]} />
        <View style={[styles.gridLine, { top: gridLineBTop }]} />
        <View style={[styles.groundLine, { top: groundTop }]} />

        <BaseLayer
          isLandscape={isLandscape}
          groundTop={groundTop}
          allyBaseTop={allyBaseTop}
          allyBaseWidth={allyBaseWidth}
          allyBaseHeight={allyBaseHeight}
          enemyBaseTop={enemyBaseTop}
          enemyBaseWidth={enemyBaseWidth}
          enemyBaseHeight={enemyBaseHeight}
          baseFlash={baseFlash}
          spawnPulse={spawnPulse}
          threat={threat}
        />

        <UnitLayer runtime={runtime} isLandscape={isLandscape} laneHeight={laneHeight} groundTop={groundTop} unitSize={unitSize} sparkCount={sparkCount} threat={threat} />
      </ImageBackground>

      <View style={styles.footer}>
        <Text style={styles.footerChip}>ALLY {lanePressure.allyCount}</Text>
        <Text style={styles.footerChipEnemy}>ENEMY {lanePressure.enemyCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 50,
  },
  frontlineHud: {
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 1,
  },
  frontlineTrack: {
    flex: 1,
    height: 18,
    borderWidth: 1,
    borderColor: '#3d5776',
    backgroundColor: '#112336',
    overflow: 'hidden',
  },
  frontlineTrackLandscape: {
    height: 22,
  },
  frontlineThreatFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#8b4339',
  },
  frontlineMarkerAlly: {
    position: 'absolute',
    top: 2,
    marginLeft: -3,
    width: 6,
    height: 10,
    backgroundColor: '#73e5ff',
  },
  frontlineMarkerEnemy: {
    position: 'absolute',
    top: 2,
    marginLeft: -3,
    width: 6,
    height: 10,
    backgroundColor: '#ff9a6f',
  },
  frontlineMarkerLandscape: {
    width: 7,
    height: 14,
    top: 2,
    marginLeft: -3.5,
  },
  frontlineCenterLine: {
    position: 'absolute',
    top: -1,
    bottom: -1,
    marginLeft: -1,
    width: 2,
    backgroundColor: '#d4e9ff',
    opacity: 0.7,
  },
  pressureBadge: {
    minWidth: 110,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#4f6f93',
    backgroundColor: '#1b3451',
    color: '#d8eeff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  pressureBadgeHot: {
    borderColor: '#cb684f',
    backgroundColor: '#5a2f2a',
    color: '#ffd7ca',
  },
  lane: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2f435f',
    backgroundColor: '#081426',
    overflow: 'hidden',
  },
  laneImage: {
    opacity: 0.5,
  },
  edgeVignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderColor: 'rgba(12,24,39,0.9)',
  },
  enemyPressureFog: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#6b2d28',
  },
  playerBacklight: {
    position: 'absolute',
    left: -20,
    top: 0,
    bottom: 0,
    width: '36%',
    backgroundColor: 'rgba(34,91,116,0.16)',
  },
  centerWarBand: {
    position: 'absolute',
    top: '31%',
    height: '35%',
    left: '22%',
    right: '22%',
    borderWidth: 1,
    borderColor: 'rgba(99,128,160,0.24)',
    backgroundColor: 'rgba(15,28,44,0.22)',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#294264',
  },
  groundLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#43648f',
  },
  footer: {
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 1,
  },
  footerChip: {
    borderWidth: 1,
    borderColor: '#48688c',
    backgroundColor: '#172f48',
    color: '#d4ebff',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  footerChipEnemy: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#c17057',
    backgroundColor: '#4f2a26',
    color: '#ffd7ca',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
