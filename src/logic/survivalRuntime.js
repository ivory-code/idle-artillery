const MATCH_DURATION_SEC = 300;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSpawnInterval(elapsedSec, wave) {
  const base = Math.max(0.65, 2.6 - wave * 0.14);
  const secondInMinute = elapsedSec % 60;
  const isSpike = secondInMinute >= 45 && secondInMinute < 55;
  return isSpike ? Math.max(0.45, base * 0.58) : base;
}

function inferTemplateArchetype(role, modules) {
  const key = `${modules.weapon} ${modules.body} ${modules.mobility} ${modules.core}`.toLowerCase();

  if (key.includes('mint') || key.includes('ice') || key.includes('frost') || key.includes('bubble')) return 'ice';
  if (key.includes('volt') || key.includes('rail') || key.includes('spark') || role === 'Sharpshot') return 'lightning';
  if (key.includes('burn') || key.includes('flame') || key.includes('fire') || key.includes('pepper') || role === 'Barrage') return 'fire';
  if (role === 'Support' || key.includes('drone') || key.includes('utility')) return 'support';
  return 'artillery';
}

function createEnemy(id, wave) {
  const hpScale = 1 + wave * 0.2;
  const atkScale = 1 + wave * 0.16;
  const archetypeCycle = ['fire', 'lightning', 'artillery', 'ice'];
  const archetype = archetypeCycle[wave % archetypeCycle.length];
  return {
    id,
    team: 'enemy',
    archetype,
    x: 0.96,
    hp: Math.round(70 * hpScale),
    maxHp: Math.round(70 * hpScale),
    attack: Math.round(13 * atkScale),
    speed: 0.075 + wave * 0.002,
    range: 0.07,
    fireRate: 0.9 + wave * 0.02,
    cooldownSec: 0.7,
    flashSec: 0,
    hitSec: 0,
    spawnSec: 0.45,
  };
}

function pickNearestTarget(source, enemies) {
  if (!enemies.length) return null;
  const sorted = [...enemies].sort((a, b) => Math.abs(a.x - source.x) - Math.abs(b.x - source.x));
  return sorted[0];
}

function applyEntityActions(state, dt) {
  const allies = state.entities.filter((entity) => entity.team === 'ally' && entity.hp > 0);
  const enemies = state.entities.filter((entity) => entity.team === 'enemy' && entity.hp > 0);

  for (let i = 0; i < state.entities.length; i += 1) {
    const entity = state.entities[i];
    if (entity.hp <= 0) continue;

    entity.cooldownSec = Math.max(0, entity.cooldownSec - dt);

    if (entity.team === 'ally') {
      const target = pickNearestTarget(entity, enemies.filter((item) => item.hp > 0));
      if (!target) {
        entity.x = clamp(entity.x + entity.speed * dt, 0.1, 0.86);
        continue;
      }

      const dist = Math.abs(target.x - entity.x);
      if (dist <= entity.range && entity.cooldownSec <= 0) {
        target.hp -= entity.attack;
        target.hitSec = 0.16;
        entity.flashSec = 0.1;
        state.shotTraces.push({
          id: `shot_${state.nextFxId}`,
          fromX: entity.x,
          toX: target.x,
          y: 100,
          team: 'ally',
          ttlSec: 0.12,
        });
        state.nextFxId += 1;
        entity.cooldownSec = 1 / entity.fireRate;
      } else {
        entity.x = clamp(entity.x + entity.speed * dt, 0.1, 0.86);
      }
      continue;
    }

    const target = pickNearestTarget(entity, allies.filter((item) => item.hp > 0));
    if (target) {
      const dist = Math.abs(target.x - entity.x);
      if (dist <= entity.range && entity.cooldownSec <= 0) {
        target.hp -= entity.attack;
        target.hitSec = 0.18;
        entity.flashSec = 0.09;
        state.shotTraces.push({
          id: `shot_${state.nextFxId}`,
          fromX: entity.x,
          toX: target.x,
          y: 103,
          team: 'enemy',
          ttlSec: 0.11,
        });
        state.nextFxId += 1;
        entity.cooldownSec = 1 / entity.fireRate;
      } else {
        entity.x = clamp(entity.x - entity.speed * dt, 0.08, 0.97);
      }
    } else {
      entity.x = clamp(entity.x - entity.speed * dt, 0.08, 0.97);
    }

    if (entity.x <= 0.1 && entity.cooldownSec <= 0) {
      state.baseHp = Math.max(0, state.baseHp - entity.attack);
      state.baseFlashSec = 0.2;
      entity.cooldownSec = 1 / entity.fireRate;
    }
  }
}

export function createDeployTemplates(units, builds, partMap) {
  return units.map((unit, index) => {
    const build = builds[unit.id];
    const modules = build
      ? {
          weapon: partMap[build.slots.turret]?.name || 'Stock Barrel',
          body: partMap[build.slots.chassis]?.name || 'Stock Chassis',
          mobility: partMap[build.slots.ammo]?.name || 'Stock Lower',
          core: partMap[build.slots.core]?.name || 'Stock Core',
        }
      : {
          weapon: 'Stock Barrel',
          body: 'Stock Chassis',
          mobility: 'Stock Lower',
          core: 'Stock Core',
        };

    const role = unit.roleIdentity;
    const archetype = inferTemplateArchetype(role, modules);
    const cost = Math.max(16, Math.round((unit.stats.attack * 0.6 + unit.stats.hp * 0.12 + unit.stats.defense * 1.8) / 3.5));
    const moveBonus = role === 'Barrage' ? 0.02 : role === 'Bulwark' ? -0.012 : 0.005;
    const rangeBonus = role === 'Sharpshot' ? 0.035 : role === 'Support' ? -0.01 : 0;

    return {
      id: unit.id,
      name: unit.name,
      role,
      archetype,
      cost,
      hp: Math.round(unit.stats.hp * 0.62),
      attack: Math.round(unit.stats.attack * 0.85),
      speed: Math.max(0.04, 0.08 + moveBonus),
      range: Math.max(0.05, 0.09 + rangeBonus),
      fireRate: Math.max(0.45, unit.stats.fireRate * 0.9),
      deployCooldownSec: 1.8 + index * 0.3,
      modules,
    };
  });
}

export function createSurvivalState(templates) {
  const cooldowns = {};
  templates.forEach((template) => {
    cooldowns[template.id] = 0;
  });

  return {
    mode: 'survival',
    durationSec: MATCH_DURATION_SEC,
    elapsedSec: 0,
    ended: false,
    victory: false,
    wave: 1,
    baseHp: 1600,
    baseMaxHp: 1600,
    watt: 42,
    wattMax: 120,
    wattRegen: 7,
    spawnTimerSec: 1.2,
    spawnPulseSec: 0,
    baseFlashSec: 0,
    entities: [],
    shotTraces: [],
    templates,
    deployCooldowns: cooldowns,
    stats: {
      kills: 0,
      deployed: 0,
      spikeMoments: 0,
    },
    nextEntityId: 1,
    nextFxId: 1,
  };
}

export function deployUnit(state, templateId) {
  if (state.ended) return state;
  const template = state.templates.find((item) => item.id === templateId);
  if (!template) return state;
  if (state.watt < template.cost) return state;
  if ((state.deployCooldowns[templateId] || 0) > 0) return state;

  const next = {
    ...state,
    watt: state.watt - template.cost,
    entities: [...state.entities],
    deployCooldowns: { ...state.deployCooldowns, [templateId]: template.deployCooldownSec },
    stats: { ...state.stats, deployed: state.stats.deployed + 1 },
    nextEntityId: state.nextEntityId + 1,
  };

  next.entities.push({
    id: `ally_${next.nextEntityId}`,
    team: 'ally',
    archetype: template.archetype || 'artillery',
    x: 0.14,
    hp: template.hp,
    maxHp: template.hp,
    attack: template.attack,
    speed: template.speed,
    range: template.range,
    fireRate: template.fireRate,
    cooldownSec: 0.4,
    flashSec: 0,
    hitSec: 0,
    spawnSec: 0.4,
  });

  return next;
}

export function stepSurvivalState(state, dt) {
  if (state.ended) return state;

  const next = {
    ...state,
    elapsedSec: state.elapsedSec + dt,
    watt: clamp(state.watt + state.wattRegen * dt, 0, state.wattMax),
    deployCooldowns: { ...state.deployCooldowns },
    entities: state.entities.map((entity) => ({
      ...entity,
      flashSec: Math.max(0, (entity.flashSec || 0) - dt),
      hitSec: Math.max(0, (entity.hitSec || 0) - dt),
      spawnSec: Math.max(0, (entity.spawnSec || 0) - dt),
    })),
    shotTraces: (state.shotTraces || [])
      .map((trace) => ({ ...trace, ttlSec: trace.ttlSec - dt }))
      .filter((trace) => trace.ttlSec > 0),
    baseFlashSec: Math.max(0, (state.baseFlashSec || 0) - dt),
    spawnPulseSec: Math.max(0, (state.spawnPulseSec || 0) - dt),
    stats: { ...state.stats },
  };
  next.nextFxId = state.nextFxId || 1;

  next.wave = Math.floor(next.elapsedSec / 30) + 1;
  if (next.elapsedSec >= next.durationSec) {
    next.ended = true;
    next.victory = next.baseHp > 0;
    return next;
  }

  Object.keys(next.deployCooldowns).forEach((key) => {
    next.deployCooldowns[key] = Math.max(0, next.deployCooldowns[key] - dt);
  });

  next.spawnTimerSec -= dt;
  if (next.spawnTimerSec <= 0) {
    const pack = next.wave >= 4 ? 2 : 1;
    for (let i = 0; i < pack; i += 1) {
      const enemy = createEnemy(`enemy_${next.nextEntityId + i}`, next.wave);
      enemy.x = 0.92 + i * 0.035;
      next.entities.push(enemy);
    }
    next.nextEntityId += pack;
    next.spawnPulseSec = 0.26;
    next.spawnTimerSec = getSpawnInterval(next.elapsedSec, next.wave);
  }

  const secondInMinute = next.elapsedSec % 60;
  if (secondInMinute >= 45 && secondInMinute < 45 + dt) {
    next.stats.spikeMoments += 1;
  }

  applyEntityActions(next, dt);

  const beforeEnemies = next.entities.filter((entity) => entity.team === 'enemy').length;
  next.entities = next.entities.filter((entity) => entity.hp > 0);
  const afterEnemies = next.entities.filter((entity) => entity.team === 'enemy').length;
  next.stats.kills += Math.max(0, beforeEnemies - afterEnemies);

  if (next.baseHp <= 0) {
    next.baseHp = 0;
    next.ended = true;
    next.victory = false;
  }

  return next;
}

export function buildResultFromSurvival(runtime) {
  const clearedFiveMinutes = runtime.victory && runtime.elapsedSec >= runtime.durationSec;
  const scrapReward = Math.round(50 + runtime.stats.kills * 3 + runtime.elapsedSec * 0.8);
  const coreBitsReward = Math.max(0, Math.floor(runtime.elapsedSec / 60) - 1) + (clearedFiveMinutes ? 2 : 0);

  return {
    mode: 'survival',
    victory: runtime.victory,
    waveId: 'survival_5m',
    waveName: 'WATT Rift (5m)',
    enemiesDefeated: runtime.stats.kills,
    durationSec: Math.round(runtime.elapsedSec),
    squadHpLeft: Math.max(0, Math.round(runtime.baseHp)),
    score: Math.round(runtime.elapsedSec * 2 + runtime.stats.kills * 7 + runtime.stats.deployed * 5),
    milestones: {
      spikesCleared: runtime.stats.spikeMoments,
      elitesDefeated: 0,
      bossesDefeated: 0,
      fiveMinuteClear: clearedFiveMinutes,
    },
    debug: {
      seed: 0,
      ticks: Math.round(runtime.elapsedSec / 0.1),
      playerShots: 0,
      enemyShots: 0,
      crits: 0,
      skillsTriggered: 0,
      elitesSpawned: 0,
      bossesSpawned: 0,
    },
    rewards: {
      scrap: scrapReward,
      coreBits: coreBitsReward,
    },
  };
}
