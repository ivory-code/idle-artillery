import { partMap } from '../data/parts';
import { unitMap } from '../data/units';
import { AssemblyPreview, PartData, PartRarity, RoleIdentity, UnitBuild, UnitStatMods, UnitStats } from '../types/game';
import { GlobalUpgradeEffects } from './upgrades';

const statKeys: Array<keyof UnitStats> = ['hp', 'attack', 'defense', 'fireRate', 'crit'];

const rarityMultiplier: Record<PartRarity, number> = {
  common: 1,
  rare: 1.18,
  epic: 1.38,
};

const PART_LEVEL_STEP = 0.04;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function applyMod(target: UnitStatMods, source: UnitStatMods): UnitStatMods {
  const next = { ...target };

  statKeys.forEach((key) => {
    if (typeof source[key] === 'number') {
      next[key] = (next[key] ?? 0) + (source[key] ?? 0);
    }
  });

  return next;
}

function scalePartMods(part: PartData, level: number): { flat: UnitStatMods; pct: UnitStatMods } {
  const scale = rarityMultiplier[part.rarity] * (1 + level * PART_LEVEL_STEP);
  const flat: UnitStatMods = {};
  const pct: UnitStatMods = {};

  statKeys.forEach((key) => {
    const flatValue = part.flatMods[key];
    const pctValue = part.pctMods[key];

    if (typeof flatValue === 'number') {
      flat[key] = flatValue * scale;
    }

    if (typeof pctValue === 'number') {
      pct[key] = pctValue * scale;
    }
  });

  return { flat, pct };
}

function resolveRoleIdentity(stats: UnitStats): RoleIdentity {
  const scores = {
    Bulwark: stats.hp * 0.5 + stats.defense * 8,
    Barrage: stats.attack * stats.fireRate * 10,
    Sharpshot: stats.attack * 5 + stats.crit * 260,
    Support: stats.fireRate * 80 + stats.hp * 0.12,
  } as const;

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as RoleIdentity;
  return best;
}

export function estimatePower(stats: UnitStats): number {
  const pressure = stats.attack * stats.fireRate * (1 + stats.crit * 0.6) * 10;
  const stability = stats.hp * 0.45 + stats.defense * 7;
  return Math.round(pressure + stability);
}

export function buildAssemblyPreview(params: {
  build: UnitBuild;
  partLevels: Record<string, number>;
  globalEffects: GlobalUpgradeEffects;
}): AssemblyPreview | null {
  const { build, partLevels, globalEffects } = params;
  const unit = unitMap[build.unitId];
  if (!unit) return null;

  const baseStats = { ...unit.baseStats };

  let flatSum: UnitStatMods = {};
  let pctSum: UnitStatMods = {};

  Object.values(build.slots).forEach((partId) => {
    if (!partId) return;
    const part = partMap[partId];
    if (!part) return;

    const level = partLevels[part.id] ?? 0;
    const scaled = scalePartMods(part, level);
    flatSum = applyMod(flatSum, scaled.flat);
    pctSum = applyMod(pctSum, scaled.pct);
  });

  const assembledStats: UnitStats = {
    hp: 0,
    attack: 0,
    defense: 0,
    fireRate: 0,
    crit: 0,
  };

  statKeys.forEach((key) => {
    const base = baseStats[key] ?? 0;
    const flat = flatSum[key] ?? 0;
    const partPct = pctSum[key] ?? 0;

    let globalPct = 0;
    if (key === 'hp') globalPct = globalEffects.hpPct;
    if (key === 'fireRate') globalPct = globalEffects.fireRatePct;

    const value = (base + flat) * (1 + partPct + globalPct);

    if (key === 'fireRate') {
      assembledStats[key] = Number(clamp(value, 0.4, 3).toFixed(2));
      return;
    }

    if (key === 'crit') {
      // Crit stays simple and readable: additive then clamped.
      assembledStats[key] = Number(clamp(base + flat + partPct + globalPct, 0, 0.75).toFixed(3));
      return;
    }

    assembledStats[key] = Math.max(1, Math.round(value));
  });

  const statDelta: UnitStats = {
    hp: assembledStats.hp - baseStats.hp,
    attack: assembledStats.attack - baseStats.attack,
    defense: assembledStats.defense - baseStats.defense,
    fireRate: Number((assembledStats.fireRate - baseStats.fireRate).toFixed(2)),
    crit: Number((assembledStats.crit - baseStats.crit).toFixed(3)),
  };

  const roleIdentity = resolveRoleIdentity(assembledStats);
  const power = estimatePower(assembledStats);

  return {
    baseStats,
    assembledStats,
    statDelta,
    roleIdentity,
    power,
  };
}
