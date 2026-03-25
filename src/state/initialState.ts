import { mockGameData } from '../data/mockGameData';
import { GameState } from '../types/game';

const unitIds = mockGameData.units.map((item) => item.id);
const partIds = mockGameData.parts.map((item) => item.id);

const partLevels = Object.fromEntries(partIds.map((partId) => [partId, 0]));
partLevels.part_turret_rail = 1;
partLevels.part_chassis_tin = 2;

export const initialState: GameState = {
  meta: {
    saveVersion: 2,
    hydrated: false,
    lastSavedAt: null,
    createdAt: Date.now(),
    appVersion: '1.0.0',
  },
  player: {
    scrap: 420,
    coreBits: 6,
  },
  collection: {
    ownedUnitIds: unitIds,
    ownedPartIds: partIds,
    partLevels,
  },
  builds: {
    build_01: {
      id: 'build_01',
      unitId: 'unit_sprout',
      slots: {
        chassis: 'part_chassis_twig',
        turret: 'part_turret_petal',
        core: 'part_core_mint',
        ammo: 'part_ammo_spark',
      },
    },
    build_02: {
      id: 'build_02',
      unitId: 'unit_bubble',
      slots: {
        chassis: 'part_chassis_tin',
        turret: 'part_turret_petal',
        core: 'part_core_mint',
        ammo: 'part_ammo_spark',
      },
    },
    build_03: {
      id: 'build_03',
      unitId: 'unit_pepper',
      slots: {
        chassis: null,
        turret: null,
        core: null,
        ammo: null,
      },
    },
  },
  squad: {
    slots: ['build_01', 'build_02', null],
    formationId: 'line',
  },
  upgrades: {
    levels: {
      reload_drive: 0,
      hull_plating: 0,
      salvage_magnet: 0,
    },
  },
  progression: {
    highestStageCleared: 0,
    unlockedWaveIds: ['wave_stage_1'],
    stageBest: {},
  },
  survival: {
    bestTimeSec: 0,
    bestScore: 0,
    totalRuns: 0,
    runs: [],
  },
  settings: {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    vibration: true,
    language: 'en',
    lowFxMode: false,
  },
  battle: {
    selectedWaveId: 'wave_stage_1',
    selectedMode: 'stage',
    lastResult: null,
  },
};
