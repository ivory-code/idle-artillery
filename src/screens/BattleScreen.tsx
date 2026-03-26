import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { BattleHUD } from '../components/battle/BattleHUD';
import { BattlefieldStage } from '../components/battle/BattlefieldStage';
import { ProductionConsole } from '../components/battle/ProductionConsole';
import { partMap } from '../data/parts';
import { buildResultFromSurvival, createDeployTemplates, createSurvivalState, deployUnit, stepSurvivalState } from '../logic/survivalRuntime';
import { useGame } from '../state/GameProvider';
import { getSquadCombatUnits } from '../state/selectors';

const TICK_SEC = 0.1;
const TICK_MS = 100;

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
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
    const reserve = isLandscape ? 182 : 266;
    const available = Math.max(220, height - reserve);
    const min = isLandscape ? 338 : 248;
    const max = isLandscape ? 490 : 356;
    return Math.max(min, Math.min(available, max));
  }, [height, isLandscape]);

  const unitSize = useMemo(() => {
    if (isLandscape) {
      return Math.max(60, Math.min(82, Math.round(laneHeight * 0.245)));
    }
    return Math.max(44, Math.min(56, Math.round(laneHeight * 0.205)));
  }, [isLandscape, laneHeight]);

  const groundTop = Math.round(laneHeight * (isLandscape ? 0.83 : 0.76));
  const gridLineATop = Math.round(laneHeight * 0.32);
  const gridLineBTop = Math.round(laneHeight * 0.58);

  const allyBaseHeight = Math.round(laneHeight * (isLandscape ? 0.76 : 0.61));
  const allyBaseWidth = Math.round(allyBaseHeight * 0.74);
  const enemyBaseHeight = Math.round(laneHeight * (isLandscape ? 0.71 : 0.57));
  const enemyBaseWidth = Math.round(enemyBaseHeight * 0.74);
  const allyBaseTop = groundTop - allyBaseHeight + 10;
  const enemyBaseTop = groundTop - enemyBaseHeight + 10;

  const timeLeftSec = Math.max(0, runtime.durationSec - runtime.elapsedSec);
  const sparkCount = isLandscape ? Math.min(14, Math.max(6, runtime.entities.length + Math.floor(runtime.wave / 2))) : Math.min(10, Math.max(4, runtime.entities.length));

  const spawnPulse = clamp01((runtime.spawnPulseSec || 0) / 0.26);
  const baseFlash = clamp01((runtime.baseFlashSec || 0) / 0.2);
  const pressureLabel = lanePressure.pressure > 0.7 ? 'BREACH RISK' : lanePressure.pressure > 0.35 ? 'HOLD LINE' : 'STABLE';
  const pressurePercent = Math.round(lanePressure.pressure * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        <View style={styles.stageArea}>
          <BattlefieldStage
            runtime={runtime}
            isLandscape={isLandscape}
            laneHeight={laneHeight}
            groundTop={groundTop}
            gridLineATop={gridLineATop}
            gridLineBTop={gridLineBTop}
            lanePressure={lanePressure}
            pressureLabel={pressureLabel}
            pressurePercent={pressurePercent}
            threat={threat}
            unitSize={unitSize}
            sparkCount={sparkCount}
            allyBaseTop={allyBaseTop}
            allyBaseWidth={allyBaseWidth}
            allyBaseHeight={allyBaseHeight}
            enemyBaseTop={enemyBaseTop}
            enemyBaseWidth={enemyBaseWidth}
            enemyBaseHeight={enemyBaseHeight}
            baseFlash={baseFlash}
            spawnPulse={spawnPulse}
          />

          <BattleHUD
            wave={runtime.wave}
            timeLeftSec={timeLeftSec}
            watt={runtime.watt}
            wattMax={runtime.wattMax}
            baseHp={runtime.baseHp}
            baseMaxHp={runtime.baseMaxHp}
          />
        </View>

        <ProductionConsole runtime={runtime} templates={templates} isLandscape={isLandscape} onDeploy={onDeploy} onReset={onReset} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070f1a',
  },
  root: {
    flex: 1,
    backgroundColor: '#070f1a',
  },
  stageArea: {
    flex: 1,
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 2,
  },
});
