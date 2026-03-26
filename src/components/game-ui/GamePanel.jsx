import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function GamePanel({ title, rightBadge, children, tone = 'default', style }) {
  const toneStyle = tone === 'enemy' ? styles.enemyTone : tone === 'player' ? styles.playerTone : null;

  return (
    <View style={[styles.outer, toneStyle, style]}>
      <View style={styles.inner}>
        {(title || rightBadge) && (
          <View style={styles.header}>
            {title ? <Text style={styles.title}>{title}</Text> : <View />}
            {rightBadge ? <Text style={styles.badge}>{rightBadge}</Text> : null}
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: palette.frameOuter,
    padding: 2,
    backgroundColor: '#0c162a',
  },
  inner: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: palette.frameInner,
    backgroundColor: palette.panel,
    padding: 10,
  },
  playerTone: {
    borderColor: '#57b9c8',
  },
  enemyTone: {
    borderColor: '#c87558',
  },
  header: {
    minHeight: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: palette.textMain,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  badge: {
    color: palette.warning,
    fontSize: 10,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: palette.warning,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
});
