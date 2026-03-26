import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

function roleTone(role) {
  if (role === 'Bulwark') return '#6da9ff';
  if (role === 'Sharpshot') return '#ffd27b';
  if (role === 'Support') return '#7ff2bf';
  return '#8de0ff';
}

export function DeploymentButton({ name, role, cost, cooldownSec = 0, availableWatt, onPress, skinSources, iconSource }) {
  const canUse = availableWatt >= cost && cooldownSec <= 0;
  const tone = roleTone(role);

  return (
    <Pressable onPress={onPress} disabled={!canUse}>
      {({ pressed }) => {
        const skinSource = !canUse ? skinSources?.disabled : pressed ? skinSources?.active || skinSources?.normal : skinSources?.normal;
        const outerStyle = [styles.outer, { borderColor: canUse ? tone : '#4a5b77' }, pressed && canUse ? styles.pressed : null, !canUse ? styles.locked : null];
        const content = (
          <>
            <View style={[styles.topAccent, { backgroundColor: tone, opacity: canUse ? 0.55 : 0.22 }]} />
            <View style={styles.top}>
              <View style={styles.nameRow}>
                {iconSource ? (
                  <View style={[styles.iconPlate, { borderColor: tone }]}>
                    <Image source={iconSource} style={styles.icon} resizeMode="contain" />
                  </View>
                ) : null}
                <Text numberOfLines={1} style={styles.name}>
                  {name}
                </Text>
              </View>
              <Text style={[styles.cost, { color: canUse ? palette.warning : palette.textDim }]}>{cost}W</Text>
            </View>
            <View style={styles.badges}>
              <Text style={[styles.role, { borderColor: tone, color: tone }]}>{role}</Text>
              {cooldownSec > 0 ? <Text style={styles.cooldown}>CD {cooldownSec.toFixed(1)}</Text> : <Text style={styles.ready}>READY</Text>}
            </View>
          </>
        );

        if (skinSource) {
          return (
            <ImageBackground source={skinSource} resizeMode="stretch" style={outerStyle} imageStyle={styles.skinImage}>
              {content}
            </ImageBackground>
          );
        }

        return <View style={outerStyle}>{content}</View>;
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    minHeight: 76,
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: '#1a2e52',
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  pressed: {
    opacity: 0.82,
  },
  locked: {
    opacity: 0.52,
  },
  topAccent: {
    height: 2,
    borderRadius: 2,
    marginBottom: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 6,
  },
  iconPlate: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#132843',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    borderRadius: 3,
  },
  name: {
    color: palette.textMain,
    fontWeight: '900',
    fontSize: 13,
    flex: 1,
  },
  cost: {
    fontWeight: '900',
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  role: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 9,
    fontWeight: '900',
  },
  cooldown: {
    color: palette.enemyB,
    fontSize: 10,
    fontWeight: '900',
  },
  ready: {
    color: palette.good,
    fontSize: 10,
    fontWeight: '900',
  },
  skinImage: {
    borderRadius: 10,
    opacity: 0.52,
  },
});
