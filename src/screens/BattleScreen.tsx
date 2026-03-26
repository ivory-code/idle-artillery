import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BattleTopHUD } from '../components/game-ui/BattleTopHUD';
import { DeploymentButton } from '../components/game-ui/DeploymentButton';
import { GamePanel } from '../components/game-ui/GamePanel';
import { palette } from '../components/game-ui/palette';
import { ScreenShell } from '../components/ScreenShell';
import { partMap } from '../data/parts';
import { buildResultFromSurvival, createDeployTemplates, createSurvivalState, deployUnit, stepSurvivalState } from '../logic/survivalRuntime';
import { useGame } from '../state/GameProvider';
import { getSquadCombatUnits } from '../state/selectors';

const TICK_SEC = 0.1;
const TICK_MS = 100;

function clamp01(value: number) {
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
  if (archetype === 'support') {
    return isAlly
      ? { body: '#7de6cf', detail: '#b8fff0', leg: '#4f7f8e', glow: '#7de6cf' }
      : { body: '#d58f7b', detail: '#ffd8cc', leg: '#7f574f', glow: '#ff9f8a' };
  }
  if (archetype === 'lightning') {
    return isAlly
      ? { body: '#82ccff', detail: '#dbf3ff', leg: '#4b6d9a', glow: '#8fe8ff' }
      : { body: '#dca07e', detail: '#ffe2c9', leg: '#7d5d4e', glow: '#ffb98a' };
  }
  if (archetype === 'fire') {
    return isAlly
      ? { body: '#6fb5f4', detail: '#d2edff', leg: '#49638d', glow: '#ffc07a' }
      : { body: '#ef7d5b', detail: '#ffd3be', leg: '#7f4f45', glow: '#ff8a5f' };
  }
  if (archetype === 'ice') {
    return isAlly
      ? { body: '#9ddcff', detail: '#f0fbff', leg: '#5678a2', glow: '#baf4ff' }
      : { body: '#d9a3a9', detail: '#ffe5ea', leg: '#7d5960', glow: '#ffb7ca' };
  }
  return isAlly
    ? { body: '#6be8ff', detail: '#d7f6ff', leg: '#4f7fb2', glow: '#80f0ff' }
    : { body: '#ff9066', detail: '#ffd0c2', leg: '#9a5b52', glow: '#ff9f84' };
}

function ArchetypeSilhouette({ archetype, isAlly, tone }: any) {
  const flipStyle = !isAlly ? styles.flipX : null;

  if (archetype === 'support') {
    return (
      <View style={[styles.silhouetteRoot, flipStyle]}>
        <View style={[styles.supportTank, { backgroundColor: tone.body }]} />
        <View style={[styles.supportPod, { backgroundColor: tone.detail }]} />
        <View style={[styles.supportAntenna, { backgroundColor: tone.detail }]} />
        <View style={[styles.supportBase, { backgroundColor: tone.leg }]} />
      </View>
    );
  }

  if (archetype === 'lightning') {
    return (
      <View style={[styles.silhouetteRoot, flipStyle]}>
        <View style={[styles.lightningHull, { backgroundColor: tone.body }]} />
        <View style={[styles.lightningNose, { borderLeftColor: tone.detail }]} />
        <View style={[styles.lightningFinTop, { backgroundColor: tone.detail }]} />
        <View style={[styles.lightningLeg, { backgroundColor: tone.leg }]} />
      </View>
    );
  }

  if (archetype === 'fire') {
    return (
      <View style={[styles.silhouetteRoot, flipStyle]}>
        <View style={[styles.fireHull, { backgroundColor: tone.body }]} />
        <View style={[styles.fireBarrel, { backgroundColor: tone.detail }]} />
        <View style={[styles.fireFurnace, { backgroundColor: tone.glow }]} />
        <View style={[styles.fireLeg, { backgroundColor: tone.leg }]} />
      </View>
    );
  }

  if (archetype === 'ice') {
    return (
      <View style={[styles.silhouetteRoot, flipStyle]}>
        <View style={[styles.iceHull, { backgroundColor: tone.body }]} />
        <View style={[styles.iceCrystalA, { borderBottomColor: tone.detail }]} />
        <View style={[styles.iceCrystalB, { borderBottomColor: tone.glow }]} />
        <View style={[styles.iceLeg, { backgroundColor: tone.leg }]} />
      </View>
    );
  }

  return (
    <View style={[styles.silhouetteRoot, flipStyle]}>
      <View style={[styles.artilleryBody, { backgroundColor: tone.body }]} />
      <View style={[styles.artilleryArmor, { backgroundColor: tone.detail }]} />
      <View style={[styles.artilleryBarrel, { backgroundColor: tone.detail }]} />
      <View style={[styles.artilleryLeg, { backgroundColor: tone.leg }]} />
    </View>
  );
}

function UnitSprite({ entity, elapsedSec }: any) {
  const phase = idPhase(entity.id);
  const isAlly = entity.team === 'ally';
  const wobble = Math.sin((elapsedSec + phase) * 8) * 1.8;
  const hpRatio = entity.maxHp > 0 ? Math.max(0, Math.min(1, entity.hp / entity.maxHp)) : 0;
  const archetype = entity.archetype || (isAlly ? 'artillery' : 'fire');
  const tone = getArchetypeTone(archetype, isAlly);
  const muzzleRatio = clamp01((entity.flashSec || 0) / 0.1);
  const hitRatio = clamp01((entity.hitSec || 0) / 0.18);
  const spawnRatio = clamp01((entity.spawnSec || 0) / 0.45);
  const thrustPulse = 0.42 + (Math.sin((elapsedSec + phase) * 15) + 1) * 0.18;

  return (
    <View style={[styles.unitWrap, { left: `${entity.x * 100}%`, top: 84 + wobble }]}>
      {spawnRatio > 0 ? (
        <View
          style={[
            styles.spawnRing,
            {
              borderColor: tone.glow,
              opacity: spawnRatio * 0.8,
              transform: [{ scale: 1 + (1 - spawnRatio) * 0.9 }],
            },
          ]}
        />
      ) : null}
      <View style={styles.unitHpTrack}>
        <View style={[styles.unitHpFill, { width: `${hpRatio * 100}%`, backgroundColor: isAlly ? palette.good : palette.enemyB }]} />
      </View>
      <View
        style={[
          styles.unitTrail,
          isAlly ? styles.unitTrailAlly : styles.unitTrailEnemy,
          {
            opacity: thrustPulse,
            left: isAlly ? -7 : undefined,
            right: !isAlly ? -7 : undefined,
          },
        ]}
      />
      <View style={[styles.unitShadow, isAlly ? styles.unitShadowAlly : styles.unitShadowEnemy]} />
      {hitRatio > 0 ? (
        <View
          style={[
            styles.hitFlash,
            {
              opacity: hitRatio * 0.9,
              backgroundColor: isAlly ? '#8beaff' : '#ffae95',
            },
          ]}
        />
      ) : null}
      <ArchetypeSilhouette archetype={archetype} isAlly={isAlly} tone={tone} />
      {muzzleRatio > 0 ? (
        <View
          style={[
            styles.muzzleFlash,
            {
              opacity: 0.2 + muzzleRatio * 0.8,
              backgroundColor: tone.glow,
              right: isAlly ? -3 : undefined,
              left: !isAlly ? -3 : undefined,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function BattlefieldSpark({ index, elapsedSec, spike }: { index: number; elapsedSec: number; spike: boolean }) {
  const x = (elapsedSec * (22 + index * 2) + index * 14) % 88;
  const y = 62 + Math.sin(elapsedSec * 5 + index) * 28;
  const color = spike && index % 2 === 0 ? palette.enemyA : palette.playerA;

  return <View style={[styles.spark, { left: `${x + 6}%`, top: y, backgroundColor: color }]} />;
}

export function BattleScreen({ navigation }: any) {
  const { state, dispatch } = useGame();
  const squadUnits = useMemo(
    () => getSquadCombatUnits(state),
    [state.builds, state.collection.partLevels, state.squad.slots, state.squad.formationId, state.upgrades.levels]
  );

  const templates = useMemo(() => createDeployTemplates(squadUnits, state.builds, partMap), [squadUnits, state.builds]);
  const [runtime, setRuntime] = useState(() => createSurvivalState(templates));
  const reportedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setRuntime((prev) => stepSurvivalState(prev, TICK_SEC));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!runtime.ended || reportedRef.current) return;
    reportedRef.current = true;
    const result = buildResultFromSurvival(runtime) as any;
    dispatch({ type: 'APPLY_BATTLE_RESULT', payload: result } as any);
    navigation.navigate('Result', { result });
  }, [runtime, dispatch, navigation]);

  const threat = useMemo(() => {
    const sec = runtime.elapsedSec % 60;
    return sec >= 45 && sec < 55 ? 'spike' : 'normal';
  }, [runtime.elapsedSec]);

  const lanePressure = useMemo(() => {
    const allies = runtime.entities.filter((entity: any) => entity.team === 'ally' && entity.hp > 0);
    const enemies = runtime.entities.filter((entity: any) => entity.team === 'enemy' && entity.hp > 0);
    const allyFront = allies.length ? Math.max(...allies.map((entity: any) => entity.x)) : 0.1;
    const enemyFront = enemies.length ? Math.min(...enemies.map((entity: any) => entity.x)) : 0.92;
    const gap = Math.max(0, enemyFront - allyFront);
    const enemyNearBase = clamp01((0.64 - enemyFront) / 0.54);
    const laneCompression = clamp01((0.38 - gap) / 0.38);
    const pressure = clamp01(enemyNearBase * 0.65 + laneCompression * 0.35);
    return {
      allyFront,
      enemyFront,
      pressure,
      allyCount: allies.length,
      enemyCount: enemies.length,
    };
  }, [runtime.entities]);

  const onDeploy = useCallback((templateId: string) => {
    setRuntime((prev) => deployUnit(prev, templateId));
  }, []);

  const onReset = useCallback(() => {
    reportedRef.current = false;
    setRuntime(createSurvivalState(templates));
  }, [templates]);

  const timeLeftSec = Math.max(0, runtime.durationSec - runtime.elapsedSec);
  const sparkCount = Math.min(14, Math.max(5, runtime.entities.length + Math.floor(runtime.wave / 2)));
  const spawnPulse = clamp01((runtime.spawnPulseSec || 0) / 0.26);
  const baseFlash = clamp01((runtime.baseFlashSec || 0) / 0.2);
  const pressureLabel = lanePressure.pressure > 0.7 ? 'BREACH RISK' : lanePressure.pressure > 0.35 ? 'HOLD LINE' : 'STABLE';

  return (
    <ScreenShell>
      <BattleTopHUD
        wave={runtime.wave}
        timeLeftSec={timeLeftSec}
        watt={runtime.watt}
        wattMax={runtime.wattMax}
        wattRegen={runtime.wattRegen}
        baseHp={runtime.baseHp}
        baseMaxHp={runtime.baseMaxHp}
        threat={threat}
      />

      <GamePanel
        title="Battlefield"
        rightBadge={`W${runtime.wave} · E${lanePressure.enemyCount}`}
        tone={threat === 'spike' ? 'enemy' : 'player'}
        style={styles.battlePanel}
      >
        <View style={styles.frontlineRow}>
          <View style={styles.frontlineTrack}>
            <View style={[styles.frontlineThreatFill, { width: `${lanePressure.pressure * 100}%` }]} />
            <View style={[styles.frontlineMarkerAlly, { left: `${lanePressure.allyFront * 100}%` }]} />
            <View style={[styles.frontlineMarkerEnemy, { left: `${lanePressure.enemyFront * 100}%` }]} />
          </View>
          <View style={[styles.pressureChip, lanePressure.pressure > 0.7 ? styles.pressureChipHot : null]}>
            <Text style={styles.pressureChipText}>{pressureLabel}</Text>
          </View>
        </View>

        <View style={styles.laneWrap}>
          <View style={styles.gridLineA} />
          <View style={styles.gridLineB} />
          <View style={styles.groundLine} />

          <View style={styles.baseTower}>
            <View style={[styles.baseShield, { opacity: 0.22 + baseFlash * 0.58, transform: [{ scale: 1 + baseFlash * 0.28 }] }]} />
            <View style={[styles.baseShieldInner, { opacity: 0.18 + baseFlash * 0.5 }]} />
            <View style={styles.baseCore} />
            <View style={[styles.baseCoreGlow, { opacity: 0.22 + baseFlash * 0.62 }]} />
            <Text style={styles.baseText}>BASE</Text>
          </View>

          <View style={styles.enemyGate}>
            <View
              style={[
                styles.enemyPulse,
                threat === 'spike' ? styles.enemyPulseSpike : null,
                { opacity: 0.2 + spawnPulse * 0.58, transform: [{ scale: 1 + spawnPulse * 0.52 }] },
              ]}
            />
            <View
              style={[
                styles.enemyPulse,
                styles.enemyPulseOuter,
                { opacity: 0.1 + spawnPulse * 0.4, transform: [{ scale: 1.15 + spawnPulse * 0.35 }] },
              ]}
            />
            <Text style={styles.gateText}>ENTRY</Text>
          </View>

          {Array.from({ length: sparkCount }).map((_, index) => (
            <BattlefieldSpark key={`spark_${index}`} index={index} elapsedSec={runtime.elapsedSec} spike={threat === 'spike'} />
          ))}

          {runtime.shotTraces.map((trace: any) => {
            const from = trace.fromX * 100;
            const to = trace.toX * 100;
            const left = Math.min(from, to);
            const width = Math.max(0.8, Math.abs(to - from));
            const traceRatio = clamp01((trace.ttlSec || 0) / 0.12);
            const color = trace.team === 'ally' ? '#7fe9ff' : '#ff9f7f';

            return (
              <React.Fragment key={trace.id}>
                <View
                  style={[
                    styles.shotTrace,
                    {
                      left: `${left}%`,
                      width: `${width}%`,
                      top: trace.y,
                      backgroundColor: color,
                      opacity: 0.25 + traceRatio * 0.7,
                    },
                  ]}
                />
                <View
                  style={[
                    styles.shotImpact,
                    {
                      left: `${to}%`,
                      top: trace.y - 2,
                      backgroundColor: color,
                      opacity: 0.35 + traceRatio * 0.6,
                    },
                  ]}
                />
              </React.Fragment>
            );
          })}

          {runtime.entities.map((entity: any) => (
            <UnitSprite key={entity.id} entity={entity} elapsedSec={runtime.elapsedSec} />
          ))}
        </View>
      </GamePanel>

      <GamePanel title="Deploy Console" rightBadge={`${Math.round(runtime.watt)}W`} tone="player" style={styles.consolePanel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deployRow}>
          {templates.map((template: any) => (
            <View key={template.id} style={styles.deployCol}>
              <DeploymentButton
                name={template.name}
                role={template.role}
                cost={template.cost}
                cooldownSec={runtime.deployCooldowns[template.id] || 0}
                availableWatt={runtime.watt}
                onPress={() => onDeploy(template.id)}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.consoleFooter}>
          <Pressable style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Support (Soon)</Text>
          </Pressable>
          <View style={styles.statChipRow}>
            <Text style={styles.statChip}>K {runtime.stats.kills}</Text>
            <Text style={styles.statChip}>D {runtime.stats.deployed}</Text>
          </View>
          <Pressable style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetBtnText}>Reset</Text>
          </Pressable>
        </View>
      </GamePanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  battlePanel: {
    marginBottom: 10,
  },
  frontlineRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  frontlineTrack: {
    flex: 1,
    height: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#39577d',
    backgroundColor: '#15243d',
    overflow: 'hidden',
  },
  frontlineThreatFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 10,
    backgroundColor: '#8f4338',
  },
  frontlineMarkerAlly: {
    position: 'absolute',
    top: 2,
    marginLeft: -3,
    width: 6,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#72e5ff',
  },
  frontlineMarkerEnemy: {
    position: 'absolute',
    top: 2,
    marginLeft: -3,
    width: 6,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#ff976e',
  },
  pressureChip: {
    minWidth: 82,
    height: 20,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#4d7095',
    backgroundColor: '#1b3555',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  pressureChipHot: {
    borderColor: '#d76a4f',
    backgroundColor: '#5a2e2a',
  },
  pressureChipText: {
    color: '#daf6ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  laneWrap: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#35527e',
    backgroundColor: '#0b1a34',
  },
  gridLineA: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 64,
    height: 1,
    backgroundColor: '#284264',
  },
  gridLineB: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 112,
    height: 1,
    backgroundColor: '#284264',
  },
  groundLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 142,
    height: 2,
    backgroundColor: '#436591',
  },
  baseTower: {
    position: 'absolute',
    left: 8,
    top: 74,
    width: 66,
    height: 94,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#4bc8cb',
    backgroundColor: '#173650',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
  },
  baseShield: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#71f3ff',
  },
  baseShieldInner: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#9cf4ff',
  },
  baseCore: {
    zIndex: 2,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#b8ffff',
    backgroundColor: '#6bf1ff',
  },
  baseCoreGlow: {
    position: 'absolute',
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#5de8ff',
  },
  baseText: {
    zIndex: 2,
    color: '#cbfdff',
    fontSize: 10,
    fontWeight: '900',
  },
  enemyGate: {
    position: 'absolute',
    right: 8,
    top: 80,
    width: 60,
    height: 84,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d57d57',
    backgroundColor: '#44271f',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  enemyPulse: {
    position: 'absolute',
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#8a4c39',
    opacity: 0.4,
  },
  enemyPulseSpike: {
    backgroundColor: '#d35b3c',
    opacity: 0.6,
  },
  enemyPulseOuter: {
    width: 94,
    height: 94,
    borderRadius: 48,
    backgroundColor: '#ac5f48',
  },
  gateText: {
    color: '#ffd7b9',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  unitWrap: {
    position: 'absolute',
    marginLeft: -17,
    width: 34,
    height: 34,
    alignItems: 'center',
  },
  spawnRing: {
    position: 'absolute',
    bottom: -4,
    width: 33,
    height: 12,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  unitHpTrack: {
    position: 'absolute',
    top: -7,
    width: 28,
    height: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#263f62',
    overflow: 'hidden',
    backgroundColor: '#101a2d',
  },
  unitHpFill: {
    height: '100%',
  },
  unitShadow: {
    position: 'absolute',
    bottom: -1,
    width: 24,
    height: 5,
    borderRadius: 999,
  },
  unitShadowAlly: {
    backgroundColor: '#16516f',
  },
  unitShadowEnemy: {
    backgroundColor: '#6e2d2d',
  },
  unitTrail: {
    position: 'absolute',
    bottom: 8,
    width: 7,
    height: 5,
    borderRadius: 5,
  },
  unitTrailAlly: {
    backgroundColor: '#76e6ff',
  },
  unitTrailEnemy: {
    backgroundColor: '#ff936f',
  },
  hitFlash: {
    position: 'absolute',
    bottom: 4,
    width: 22,
    height: 22,
    borderRadius: 8,
  },
  muzzleFlash: {
    position: 'absolute',
    bottom: 12,
    width: 8,
    height: 4,
    borderRadius: 3,
  },
  silhouetteRoot: {
    position: 'absolute',
    bottom: 1,
    width: 30,
    height: 24,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  flipX: {
    transform: [{ scaleX: -1 }],
  },
  artilleryBody: {
    position: 'absolute',
    bottom: 8,
    width: 18,
    height: 11,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e6f1ff',
  },
  artilleryArmor: {
    position: 'absolute',
    bottom: 11,
    left: 4,
    width: 10,
    height: 4,
    borderRadius: 2,
  },
  artilleryBarrel: {
    position: 'absolute',
    bottom: 13,
    right: 1,
    width: 12,
    height: 3,
    borderRadius: 2,
  },
  artilleryLeg: {
    position: 'absolute',
    bottom: 1,
    width: 17,
    height: 6,
    borderRadius: 2,
  },
  supportTank: {
    position: 'absolute',
    bottom: 7,
    width: 15,
    height: 13,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#ecfbff',
  },
  supportPod: {
    position: 'absolute',
    bottom: 11,
    right: 2,
    width: 9,
    height: 5,
    borderRadius: 2,
  },
  supportAntenna: {
    position: 'absolute',
    bottom: 18,
    left: 10,
    width: 2,
    height: 7,
    borderRadius: 2,
  },
  supportBase: {
    position: 'absolute',
    bottom: 1,
    width: 16,
    height: 6,
    borderRadius: 2,
  },
  lightningHull: {
    position: 'absolute',
    bottom: 8,
    left: 6,
    width: 16,
    height: 9,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#e6f1ff',
  },
  lightningNose: {
    position: 'absolute',
    bottom: 10,
    right: -2,
    width: 0,
    height: 0,
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  lightningFinTop: {
    position: 'absolute',
    bottom: 17,
    left: 10,
    width: 6,
    height: 3,
    borderRadius: 2,
  },
  lightningLeg: {
    position: 'absolute',
    bottom: 1,
    width: 14,
    height: 5,
    borderRadius: 2,
  },
  fireHull: {
    position: 'absolute',
    bottom: 7,
    width: 17,
    height: 11,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffe8d6',
  },
  fireBarrel: {
    position: 'absolute',
    bottom: 12,
    right: 1,
    width: 10,
    height: 3,
    borderRadius: 2,
  },
  fireFurnace: {
    position: 'absolute',
    bottom: 11,
    left: 8,
    width: 5,
    height: 5,
    borderRadius: 2,
  },
  fireLeg: {
    position: 'absolute',
    bottom: 1,
    width: 16,
    height: 6,
    borderRadius: 2,
  },
  iceHull: {
    position: 'absolute',
    bottom: 8,
    width: 17,
    height: 10,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#f4fbff',
  },
  iceCrystalA: {
    position: 'absolute',
    bottom: 16,
    left: 7,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  iceCrystalB: {
    position: 'absolute',
    bottom: 14,
    right: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  iceLeg: {
    position: 'absolute',
    bottom: 1,
    width: 15,
    height: 5,
    borderRadius: 2,
  },
  spark: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    opacity: 0.85,
  },
  shotTrace: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
  },
  shotImpact: {
    position: 'absolute',
    marginLeft: -2,
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  deployRow: {
    gap: 8,
  },
  consolePanel: {
    marginBottom: 4,
  },
  deployCol: {
    width: 168,
  },
  consoleFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  supportBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#68bde2',
    borderRadius: 10,
    backgroundColor: '#1e4062',
    minHeight: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportBtnText: {
    color: '#bfeeff',
    fontSize: 11,
    fontWeight: '900',
  },
  statChipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statChip: {
    minWidth: 44,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#54739e',
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 7,
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
    backgroundColor: '#182f52',
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: '#7e8fb0',
    borderRadius: 10,
    backgroundColor: '#25395b',
    minHeight: 38,
    minWidth: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtnText: {
    color: palette.textDim,
    fontSize: 11,
    fontWeight: '900',
  },
});
