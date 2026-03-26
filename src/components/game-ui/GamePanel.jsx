import React from 'react';
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native';

import { palette } from './palette';

export function GamePanel({
  title = '',
  rightBadge = '',
  children = null,
  tone = 'default',
  style = null,
  frameSource = null,
  backgroundSource = null,
  innerStyle = null,
  backgroundOpacity = 0.35,
  frameOpacity = 0.45,
}) {
  const toneStyle = tone === 'enemy' ? styles.enemyTone : tone === 'player' ? styles.playerTone : null;
  const body = (
    <>
      {(title || rightBadge) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {rightBadge ? <Text style={styles.badge}>{rightBadge}</Text> : null}
        </View>
      )}
      {children}
    </>
  );

  return (
    <View style={[styles.outer, toneStyle, style]}>
      {backgroundSource ? (
        <ImageBackground source={backgroundSource} resizeMode="stretch" style={[styles.inner, innerStyle]} imageStyle={[styles.innerBackground, { opacity: backgroundOpacity }]}>
          {body}
        </ImageBackground>
      ) : (
        <View style={[styles.inner, innerStyle]}>{body}</View>
      )}
      {frameSource ? <Image source={frameSource} style={[styles.frameOverlay, { opacity: frameOpacity }]} resizeMode="stretch" pointerEvents="none" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'relative',
    overflow: 'hidden',
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
  innerBackground: {
    opacity: 0.35,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
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
