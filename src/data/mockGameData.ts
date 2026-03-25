import { EnemyData, PartData, PartSlotInfo, SkillData, UnitData, UpgradeTrackData, WaveData } from '../types/game';

export const partSlots: PartSlotInfo[] = [
  {
    id: 'chassis',
    name: 'Chassis',
    affects: ['HP', 'DEF'],
    description: 'Defines durability and front-line identity.',
  },
  {
    id: 'turret',
    name: 'Turret',
    affects: ['ATK', 'Fire Rate'],
    description: 'Defines main damage profile and tempo.',
  },
  {
    id: 'core',
    name: 'Core',
    affects: ['Crit', 'Rate Utility'],
    description: 'Adds control tuning and precision.',
  },
  {
    id: 'ammo',
    name: 'Ammo',
    affects: ['Damage Style'],
    description: 'Shapes damage flavor and burst behavior.',
  },
];

export const units: UnitData[] = [
  {
    id: 'unit_sprout',
    name: 'Sprout Cannon',
    archetypeId: 'arch_burst',
    baseStats: { hp: 120, attack: 30, defense: 10, fireRate: 1.2, crit: 0.05 },
  },
  {
    id: 'unit_bubble',
    name: 'Bubble Guard',
    archetypeId: 'arch_guard',
    baseStats: { hp: 170, attack: 22, defense: 18, fireRate: 0.85, crit: 0.03 },
  },
  {
    id: 'unit_pepper',
    name: 'Pepper Rail',
    archetypeId: 'arch_siege',
    baseStats: { hp: 135, attack: 38, defense: 9, fireRate: 0.95, crit: 0.06 },
  },
];

export const parts: PartData[] = [
  {
    id: 'part_chassis_twig',
    name: 'Twig Chassis',
    slot: 'chassis',
    rarity: 'common',
    flatMods: { hp: 22, defense: 4 },
    pctMods: {},
    slotEffects: ['Solid starter hull', 'Stable HP boost'],
  },
  {
    id: 'part_chassis_tin',
    name: 'Tin Chassis',
    slot: 'chassis',
    rarity: 'rare',
    flatMods: { hp: 30, defense: 6 },
    pctMods: { hp: 0.02 },
    slotEffects: ['Heavy shell', 'Higher durability scaling'],
  },
  {
    id: 'part_turret_petal',
    name: 'Petal Turret',
    slot: 'turret',
    rarity: 'common',
    flatMods: { attack: 8, fireRate: 0.08 },
    pctMods: {},
    slotEffects: ['Faster volleys', 'Light attack boost'],
  },
  {
    id: 'part_turret_rail',
    name: 'Rail Turret',
    slot: 'turret',
    rarity: 'rare',
    flatMods: { attack: 14 },
    pctMods: { attack: 0.03, crit: 0.01 },
    slotEffects: ['High impact shell', 'Sharp burst profile'],
  },
  {
    id: 'part_core_mint',
    name: 'Mint Core',
    slot: 'core',
    rarity: 'common',
    flatMods: { fireRate: 0.05 },
    pctMods: {},
    slotEffects: ['Steady timing', 'Cleaner firing cycle'],
  },
  {
    id: 'part_core_volt',
    name: 'Volt Core',
    slot: 'core',
    rarity: 'rare',
    flatMods: { attack: 6, crit: 0.02 },
    pctMods: { fireRate: 0.02 },
    slotEffects: ['Power surge', 'Aggressive crit bias'],
  },
  {
    id: 'part_ammo_spark',
    name: 'Spark Ammo',
    slot: 'ammo',
    rarity: 'common',
    flatMods: { attack: 6, crit: 0.01 },
    pctMods: {},
    slotEffects: ['Reliable rounds', 'Balanced output'],
  },
  {
    id: 'part_ammo_bubble',
    name: 'Bubble Bomb',
    slot: 'ammo',
    rarity: 'epic',
    flatMods: { attack: 12, fireRate: -0.04 },
    pctMods: { attack: 0.04 },
    slotEffects: ['Big payload', 'Slower but heavier shots'],
  },
];

export const enemies: EnemyData[] = [
  { id: 'enemy_pop', name: 'Pop Drone', stats: { hp: 60, attack: 10, defense: 3, fireRate: 1.0 } },
  { id: 'enemy_clunk', name: 'Clunk Walker', stats: { hp: 95, attack: 13, defense: 7, fireRate: 0.9 } },
  { id: 'enemy_hush', name: 'Hush Bomber', stats: { hp: 80, attack: 18, defense: 4, fireRate: 0.8 } },
];

export const waves: WaveData[] = [
  {
    id: 'wave_stage_1',
    stageName: 'Candy Dunes',
    recommendedPower: 180,
    entries: [
      { enemyId: 'enemy_pop', count: 8 },
      { enemyId: 'enemy_clunk', count: 3 },
    ],
    rewards: { scrap: 95, coreBits: 1 },
  },
  {
    id: 'wave_stage_2',
    stageName: 'Tin Valley',
    recommendedPower: 260,
    entries: [
      { enemyId: 'enemy_pop', count: 10 },
      { enemyId: 'enemy_clunk', count: 5 },
      { enemyId: 'enemy_hush', count: 3 },
    ],
    rewards: { scrap: 130, coreBits: 2 },
  },
];

export const upgrades: UpgradeTrackData[] = [
  {
    id: 'reload_drive',
    name: 'Reload Drive',
    description: 'Increase fire rate for all units.',
    baseCost: 90,
    costStep: 1.4,
    stat: 'fireRatePct',
    stepValue: 0.03,
  },
  {
    id: 'hull_plating',
    name: 'Hull Plating',
    description: 'Increase HP for all units.',
    baseCost: 100,
    costStep: 1.45,
    stat: 'hpPct',
    stepValue: 0.04,
  },
  {
    id: 'salvage_magnet',
    name: 'Salvage Magnet',
    description: 'Increase battle rewards.',
    baseCost: 120,
    costStep: 1.5,
    stat: 'rewardPct',
    stepValue: 0.05,
  },
];

export const skills: SkillData[] = [
  { id: 'skill_rapid_burst', name: 'Rapid Burst', trigger: 'cooldown', cooldownSec: 8, effect: { type: 'damageMult', value: 1.8 } },
  { id: 'skill_guard_pulse', name: 'Guard Pulse', trigger: 'cooldown', cooldownSec: 12, effect: { type: 'shield', value: 0.12 } },
  { id: 'skill_rail_focus', name: 'Rail Focus', trigger: 'passive', cooldownSec: 0, effect: { type: 'critBoost', value: 0.03 } },
];

export const mockGameData = {
  partSlots,
  units,
  parts,
  enemies,
  waves,
  upgrades,
  skills,
};
