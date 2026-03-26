import React, { useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ASSET_KEYS, getRarityFrameAsset, getSlotAssetKey, getUiAsset, getUnitAsset, roleToUnitArchetype } from '../assets';
import { GamePanel } from '../components/game-ui/GamePanel';
import { MechUnitCard } from '../components/game-ui/MechUnitCard';
import { palette } from '../components/game-ui/palette';
import { ScreenShell } from '../components/ScreenShell';
import { partMap, partSlots, parts } from '../data/parts';
import { unitMap } from '../data/units';
import { buildAssemblyPreview } from '../logic/assembly';
import { getPartUpgradeCost, getUpgradeEffects } from '../logic/upgrades';
import { useGame } from '../state/GameProvider';
import { getBuildArray } from '../state/selectors';
import { PartSlot } from '../types/game';

const statKeys = ['hp', 'attack', 'defense', 'fireRate', 'crit'] as const;

function BuildSwitchChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.buildChip, active ? styles.buildChipActive : null, pressed ? styles.buildChipPressed : null]}>
      <ImageBackground
        source={getUiAsset(active ? ASSET_KEYS.ui.deployButtonActive : ASSET_KEYS.ui.deployButtonNormal)}
        resizeMode="stretch"
        style={styles.buildChipBg}
        imageStyle={styles.buildChipBgImage}
      >
        <View style={[styles.buildChipRail, active ? styles.buildChipRailActive : null]} />
        <Text style={styles.buildChipText}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

function AssemblyStat({ label, value }: { label: string; value: string }) {
  return (
    <ImageBackground source={getUiAsset(ASSET_KEYS.ui.statBoxSmall)} resizeMode="stretch" style={styles.assemblyStat} imageStyle={styles.assemblyStatImage}>
      <Text style={styles.assemblyStatLabel}>{label}</Text>
      <Text style={styles.assemblyStatValue}>{value}</Text>
    </ImageBackground>
  );
}

function SlotActionButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.slotActionButton, disabled ? styles.slotActionButtonDisabled : null, pressed ? styles.slotActionButtonPressed : null]}>
      <ImageBackground
        source={getUiAsset(disabled ? ASSET_KEYS.ui.deployButtonDisabled : ASSET_KEYS.ui.deployButtonActive)}
        resizeMode="stretch"
        style={styles.slotActionButtonBg}
        imageStyle={styles.slotActionButtonBgImage}
      >
        <Text style={styles.slotActionButtonText}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

function ModuleGlyph({ slot }: { slot: PartSlot }) {
  if (slot === 'turret') {
    return (
      <View style={styles.moduleGlyphRoot}>
        <View style={styles.moduleGlyphBarrel} />
        <View style={styles.moduleGlyphBody} />
      </View>
    );
  }

  if (slot === 'chassis') {
    return (
      <View style={styles.moduleGlyphRoot}>
        <View style={styles.moduleGlyphChassis} />
        <View style={styles.moduleGlyphLegs} />
      </View>
    );
  }

  if (slot === 'ammo') {
    return (
      <View style={styles.moduleGlyphRoot}>
        <View style={styles.moduleGlyphTrack} />
        <View style={styles.moduleGlyphWheel} />
      </View>
    );
  }

  return (
    <View style={styles.moduleGlyphRoot}>
      <View style={styles.moduleGlyphCoreOuter} />
      <View style={styles.moduleGlyphCoreInner} />
    </View>
  );
}

export function AssemblyScreen() {
  const { state, dispatch } = useGame();
  const buildList = getBuildArray(state);
  const [activeBuildId, setActiveBuildId] = useState<string>(buildList[0]?.id || '');

  const build = state.builds[activeBuildId];
  const unit = build ? unitMap[build.unitId] : null;

  const preview = useMemo(() => {
    if (!build) return null;
    return buildAssemblyPreview({
      build,
      partLevels: state.collection.partLevels,
      globalEffects: getUpgradeEffects(state.upgrades.levels),
    });
  }, [build, state.collection.partLevels, state.upgrades.levels]);

  if (!build || !unit || !preview) {
    return (
      <ScreenShell>
        <GamePanel title="Assembly Console" rightBadge="NO BUILD" tone="player" frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}>
          <Text style={styles.emptyText}>No build found.</Text>
        </GamePanel>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <GamePanel
        title="Assembly Console"
        rightBadge={build.id.toUpperCase()}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
        backgroundOpacity={0.24}
        frameOpacity={0.62}
        innerStyle={styles.consoleInner}
        style={styles.sectionGap}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.buildSelectorRow}>
          {buildList.map((item) => {
            const itemUnit = unitMap[item.unitId];
            return <BuildSwitchChip key={item.id} label={itemUnit?.name || item.id} active={item.id === activeBuildId} onPress={() => setActiveBuildId(item.id)} />;
          })}
        </ScrollView>
      </GamePanel>

      <GamePanel
        title="Frame Identity"
        rightBadge={`PWR ${preview.power}`}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.3}
        frameOpacity={0.64}
        innerStyle={styles.identityInner}
        style={styles.sectionGap}
      >
        <View style={styles.identityTopRow}>
          <View style={styles.identityCardWrap}>
            <MechUnitCard
              name={unit.name}
              archetype={preview.roleIdentity}
              cost={Math.max(16, Math.round(preview.power / 24))}
              rarity="rare"
              modules={{
                weapon: partMap[build.slots.turret || '']?.name || 'Stock',
                body: partMap[build.slots.chassis || '']?.name || 'Stock',
                mobility: partMap[build.slots.ammo || '']?.name || 'Stock',
                core: partMap[build.slots.core || '']?.name || 'Stock',
              }}
              unitImageSource={getUnitAsset({ team: 'ally', archetype: roleToUnitArchetype(preview.roleIdentity) })}
              panelFrameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
              panelBackgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
              rarityFrameSource={getRarityFrameAsset('rare')}
            />
          </View>

          <ImageBackground source={getUiAsset(ASSET_KEYS.ui.upgradePanel)} resizeMode="stretch" style={styles.identitySignalPanel} imageStyle={styles.identitySignalPanelImage}>
            <View style={styles.identitySignalRail} />
            <Text style={styles.identitySignalLabel}>BUILD SIGNAL</Text>
            <View style={styles.identitySignalTrack}>
              <ImageBackground
                source={getUiAsset(ASSET_KEYS.ui.wattPanel)}
                resizeMode="stretch"
                style={[styles.identitySignalFill, { width: `${Math.max(12, Math.round((preview.power / Math.max(1, preview.power + 240)) * 100))}%` }]}
                imageStyle={styles.identitySignalFillImage}
              />
            </View>
            <Text style={styles.identitySignalValue}>{preview.roleIdentity.toUpperCase()}</Text>
          </ImageBackground>
        </View>

        <View style={styles.identityStatsRow}>
          <AssemblyStat label="ROLE" value={preview.roleIdentity.toUpperCase()} />
          <AssemblyStat label="ATT" value={`${preview.assembledStats.attack}`} />
          <AssemblyStat label="DEF" value={`${preview.assembledStats.defense}`} />
          <AssemblyStat label="ROF" value={`${preview.assembledStats.fireRate}`} />
        </View>
      </GamePanel>

      <GamePanel
        title="Module Slots"
        rightBadge="MODULAR"
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.deployBar)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.33}
        frameOpacity={0.66}
        innerStyle={styles.slotPanelInner}
        style={styles.sectionGap}
      >
        <View style={styles.slotGrid}>
          {partSlots.map((slotInfo) => {
            const slot = slotInfo.id as PartSlot;
            const currentPartId = build.slots[slot];
            const currentPart = currentPartId ? partMap[currentPartId] : null;
            const currentLevel = currentPart ? state.collection.partLevels[currentPart.id] || 0 : 0;
            const upgradeCost = currentPart ? getPartUpgradeCost(currentLevel) : 0;
            const candidates = parts.filter((part) => part.slot === slot);

            return (
              <View key={slotInfo.id} style={styles.slotCell}>
                <ImageBackground source={getUiAsset(getSlotAssetKey(slot))} resizeMode="stretch" style={styles.slotFrame} imageStyle={styles.slotFrameImage}>
                  {currentPart ? <Image source={getRarityFrameAsset(currentPart.rarity)} style={styles.slotRarityFrame} resizeMode="stretch" /> : null}
                  <View style={styles.slotRail} />

                  <View style={styles.slotHeaderRow}>
                    <Text style={styles.slotName}>{slotInfo.name}</Text>
                    <Text style={styles.slotLevelBadge}>LV.{currentLevel}</Text>
                  </View>

                  <View style={styles.slotGlyphRow}>
                    <ModuleGlyph slot={slot} />
                    <View style={styles.slotSignalMeta}>
                      <Text style={styles.slotSignalLabel}>MODULE</Text>
                      <Text style={styles.slotSignalValue}>{currentPart ? currentPart.rarity.toUpperCase() : 'EMPTY'}</Text>
                      <View style={styles.slotSignalTrack}>
                        <ImageBackground
                          source={getUiAsset(ASSET_KEYS.ui.wattPanel)}
                          resizeMode="stretch"
                          style={[styles.slotSignalFill, { width: `${Math.max(10, Math.round(Math.min(1, currentLevel / 10) * 100))}%` }]}
                          imageStyle={styles.slotSignalFillImage}
                        />
                      </View>
                    </View>
                  </View>

                  <Text numberOfLines={1} style={styles.slotPartName}>
                    {currentPart ? currentPart.name : 'EMPTY'}
                  </Text>
                  <Text style={styles.slotMeta}>{currentPart ? currentPart.rarity.toUpperCase() : 'UNASSIGNED'}</Text>

                  <View style={styles.slotActionRow}>
                    <SlotActionButton label="UNEQUIP" onPress={() => dispatch({ type: 'EQUIP_PART', payload: { buildId: build.id, slot, partId: null } })} />
                    {currentPart ? (
                      <SlotActionButton
                        label={`UP ${upgradeCost}`}
                        onPress={() => dispatch({ type: 'UPGRADE_PART', payload: { partId: currentPart.id, cost: upgradeCost } })}
                        disabled={state.player.scrap < upgradeCost}
                      />
                    ) : null}
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.partChoiceRow}>
                    {candidates.map((part) => (
                      <Pressable
                        key={`${slot}_${part.id}`}
                        style={({ pressed }) => [styles.partChoice, build.slots[slot] === part.id ? styles.partChoiceActive : null, pressed ? styles.partChoicePressed : null]}
                        onPress={() => dispatch({ type: 'EQUIP_PART', payload: { buildId: build.id, slot, partId: part.id } })}
                      >
                        <Text style={styles.partChoiceText}>{part.name}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </ImageBackground>
              </View>
            );
          })}
        </View>
      </GamePanel>

      <GamePanel
        title="Output Matrix"
        rightBadge={preview.roleIdentity}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.upgradePanel)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.31}
        frameOpacity={0.64}
        innerStyle={styles.matrixInner}
      >
        <View style={styles.statList}>
          {statKeys.map((key) => {
            const base = preview.baseStats[key];
            const assembled = preview.assembledStats[key];
            const delta = preview.statDelta[key];
            const positive = delta >= 0;
            const ratio = Math.max(0.08, Math.min(1, assembled / Math.max(1, Math.max(...statKeys.map((candidate) => preview.assembledStats[candidate])))));

            return (
              <ImageBackground key={key} source={getUiAsset(ASSET_KEYS.ui.statBoxSmall)} resizeMode="stretch" style={styles.statRow} imageStyle={styles.statRowImage}>
                <Text style={styles.statKey}>{key.toUpperCase()}</Text>
                <View style={styles.statTrack}>
                  <ImageBackground source={getUiAsset(ASSET_KEYS.ui.wattPanel)} resizeMode="stretch" style={[styles.statFill, { width: `${Math.round(ratio * 100)}%` }]} imageStyle={styles.statFillImage} />
                </View>
                <Text style={styles.statValue}>{`${assembled}`}</Text>
                <Text style={styles.statBase}>{`${base}`}</Text>
                <Text style={[styles.statDelta, { color: positive ? '#7df2c5' : '#ff9a8e' }]}>{positive ? `+${delta}` : `${delta}`}</Text>
              </ImageBackground>
            );
          })}
        </View>
      </GamePanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  sectionGap: {
    marginBottom: 10,
  },
  consoleInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  emptyText: {
    color: '#bed5ea',
    fontSize: 13,
    fontWeight: '700',
  },
  buildSelectorRow: {
    gap: 8,
  },
  buildChip: {
    minWidth: 134,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#5a80aa',
  },
  buildChipActive: {
    borderColor: '#82dfff',
  },
  buildChipPressed: {
    opacity: 0.84,
  },
  buildChipBg: {
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  buildChipBgImage: {
    opacity: 0.4,
  },
  buildChipRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#5f83a9',
    opacity: 0.5,
  },
  buildChipRailActive: {
    backgroundColor: '#84e6ff',
    opacity: 0.85,
  },
  buildChipText: {
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  identityInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  identityTopRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  identityCardWrap: {
    flex: 1,
    minWidth: 0,
  },
  identitySignalPanel: {
    width: 112,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4f7397',
    overflow: 'hidden',
    backgroundColor: '#142745',
    paddingHorizontal: 7,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  identitySignalPanelImage: {
    opacity: 0.34,
  },
  identitySignalRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#7be2ff',
    opacity: 0.72,
  },
  identitySignalLabel: {
    color: '#9ec9e7',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  identitySignalTrack: {
    marginTop: 7,
    height: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f7398',
    overflow: 'hidden',
    backgroundColor: '#173150',
  },
  identitySignalFill: {
    height: '100%',
  },
  identitySignalFillImage: {
    opacity: 0.94,
  },
  identitySignalValue: {
    marginTop: 7,
    color: '#d6ecff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  identityStatsRow: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  assemblyStat: {
    flexGrow: 1,
    minWidth: 72,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f7398',
    paddingHorizontal: 7,
    paddingVertical: 6,
  },
  assemblyStatImage: {
    opacity: 0.32,
  },
  assemblyStatLabel: {
    color: '#a6d0ea',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  assemblyStatValue: {
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
  slotPanelInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCell: {
    width: '48%',
  },
  slotFrame: {
    minHeight: 172,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f729b',
    paddingHorizontal: 6,
    paddingVertical: 7,
  },
  slotRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#7ce5ff',
    opacity: 0.62,
  },
  slotFrameImage: {
    opacity: 0.28,
  },
  slotRarityFrame: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.33,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotName: {
    color: '#b7dcf6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  slotLevelBadge: {
    borderWidth: 1,
    borderColor: '#73bde3',
    borderRadius: 999,
    backgroundColor: '#204f77',
    color: '#d6f0ff',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  slotPartName: {
    marginTop: 6,
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
  },
  slotMeta: {
    marginTop: 2,
    color: '#9ec3df',
    fontSize: 9,
    fontWeight: '700',
  },
  slotActionRow: {
    marginTop: 7,
    flexDirection: 'row',
    gap: 5,
  },
  slotActionButton: {
    flex: 1,
    minHeight: 25,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#70a2d2',
    overflow: 'hidden',
  },
  slotActionButtonPressed: {
    opacity: 0.82,
  },
  slotActionButtonDisabled: {
    opacity: 0.45,
  },
  slotActionButtonBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotActionButtonBgImage: {
    opacity: 0.38,
  },
  slotActionButtonText: {
    color: '#d7efff',
    fontSize: 9,
    fontWeight: '900',
  },
  partChoiceRow: {
    marginTop: 7,
    gap: 4,
    paddingRight: 6,
  },
  partChoice: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f7199',
    backgroundColor: '#1d3556',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  partChoiceActive: {
    borderColor: '#7de2ff',
    backgroundColor: '#21527a',
  },
  partChoicePressed: {
    opacity: 0.84,
  },
  partChoiceText: {
    color: '#d2e9fd',
    fontSize: 8,
    fontWeight: '800',
  },
  slotGlyphRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  slotSignalMeta: {
    flex: 1,
  },
  slotSignalLabel: {
    color: '#94c2df',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  slotSignalValue: {
    marginTop: 2,
    color: '#d2e9ff',
    fontSize: 9,
    fontWeight: '900',
  },
  slotSignalTrack: {
    marginTop: 5,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4f7398',
    overflow: 'hidden',
    backgroundColor: '#183250',
  },
  slotSignalFill: {
    height: '100%',
  },
  slotSignalFillImage: {
    opacity: 0.94,
  },
  moduleGlyphRoot: {
    width: 36,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleGlyphBarrel: {
    position: 'absolute',
    top: 5,
    right: 4,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d7ecff',
  },
  moduleGlyphBody: {
    width: 20,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#83b6de',
    borderWidth: 1,
    borderColor: '#d5ebff',
  },
  moduleGlyphChassis: {
    width: 22,
    height: 10,
    borderRadius: 4,
    backgroundColor: '#84b9db',
    borderWidth: 1,
    borderColor: '#d7ecff',
  },
  moduleGlyphLegs: {
    marginTop: 3,
    width: 17,
    height: 5,
    borderRadius: 2,
    backgroundColor: '#4f7398',
  },
  moduleGlyphTrack: {
    width: 24,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d7ecff',
    backgroundColor: '#5f89b0',
  },
  moduleGlyphWheel: {
    marginTop: 3,
    width: 18,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#d1e8fb',
  },
  moduleGlyphCoreOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d7ecff',
    backgroundColor: '#608fb2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleGlyphCoreInner: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#bcedff',
  },
  matrixInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  statList: {
    gap: 6,
  },
  statRow: {
    minHeight: 36,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4e7097',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    gap: 7,
  },
  statRowImage: {
    opacity: 0.32,
  },
  statKey: {
    width: 54,
    color: '#a6cae7',
    fontSize: 9,
    fontWeight: '900',
  },
  statTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#4d7097',
    overflow: 'hidden',
    backgroundColor: '#132741',
  },
  statFill: {
    height: '100%',
  },
  statFillImage: {
    opacity: 0.94,
  },
  statValue: {
    width: 38,
    color: palette.textMain,
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'right',
  },
  statBase: {
    width: 34,
    color: '#94b3cf',
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
  },
  statDelta: {
    width: 32,
    textAlign: 'right',
    fontSize: 9,
    fontWeight: '900',
  },
});
