import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

function roleTone(role) {
  if (role === 'Bulwark') return '#6da9ff';
  if (role === 'Sharpshot') return '#ffd27b';
  if (role === 'Support') return '#7ff2bf';
  return '#8de0ff';
}

export function DeploymentButton({ name, role, cost, cooldownSec = 0, availableWatt, onPress }) {
  const canUse = availableWatt >= cost && cooldownSec <= 0;
  const tone = roleTone(role);

  return (
    <Pressable onPress={onPress} disabled={!canUse} style={({ pressed }) => [styles.outer, { borderColor: canUse ? tone : '#4a5b77' }, pressed && canUse ? styles.pressed : null, !canUse ? styles.locked : null]}>
      <View style={styles.top}>
        <Text numberOfLines={1} style={styles.name}>
          {name}
        </Text>
        <Text style={[styles.cost, { color: canUse ? palette.warning : palette.textDim }]}>{cost}W</Text>
      </View>
      <View style={styles.badges}>
        <Text style={[styles.role, { borderColor: tone, color: tone }]}>{role}</Text>
        {cooldownSec > 0 ? <Text style={styles.cooldown}>CD {cooldownSec.toFixed(1)}</Text> : <Text style={styles.ready}>READY</Text>}
      </View>
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
    opacity: 0.48,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    color: palette.textMain,
    fontWeight: '900',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  cost: {
    fontWeight: '900',
    fontSize: 12,
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
});
