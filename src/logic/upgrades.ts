import { upgradeTracks } from '../data/upgrades';
import { UpgradeTrackId } from '../types/game';

export interface GlobalUpgradeEffects {
  fireRatePct: number;
  hpPct: number;
  rewardPct: number;
}

export function getUpgradeCost(trackId: UpgradeTrackId, level: number): number {
  const track = upgradeTracks.find((item) => item.id === trackId);
  if (!track) return 9999;
  return Math.round(track.baseCost * Math.pow(track.costStep, level));
}

export function getUpgradeEffects(levels: Record<UpgradeTrackId, number>): GlobalUpgradeEffects {
  const effects: GlobalUpgradeEffects = { fireRatePct: 0, hpPct: 0, rewardPct: 0 };

  upgradeTracks.forEach((track) => {
    const level = levels[track.id] || 0;
    effects[track.stat] += level * track.stepValue;
  });

  return effects;
}

export function getPartUpgradeCost(currentLevel: number): number {
  return Math.round(35 * Math.pow(1.35, currentLevel));
}
