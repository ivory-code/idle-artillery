import { FormationId, UnitStats } from '../types/game';

interface FormationBonus {
  attackPct: number;
  hpPct: number;
}

function getFormationBonus(formationId: FormationId): FormationBonus {
  if (formationId === 'triangle') {
    return { attackPct: 0.08, hpPct: -0.02 };
  }

  if (formationId === 'focus') {
    return { attackPct: 0.12, hpPct: -0.06 };
  }

  return { attackPct: 0.04, hpPct: 0.04 };
}

export function applyFormationBonus(statsList: UnitStats[], formationId: FormationId): UnitStats[] {
  const bonus = getFormationBonus(formationId);

  return statsList.map((stats) => ({
    ...stats,
    attack: Math.round(stats.attack * (1 + bonus.attackPct)),
    hp: Math.max(1, Math.round(stats.hp * (1 + bonus.hpPct))),
  }));
}
