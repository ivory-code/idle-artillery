import React, { PropsWithChildren, createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import { loadSave, saveState } from '../persistence/saveLoad';
import { GameAction, GameState } from '../types/game';
import { gameReducer } from './gameReducer';
import { initialState } from './initialState';

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    async function hydrate() {
      const loaded = await loadSave(initialState);
      dispatch({ type: 'HYDRATE', payload: loaded });
    }

    void hydrate();
  }, []);

  useEffect(() => {
    if (!state.meta.hydrated) return;
    void saveState(state);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
