import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { GamePanel } from './GamePanel';
import { palette } from './palette';

function silhouetteStyle(archetype) {
  if (archetype === 'Bulwark') {
    return { width: 34, height: 22, borderRadius: 6, backgroundColor: '#7ca7e2' };
  }
  if (archetype === 'Sharpshot') {
    return { width: 30, height: 14, borderRadius: 4, backgroundColor: '#f6c16c' };
  }
  if (archetype === 'Support') {
    return { width: 26, height: 22, borderRadius: 13, backgroundColor: '#7ce9ca' };
  }
  return { width: 32, height: 18, borderRadius: 5, backgroundColor: '#7bd6ff' };
}

export function MechUnitCard({
  name,
  archetype,
  cost,
  rarity = 'common',
  modules = {},
  unitImageSource,
  panelFrameSource,
  panelBackgroundSource,
  rarityFrameSource,
}) {
  const rarityTone = rarity === 'epic' ? palette.epic : rarity === 'rare' ? palette.rare : palette.textDim;

  return (
    <GamePanel tone="player" style={styles.panel} rightBadge={rarity.toUpperCase()} frameSource={panelFrameSource} backgroundSource={panelBackgroundSource}>
      <View style={styles.top}>
        <View style={styles.silhouetteBox}>
          {unitImageSource ? (
            <Image source={unitImageSource} style={styles.unitImage} resizeMode="contain" />
          ) : (
            <>
              <View style={[styles.silhouette, silhouetteStyle(archetype)]} />
              <View style={styles.legs} />
            </>
          )}
          {rarityFrameSource ? <Image source={rarityFrameSource} style={styles.rarityFrame} resizeMode="stretch" /> : null}
        </View>
        <View style={styles.meta}>
          <Text numberOfLines={1} style={styles.name}>
            {name}
          </Text>
          <Text style={[styles.arch, { color: rarityTone }]}>{archetype}</Text>
          <Text style={styles.cost}>{cost} WATT</Text>
        </View>
      </View>

      <View style={styles.modules}>
        <Text style={styles.mod}>W {modules.weapon || 'Stock'}</Text>
        <Text style={styles.mod}>B {modules.body || 'Stock'}</Text>
        <Text style={styles.mod}>M {modules.mobility || 'Stock'}</Text>
        <Text style={styles.mod}>C {modules.core || 'Stock'}</Text>
      </View>
    </GamePanel>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginBottom: 0,
  },
  top: {
    flexDirection: 'row',
    gap: 10,
  },
  silhouetteBox: {
    position: 'relative',
    overflow: 'hidden',
    width: 58,
    height: 50,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#56719a',
    backgroundColor: '#101f3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouette: {
    borderWidth: 1,
    borderColor: '#d5ebff',
  },
  unitImage: {
    width: '100%',
    height: '100%',
  },
  rarityFrame: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.38,
  },
  legs: {
    width: 18,
    height: 6,
    borderRadius: 2,
    backgroundColor: '#c2d8ef',
    marginTop: 4,
  },
  meta: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    color: palette.textMain,
    fontSize: 12,
    fontWeight: '900',
  },
  arch: {
    fontSize: 10,
    fontWeight: '800',
  },
  cost: {
    color: palette.warning,
    fontSize: 10,
    fontWeight: '900',
  },
  modules: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#3a547d',
    paddingTop: 7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  mod: {
    color: palette.textDim,
    fontSize: 9,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#48658e',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#162b4b',
  },
});
