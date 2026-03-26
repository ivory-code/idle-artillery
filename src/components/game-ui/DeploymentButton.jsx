import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

function roleTone(role) {
  if (role === 'Bulwark') return '#6da9ff';
  if (role === 'Sharpshot') return '#ffd27b';
  if (role === 'Support') return '#7ff2bf';
  return '#8de0ff';
}

export function DeploymentButton({ name, role, cost, cooldownSec = 0, availableWatt, onPress, iconSource }) {
  const canUse = availableWatt >= cost && cooldownSec <= 0;
  const tone = roleTone(role);

  return (
    <Pressable onPress={onPress} disabled={!canUse}>
      {({ pressed }) => {
        const outerStyle = [styles.outer, { borderColor: canUse ? tone : '#4a5b77' }, pressed && canUse ? styles.pressed : null, !canUse ? styles.locked : null];
        return (
          <View style={outerStyle}>
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
              {cooldownSec > 0 ? <Text style={styles.cooldown}>CD {cooldownSec.toFixed(1)}</Text> : <Text style={styles.ready}>RDY</Text>}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outer: {
    minHeight: 72,
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: '#162a45',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.82,
  },
  locked: {
    opacity: 0.52,
  },
  topAccent: {
    height: 2,
    marginBottom: 5,
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
    gap: 5,
  },
  iconPlate: {
    width: 22,
    height: 22,
    borderWidth: 1,
    backgroundColor: '#13243a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 17,
    height: 17,
  },
  name: {
    color: palette.textMain,
    fontWeight: '900',
    fontSize: 12,
    flex: 1,
  },
  cost: {
    fontWeight: '900',
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  role: {
    borderWidth: 1,
    borderRadius: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 8,
    fontWeight: '900',
  },
  cooldown: {
    color: palette.enemyB,
    fontSize: 9,
    fontWeight: '900',
  },
  ready: {
    color: palette.good,
    fontSize: 9,
    fontWeight: '900',
  },
});
