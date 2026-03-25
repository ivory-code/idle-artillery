import { enemyMap } from '../data/enemies';
import { BattleMode, BattleResult, RoleIdentity, UnitStats, WaveData } from '../types/game';

export const BATTLE_TICK_SEC = 0.2;
export const STAGE_MAX_SEC = 180;
export const SURVIVAL_DURATION_SEC = 300;

const SPIKE_INTERVAL_SEC = 60;
const SPIKE_START_OFFSET_SEC = 45;
const SPIKE_DURATION_SEC = 10;
const ELITE_INTERVAL_SEC = 60;
const SURVIVAL_BOSS_TIMES_SEC = [150, 270];

interface CombatUnitInput {
  id: string;
  name: string;
  roleIdentity: RoleIdentity;
  stats: UnitStats;
}

interface RuntimeActor {
  id: string;
  name: string;
  side: 'player' | 'enemy';
  role: RoleIdentity | null;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  fireRate: number;
  crit: number;
  attackCooldownSec: number;
  skillCooldownSec: number;
  empoweredShots: number;
  isElite: boolean;
  isBoss: boolean;
}

interface TeamBuff {
  type: 'attack' | 'fireRate' | 'damageReduction';
  value: number;
  expiresAt: number;
}

interface Counters {
  ticks: number;
  playerShots: number;
  enemyShots: number;
  crits: number;
  skillsTriggered: number;
  enemiesDefeated: number;
  spikesCleared: number;
  elitesSpawned: number;
  bossesSpawned: number;
  elitesDefeated: number;
  bossesDefeated: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getMitigation(defense: number): number {
  return 100 / (100 + defense * 8);
}

function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function roleAttackMultiplier(role: RoleIdentity): number {
  if (role === 'Bulwark') return 0.85;
  if (role === 'Support') return 0.78;
  if (role === 'Sharpshot') return 1.12;
  return 1;
}

function roleFireRateBonus(role: RoleIdentity): number {
  if (role === 'Barrage') return 0.08;
  if (role === 'Support') return 0.05;
  if (role === 'Bulwark') return -0.05;
  if (role === 'Sharpshot') return -0.08;
  return 0;
}

function roleCritBonus(role: RoleIdentity): number {
  if (role === 'Sharpshot') return 0.1;
  return 0;
}

function roleSkillCooldown(role: RoleIdentity): number {
  if (role === 'Bulwark') return 14;
  if (role === 'Barrage') return 9;
  if (role === 'Sharpshot') return 12;
  return 12;
}

function isSpikeWindow(elapsedSec: number): boolean {
  const secondInMinute = elapsedSec % SPIKE_INTERVAL_SEC;
  return secondInMinute >= SPIKE_START_OFFSET_SEC && secondInMinute < SPIKE_START_OFFSET_SEC + SPIKE_DURATION_SEC;
}

function toRuntimePlayer(unit: CombatUnitInput, rng: () => number): RuntimeActor {
  const baseInterval = 1 / clamp(unit.stats.fireRate, 0.35, 3.2);

  return {
    id: unit.id,
    name: unit.name,
    side: 'player',
    role: unit.roleIdentity,
    hp: unit.stats.hp,
    maxHp: unit.stats.hp,
    attack: unit.stats.attack,
    defense: unit.stats.defense,
    fireRate: unit.stats.fireRate,
    crit: unit.stats.crit,
    attackCooldownSec: baseInterval * (0.4 + rng() * 0.4),
    skillCooldownSec: roleSkillCooldown(unit.roleIdentity),
    empoweredShots: 0,
    isElite: false,
    isBoss: false,
  };
}

function toRuntimeEnemy(params: {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  fireRate: number;
  isElite?: boolean;
  isBoss?: boolean;
  rng: () => number;
}): RuntimeActor {
  const { id, name, hp, attack, defense, fireRate, isElite = false, isBoss = false, rng } = params;
  const baseInterval = 1 / clamp(fireRate, 0.3, 2.6);

  return {
    id,
    name,
    side: 'enemy',
    role: null,
    hp,
    maxHp: hp,
    attack,
    defense,
    fireRate,
    crit: isBoss ? 0.06 : 0.03,
    attackCooldownSec: baseInterval * (0.35 + rng() * 0.5),
    skillCooldownSec: 0,
    empoweredShots: 0,
    isElite,
    isBoss,
  };
}

function roundStat(value: number): number {
  return Math.max(1, Math.round(value));
}

function calcPlayerDamage(params: {
  attacker: RuntimeActor;
  target: RuntimeActor;
  attackBuffPct: number;
  forceCrit: boolean;
  abilityMultiplier?: number;
  rng: () => number;
  counters: Counters;
}): number {
  const { attacker, target, attackBuffPct, forceCrit, abilityMultiplier = 1, rng, counters } = params;
  const role = attacker.role || 'Barrage';
  const attackPower = attacker.attack * (1 + attackBuffPct) * roleAttackMultiplier(role) * abilityMultiplier;
  const critChance = clamp(attacker.crit + roleCritBonus(role) + (forceCrit ? 0.2 : 0), 0, 0.95);
  const isCrit = forceCrit || rng() < critChance;

  if (isCrit) {
    counters.crits += 1;
  }

  const critMult = role === 'Sharpshot' ? 1.8 : 1.5;
  const rawDamage = attackPower * (isCrit ? critMult : 1);
  const reduced = rawDamage * getMitigation(target.defense);
  return roundStat(reduced);
}

function calcEnemyDamage(params: {
  attacker: RuntimeActor;
  target: RuntimeActor;
  teamReductionPct: number;
  rng: () => number;
  counters: Counters;
}): number {
  const { attacker, target, teamReductionPct, rng, counters } = params;
  const isCrit = rng() < attacker.crit;
  if (isCrit) {
    counters.crits += 1;
  }

  const critMult = attacker.isBoss ? 1.7 : 1.45;
  const rawDamage = attacker.attack * (isCrit ? critMult : 1);
  const mitigated = rawDamage * getMitigation(target.defense);
  const reduced = mitigated * (1 - clamp(teamReductionPct, 0, 0.65));
  return roundStat(reduced);
}

function sumBuff(buffs: TeamBuff[], type: TeamBuff['type']): number {
  return buffs.filter((buff) => buff.type === type).reduce((sum, buff) => sum + buff.value, 0);
}

export function runBattleSimulation(params: {
  mode: BattleMode;
  squad: CombatUnitInput[];
  rewardPct: number;
  wave?: WaveData;
  seed?: number;
}): BattleResult {
  const { mode, squad, rewardPct } = params;
  const wave = params.wave;
  const seed = params.seed ?? Math.floor(Date.now() % 1000000);
  const rng = makeRng(seed);
  const enemyTemplates = Object.values(enemyMap);

  const counters: Counters = {
    ticks: 0,
    playerShots: 0,
    enemyShots: 0,
    crits: 0,
    skillsTriggered: 0,
    enemiesDefeated: 0,
    spikesCleared: 0,
    elitesSpawned: 0,
    bossesSpawned: 0,
    elitesDefeated: 0,
    bossesDefeated: 0,
  };

  const players: RuntimeActor[] = squad.map((unit) => toRuntimePlayer(unit, rng));
  const enemies: RuntimeActor[] = [];
  const teamBuffs: TeamBuff[] = [];

  let elapsedSec = 0;
  let spawnTimerSec = 0;
  let nextEliteSec = ELITE_INTERVAL_SEC;
  let nextSpikeEndSec = SPIKE_START_OFFSET_SEC + SPIKE_DURATION_SEC;
  let nextBossIndex = 0;
  let spawnCycle = 0;

  if (mode === 'stage') {
    const stageWave = wave;
    if (stageWave) {
      stageWave.entries.forEach((entry) => {
        const template = enemyMap[entry.enemyId];
        if (!template) return;

        for (let i = 0; i < entry.count; i += 1) {
          const scale = 0.94 + rng() * 0.12;
          enemies.push(
            toRuntimeEnemy({
              id: `${template.id}_${i}_${Math.floor(rng() * 9999)}`,
              name: template.name,
              hp: roundStat(template.stats.hp * scale),
              attack: roundStat(template.stats.attack * scale),
              defense: roundStat(template.stats.defense * scale),
              fireRate: Number((template.stats.fireRate * (0.92 + rng() * 0.1)).toFixed(2)),
              rng,
            })
          );
        }
      });
    }
  }

  function alivePlayers(): RuntimeActor[] {
    return players.filter((actor) => actor.hp > 0);
  }

  function aliveEnemies(): RuntimeActor[] {
    return enemies.filter((actor) => actor.hp > 0);
  }

  function removeExpiredBuffs() {
    const active = teamBuffs.filter((buff) => buff.expiresAt > elapsedSec);
    teamBuffs.length = 0;
    teamBuffs.push(...active);
  }

  function markKill(target: RuntimeActor) {
    if (target.hp > 0) return;
    counters.enemiesDefeated += 1;
    if (target.isElite) counters.elitesDefeated += 1;
    if (target.isBoss) counters.bossesDefeated += 1;
  }

  function hitTarget(target: RuntimeActor, damage: number) {
    target.hp = Math.max(0, target.hp - damage);
    if (target.side === 'enemy') {
      markKill(target);
    }
  }

  function getBulwarkPassiveReduction(): number {
    return alivePlayers().some((unit) => unit.role === 'Bulwark') ? 0.08 : 0;
  }

  function selectEnemyTarget(): RuntimeActor | null {
    const target = aliveEnemies().sort((a, b) => a.hp - b.hp || a.attack - b.attack)[0];
    return target || null;
  }

  function selectEnemySecondaryTarget(excludeId: string): RuntimeActor | null {
    const target = aliveEnemies().filter((enemy) => enemy.id !== excludeId).sort((a, b) => a.hp - b.hp || a.attack - b.attack)[0];
    return target || null;
  }

  function selectPlayerTarget(): RuntimeActor | null {
    const target = alivePlayers().sort((a, b) => {
      const scoreA = a.attack * 0.7 + a.maxHp * 0.2 + a.defense * 2;
      const scoreB = b.attack * 0.7 + b.maxHp * 0.2 + b.defense * 2;
      return scoreB - scoreA;
    })[0];
    return target || null;
  }

  function spawnSurvivalPack() {
    const inSpike = isSpikeWindow(elapsedSec);
    const rampTier = Math.floor(elapsedSec / 30);
    const baseScale = 1 + rampTier * 0.12 + (inSpike ? 0.18 : 0);
    const packSize = 2 + Math.floor(elapsedSec / 75) + (inSpike ? 2 : 0);

    for (let i = 0; i < packSize; i += 1) {
      const template = enemyTemplates[spawnCycle % enemyTemplates.length];
      spawnCycle += 1;
      const jitter = 0.93 + rng() * 0.14;
      const scale = baseScale * jitter;
      enemies.push(
        toRuntimeEnemy({
          id: `sv_${template.id}_${counters.ticks}_${i}`,
          name: template.name,
          hp: roundStat(template.stats.hp * scale),
          attack: roundStat(template.stats.attack * scale),
          defense: roundStat(template.stats.defense * (1 + (baseScale - 1) * 0.75)),
          fireRate: Number((template.stats.fireRate * (1 + (baseScale - 1) * 0.2)).toFixed(2)),
          rng,
        })
      );
    }
  }

  function spawnElite() {
    const template = enemyTemplates[(spawnCycle + 1) % enemyTemplates.length];
    const rampTier = Math.floor(elapsedSec / 30);
    const scale = 1.65 + rampTier * 0.14;

    enemies.push(
      toRuntimeEnemy({
        id: `elite_${template.id}_${Math.floor(elapsedSec)}`,
        name: `${template.name} Elite`,
        hp: roundStat(template.stats.hp * scale * 1.7),
        attack: roundStat(template.stats.attack * scale * 1.35),
        defense: roundStat(template.stats.defense * scale * 1.25),
        fireRate: Number((template.stats.fireRate * 1.1).toFixed(2)),
        isElite: true,
        rng,
      })
    );

    counters.elitesSpawned += 1;
  }

  function spawnBoss() {
    const template = enemyMap.enemy_hush || enemyTemplates[0];
    const rampTier = Math.floor(elapsedSec / 30);
    const scale = 2.8 + rampTier * 0.18;

    enemies.push(
      toRuntimeEnemy({
        id: `boss_${Math.floor(elapsedSec)}`,
        name: `${template.name} Overlord`,
        hp: roundStat(template.stats.hp * scale * 3.5),
        attack: roundStat(template.stats.attack * scale * 1.9),
        defense: roundStat(template.stats.defense * scale * 1.6),
        fireRate: Number((template.stats.fireRate * 0.95).toFixed(2)),
        isBoss: true,
        rng,
      })
    );

    counters.bossesSpawned += 1;
  }

  while (true) {
    const livePlayers = alivePlayers();
    const liveEnemies = aliveEnemies();

    if (livePlayers.length === 0) {
      break;
    }

    if (mode === 'stage') {
      if (liveEnemies.length === 0) {
        break;
      }
      if (elapsedSec >= STAGE_MAX_SEC) {
        break;
      }
    }

    if (mode === 'survival') {
      if (elapsedSec >= SURVIVAL_DURATION_SEC) {
        break;
      }

      if (spawnTimerSec <= 0) {
        spawnSurvivalPack();
        const speedUp = Math.floor(elapsedSec / 45) * 0.2;
        const baseInterval = clamp(3 - speedUp, 0.95, 3);
        spawnTimerSec = isSpikeWindow(elapsedSec) ? baseInterval * 0.58 : baseInterval;
      } else {
        spawnTimerSec -= BATTLE_TICK_SEC;
      }

      if (elapsedSec >= nextEliteSec) {
        spawnElite();
        nextEliteSec += ELITE_INTERVAL_SEC;
      }

      if (nextBossIndex < SURVIVAL_BOSS_TIMES_SEC.length && elapsedSec >= SURVIVAL_BOSS_TIMES_SEC[nextBossIndex]) {
        spawnBoss();
        nextBossIndex += 1;
      }

      if (elapsedSec >= nextSpikeEndSec) {
        if (livePlayers.length > 0) {
          counters.spikesCleared += 1;
        }
        nextSpikeEndSec += SPIKE_INTERVAL_SEC;
      }
    }

    removeExpiredBuffs();
    const attackBuffPct = sumBuff(teamBuffs, 'attack');
    const fireRateBuffPct = sumBuff(teamBuffs, 'fireRate');
    const teamReductionPct = sumBuff(teamBuffs, 'damageReduction') + getBulwarkPassiveReduction();

    livePlayers.forEach((player) => {
      const role = player.role || 'Barrage';
      player.skillCooldownSec -= BATTLE_TICK_SEC;

      if (player.skillCooldownSec <= 0) {
        counters.skillsTriggered += 1;
        if (role === 'Support') {
          teamBuffs.push({ type: 'attack', value: 0.12, expiresAt: elapsedSec + 6 });
          teamBuffs.push({ type: 'fireRate', value: 0.12, expiresAt: elapsedSec + 6 });
        } else if (role === 'Bulwark') {
          teamBuffs.push({ type: 'damageReduction', value: 0.18, expiresAt: elapsedSec + 4 });
        } else if (role === 'Sharpshot') {
          player.empoweredShots += 1;
        } else if (role === 'Barrage') {
          const skillTargets = aliveEnemies().sort((a, b) => a.hp - b.hp).slice(0, 3);
          skillTargets.forEach((target) => {
            const damage = calcPlayerDamage({
              attacker: player,
              target,
              attackBuffPct,
              forceCrit: false,
              abilityMultiplier: 0.75,
              rng,
              counters,
            });
            hitTarget(target, damage);
          });
        }

        player.skillCooldownSec += roleSkillCooldown(role);
      }
    });

    alivePlayers().forEach((player) => {
      const role = player.role || 'Barrage';
      const fireRate = clamp(player.fireRate * (1 + fireRateBuffPct + roleFireRateBonus(role)), 0.35, 3.5);
      const interval = 1 / fireRate;
      player.attackCooldownSec -= BATTLE_TICK_SEC;

      while (player.attackCooldownSec <= 0 && player.hp > 0) {
        const target = selectEnemyTarget();
        if (!target) break;

        const empowered = player.empoweredShots > 0;
        const damage = calcPlayerDamage({
          attacker: player,
          target,
          attackBuffPct,
          forceCrit: empowered,
          rng,
          counters,
        });

        hitTarget(target, damage);
        counters.playerShots += 1;

        if (role === 'Barrage') {
          const splashTarget = selectEnemySecondaryTarget(target.id);
          if (splashTarget) {
            hitTarget(splashTarget, Math.max(1, Math.round(damage * 0.35)));
          }
        }

        if (empowered) {
          player.empoweredShots -= 1;
        }

        player.attackCooldownSec += interval;
      }
    });

    aliveEnemies().forEach((enemy) => {
      const interval = 1 / clamp(enemy.fireRate, 0.3, 2.6);
      enemy.attackCooldownSec -= BATTLE_TICK_SEC;

      while (enemy.attackCooldownSec <= 0 && enemy.hp > 0) {
        const target = selectPlayerTarget();
        if (!target) break;

        const damage = calcEnemyDamage({
          attacker: enemy,
          target,
          teamReductionPct,
          rng,
          counters,
        });

        hitTarget(target, damage);
        counters.enemyShots += 1;
        enemy.attackCooldownSec += interval;
      }
    });

    elapsedSec += BATTLE_TICK_SEC;
    counters.ticks += 1;
  }

  const finalPlayers = alivePlayers();
  const finalEnemies = aliveEnemies();
  const durationSec = Math.max(1, Math.round(elapsedSec));
  const fiveMinuteClear = mode === 'survival' && durationSec >= SURVIVAL_DURATION_SEC && finalPlayers.length > 0;
  const victory = mode === 'stage' ? finalPlayers.length > 0 && finalEnemies.length === 0 : fiveMinuteClear;

  const squadHpLeft = Math.round(finalPlayers.reduce((sum, actor) => sum + actor.hp, 0));
  const enemiesDefeated = counters.enemiesDefeated;

  const stageRewards = wave?.rewards || { scrap: 60, coreBits: 1 };
  const stageScrapBase = stageRewards.scrap + enemiesDefeated * 2;
  const stageScrap = Math.round(stageScrapBase * (1 + rewardPct) * (victory ? 1 : 0.6));
  const stageCoreBits = victory ? stageRewards.coreBits : 0;

  const survivalBase = 60 + Math.floor(durationSec * 0.8) + enemiesDefeated * 3;
  const survivalBonuses = counters.spikesCleared * 20 + counters.elitesDefeated * 35 + counters.bossesDefeated * 95;
  const survivalScrap = Math.round((survivalBase + survivalBonuses) * (1 + rewardPct));
  const survivalCoreBits = Math.max(0, Math.floor(durationSec / 60) - 1) + counters.bossesDefeated + (victory ? 2 : 0);

  const stageScore = enemiesDefeated * 30 + squadHpLeft + (victory ? 250 : 0);
  const survivalScore = durationSec * 2 + enemiesDefeated * 6 + counters.elitesDefeated * 30 + counters.bossesDefeated * 120 + (victory ? 200 : 0);

  return {
    mode,
    victory,
    waveId: mode === 'stage' ? wave?.id || 'wave_unknown' : 'survival_5m',
    waveName: mode === 'stage' ? wave?.stageName || 'Unknown Stage' : 'Pulse Storm (5m Survival)',
    enemiesDefeated,
    durationSec,
    squadHpLeft,
    score: mode === 'stage' ? stageScore : survivalScore,
    milestones: {
      spikesCleared: mode === 'survival' ? counters.spikesCleared : 0,
      elitesDefeated: mode === 'survival' ? counters.elitesDefeated : 0,
      bossesDefeated: mode === 'survival' ? counters.bossesDefeated : 0,
      fiveMinuteClear,
    },
    debug: {
      seed,
      ticks: counters.ticks,
      playerShots: counters.playerShots,
      enemyShots: counters.enemyShots,
      crits: counters.crits,
      skillsTriggered: counters.skillsTriggered,
      elitesSpawned: counters.elitesSpawned,
      bossesSpawned: counters.bossesSpawned,
    },
    rewards: {
      scrap: mode === 'stage' ? stageScrap : survivalScrap,
      coreBits: mode === 'stage' ? stageCoreBits : survivalCoreBits,
    },
  };
}
