import React, { useMemo } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ASSET_KEYS, getBaseAsset, getRarityFrameAsset, getSlotAssetKey, getUiAsset, getUnitAsset, roleToUnitArchetype } from '../assets';
import { MechUnitCard } from '../components/game-ui/MechUnitCard';
import { GamePanel } from '../components/game-ui/GamePanel';
import { palette } from '../components/game-ui/palette';
import { ScreenShell } from '../components/ScreenShell';
import { partMap } from '../data/parts';
import { unitMap } from '../data/units';
import { waves } from '../data/waves';
import { buildAssemblyPreview } from '../logic/assembly';
import { getUpgradeEffects } from '../logic/upgrades';
import { RootStackParamList } from '../navigation/routes';
import { useGame } from '../state/GameProvider';
import { getBuildArray, getSquadPower } from '../state/selectors';
import { GameState, RoleIdentity } from '../types/game';

type Props = NativeStackScreenProps<RootStackParamList, 'Hangar'>;

type BuildCard = {
  id: string;
  unitName: string;
  roleIdentity: RoleIdentity;
  power: number;
  rarity: 'common' | 'rare' | 'epic';
  modules: {
    weapon: string;
    body: string;
    mobility: string;
    core: string;
  };
};

function rarityRank(rarity: 'common' | 'rare' | 'epic'): number {
  if (rarity === 'epic') return 3;
  if (rarity === 'rare') return 2;
  return 1;
}

function buildRarity(buildId: string, state: GameState): 'common' | 'rare' | 'epic' {
  const build = state.builds[buildId];
  if (!build) return 'common';

  let best: 'common' | 'rare' | 'epic' = 'common';
  (Object.values(build.slots) as Array<string | null>).forEach((partId) => {
    if (!partId) return;
    const part = partMap[partId];
    if (!part) return;
    if (rarityRank(part.rarity) > rarityRank(best)) {
      best = part.rarity;
    }
  });

  return best;
}

function CommandStat({ label, value }: { label: string; value: string }) {
  return (
    <ImageBackground source={getUiAsset(ASSET_KEYS.ui.statBoxSmall)} resizeMode="stretch" style={styles.commandStat} imageStyle={styles.commandStatImage}>
      <Text style={styles.commandStatLabel}>{label}</Text>
      <Text style={styles.commandStatValue}>{value}</Text>
    </ImageBackground>
  );
}

function ConsoleGauge({ label, value, ratio }: { label: string; value: string; ratio: number }) {
  return (
    <View style={styles.gaugeWrap}>
      <View style={styles.gaugeHeader}>
        <Text style={styles.gaugeLabel}>{label}</Text>
        <Text style={styles.gaugeValue}>{value}</Text>
      </View>
      <View style={styles.gaugeTrack}>
        <ImageBackground
          source={getUiAsset(ASSET_KEYS.ui.wattPanel)}
          resizeMode="stretch"
          style={[styles.gaugeFill, { width: `${Math.max(8, Math.round(Math.max(0, Math.min(1, ratio)) * 100))}%` }]}
          imageStyle={styles.gaugeFillImage}
        />
      </View>
    </View>
  );
}

function OpsButton({
  label,
  caption,
  onPress,
}: {
  label: string;
  caption: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.opsButton, pressed ? styles.opsButtonPressed : null]}>
      <ImageBackground source={getUiAsset(ASSET_KEYS.ui.deployButtonNormal)} resizeMode="stretch" style={styles.opsButtonBg} imageStyle={styles.opsButtonBgImage}>
        <View style={styles.opsButtonRail} />
        <Text style={styles.opsButtonLabel}>{label}</Text>
        <Text style={styles.opsButtonCaption}>{caption}</Text>
      </ImageBackground>
    </Pressable>
  );
}

function PartSlotGlyph({ slot }: { slot: string }) {
  if (slot === 'turret') {
    return (
      <View style={styles.glyphRoot}>
        <View style={styles.glyphBarrel} />
        <View style={styles.glyphBody} />
      </View>
    );
  }

  if (slot === 'chassis') {
    return (
      <View style={styles.glyphRoot}>
        <View style={styles.glyphChassisBody} />
        <View style={styles.glyphChassisLeg} />
      </View>
    );
  }

  if (slot === 'ammo') {
    return (
      <View style={styles.glyphRoot}>
        <View style={styles.glyphMobilityTrack} />
        <View style={styles.glyphMobilityWheel} />
      </View>
    );
  }

  return (
    <View style={styles.glyphRoot}>
      <View style={styles.glyphCoreOuter} />
      <View style={styles.glyphCoreInner} />
    </View>
  );
}

export function HangarScreen({ navigation }: Props) {
  const { state } = useGame();
  const squadPower = getSquadPower(state);
  const buildList = getBuildArray(state);

  const buildCards = useMemo<BuildCard[]>(() => {
    const globalEffects = getUpgradeEffects(state.upgrades.levels);

    return buildList
      .map((build) => {
        const unit = unitMap[build.unitId];
        if (!unit) return null;

        const preview = buildAssemblyPreview({
          build,
          partLevels: state.collection.partLevels,
          globalEffects,
        });

        if (!preview) return null;

        return {
          id: build.id,
          unitName: unit.name,
          roleIdentity: preview.roleIdentity,
          power: preview.power,
          rarity: buildRarity(build.id, state),
          modules: {
            weapon: partMap[build.slots.turret || '']?.name || 'Stock',
            body: partMap[build.slots.chassis || '']?.name || 'Stock',
            mobility: partMap[build.slots.ammo || '']?.name || 'Stock',
            core: partMap[build.slots.core || '']?.name || 'Stock',
          },
        };
      })
      .filter((item): item is BuildCard => Boolean(item))
      .sort((a, b) => b.power - a.power);
  }, [buildList, state.collection.partLevels, state.upgrades.levels, state.builds]);

  const parts = state.collection.ownedPartIds
    .map((id) => partMap[id])
    .filter(Boolean)
    .slice(0, 12);

  const clearedCount = state.progression.unlockedWaveIds.length;
  const stageRatio = waves.length ? clearedCount / waves.length : 0;
  const squadFill = state.squad.slots.filter(Boolean).length / Math.max(1, state.squad.slots.length);

  return (
    <ScreenShell>
      <GamePanel
        title="Hangar Command"
        rightBadge={`PWR ${squadPower}`}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
        backgroundOpacity={0.24}
        frameOpacity={0.62}
        innerStyle={styles.commandInner}
        style={styles.sectionGap}
      >
        <View style={styles.commandTopRow}>
          <ImageBackground source={getUiAsset(ASSET_KEYS.ui.upgradePanel)} resizeMode="stretch" style={styles.baseStatusCard} imageStyle={styles.baseStatusCardImage}>
            <View style={styles.baseStatusGlow} />
            <Image source={getBaseAsset(ASSET_KEYS.bases.playerMain)} resizeMode="contain" style={styles.baseStatusImage} />
            <Text style={styles.baseStatusLabel}>FORT CORE</Text>
          </ImageBackground>

          <View style={styles.commandStatsColumn}>
            <View style={styles.commandStatRow}>
              <CommandStat label="SCRAP" value={`${state.player.scrap}`} />
              <CommandStat label="CORE" value={`${state.player.coreBits}`} />
              <CommandStat label="STAGE" value={`${clearedCount}/${waves.length}`} />
              <CommandStat label="BEST" value={`${state.survival.bestTimeSec}s`} />
            </View>
            <View style={styles.commandChipRow}>
              <Text style={styles.commandChip}>SQUAD {state.squad.slots.filter(Boolean).length}/4</Text>
              <Text style={styles.commandChip}>BUILD {buildCards.length}</Text>
              <Text style={styles.commandChip}>PART {state.collection.ownedPartIds.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.commandGaugeRow}>
          <ConsoleGauge label="STAGE LANE" value={`${Math.round(stageRatio * 100)}%`} ratio={stageRatio} />
          <ConsoleGauge label="SQUAD READINESS" value={`${Math.round(squadFill * 100)}%`} ratio={squadFill} />
        </View>
      </GamePanel>

      <GamePanel
        title="Frame Deck"
        rightBadge={`${buildCards.length} BUILDS`}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.3}
        frameOpacity={0.64}
        innerStyle={styles.deckInner}
        style={styles.sectionGap}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buildScroll}>
          {buildCards.map((card) => (
            <View key={card.id} style={styles.buildCardWrap}>
              <ImageBackground source={getUiAsset(ASSET_KEYS.ui.statBoxSmall)} resizeMode="stretch" style={styles.buildHeader} imageStyle={styles.buildHeaderImage}>
                <Text style={styles.buildHeaderId}>{card.id.toUpperCase()}</Text>
                <Text style={styles.buildHeaderPower}>PWR {card.power}</Text>
              </ImageBackground>

              <MechUnitCard
                name={card.unitName}
                archetype={card.roleIdentity}
                cost={Math.max(16, Math.round(card.power / 24))}
                rarity={card.rarity}
                modules={card.modules}
                unitImageSource={getUnitAsset({ team: 'ally', archetype: roleToUnitArchetype(card.roleIdentity) })}
                panelFrameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
                panelBackgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
                rarityFrameSource={getRarityFrameAsset(card.rarity)}
              />

              <View style={styles.buildChipRow}>
                <Text style={styles.buildChip}>{card.roleIdentity}</Text>
                <Text style={styles.buildChip}>{card.rarity.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </GamePanel>

      <GamePanel
        title="Operations Console"
        rightBadge="TACTICAL"
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.deployBar)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.34}
        frameOpacity={0.66}
        innerStyle={styles.opsInner}
        style={styles.sectionGap}
      >
        <View style={styles.opsStatusRow}>
          <Text style={styles.opsStatusChip}>ASSEMBLY READY</Text>
          <Text style={styles.opsStatusChip}>UPGRADE LIVE</Text>
          <Text style={styles.opsStatusChipEnemy}>SURVIVAL HOT</Text>
        </View>
        <View style={styles.actionsRow}>
          <OpsButton label="ASSEMBLY" caption="Parts + Roles" onPress={() => navigation.navigate('Assembly')} />
          <OpsButton label="UPGRADE" caption="Tech Tracks" onPress={() => navigation.navigate('Upgrade')} />
          <OpsButton label="SURVIVAL" caption="5m Defense" onPress={() => navigation.navigate('Battle')} />
        </View>
      </GamePanel>

      <GamePanel
        title="Part Rack"
        rightBadge={`${parts.length} PARTS`}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.31}
        frameOpacity={0.64}
        innerStyle={styles.rackInner}
      >
        <View style={styles.partsGrid}>
          {parts.map((part) => (
            <View key={part.id} style={styles.partCell}>
              <ImageBackground source={getUiAsset(getSlotAssetKey(part.slot))} resizeMode="stretch" style={styles.partSlotFrame} imageStyle={styles.partSlotFrameImage}>
                <Image source={getRarityFrameAsset(part.rarity)} style={styles.partRarityFrame} resizeMode="stretch" />
                <View style={styles.partRail} />
                <View style={styles.partLevelBadge}>
                  <Text style={styles.partLevelBadgeText}>LV.{state.collection.partLevels[part.id] || 0}</Text>
                </View>
                <Text style={styles.partSlotLabel}>{part.slot.toUpperCase()}</Text>
                <PartSlotGlyph slot={part.slot} />
                <Text numberOfLines={1} style={styles.partName}>
                  {part.name}
                </Text>
                <Text style={styles.partMeta}>{part.rarity.toUpperCase()}</Text>
              </ImageBackground>
            </View>
          ))}
        </View>
      </GamePanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    marginBottom: 10,
  },
  commandInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  commandStatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commandTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  baseStatusCard: {
    width: 96,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#4f779e',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 7,
    backgroundColor: '#132844',
  },
  baseStatusCardImage: {
    opacity: 0.34,
  },
  baseStatusGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#48d0e7',
    opacity: 0.2,
  },
  baseStatusImage: {
    width: 68,
    height: 48,
  },
  baseStatusLabel: {
    marginTop: 3,
    color: '#d8f1ff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  commandStatsColumn: {
    flex: 1,
  },
  commandStat: {
    flexGrow: 1,
    minWidth: 72,
    borderRadius: 9,
    paddingHorizontal: 8,
    paddingVertical: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#51759f',
  },
  commandStatImage: {
    opacity: 0.34,
  },
  commandStatLabel: {
    color: '#a8d1eb',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.35,
  },
  commandStatValue: {
    color: palette.textMain,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  commandGaugeRow: {
    marginTop: 9,
    gap: 7,
  },
  commandChipRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  commandChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f7296',
    backgroundColor: '#1a3251',
    color: '#bee1f8',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gaugeWrap: {
    borderWidth: 1,
    borderColor: '#4b6f95',
    borderRadius: 9,
    backgroundColor: '#12243d',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  gaugeLabel: {
    color: '#95c5e1',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  gaugeValue: {
    color: '#d5ecff',
    fontSize: 10,
    fontWeight: '800',
  },
  gaugeTrack: {
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4a6d93',
    overflow: 'hidden',
    backgroundColor: '#111f35',
  },
  gaugeFill: {
    height: '100%',
  },
  gaugeFillImage: {
    opacity: 0.95,
  },
  deckInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  buildScroll: {
    gap: 10,
    paddingRight: 6,
  },
  buildCardWrap: {
    width: 232,
  },
  buildHeader: {
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f749a',
    minHeight: 28,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 9,
  },
  buildHeaderImage: {
    opacity: 0.32,
  },
  buildHeaderId: {
    color: '#cae6ff',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  buildHeaderPower: {
    color: '#ffe2ad',
    fontSize: 10,
    fontWeight: '900',
  },
  buildChipRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 6,
  },
  buildChip: {
    borderWidth: 1,
    borderColor: '#4e749b',
    borderRadius: 999,
    backgroundColor: '#193555',
    color: '#cde6ff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  opsInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  opsStatusRow: {
    marginBottom: 7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  opsStatusChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#58a7c6',
    backgroundColor: '#163d5e',
    color: '#d4edff',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  opsStatusChipEnemy: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#bf6e5f',
    backgroundColor: '#4a2b2a',
    color: '#ffd4c6',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  opsButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#5f86b0',
    minHeight: 78,
  },
  opsButtonPressed: {
    opacity: 0.84,
  },
  opsButtonBg: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  opsButtonBgImage: {
    opacity: 0.42,
  },
  opsButtonRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#79deff',
    opacity: 0.6,
  },
  opsButtonLabel: {
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  opsButtonCaption: {
    marginTop: 2,
    color: '#abd4ea',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'center',
  },
  rackInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  partsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  partCell: {
    width: '31%',
  },
  partSlotFrame: {
    minHeight: 88,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#53769f',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  partRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#7ce4ff',
    opacity: 0.6,
  },
  partSlotLabel: {
    position: 'absolute',
    top: 4,
    left: 6,
    color: '#a4cde8',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  partSlotFrameImage: {
    opacity: 0.25,
  },
  partRarityFrame: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.36,
  },
  partLevelBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderWidth: 1,
    borderColor: '#72b7dd',
    borderRadius: 999,
    backgroundColor: '#204d73',
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  partLevelBadgeText: {
    color: '#cdeeff',
    fontSize: 8,
    fontWeight: '900',
  },
  partName: {
    marginTop: 3,
    color: palette.textMain,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  partMeta: {
    marginTop: 3,
    color: '#b0cfe8',
    fontSize: 8,
    fontWeight: '800',
  },
  glyphRoot: {
    marginTop: 10,
    width: 36,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphBarrel: {
    position: 'absolute',
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8ebff',
    right: 2,
    top: 5,
  },
  glyphBody: {
    width: 20,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#7eb1db',
    borderWidth: 1,
    borderColor: '#d8eeff',
  },
  glyphChassisBody: {
    width: 22,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#87bbdc',
    borderWidth: 1,
    borderColor: '#d9efff',
  },
  glyphChassisLeg: {
    marginTop: 3,
    width: 18,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#4f7095',
  },
  glyphMobilityTrack: {
    width: 24,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d9f0ff',
    backgroundColor: '#5f86ad',
  },
  glyphMobilityWheel: {
    marginTop: 4,
    width: 18,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#d3e9fc',
  },
  glyphCoreOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4ecff',
    backgroundColor: '#5c89af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphCoreInner: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#b7ebff',
  },
});
