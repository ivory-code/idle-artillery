import { waves } from '../data/waves';
import { GameAction, GameState, StageBestRecord } from '../types/game';

const SURVIVAL_HISTORY_LIMIT = 30;

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'EQUIP_PART': {
      const { buildId, slot, partId } = action.payload;
      const targetBuild = state.builds[buildId];
      if (!targetBuild) return state;

      return {
        ...state,
        builds: {
          ...state.builds,
          [buildId]: {
            ...targetBuild,
            slots: {
              ...targetBuild.slots,
              [slot]: partId,
            },
          },
        },
      };
    }

    case 'UPGRADE_PART': {
      const { partId, cost } = action.payload;
      if (state.player.scrap < cost) return state;

      return {
        ...state,
        player: {
          ...state.player,
          scrap: state.player.scrap - cost,
        },
        collection: {
          ...state.collection,
          partLevels: {
            ...state.collection.partLevels,
            [partId]: (state.collection.partLevels[partId] ?? 0) + 1,
          },
        },
      };
    }

    case 'SET_SQUAD_SLOT': {
      const next = [...state.squad.slots];
      next[action.payload.index] = action.payload.buildId;

      return {
        ...state,
        squad: {
          ...state.squad,
          slots: next,
        },
      };
    }

    case 'SET_FORMATION':
      return {
        ...state,
        squad: {
          ...state.squad,
          formationId: action.payload.formationId,
        },
      };

    case 'SET_BATTLE_MODE':
      return {
        ...state,
        battle: {
          ...state.battle,
          selectedMode: action.payload.mode,
        },
      };

    case 'SELECT_WAVE':
      return {
        ...state,
        battle: {
          ...state.battle,
          selectedWaveId: action.payload.waveId,
        },
      };

    case 'SET_SETTING': {
      const { key, value } = action.payload;

      if ((key === 'musicVolume' || key === 'sfxVolume') && typeof value === 'number') {
        return {
          ...state,
          settings: {
            ...state.settings,
            [key]: Math.max(0, Math.min(1, Number(value.toFixed(2)))),
          },
        };
      }

      if ((key === 'vibration' || key === 'lowFxMode') && typeof value === 'boolean') {
        return {
          ...state,
          settings: {
            ...state.settings,
            [key]: value,
          },
        };
      }

      if (key === 'language' && (value === 'en' || value === 'ko')) {
        return {
          ...state,
          settings: {
            ...state.settings,
            language: value,
          },
        };
      }

      return state;
    }

    case 'APPLY_BATTLE_RESULT':
      {
      const result = action.payload;
      const nextPlayer = {
        scrap: state.player.scrap + result.rewards.scrap,
        coreBits: state.player.coreBits + result.rewards.coreBits,
      };

      let nextProgression = state.progression;
      let nextSurvival = state.survival;

      if (result.mode === 'stage') {
        const waveId = result.waveId;
        const stageIndex = waves.findIndex((item) => item.id === waveId);
        const prevBest: StageBestRecord = state.progression.stageBest[waveId] || {
          bestTimeSec: null,
          bestScore: 0,
          bestHpLeft: 0,
          clearCount: 0,
        };

        const nextBest: StageBestRecord = {
          bestTimeSec: result.victory
            ? prevBest.bestTimeSec === null
              ? result.durationSec
              : Math.min(prevBest.bestTimeSec, result.durationSec)
            : prevBest.bestTimeSec,
          bestScore: Math.max(prevBest.bestScore, result.score),
          bestHpLeft: Math.max(prevBest.bestHpLeft, result.squadHpLeft),
          clearCount: prevBest.clearCount + (result.victory ? 1 : 0),
        };

        const unlockedWaveSet = new Set(state.progression.unlockedWaveIds);
        unlockedWaveSet.add(waveId);

        let highestStageCleared = state.progression.highestStageCleared;
        if (result.victory && stageIndex >= 0) {
          highestStageCleared = Math.max(highestStageCleared, stageIndex + 1);
          const nextWave = waves[stageIndex + 1];
          if (nextWave) {
            unlockedWaveSet.add(nextWave.id);
          }
        }

        nextProgression = {
          ...state.progression,
          highestStageCleared,
          unlockedWaveIds: waves.filter((item) => unlockedWaveSet.has(item.id)).map((item) => item.id),
          stageBest: {
            ...state.progression.stageBest,
            [waveId]: nextBest,
          },
        };
      }

      if (result.mode === 'survival') {
        const runRecord = {
          id: `${result.mode}_${Date.now()}`,
          playedAt: Date.now(),
          durationSec: result.durationSec,
          score: result.score,
          enemiesDefeated: result.enemiesDefeated,
          victory: result.victory,
          rewards: result.rewards,
          milestones: result.milestones,
        };

        nextSurvival = {
          bestTimeSec: Math.max(state.survival.bestTimeSec, result.durationSec),
          bestScore: Math.max(state.survival.bestScore, result.score),
          totalRuns: state.survival.totalRuns + 1,
          runs: [runRecord, ...state.survival.runs].slice(0, SURVIVAL_HISTORY_LIMIT),
        };
      }

      return {
        ...state,
        player: nextPlayer,
        progression: nextProgression,
        survival: nextSurvival,
        battle: {
          ...state.battle,
          lastResult: result,
        },
      };
      }

    case 'PURCHASE_UPGRADE': {
      const { trackId, cost } = action.payload;
      if (state.player.scrap < cost) return state;

      return {
        ...state,
        player: {
          ...state.player,
          scrap: state.player.scrap - cost,
        },
        upgrades: {
          ...state.upgrades,
          levels: {
            ...state.upgrades.levels,
            [trackId]: (state.upgrades.levels[trackId] || 0) + 1,
          },
        },
      };
    }

    default:
      return state;
  }
}
