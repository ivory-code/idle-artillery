import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { CurrencyBar } from '../components/CurrencyBar';
import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { upgradeTracks } from '../data/upgrades';
import { getUpgradeCost } from '../logic/upgrades';
import { useGame } from '../state/GameProvider';
import { colors } from '../theme/colors';

function toPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function UpgradeScreen() {
  const { state, dispatch } = useGame();

  return (
    <ScreenShell>
      <Text style={styles.title}>Upgrade</Text>
      <CurrencyBar scrap={state.player.scrap} coreBits={state.player.coreBits} />

      <ListPanel
        title="Upgrade Tracks"
        items={upgradeTracks}
        renderItem={(track) => {
          const level = state.upgrades.levels[track.id] || 0;
          const cost = getUpgradeCost(track.id, level);
          const canBuy = state.player.scrap >= cost;

          return (
            <>
              <InfoCard title={track.name} subtitle={`Lv.${level} - ${track.description}`} rightLabel={`Cost ${cost}`} />
              <PixelButton
                label={canBuy ? 'Purchase Upgrade' : 'Not Enough Scrap'}
                onPress={() => dispatch({ type: 'PURCHASE_UPGRADE', payload: { trackId: track.id, cost } })}
                disabled={!canBuy}
              />
            </>
          );
        }}
      />

      <ListPanel
        title="Settings"
        items={[
          { id: 'music' },
          { id: 'sfx' },
          { id: 'vibration' },
          { id: 'language' },
          { id: 'lowfx' },
        ]}
        renderItem={(item) => {
          if (item.id === 'music') {
            return (
              <>
                <InfoCard title="Music Volume" rightLabel={toPercent(state.settings.musicVolume)} />
                <PixelButton label="Music -10%" onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'musicVolume', value: state.settings.musicVolume - 0.1 } })} />
                <PixelButton label="Music +10%" onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'musicVolume', value: state.settings.musicVolume + 0.1 } })} />
              </>
            );
          }

          if (item.id === 'sfx') {
            return (
              <>
                <InfoCard title="SFX Volume" rightLabel={toPercent(state.settings.sfxVolume)} />
                <PixelButton label="SFX -10%" onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'sfxVolume', value: state.settings.sfxVolume - 0.1 } })} />
                <PixelButton label="SFX +10%" onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'sfxVolume', value: state.settings.sfxVolume + 0.1 } })} />
              </>
            );
          }

          if (item.id === 'vibration') {
            return (
              <>
                <InfoCard title="Vibration" rightLabel={state.settings.vibration ? 'On' : 'Off'} />
                <PixelButton
                  label={state.settings.vibration ? 'Turn Off Vibration' : 'Turn On Vibration'}
                  onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'vibration', value: !state.settings.vibration } })}
                />
              </>
            );
          }

          if (item.id === 'language') {
            return (
              <>
                <InfoCard title="Language" rightLabel={state.settings.language.toUpperCase()} />
                <PixelButton
                  label="Toggle Language"
                  onPress={() =>
                    dispatch({
                      type: 'SET_SETTING',
                      payload: { key: 'language', value: state.settings.language === 'en' ? 'ko' : 'en' },
                    })
                  }
                />
              </>
            );
          }

          return (
            <>
              <InfoCard title="Low FX Mode" rightLabel={state.settings.lowFxMode ? 'On' : 'Off'} />
              <PixelButton
                label={state.settings.lowFxMode ? 'Disable Low FX' : 'Enable Low FX'}
                onPress={() => dispatch({ type: 'SET_SETTING', payload: { key: 'lowFxMode', value: !state.settings.lowFxMode } })}
              />
            </>
          );
        }}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
});
