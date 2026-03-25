import AsyncStorage from '@react-native-async-storage/async-storage';

import { GameState } from '../types/game';

const STORAGE_KEY = '@tiny_barrage_mvp_save';
const BACKUP_KEY = '@tiny_barrage_mvp_save_backup';
const CURRENT_SAVE_VERSION = 2;

type RawSave = {
  meta?: Partial<GameState['meta']>;
  player?: Partial<GameState['player']>;
  collection?: Partial<GameState['collection']>;
  builds?: GameState['builds'];
  squad?: Partial<GameState['squad']>;
  upgrades?: Partial<GameState['upgrades']>;
  progression?: Partial<GameState['progression']>;
  survival?: Partial<GameState['survival']>;
  settings?: Partial<GameState['settings']>;
  battle?: Partial<GameState['battle']>;
  [key: string]: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function migrateV1ToV2(raw: RawSave, fallbackState: GameState): RawSave {
  const meta = raw.meta || {};
  return {
    ...raw,
    progression: raw.progression || fallbackState.progression,
    survival: raw.survival || fallbackState.survival,
    settings: raw.settings || fallbackState.settings,
    battle: {
      ...fallbackState.battle,
      ...raw.battle,
      selectedMode: raw.battle?.selectedMode || 'stage',
    },
    meta: {
      ...meta,
      saveVersion: 2,
      createdAt: typeof meta.createdAt === 'number' ? meta.createdAt : Date.now(),
      appVersion: typeof meta.appVersion === 'string' ? meta.appVersion : fallbackState.meta.appVersion,
    },
  };
}

function migrateToCurrent(raw: RawSave, fallbackState: GameState): RawSave {
  const version = typeof raw.meta?.saveVersion === 'number' ? raw.meta.saveVersion : 1;

  if (version < 2) {
    return migrateV1ToV2(raw, fallbackState);
  }

  return raw;
}

function normalizeSave(raw: unknown, fallbackState: GameState): GameState {
  if (!isRecord(raw)) {
    return { ...fallbackState, meta: { ...fallbackState.meta, hydrated: true } };
  }

  const migrated = migrateToCurrent(raw as RawSave, fallbackState);

  const safeUnlockedWaveIds =
    Array.isArray(migrated.progression?.unlockedWaveIds) && migrated.progression?.unlockedWaveIds.length
      ? migrated.progression.unlockedWaveIds
      : fallbackState.progression.unlockedWaveIds;

  const safeRuns =
    Array.isArray(migrated.survival?.runs) && migrated.survival?.runs.length
      ? migrated.survival.runs.filter((run) => isRecord(run)).slice(0, 30)
      : [];

  return {
    ...fallbackState,
    ...migrated,
    player: {
      ...fallbackState.player,
      ...migrated.player,
    },
    collection: {
      ...fallbackState.collection,
      ...migrated.collection,
      partLevels: {
        ...fallbackState.collection.partLevels,
        ...migrated.collection?.partLevels,
      },
    },
    squad: {
      ...fallbackState.squad,
      ...migrated.squad,
    },
    upgrades: {
      ...fallbackState.upgrades,
      ...migrated.upgrades,
      levels: {
        ...fallbackState.upgrades.levels,
        ...migrated.upgrades?.levels,
      },
    },
    progression: {
      ...fallbackState.progression,
      ...migrated.progression,
      unlockedWaveIds: safeUnlockedWaveIds,
      stageBest: {
        ...fallbackState.progression.stageBest,
        ...migrated.progression?.stageBest,
      },
    },
    survival: {
      ...fallbackState.survival,
      ...migrated.survival,
      runs: safeRuns,
    },
    settings: {
      ...fallbackState.settings,
      ...migrated.settings,
    },
    battle: {
      ...fallbackState.battle,
      ...migrated.battle,
    },
    meta: {
      ...fallbackState.meta,
      ...migrated.meta,
      saveVersion: CURRENT_SAVE_VERSION,
      hydrated: true,
      createdAt: typeof migrated.meta?.createdAt === 'number' ? migrated.meta.createdAt : fallbackState.meta.createdAt,
      appVersion: typeof migrated.meta?.appVersion === 'string' ? migrated.meta.appVersion : fallbackState.meta.appVersion,
    },
  };
}

export async function loadSave(fallbackState: GameState): Promise<GameState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...fallbackState, meta: { ...fallbackState.meta, hydrated: true } };
    }

    try {
      return normalizeSave(JSON.parse(raw), fallbackState);
    } catch {
      const backupRaw = await AsyncStorage.getItem(BACKUP_KEY);
      if (!backupRaw) {
        return { ...fallbackState, meta: { ...fallbackState.meta, hydrated: true } };
      }

      try {
        return normalizeSave(JSON.parse(backupRaw), fallbackState);
      } catch {
        return { ...fallbackState, meta: { ...fallbackState.meta, hydrated: true } };
      }
    }
  } catch {
    return { ...fallbackState, meta: { ...fallbackState.meta, hydrated: true } };
  }
}

export async function saveState(state: GameState): Promise<void> {
  try {
    const previous = await AsyncStorage.getItem(STORAGE_KEY);
    if (previous) {
      await AsyncStorage.setItem(BACKUP_KEY, previous);
    }

    const payload: GameState = {
      ...state,
      meta: {
        ...state.meta,
        saveVersion: CURRENT_SAVE_VERSION,
        hydrated: false,
        lastSavedAt: Date.now(),
      },
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Keep gameplay running even if save write fails.
  }
}
