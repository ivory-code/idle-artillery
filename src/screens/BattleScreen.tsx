import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { ASSET_KEYS, getBackgroundAsset, getBaseAsset, getDeployButtonSkins, getUiAsset, getUnitAsset } from '../assets';
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
const DEPLOY_BUTTON_SKINS = getDeployButtonSkins();

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
  const thrustPulse = 0.42 + (Math.sin((elapsedSec + phase) * 15) + 1) * 0.18;
  const hpTrackWidth = Math.max(24, unitSize * 0.82);
  const hpTrackHeight = Math.max(4, unitSize * 0.12);
  const hitSize = Math.max(20, unitSize * 0.64);
  const flashWidth = Math.max(8, unitSize * 0.24);
  const flashHeight = Math.max(4, unitSize * 0.12);
  const trailWidth = Math.max(7, unitSize * 0.22);
  const trailHeight = Math.max(5, unitSize * 0.16);
  const shadowWidth = Math.max(24, unitSize * 0.72);
  const shadowHeight = Math.max(5, unitSize * 0.16);
  const spawnRingWidth = Math.max(30, unitSize * 0.96);
  const spawnRingHeight = Math.max(11, unitSize * 0.35);

  return (
    <View
      style={[
        styles.unitWrap,
        {
          left: `${entity.x * 100}%`,
          top: groundTop - unitSize - 4 + wobble,
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
              width: spawnRingWidth,
              height: spawnRingHeight,
              bottom: -Math.max(4, unitSize * 0.12),
              borderColor: tone.glow,
              opacity: spawnRatio * 0.8,
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
      <View
        style={[
          styles.unitTrail,
          isAlly ? styles.unitTrailAlly : styles.unitTrailEnemy,
          {
            width: trailWidth,
            height: trailHeight,
            bottom: Math.max(8, unitSize * 0.24),
            opacity: thrustPulse,
            left: isAlly ? -7 : undefined,
            right: !isAlly ? -7 : undefined,
          },
        ]}
      />
      <View style={[styles.unitShadow, isAlly ? styles.unitShadowAlly : styles.unitShadowEnemy, { width: shadowWidth, height: shadowHeight }]} />
      {hitRatio > 0 ? (
        <View
          style={[
            styles.hitFlash,
            {
              width: hitSize,
              height: hitSize,
              bottom: Math.max(4, unitSize * 0.12),
              opacity: hitRatio * 0.9,
              backgroundColor: isAlly ? '#8beaff' : '#ffae95',
            },
          ]}
        />
      ) : null}
      <View
        style={[
          styles.unitPlate,
          isAlly ? styles.unitPlateAlly : styles.unitPlateEnemy,
          {
            width: unitSize * 0.84,
            height: unitSize * 0.6,
            bottom: Math.max(2, unitSize * 0.08),
          },
        ]}
      />
      <Image
        source={unitAsset}
        style={[styles.unitAsset, !isAlly ? styles.unitAssetFlip : null, { width: unitSize * 0.9, height: unitSize * 0.74 }]}
        resizeMode="contain"
      />
      {muzzleRatio > 0 ? (
        <View
          style={[
            styles.muzzleFlash,
            {
              width: flashWidth,
              height: flashHeight,
              bottom: Math.max(12, unitSize * 0.35),
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

function BattlefieldSpark({ index, elapsedSec, spike, laneHeight }: { index: number; elapsedSec: number; spike: boolean; laneHeight: number }) {
  const x = (elapsedSec * (22 + index * 2) + index * 14) % 88;
  const y = laneHeight * 0.28 + Math.sin(elapsedSec * 5 + index) * laneHeight * 0.16;
  const color = spike && index % 2 === 0 ? palette.enemyA : palette.playerA;
  const size = laneHeight > 250 ? 4 : 3;

  return <View style={[styles.spark, { width: size, height: size, left: `${x + 6}%`, top: y, backgroundColor: color }]} />;
}

export function BattleScreen({ navigation }: any) {
  const { state, dispatch } = useGame();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
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

  const laneHeight = useMemo(() => {
    if (isLandscape) {
      return Math.max(246, Math.min(height - 178, 360));
    }
    return Math.max(210, Math.min(height * 0.48, 292));
  }, [height, isLandscape]);
  const unitSize = useMemo(() => {
    if (isLandscape) {
      return Math.max(46, Math.min(58, Math.round(laneHeight * 0.2)));
    }
    return Math.max(36, Math.min(44, Math.round(laneHeight * 0.17)));
  }, [isLandscape, laneHeight]);
  const groundTop = Math.round(laneHeight * (isLandscape ? 0.76 : 0.71));
  const gridLineATop = Math.round(laneHeight * 0.28);
  const gridLineBTop = Math.round(laneHeight * 0.5);
  const allyBaseHeight = Math.round(laneHeight * (isLandscape ? 0.62 : 0.48));
  const allyBaseWidth = Math.round(allyBaseHeight * 0.72);
  const enemyBaseHeight = Math.round(laneHeight * (isLandscape ? 0.58 : 0.45));
  const enemyBaseWidth = Math.round(enemyBaseHeight * 0.72);
  const allyBaseTop = groundTop - allyBaseHeight + 8;
  const enemyBaseTop = groundTop - enemyBaseHeight + 8;
  const timeLeftSec = Math.max(0, runtime.durationSec - runtime.elapsedSec);
  const sparkCount = isLandscape ? Math.min(22, Math.max(8, runtime.entities.length + runtime.wave)) : Math.min(14, Math.max(5, runtime.entities.length + Math.floor(runtime.wave / 2)));
  const spawnPulse = clamp01((runtime.spawnPulseSec || 0) / 0.26);
  const baseFlash = clamp01((runtime.baseFlashSec || 0) / 0.2);
  const wattRatio = runtime.wattMax > 0 ? clamp01(runtime.watt / runtime.wattMax) : 0;
  const pressureLabel = lanePressure.pressure > 0.7 ? 'BREACH RISK' : lanePressure.pressure > 0.35 ? 'HOLD LINE' : 'STABLE';
  const pressurePercent = Math.round(lanePressure.pressure * 100);

  return (
    <ScreenShell scroll={false} contentStyle={[styles.screenContent, isLandscape ? styles.screenContentLandscape : styles.screenContentPortrait]}>
      <View style={styles.hudWrap}>
        <BattleTopHUD
          wave={runtime.wave}
          timeLeftSec={timeLeftSec}
          watt={runtime.watt}
          wattMax={runtime.wattMax}
          wattRegen={runtime.wattRegen}
          baseHp={runtime.baseHp}
          baseMaxHp={runtime.baseMaxHp}
          threat={threat}
          frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
          backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
          wattPanelSource={getUiAsset(ASSET_KEYS.ui.wattPanel)}
          hpPanelSource={getUiAsset(ASSET_KEYS.ui.statBoxSmall)}
        />
      </View>

      <View style={styles.battleCore}>
        <GamePanel
          title="Battlefield"
          rightBadge={`W${runtime.wave} · E${lanePressure.enemyCount}`}
          tone={threat === 'spike' ? 'enemy' : 'player'}
          style={styles.battlePanel}
          frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
          backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
          backgroundOpacity={0.2}
          frameOpacity={0.62}
          innerStyle={styles.battlePanelInner}
        >
          <View style={styles.frontlineRow}>
            <View style={[styles.frontlineTrack, isLandscape ? styles.frontlineTrackLandscape : null]}>
              <View style={[styles.frontlineThreatFill, { width: `${lanePressure.pressure * 100}%` }]} />
              <View style={[styles.frontlineMarkerAlly, isLandscape ? styles.frontlineMarkerLandscape : null, { left: `${lanePressure.allyFront * 100}%` }]} />
              <View style={[styles.frontlineMarkerEnemy, isLandscape ? styles.frontlineMarkerLandscape : null, { left: `${lanePressure.enemyFront * 100}%` }]} />
              <View style={[styles.frontlineCenterLine, { left: `${((lanePressure.allyFront + lanePressure.enemyFront) / 2) * 100}%` }]} />
            </View>
            <View style={[styles.pressureChip, lanePressure.pressure > 0.7 ? styles.pressureChipHot : null]}>
              <Text style={styles.pressureChipText}>{pressureLabel}</Text>
            </View>
          </View>

          <ImageBackground source={getBackgroundAsset(ASSET_KEYS.backgrounds.battlefieldMain)} resizeMode="cover" style={[styles.laneWrap, { height: laneHeight }]} imageStyle={styles.laneBackgroundImage}>
            <View style={styles.battleVignette} />
            <View style={[styles.enemyPressureFog, { opacity: 0.2 + lanePressure.pressure * 0.42, width: `${34 + lanePressure.pressure * 40}%` }]} />
            <View style={styles.playerBacklight} />
            <View style={[styles.gridLineA, { top: gridLineATop }]} />
            <View style={[styles.gridLineB, { top: gridLineBTop }]} />
            <View style={[styles.groundLine, { top: groundTop }]} />

            <View style={[styles.baseTower, { left: isLandscape ? 12 : 8, top: allyBaseTop, width: allyBaseWidth, height: allyBaseHeight, borderWidth: isLandscape ? 3 : 2 }]}>
              <Image source={getBaseAsset(ASSET_KEYS.bases.playerMain)} style={styles.baseTowerAsset} resizeMode="contain" />
              <View style={[styles.baseShield, { opacity: 0.22 + baseFlash * 0.58, transform: [{ scale: 1 + baseFlash * 0.28 }] }]} />
              <View style={[styles.baseShieldInner, { opacity: 0.18 + baseFlash * 0.5 }]} />
              <View style={[styles.baseCore, isLandscape ? styles.baseCoreLandscape : null]} />
              <View style={[styles.baseCoreGlow, isLandscape ? styles.baseCoreGlowLandscape : null, { opacity: 0.22 + baseFlash * 0.62 }]} />
              <Text style={[styles.baseText, isLandscape ? styles.baseTextLandscape : null]}>BASE</Text>
            </View>
            <View style={[styles.basePlatform, { left: isLandscape ? 14 : 10, top: groundTop + 4, width: allyBaseWidth + 16 }]} />

            <View style={[styles.enemyGate, { right: isLandscape ? 12 : 8, top: enemyBaseTop, width: enemyBaseWidth, height: enemyBaseHeight, borderWidth: isLandscape ? 3 : 2 }]}>
              <Image source={getBaseAsset(ASSET_KEYS.bases.enemyMain)} style={styles.enemyGateAsset} resizeMode="contain" />
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
              <Text style={[styles.gateText, isLandscape ? styles.gateTextLandscape : null]}>ENTRY</Text>
            </View>
            <View style={[styles.enemyPlatform, { right: isLandscape ? 14 : 10, top: groundTop + 4, width: enemyBaseWidth + 16 }]} />

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
          </ImageBackground>

          <View style={styles.battleFooterRow}>
            <Text style={styles.footerChip}>PRESSURE {pressurePercent}%</Text>
            <Text style={styles.footerChip}>ALLY {lanePressure.allyCount}</Text>
            <Text style={styles.footerChipEnemy}>ENEMY {lanePressure.enemyCount}</Text>
          </View>
        </GamePanel>
      </View>

      <GamePanel
        title="Production Console"
        rightBadge={`${Math.round(runtime.watt)}W`}
        tone="player"
        style={[styles.consolePanel, isLandscape ? styles.consolePanelLandscape : styles.consolePanelPortrait]}
        frameSource={getUiAsset(ASSET_KEYS.ui.deployBar)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.34}
        frameOpacity={0.64}
        innerStyle={styles.consolePanelInner}
      >
        <View style={styles.consoleHeadRow}>
          <View style={styles.consoleGaugeWrap}>
            <Text style={styles.consoleGaugeLabel}>WATT FLOW</Text>
            <View style={styles.consoleGaugeTrack}>
              <ImageBackground
                source={getUiAsset(ASSET_KEYS.ui.wattPanel)}
                resizeMode="stretch"
                style={[styles.consoleGaugeFill, { width: `${wattRatio * 100}%` }]}
                imageStyle={styles.consoleGaugeFillImage}
              />
            </View>
            <Text style={styles.consoleGaugeValue}>{Math.round(runtime.wattRegen * 10) / 10}/s</Text>
          </View>
          <View style={styles.consoleInfoRow}>
            <Text style={styles.consoleInfoChip}>K {runtime.stats.kills}</Text>
            <Text style={styles.consoleInfoChip}>D {runtime.stats.deployed}</Text>
            <Text style={styles.consoleInfoChip}>W {runtime.wave}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.deployRow, isLandscape ? styles.deployRowLandscape : null]}>
          {templates.map((template: any) => (
            <View key={template.id} style={[styles.deployCol, isLandscape ? styles.deployColLandscape : null]}>
              <DeploymentButton
                name={template.name}
                role={template.role}
                cost={template.cost}
                cooldownSec={runtime.deployCooldowns[template.id] || 0}
                availableWatt={runtime.watt}
                onPress={() => onDeploy(template.id)}
                skinSources={DEPLOY_BUTTON_SKINS}
                iconSource={getUnitAsset({ team: 'ally', archetype: template.archetype })}
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.consoleFooter}>
          <Pressable style={styles.supportBtn}>
            <Text style={styles.supportBtnText}>Support Relay</Text>
          </Pressable>
          <Pressable style={styles.resetBtn} onPress={onReset}>
            <Text style={styles.resetBtnText}>Reset Run</Text>
          </Pressable>
        </View>
      </GamePanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
  },
  screenContentLandscape: {
    paddingHorizontal: 10,
  },
  screenContentPortrait: {
    paddingHorizontal: 12,
  },
  hudWrap: {
    marginBottom: 6,
  },
  battleCore: {
    flex: 1,
    marginBottom: 8,
  },
  combatStage: {
    gap: 8,
  },
  combatStageLandscape: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  combatStagePortrait: {
    flexDirection: 'column',
  },
  battlePanel: {
    marginBottom: 0,
    flex: 1,
  },
  battlePanelInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  frontlineTrackLandscape: {
    height: 20,
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
  frontlineMarkerLandscape: {
    top: 2,
    width: 7,
    height: 14,
    marginLeft: -3.5,
    borderRadius: 3,
  },
  frontlineCenterLine: {
    position: 'absolute',
    top: -1,
    bottom: -1,
    marginLeft: -1,
    width: 2,
    borderRadius: 2,
    backgroundColor: '#c4dfff',
    opacity: 0.75,
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
    minHeight: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#35527e',
    backgroundColor: '#0b1a34',
  },
  battleVignette: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 2,
    borderColor: 'rgba(16,34,58,0.86)',
    borderRadius: 12,
  },
  enemyPressureFog: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#6f2f2a',
  },
  playerBacklight: {
    position: 'absolute',
    left: -20,
    top: 0,
    bottom: 0,
    width: '36%',
    backgroundColor: 'rgba(40,110,140,0.2)',
  },
  laneBackgroundImage: {
    opacity: 0.58,
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
    overflow: 'hidden',
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
  baseTowerAsset: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.76,
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
  baseCoreLandscape: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  baseCoreGlowLandscape: {
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 11,
  },
  baseText: {
    zIndex: 2,
    color: '#cbfdff',
    fontSize: 10,
    fontWeight: '900',
  },
  baseTextLandscape: {
    fontSize: 11,
    letterSpacing: 0.35,
  },
  enemyGate: {
    overflow: 'hidden',
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
  },
  enemyGateAsset: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.78,
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
  gateTextLandscape: {
    fontSize: 10,
    letterSpacing: 0.6,
  },
  basePlatform: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(62,140,160,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(127,214,231,0.5)',
  },
  enemyPlatform: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(156,82,60,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,167,132,0.45)',
  },
  unitWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  spawnRing: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 1.5,
  },
  unitHpTrack: {
    position: 'absolute',
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
    borderRadius: 8,
  },
  muzzleFlash: {
    position: 'absolute',
    borderRadius: 3,
  },
  unitAsset: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 5,
    opacity: 0.97,
  },
  unitPlate: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
  },
  unitPlateAlly: {
    borderColor: 'rgba(118,230,255,0.44)',
    backgroundColor: 'rgba(34,82,112,0.42)',
  },
  unitPlateEnemy: {
    borderColor: 'rgba(255,150,120,0.45)',
    backgroundColor: 'rgba(114,52,42,0.4)',
  },
  unitAssetFlip: {
    transform: [{ scaleX: -1 }],
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
  battleFooterRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerChip: {
    borderWidth: 1,
    borderColor: '#4f6f98',
    borderRadius: 999,
    backgroundColor: '#1b3555',
    color: '#d4ebff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  footerChipEnemy: {
    marginLeft: 'auto',
    borderWidth: 1,
    borderColor: '#cf7b63',
    borderRadius: 999,
    backgroundColor: '#5c2f2a',
    color: '#ffd8cc',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  deployRow: {
    gap: 8,
  },
  deployRowLandscape: {
    gap: 10,
    paddingRight: 4,
  },
  deployColumn: {
    gap: 8,
    paddingRight: 4,
  },
  consolePanel: {
    marginBottom: 0,
  },
  consolePanelInner: {
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 8,
  },
  consolePanelLandscape: {
    justifyContent: 'space-between',
  },
  consolePanelPortrait: {
    marginBottom: 4,
  },
  deployCol: {
    width: 168,
  },
  deployColLandscape: {
    width: '100%',
    minWidth: 230,
  },
  consoleHeadRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  consoleGaugeWrap: {
    flex: 1,
  },
  consoleGaugeLabel: {
    color: '#a2d0ec',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  consoleGaugeTrack: {
    marginTop: 4,
    height: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f7397',
    backgroundColor: '#13263f',
    overflow: 'hidden',
  },
  consoleGaugeFill: {
    height: '100%',
  },
  consoleGaugeFillImage: {
    opacity: 0.92,
  },
  consoleGaugeValue: {
    marginTop: 3,
    color: '#89d3ff',
    fontSize: 9,
    fontWeight: '800',
  },
  consoleInfoRow: {
    flexDirection: 'row',
    gap: 5,
  },
  consoleInfoChip: {
    minWidth: 42,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#587ba3',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 5,
    color: '#d6ecff',
    fontSize: 10,
    fontWeight: '900',
    backgroundColor: '#1a3354',
  },
  consoleFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consoleFooterLandscape: {
    marginTop: 8,
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
