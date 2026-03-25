export type PartSlot = 'chassis' | 'turret' | 'core' | 'ammo';
export type PartRarity = 'common' | 'rare' | 'epic';
export type FormationId = 'line' | 'triangle' | 'focus';
export type BattleMode = 'stage' | 'survival';
export type UpgradeTrackId = 'reload_drive' | 'hull_plating' | 'salvage_magnet';
export type RoleIdentity = 'Bulwark' | 'Barrage' | 'Sharpshot' | 'Support';
export type LanguageId = 'en' | 'ko';
export type SettingKey = 'musicVolume' | 'sfxVolume' | 'vibration' | 'language' | 'lowFxMode';

export interface UnitStats {
  hp: number;
  attack: number;
  defense: number;
  fireRate: number;
  crit: number;
}

export type UnitStatMods = Partial<Record<keyof UnitStats, number>>;

export interface UnitData {
  id: string;
  name: string;
  archetypeId: string;
  baseStats: UnitStats;
}

export interface PartData {
  id: string;
  name: string;
  slot: PartSlot;
  rarity: PartRarity;
  flatMods: UnitStatMods;
  pctMods: UnitStatMods;
  slotEffects: string[];
}

export interface PartSlotInfo {
  id: PartSlot;
  name: string;
  affects: string[];
  description: string;
}

export interface EnemyData {
  id: string;
  name: string;
  stats: Pick<UnitStats, 'hp' | 'attack' | 'defense' | 'fireRate'>;
}

export interface WaveData {
  id: string;
  stageName: string;
  recommendedPower: number;
  entries: Array<{ enemyId: string; count: number }>;
  rewards: {
    scrap: number;
    coreBits: number;
  };
}

export interface UpgradeTrackData {
  id: UpgradeTrackId;
  name: string;
  description: string;
  baseCost: number;
  costStep: number;
  stat: 'fireRatePct' | 'hpPct' | 'rewardPct';
  stepValue: number;
}

export interface SkillData {
  id: string;
  name: string;
  trigger: 'cooldown' | 'passive';
  cooldownSec: number;
  effect: {
    type: string;
    value: number;
  };
}

export interface UnitBuild {
  id: string;
  unitId: string;
  slots: Record<PartSlot, string | null>;
}

export interface AssemblyPreview {
  baseStats: UnitStats;
  assembledStats: UnitStats;
  statDelta: UnitStats;
  roleIdentity: RoleIdentity;
  power: number;
}

export interface BattleResult {
  mode: BattleMode;
  victory: boolean;
  waveId: string;
  waveName: string;
  enemiesDefeated: number;
  durationSec: number;
  squadHpLeft: number;
  score: number;
  milestones: {
    spikesCleared: number;
    elitesDefeated: number;
    bossesDefeated: number;
    fiveMinuteClear: boolean;
  };
  debug: {
    seed: number;
    ticks: number;
    playerShots: number;
    enemyShots: number;
    crits: number;
    skillsTriggered: number;
    elitesSpawned: number;
    bossesSpawned: number;
  };
  rewards: {
    scrap: number;
    coreBits: number;
  };
}

export interface StageBestRecord {
  bestTimeSec: number | null;
  bestScore: number;
  bestHpLeft: number;
  clearCount: number;
}

export interface SurvivalRunRecord {
  id: string;
  playedAt: number;
  durationSec: number;
  score: number;
  enemiesDefeated: number;
  victory: boolean;
  rewards: {
    scrap: number;
    coreBits: number;
  };
  milestones: {
    spikesCleared: number;
    elitesDefeated: number;
    bossesDefeated: number;
    fiveMinuteClear: boolean;
  };
}

export interface GameState {
  meta: {
    saveVersion: number;
    hydrated: boolean;
    lastSavedAt: number | null;
    createdAt: number;
    appVersion: string;
  };
  player: {
    scrap: number;
    coreBits: number;
  };
  collection: {
    ownedUnitIds: string[];
    ownedPartIds: string[];
    partLevels: Record<string, number>;
  };
  builds: Record<string, UnitBuild>;
  squad: {
    slots: Array<string | null>;
    formationId: FormationId;
  };
  upgrades: {
    levels: Record<UpgradeTrackId, number>;
  };
  progression: {
    highestStageCleared: number;
    unlockedWaveIds: string[];
    stageBest: Record<string, StageBestRecord>;
  };
  survival: {
    bestTimeSec: number;
    bestScore: number;
    totalRuns: number;
    runs: SurvivalRunRecord[];
  };
  settings: {
    musicVolume: number;
    sfxVolume: number;
    vibration: boolean;
    language: LanguageId;
    lowFxMode: boolean;
  };
  battle: {
    selectedWaveId: string;
    selectedMode: BattleMode;
    lastResult: BattleResult | null;
  };
}

export type GameAction =
  | { type: 'HYDRATE'; payload: GameState }
  | { type: 'EQUIP_PART'; payload: { buildId: string; slot: PartSlot; partId: string | null } }
  | { type: 'UPGRADE_PART'; payload: { partId: string; cost: number } }
  | { type: 'SET_SQUAD_SLOT'; payload: { index: number; buildId: string | null } }
  | { type: 'SET_FORMATION'; payload: { formationId: FormationId } }
  | { type: 'SET_BATTLE_MODE'; payload: { mode: BattleMode } }
  | { type: 'SELECT_WAVE'; payload: { waveId: string } }
  | { type: 'SET_SETTING'; payload: { key: SettingKey; value: number | boolean | LanguageId } }
  | { type: 'APPLY_BATTLE_RESULT'; payload: BattleResult }
  | { type: 'PURCHASE_UPGRADE'; payload: { trackId: UpgradeTrackId; cost: number } };
