import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { getUnitAsset } from '../../assets';
import { palette } from '../game-ui/palette';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function idPhase(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i += 1) {
    sum += id.charCodeAt(i);
  }
  return (sum % 31) / 7;
}

function getArchetypeTone(archetype: string, isAlly: boolean) {
  if (archetype === 'support') return isAlly ? '#7de6cf' : '#ffac8f';
  if (archetype === 'lightning') return isAlly ? '#8de2ff' : '#ffb489';
  if (archetype === 'fire') return isAlly ? '#ffd284' : '#ff8d6a';
  if (archetype === 'ice') return isAlly ? '#b3f2ff' : '#ffc1cf';
  return isAlly ? '#77e8ff' : '#ff9b7b';
}

function ModuleAssembly({ archetype, isAlly, unitSize }: { archetype: string; isAlly: boolean; unitSize: number }) {
  const accent = getArchetypeTone(archetype, isAlly);
  const steel = isAlly ? '#396487' : '#7f4c43';
  const frame = isAlly ? '#9adfff' : '#ffb89e';
  const lowerWidth = Math.max(24, unitSize * 0.56);
  const bodyWidth = Math.max(19, unitSize * 0.44);
  const weaponWidth =
    archetype === 'artillery'
      ? Math.max(20, unitSize * 0.5)
      : archetype === 'support'
        ? Math.max(13, unitSize * 0.3)
        : Math.max(16, unitSize * 0.38);
  const coreSize = Math.max(6, unitSize * 0.14);

  return (
    <View style={styles.moduleRoot}>
      <View style={[styles.moduleLower, { width: lowerWidth, backgroundColor: steel, borderColor: frame }]} />
      <View style={[styles.moduleBody, { width: bodyWidth, backgroundColor: accent, borderColor: frame }]} />
      <View style={[styles.moduleCore, { width: coreSize, height: coreSize, backgroundColor: frame }]} />
      <View style={[styles.moduleWeapon, { width: weaponWidth, backgroundColor: frame }]} />
      <View style={[styles.moduleBrace, styles.moduleBraceLeft, { borderColor: frame }]} />
      <View style={[styles.moduleBrace, styles.moduleBraceRight, { borderColor: frame }]} />

      {archetype === 'support' ? <View style={[styles.moduleSupportTank, { backgroundColor: accent, borderColor: frame }]} /> : null}
      {archetype === 'lightning' ? <View style={[styles.moduleLightningFin, { borderLeftColor: frame }]} /> : null}
      {archetype === 'fire' ? <View style={[styles.moduleFireVent, { backgroundColor: '#ffc37c' }]} /> : null}
      {archetype === 'ice' ? <View style={[styles.moduleIceArmor, { borderBottomColor: '#d6f5ff' }]} /> : null}
    </View>
  );
}

function BattlefieldSpark({
  index,
  elapsedSec,
  spike,
  laneHeight,
}: {
  index: number;
  elapsedSec: number;
  spike: boolean;
  laneHeight: number;
}) {
  const x = (elapsedSec * (20 + index * 2) + index * 13) % 88;
  const y = laneHeight * 0.3 + Math.sin(elapsedSec * 5 + index) * laneHeight * 0.18;
  const color = spike && index % 2 === 0 ? palette.enemyA : palette.playerA;
  const size = laneHeight > 300 ? 4 : 3;
  return <View style={[styles.spark, { left: `${x + 6}%`, top: y, width: size, height: size, backgroundColor: color }]} />;
}

function UnitSprite({ entity, elapsedSec, groundTop, unitSize }: any) {
  const phase = idPhase(entity.id);
  const isAlly = entity.team === 'ally';
  const wobble = Math.sin((elapsedSec + phase) * 8) * 1.8;
  const hpRatio = entity.maxHp > 0 ? Math.max(0, Math.min(1, entity.hp / entity.maxHp)) : 0;
  const archetype = entity.archetype || (isAlly ? 'artillery' : 'fire');
  const unitAsset = getUnitAsset({ team: isAlly ? 'ally' : 'enemy', archetype });
  const tone = getArchetypeTone(archetype, isAlly);
  const muzzleRatio = clamp01((entity.flashSec || 0) / 0.1);
  const hitRatio = clamp01((entity.hitSec || 0) / 0.18);
  const spawnRatio = clamp01((entity.spawnSec || 0) / 0.45);
  const hpTrackWidth = Math.max(24, unitSize * 0.82);
  const hpTrackHeight = Math.max(4, unitSize * 0.12);
  const hitSize = Math.max(20, unitSize * 0.66);
  const flashWidth = Math.max(8, unitSize * 0.24);
  const flashHeight = Math.max(4, unitSize * 0.1);

  return (
    <View
      style={[
        styles.unitWrap,
        {
          left: `${entity.x * 100}%`,
          top: groundTop - unitSize - 6 + wobble,
          width: unitSize,
          height: unitSize,
          marginLeft: -(unitSize / 2),
        },
      ]}
    >
      {spawnRatio > 0 ? (
        <View
          style={[
            styles.spawnRing,
            {
              width: Math.max(30, unitSize * 0.95),
              height: Math.max(10, unitSize * 0.32),
              bottom: -Math.max(4, unitSize * 0.12),
              opacity: spawnRatio * 0.82,
              borderColor: tone,
              transform: [{ scale: 1 + (1 - spawnRatio) * 0.9 }],
            },
          ]}
        />
      ) : null}

      <View
        style={[
          styles.unitHpTrack,
          {
            width: hpTrackWidth,
            height: hpTrackHeight,
            top: -Math.max(7, unitSize * 0.2),
          },
        ]}
      >
        <View style={[styles.unitHpFill, { width: `${hpRatio * 100}%`, backgroundColor: isAlly ? palette.good : palette.enemyB }]} />
      </View>

      <View style={[styles.unitShadow, isAlly ? styles.unitShadowAlly : styles.unitShadowEnemy, { width: unitSize * 0.75, height: unitSize * 0.16 }]} />
      {hitRatio > 0 ? (
        <View
          style={[
            styles.hitFlash,
            {
              width: hitSize,
              height: hitSize,
              bottom: Math.max(4, unitSize * 0.1),
              opacity: hitRatio * 0.88,
              backgroundColor: isAlly ? '#8beaff' : '#ffae95',
            },
          ]}
        />
      ) : null}

      <View style={[styles.unitPlate, isAlly ? styles.unitPlateAlly : styles.unitPlateEnemy, { width: unitSize * 0.88, height: unitSize * 0.62, bottom: unitSize * 0.07 }]} />
      <ModuleAssembly archetype={archetype} isAlly={isAlly} unitSize={unitSize} />
      <Image source={unitAsset} style={[styles.unitAsset, !isAlly ? styles.unitAssetFlip : null, { width: unitSize * 0.92, height: unitSize * 0.76 }]} resizeMode="contain" />

      {muzzleRatio > 0 ? (
        <View
          style={[
            styles.muzzleFlash,
            {
              width: flashWidth,
              height: flashHeight,
              bottom: Math.max(13, unitSize * 0.34),
              opacity: 0.2 + muzzleRatio * 0.82,
              backgroundColor: tone,
              right: isAlly ? -3 : undefined,
              left: !isAlly ? -3 : undefined,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

interface UnitLayerProps {
  runtime: any;
  isLandscape: boolean;
  laneHeight: number;
  groundTop: number;
  unitSize: number;
  sparkCount: number;
  threat: 'normal' | 'spike';
}

export function UnitLayer({ runtime, isLandscape, laneHeight, groundTop, unitSize, sparkCount, threat }: UnitLayerProps) {
  return (
    <>
      {Array.from({ length: sparkCount }).map((_, index) => (
        <BattlefieldSpark key={`spark_${index}`} index={index} elapsedSec={runtime.elapsedSec} spike={threat === 'spike'} laneHeight={laneHeight} />
      ))}

      {runtime.shotTraces.map((trace: any) => {
        const from = trace.fromX * 100;
        const to = trace.toX * 100;
        const left = Math.min(from, to);
        const width = Math.max(0.8, Math.abs(to - from));
        const traceRatio = clamp01((trace.ttlSec || 0) / 0.12);
        const traceY = trace.y * (laneHeight / 220);
        const color = trace.team === 'ally' ? '#7fe9ff' : '#ff9f7f';

        return (
          <React.Fragment key={trace.id}>
            <View
              style={[
                styles.shotTrace,
                {
                  left: `${left}%`,
                  width: `${width}%`,
                  top: traceY,
                  backgroundColor: color,
                  opacity: 0.25 + traceRatio * 0.72,
                  height: isLandscape ? 2.5 : 2,
                },
              ]}
            />
            <View
              style={[
                styles.shotImpact,
                {
                  left: `${to}%`,
                  top: traceY - 2,
                  backgroundColor: color,
                  opacity: 0.4 + traceRatio * 0.6,
                },
              ]}
            />
          </React.Fragment>
        );
      })}

      {runtime.entities.map((entity: any) => (
        <UnitSprite key={entity.id} entity={entity} elapsedSec={runtime.elapsedSec} groundTop={groundTop} unitSize={unitSize} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  spark: {
    position: 'absolute',
    borderRadius: 2,
    opacity: 0.62,
  },
  shotTrace: {
    position: 'absolute',
    borderRadius: 2,
  },
  shotImpact: {
    position: 'absolute',
    marginLeft: -2,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  unitWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  spawnRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: 2,
  },
  unitHpTrack: {
    position: 'absolute',
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#2a415f',
    overflow: 'hidden',
    backgroundColor: '#111a2d',
  },
  unitHpFill: {
    height: '100%',
  },
  unitShadow: {
    position: 'absolute',
    bottom: -2,
    borderRadius: 2,
  },
  unitShadowAlly: {
    backgroundColor: '#1c5f7d',
  },
  unitShadowEnemy: {
    backgroundColor: '#7a3432',
  },
  hitFlash: {
    position: 'absolute',
    borderRadius: 8,
  },
  muzzleFlash: {
    position: 'absolute',
    borderRadius: 3,
  },
  unitAsset: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 2,
    opacity: 0.7,
  },
  unitPlate: {
    position: 'absolute',
    borderRadius: 2,
    borderWidth: 1,
  },
  unitPlateAlly: {
    borderColor: 'rgba(118,230,255,0.58)',
    backgroundColor: 'rgba(23,61,85,0.58)',
  },
  unitPlateEnemy: {
    borderColor: 'rgba(255,150,120,0.58)',
    backgroundColor: 'rgba(95,45,38,0.56)',
  },
  unitAssetFlip: {
    transform: [{ scaleX: -1 }],
  },
  moduleRoot: {
    position: 'absolute',
    bottom: 3,
    width: '92%',
    height: '76%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  moduleLower: {
    position: 'absolute',
    bottom: 5,
    height: 8,
    borderWidth: 1,
  },
  moduleBody: {
    position: 'absolute',
    bottom: 12,
    height: 13,
    borderWidth: 1,
  },
  moduleCore: {
    position: 'absolute',
    bottom: 16,
  },
  moduleWeapon: {
    position: 'absolute',
    bottom: 19,
    right: -2,
    height: 5,
  },
  moduleSupportTank: {
    position: 'absolute',
    bottom: 12,
    left: 1,
    width: 7,
    height: 8,
    borderWidth: 1,
  },
  moduleLightningFin: {
    position: 'absolute',
    bottom: 18,
    left: 3,
    width: 0,
    height: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  moduleFireVent: {
    position: 'absolute',
    bottom: 13,
    left: 6,
    width: 5,
    height: 5,
  },
  moduleIceArmor: {
    position: 'absolute',
    bottom: 19,
    left: 9,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  moduleBrace: {
    position: 'absolute',
    bottom: 9,
    width: 5,
    height: 10,
    borderWidth: 1,
  },
  moduleBraceLeft: {
    left: 4,
  },
  moduleBraceRight: {
    right: 4,
  },
});
