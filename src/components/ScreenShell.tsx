import React, { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

interface ScreenShellProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenShell({ children, scroll = true, contentStyle }: ScreenShellProps) {
  const body = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View pointerEvents="none" style={styles.bgLayer}>
        <View style={[styles.orb, styles.orbA]} />
        <View style={[styles.orb, styles.orbB]} />
      </View>
      {scroll ? <ScrollView contentContainerStyle={styles.scrollContent}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: colors.bgMid,
    opacity: 0.4,
  },
  orbA: {
    width: 260,
    height: 260,
    top: -120,
    right: -90,
  },
  orbB: {
    width: 190,
    height: 190,
    bottom: -80,
    left: -70,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.bg,
  },
});
