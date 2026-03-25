import { waves } from '../data/waves';
import { unitMap } from '../data/units';
import { buildAssemblyPreview, estimatePower } from '../logic/assembly';
import { applyFormationBonus } from '../logic/squad';
import { getUpgradeEffects } from '../logic/upgrades';
import { GameState, RoleIdentity, UnitBuild, UnitStats, WaveData } from '../types/game';

export interface SquadCombatUnit {
  id: string;
  name: string;
  archetypeId: string;
  roleIdentity: RoleIdentity;
  stats: UnitStats;
}

export function getUnlockedWaveIds(state: GameState): string[] {
  if (state.progression.unlockedWaveIds.length) {
    return state.progression.unlockedWaveIds;
  }
  return waves.length ? [waves[0].id] : [];
}

export function getSelectedWave(state: GameState): WaveData {
  const unlocked = new Set(getUnlockedWaveIds(state));
  const selected = waves.find((wave) => wave.id === state.battle.selectedWaveId);
  if (selected && unlocked.has(selected.id)) {
    return selected;
  }

  const firstUnlocked = waves.find((wave) => unlocked.has(wave.id));
  return firstUnlocked || waves[0];
}

export function getBuildArray(state: GameState): UnitBuild[] {
  return Object.values(state.builds);
}

export function getSquadBuilds(state: GameState): UnitBuild[] {
  return state.squad.slots.map((buildId) => (buildId ? state.builds[buildId] : null)).filter((build): build is UnitBuild => Boolean(build));
}

export function getSquadStats(state: GameState): UnitStats[] {
  return getSquadCombatUnits(state).map((unit) => unit.stats);
}

export function getSquadCombatUnits(state: GameState): SquadCombatUnit[] {
  const effects = getUpgradeEffects(state.upgrades.levels);

  const previews = getSquadBuilds(state)
    .map((build) => {
      const preview = buildAssemblyPreview({ build, partLevels: state.collection.partLevels, globalEffects: effects });
      if (!preview) return null;
      const unit = unitMap[build.unitId];
      if (!unit) return null;

      return {
        id: build.id,
        name: unit.name,
        archetypeId: unit.archetypeId,
        roleIdentity: preview.roleIdentity,
        stats: preview.assembledStats,
      };
    })
    .filter((item): item is Omit<SquadCombatUnit, 'stats'> & { stats: UnitStats } => Boolean(item));

  const formedStats = applyFormationBonus(
    previews.map((item) => item.stats),
    state.squad.formationId
  );

  return previews.map((item, index) => ({
    ...item,
    stats: formedStats[index],
  }));
}

export function getSquadPower(state: GameState): number {
  return getSquadStats(state).reduce((sum, stats) => sum + estimatePower(stats), 0);
}
