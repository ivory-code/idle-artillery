import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { ASSET_KEYS, getUiAsset } from '../assets';
import { GamePanel } from '../components/game-ui/GamePanel';
import { palette } from '../components/game-ui/palette';
import { ScreenShell } from '../components/ScreenShell';
import { upgradeTracks } from '../data/upgrades';
import { getUpgradeCost, getUpgradeEffects } from '../logic/upgrades';
import { useGame } from '../state/GameProvider';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <ImageBackground source={getUiAsset(ASSET_KEYS.ui.statBoxSmall)} resizeMode="stretch" style={styles.statTile} imageStyle={styles.statTileImage}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </ImageBackground>
  );
}

function ConsoleButton({
  label,
  onPress,
  disabled,
  active,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.consoleButton, disabled ? styles.consoleButtonDisabled : null, pressed ? styles.consoleButtonPressed : null]}>
      <ImageBackground
        source={getUiAsset(disabled ? ASSET_KEYS.ui.deployButtonDisabled : active ? ASSET_KEYS.ui.deployButtonActive : ASSET_KEYS.ui.deployButtonNormal)}
        resizeMode="stretch"
        style={styles.consoleButtonBg}
        imageStyle={styles.consoleButtonBgImage}
      >
        <View style={[styles.consoleButtonRail, active ? styles.consoleButtonRailActive : null]} />
        <Text style={styles.consoleButtonText}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

function ControlChip({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.controlChip, pressed ? styles.controlChipPressed : null]}>
      <ImageBackground source={getUiAsset(ASSET_KEYS.ui.deployButtonNormal)} resizeMode="stretch" style={styles.controlChipBg} imageStyle={styles.controlChipBgImage}>
        <Text style={styles.controlChipText}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

function TrackGlyph({ trackId }: { trackId: string }) {
  if (trackId === 'reload_drive') {
    return (
      <View style={styles.trackGlyphRoot}>
        <View style={styles.trackGlyphBarrel} />
        <View style={styles.trackGlyphCore} />
      </View>
    );
  }

  if (trackId === 'hull_plating') {
    return (
      <View style={styles.trackGlyphRoot}>
        <View style={styles.trackGlyphPlate} />
        <View style={styles.trackGlyphPlateInner} />
      </View>
    );
  }

  return (
    <View style={styles.trackGlyphRoot}>
      <View style={styles.trackGlyphMagnetOuter} />
      <View style={styles.trackGlyphMagnetInner} />
    </View>
  );
}

export function UpgradeScreen() {
  const { state, dispatch } = useGame();
  const effects = getUpgradeEffects(state.upgrades.levels);

  return (
    <ScreenShell>
      <GamePanel
        title="Upgrade Terminal"
        rightBadge="TECH"
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
        backgroundOpacity={0.24}
        frameOpacity={0.62}
        innerStyle={styles.commandInner}
        style={styles.sectionGap}
      >
        <View style={styles.commandTopRow}>
          <ImageBackground source={getUiAsset(ASSET_KEYS.ui.upgradePanel)} resizeMode="stretch" style={styles.reactorCoreCard} imageStyle={styles.reactorCoreCardImage}>
            <View style={styles.reactorCoreGlow} />
            <Text style={styles.reactorCoreLabel}>TECH CORE</Text>
            <View style={styles.reactorCoreRing} />
          </ImageBackground>

          <View style={styles.commandStatsColumn}>
            <View style={styles.statsRow}>
              <StatTile label="SCRAP" value={`${state.player.scrap}`} />
              <StatTile label="CORE" value={`${state.player.coreBits}`} />
              <StatTile label="ROF" value={toPercent(effects.fireRatePct)} />
              <StatTile label="HP" value={toPercent(effects.hpPct)} />
            </View>
            <View style={styles.commandChipRow}>
              <Text style={styles.commandChip}>SYSTEM ONLINE</Text>
              <Text style={styles.commandChip}>TRACKS {upgradeTracks.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.effectMatrix}>
          <View style={styles.effectRow}>
            <Text style={styles.effectLabel}>REWARD BOOST</Text>
            <Text style={styles.effectValue}>{toPercent(effects.rewardPct)}</Text>
          </View>
          <View style={styles.effectTrack}>
            <ImageBackground source={getUiAsset(ASSET_KEYS.ui.wattPanel)} resizeMode="stretch" style={[styles.effectFill, { width: `${Math.max(8, Math.round(Math.min(1, effects.rewardPct) * 100))}%` }]} imageStyle={styles.effectFillImage} />
          </View>
        </View>
      </GamePanel>

      <GamePanel
        title="Tech Tracks"
        rightBadge={`${upgradeTracks.length} SYSTEMS`}
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.upgradePanel)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.32}
        frameOpacity={0.66}
        innerStyle={styles.tracksInner}
        style={styles.sectionGap}
      >
        <View style={styles.trackList}>
          {upgradeTracks.map((track) => {
            const level = state.upgrades.levels[track.id] || 0;
            const cost = getUpgradeCost(track.id, level);
            const canBuy = state.player.scrap >= cost;
            const effectValue = level * track.stepValue;
            const progressRatio = Math.max(0.08, Math.min(1, (level % 10) / 10 || 0.08));

            return (
              <ImageBackground key={track.id} source={getUiAsset(ASSET_KEYS.ui.upgradePanel)} resizeMode="stretch" style={styles.trackCard} imageStyle={styles.trackCardImage}>
                <View style={styles.trackRail} />

                <View style={styles.trackTopRow}>
                  <TrackGlyph trackId={track.id} />
                  <View style={styles.trackHeader}>
                    <Text style={styles.trackName}>{track.name}</Text>
                    <Text style={styles.trackLevel}>LV.{level}</Text>
                  </View>
                </View>

                <Text style={styles.trackDesc}>{track.description}</Text>

                <View style={styles.trackMetaRow}>
                  <Text style={styles.trackMeta}>BONUS {toPercent(effectValue)}</Text>
                  <Text style={styles.trackMeta}>COST {cost}</Text>
                </View>
                <View style={styles.trackTagRow}>
                  <Text style={styles.trackTag}>TECH</Text>
                  <Text style={styles.trackTag}>GLOBAL</Text>
                </View>

                <View style={styles.trackProgressWrap}>
                  <ImageBackground source={getUiAsset(ASSET_KEYS.ui.wattPanel)} resizeMode="stretch" style={[styles.trackProgressFill, { width: `${Math.round(progressRatio * 100)}%` }]} imageStyle={styles.trackProgressFillImage} />
                </View>

                <ConsoleButton
                  label={canBuy ? 'APPLY UPGRADE' : 'INSUFFICIENT SCRAP'}
                  disabled={!canBuy}
                  active={canBuy}
                  onPress={() => dispatch({ type: 'PURCHASE_UPGRADE', payload: { trackId: track.id, cost } })}
                />
              </ImageBackground>
            );
          })}
        </View>
      </GamePanel>

      <GamePanel
        title="Field Controls"
        rightBadge="SYSTEM"
        tone="player"
        frameSource={getUiAsset(ASSET_KEYS.ui.deployBar)}
        backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
        backgroundOpacity={0.33}
        frameOpacity={0.66}
        innerStyle={styles.controlsInner}
      >
        <View style={styles.controlsGrid}>
          <ControlChip
            label={`MUSIC ${toPercent(state.settings.musicVolume)}`}
            onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'musicVolume', value: clamp01(state.settings.musicVolume + 0.1) } })}
          />
          <ControlChip
            label={`SFX ${toPercent(state.settings.sfxVolume)}`}
            onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'sfxVolume', value: clamp01(state.settings.sfxVolume + 0.1) } })}
          />
          <ControlChip
            label={`VIB ${state.settings.vibration ? 'ON' : 'OFF'}`}
            onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'vibration', value: !state.settings.vibration } })}
          />
          <ControlChip
            label={`LANG ${state.settings.language.toUpperCase()}`}
            onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'language', value: state.settings.language === 'en' ? 'ko' : 'en' } })}
          />
          <ControlChip
            label={`LOW FX ${state.settings.lowFxMode ? 'ON' : 'OFF'}`}
            onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'lowFxMode', value: !state.settings.lowFxMode } })}
          />
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
  commandTopRow: {
    flexDirection: 'row',
    gap: 8,
  },
  reactorCoreCard: {
    width: 96,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#53769e',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#122744',
  },
  reactorCoreCardImage: {
    opacity: 0.32,
  },
  reactorCoreGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#54e0ff',
    opacity: 0.2,
  },
  reactorCoreRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#7fe4ff',
    backgroundColor: '#305980',
    opacity: 0.9,
  },
  reactorCoreLabel: {
    position: 'absolute',
    top: 8,
    color: '#cbe8ff',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  commandStatsColumn: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
    borderColor: '#4d7398',
    backgroundColor: '#1a3454',
    color: '#c2e4fb',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statTile: {
    flexGrow: 1,
    minWidth: 72,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 7,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f7398',
  },
  statTileImage: {
    opacity: 0.34,
  },
  statLabel: {
    color: '#aad8ed',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  statValue: {
    color: palette.textMain,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },
  effectMatrix: {
    marginTop: 9,
    borderWidth: 1,
    borderColor: '#4c7095',
    borderRadius: 9,
    backgroundColor: '#162c48',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  effectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  effectLabel: {
    color: '#a3cbe6',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  effectValue: {
    color: '#d3ebff',
    fontSize: 10,
    fontWeight: '900',
  },
  effectTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f7398',
    backgroundColor: '#19314d',
  },
  effectFill: {
    height: '100%',
  },
  effectFillImage: {
    opacity: 0.95,
  },
  tracksInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  trackList: {
    gap: 8,
  },
  trackCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4e739e',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  trackCardImage: {
    opacity: 0.28,
  },
  trackRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#7adfff',
    opacity: 0.65,
  },
  trackTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackName: {
    color: palette.textMain,
    fontSize: 12,
    fontWeight: '900',
  },
  trackLevel: {
    color: '#ffe4b2',
    fontSize: 10,
    fontWeight: '900',
  },
  trackDesc: {
    marginTop: 3,
    color: '#a9cde7',
    fontSize: 10,
    fontWeight: '700',
  },
  trackMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackTagRow: {
    marginTop: 5,
    flexDirection: 'row',
    gap: 6,
  },
  trackTag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#54789f',
    backgroundColor: '#193653',
    color: '#bddbf2',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  trackMeta: {
    color: '#d4ebff',
    fontSize: 9,
    fontWeight: '800',
  },
  trackProgressWrap: {
    marginTop: 6,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4f7398',
    backgroundColor: '#19314d',
  },
  trackProgressFill: {
    height: '100%',
  },
  trackProgressFillImage: {
    opacity: 0.95,
  },
  consoleButton: {
    marginTop: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#5f86ae',
    overflow: 'hidden',
    minHeight: 32,
  },
  consoleButtonPressed: {
    opacity: 0.86,
  },
  consoleButtonDisabled: {
    opacity: 0.45,
  },
  consoleButtonBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  consoleButtonBgImage: {
    opacity: 0.42,
  },
  consoleButtonRail: {
    position: 'absolute',
    left: 6,
    right: 6,
    top: 3,
    height: 2,
    borderRadius: 2,
    backgroundColor: '#5f84ab',
    opacity: 0.5,
  },
  consoleButtonRailActive: {
    backgroundColor: '#7ce2ff',
    opacity: 0.85,
  },
  consoleButtonText: {
    color: '#ddf2ff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  controlsInner: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  controlsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  controlChip: {
    width: '48%',
    minHeight: 36,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#5b82ac',
    overflow: 'hidden',
  },
  controlChipPressed: {
    opacity: 0.84,
  },
  controlChipBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  controlChipBgImage: {
    opacity: 0.36,
  },
  controlChipText: {
    color: '#d5ebff',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
  },
  trackGlyphRoot: {
    width: 34,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackGlyphBarrel: {
    position: 'absolute',
    width: 18,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8ecff',
    top: 6,
    right: 3,
  },
  trackGlyphCore: {
    width: 18,
    height: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d6ecff',
    backgroundColor: '#85b8de',
  },
  trackGlyphPlate: {
    width: 20,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d5ebff',
    backgroundColor: '#628eb7',
  },
  trackGlyphPlateInner: {
    position: 'absolute',
    width: 10,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#d4e9fc',
  },
  trackGlyphMagnetOuter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d5ebff',
    backgroundColor: '#5f8eb2',
  },
  trackGlyphMagnetInner: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdeafe',
  },
});
