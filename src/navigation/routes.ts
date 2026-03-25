import { BattleResult } from '../types/game';

export type RootStackParamList = {
  Home: undefined;
  Hangar: undefined;
  Assembly: undefined;
  Squad: undefined;
  Battle: undefined;
  Upgrade: undefined;
  Result: { result?: BattleResult } | undefined;
};
