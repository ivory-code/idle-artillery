import type { ImageSourcePropType } from 'react-native';
import type { PartRarity, PartSlot, RoleIdentity } from '../types/game';

export type AssetCategory = 'units' | 'bases' | 'backgrounds' | 'ui' | 'icons' | 'effects';
export type UnitTeam = 'ally' | 'enemy';
export type UnitArchetype = 'artillery' | 'support' | 'lightning' | 'fire' | 'ice';

type CategoryAssetMap = Record<string, ImageSourcePropType>;
type UnitArchetypeMap = Partial<Record<UnitArchetype | 'default', ImageSourcePropType>>;

const CATEGORY_FALLBACKS: Record<AssetCategory, ImageSourcePropType> = {
  units: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
  bases: require('../../assets/bases/base_player_main.png') as ImageSourcePropType,
  backgrounds: require('../../assets/backgrounds/bg_battlefield_main.png') as ImageSourcePropType,
  ui: require('../../assets/ui/ui_stat_box_small.png') as ImageSourcePropType,
  icons: require('../../assets/icon.png') as ImageSourcePropType,
  effects: require('../../assets/android-icon-monochrome.png') as ImageSourcePropType,
};

export const ASSET_KEYS = {
  units: {
    allyArtillery: 'ally.artillery',
    allyLightning: 'ally.lightning',
    allyFire: 'ally.fire',
    allyIce: 'ally.ice',
    allySupport: 'ally.support',
    enemyArtillery: 'enemy.artillery',
    enemyLightning: 'enemy.lightning',
    enemyFire: 'enemy.fire',
    enemyIce: 'enemy.ice',
    enemySupport: 'enemy.support',
  },
  bases: {
    playerMain: 'player.main',
    enemyMain: 'enemy.main',
  },
  backgrounds: {
    battlefieldMain: 'battlefield.main',
  },
  ui: {
    hudFrames: 'hud.frames',
    hudTopFrame: 'hud.topFrame',
    assemblyConsoleMain: 'assembly.console.main',
    deployBar: 'deploy.bar',
    deployButtonNormal: 'deploy.button.normal',
    deployButtonActive: 'deploy.button.active',
    deployButtonDisabled: 'deploy.button.disabled',
    wattPanel: 'panel.watt',
    unitCardFrame: 'frame.unitCard',
    rarityCommon: 'frame.rarity.common',
    rarityRare: 'frame.rarity.rare',
    slotWeapon: 'slot.weapon',
    slotBody: 'slot.body',
    slotMobility: 'slot.mobility',
    slotCore: 'slot.core',
    statBoxSmall: 'box.stat.small',
    resultRewardPanel: 'panel.resultReward',
    upgradePanel: 'panel.upgrade',
  },
} as const;

export const ASSETS_BY_CATEGORY: Record<AssetCategory, CategoryAssetMap> = {
  units: {
    [ASSET_KEYS.units.allyArtillery]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.allyLightning]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.allyFire]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.allyIce]: require('../../assets/units/unit_support_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.allySupport]: require('../../assets/units/unit_support_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.enemyArtillery]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.enemyLightning]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.enemyFire]: require('../../assets/units/unit_artillery_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.enemyIce]: require('../../assets/units/unit_support_mech.png') as ImageSourcePropType,
    [ASSET_KEYS.units.enemySupport]: require('../../assets/units/unit_support_mech.png') as ImageSourcePropType,
  },
  bases: {
    [ASSET_KEYS.bases.playerMain]: require('../../assets/bases/base_player_main.png') as ImageSourcePropType,
    [ASSET_KEYS.bases.enemyMain]: require('../../assets/bases/base_enemy_main.png') as ImageSourcePropType,
  },
  backgrounds: {
    [ASSET_KEYS.backgrounds.battlefieldMain]: require('../../assets/backgrounds/bg_battlefield_main.png') as ImageSourcePropType,
  },
  ui: {
    [ASSET_KEYS.ui.hudFrames]: require('../../assets/ui/hud_frames.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.hudTopFrame]: require('../../assets/ui/ui_hud_top_frame.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.assemblyConsoleMain]: require('../../assets/ui/ui_assembly_console_main.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.deployBar]: require('../../assets/ui/ui_deploy_bar.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.deployButtonNormal]: require('../../assets/ui/ui_button_deploy_normal.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.deployButtonActive]: require('../../assets/ui/ui_button_deploy_active.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.deployButtonDisabled]: require('../../assets/ui/ui_button_deploy_disabled.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.wattPanel]: require('../../assets/ui/ui_watt_panel.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.unitCardFrame]: require('../../assets/ui/ui_unit_card_frame.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.rarityCommon]: require('../../assets/ui/ui_rarity_common.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.rarityRare]: require('../../assets/ui/ui_rarity_rare.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.slotWeapon]: require('../../assets/ui/ui_slot_weapon.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.slotBody]: require('../../assets/ui/ui_slot_body.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.slotMobility]: require('../../assets/ui/ui_slot_mobility.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.slotCore]: require('../../assets/ui/ui_slot_core.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.statBoxSmall]: require('../../assets/ui/ui_stat_box_small.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.resultRewardPanel]: require('../../assets/ui/ui_result_reward_panel.png') as ImageSourcePropType,
    [ASSET_KEYS.ui.upgradePanel]: require('../../assets/ui/ui_upgrade_panel.png') as ImageSourcePropType,
  },
  icons: {},
  effects: {},
};

export const UNIT_ASSETS_BY_ARCHETYPE: Record<UnitTeam, UnitArchetypeMap> = {
  ally: {
    artillery: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allyArtillery],
    lightning: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allyLightning],
    fire: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allyFire],
    ice: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allyIce],
    support: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allySupport],
    default: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.allyArtillery],
  },
  enemy: {
    artillery: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemyArtillery],
    lightning: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemyLightning],
    fire: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemyFire],
    ice: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemyIce],
    support: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemySupport],
    default: ASSETS_BY_CATEGORY.units[ASSET_KEYS.units.enemySupport],
  },
};

export function getAsset(category: AssetCategory, key: string): ImageSourcePropType {
  return ASSETS_BY_CATEGORY[category][key] ?? CATEGORY_FALLBACKS[category];
}

export function getUnitAsset(params?: { team?: UnitTeam; archetype?: string }): ImageSourcePropType {
  const team = params?.team ?? 'ally';
  const archetype = (params?.archetype ?? 'artillery').toLowerCase();
  const teamMap = UNIT_ASSETS_BY_ARCHETYPE[team] ?? UNIT_ASSETS_BY_ARCHETYPE.ally;
  return teamMap[archetype as UnitArchetype] ?? teamMap.default ?? CATEGORY_FALLBACKS.units;
}

export function getBaseAsset(key: string): ImageSourcePropType {
  return getAsset('bases', key);
}

export function getBackgroundAsset(key: string): ImageSourcePropType {
  return getAsset('backgrounds', key);
}

export function getUiAsset(key: string): ImageSourcePropType {
  return getAsset('ui', key);
}

export function getIconAsset(key: string): ImageSourcePropType {
  return getAsset('icons', key);
}

export function getEffectAsset(key: string): ImageSourcePropType {
  return getAsset('effects', key);
}

export function getCategoryFallback(category: AssetCategory): ImageSourcePropType {
  return CATEGORY_FALLBACKS[category];
}

export function getDeployButtonSkins() {
  return {
    normal: getUiAsset(ASSET_KEYS.ui.deployButtonNormal),
    active: getUiAsset(ASSET_KEYS.ui.deployButtonActive),
    disabled: getUiAsset(ASSET_KEYS.ui.deployButtonDisabled),
  };
}

export function getRarityFrameAsset(rarity?: PartRarity | 'epic'): ImageSourcePropType {
  if (rarity === 'rare' || rarity === 'epic') {
    return getUiAsset(ASSET_KEYS.ui.rarityRare);
  }
  return getUiAsset(ASSET_KEYS.ui.rarityCommon);
}

export function getSlotAssetKey(slot: PartSlot): string {
  if (slot === 'turret') return ASSET_KEYS.ui.slotWeapon;
  if (slot === 'chassis') return ASSET_KEYS.ui.slotBody;
  if (slot === 'ammo') return ASSET_KEYS.ui.slotMobility;
  return ASSET_KEYS.ui.slotCore;
}

export function roleToUnitArchetype(role?: RoleIdentity | string): UnitArchetype {
  if (role === 'Sharpshot') return 'lightning';
  if (role === 'Barrage') return 'fire';
  if (role === 'Support') return 'support';
  if (role === 'Bulwark') return 'artillery';
  return 'artillery';
}
