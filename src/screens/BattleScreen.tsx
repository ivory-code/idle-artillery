import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ActionTile } from '../components/game/ActionTile';
import { BattlefieldLane } from '../components/game/BattlefieldLane';
import { DeployTray } from '../components/game/DeployTray';
import { HudResourceBar } from '../components/game/HudResourceBar';
import { SurvivalHud } from '../components/game/SurvivalHud';
import { ScreenShell } from '../components/ScreenShell';
import { partMap } from '../data/parts';
import { buildResultFromSurvival, createDeployTemplates, createSurvivalState, deployUnit, stepSurvivalState } from '../logic/survivalRuntime';
import { useGame } from '../state/GameProvider';
import { getSquadCombatUnits } from '../state/selectors';
import { colors } from '../theme/colors';

const TICK_SEC = 0.1;
const TICK_MS = 100;

export function BattleScreen({ navigation }: any) {
  const { state, dispatch } = useGame();
  const squadUnits = getSquadCombatUnits(state);

  const templates = useMemo(() => createDeployTemplates(squadUnits, state.builds, partMap), [squadUnits, state.builds]);
  const [runtime, setRuntime] = useState(() => createSurvivalState(templates));
  const reportedRef = useRef(false);

  useEffect(() => {
    if (runtime.elapsedSec <= 0.01 && runtime.entities.length === 0) {
      setRuntime(createSurvivalState(templates));
    }
  }, [templates]);

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

  const onDeploy = (templateId) => {
    setRuntime((prev) => deployUnit(prev, templateId));
  };

  const resetMatch = () => {
    reportedRef.current = false;
    setRuntime(createSurvivalState(templates));
  };

  const timeLeftSec = Math.max(0, runtime.durationSec - runtime.elapsedSec);

  return (
    <ScreenShell scroll={false}>
      <HudResourceBar scrap={state.player.scrap} coreBits={state.player.coreBits} rightBadge="LIVE SURVIVAL" />

      <SurvivalHud
        timeLeftSec={timeLeftSec}
        watt={runtime.watt}
        wattMax={runtime.wattMax}
        wattRegen={runtime.wattRegen}
        wave={runtime.wave}
        baseHp={runtime.baseHp}
        baseMaxHp={runtime.baseMaxHp}
      />

      <BattlefieldLane entities={runtime.entities} baseHp={runtime.baseHp} baseMaxHp={runtime.baseMaxHp} />

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>Kills {runtime.stats.kills}</Text>
        <Text style={styles.statusText}>Deploy {runtime.stats.deployed}</Text>
        <Text style={styles.statusText}>Pressure W{runtime.wave}</Text>
      </View>

      <View style={styles.actionRow}>
        <View style={styles.actionHalf}>
          <ActionTile label="Reset Match" caption="Restart 5m run" icon="🔄" onPress={resetMatch} />
        </View>
        <View style={styles.actionHalf}>
          <ActionTile label="Hangar" caption="Exit battle" icon="↩️" onPress={() => navigation.goBack()} />
        </View>
      </View>

      <DeployTray templates={runtime.templates} currentWatt={runtime.watt} cooldowns={runtime.deployCooldowns as Record<string, number>} onDeploy={onDeploy} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  statusText: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
    marginBottom: 8,
  },
  actionHalf: {
    width: '50%',
    paddingHorizontal: 4,
  },
});
