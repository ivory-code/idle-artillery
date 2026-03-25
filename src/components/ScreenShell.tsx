import React, { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { colors } from '../theme/colors';

interface ScreenShellProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenShell({ children, scroll = true, contentStyle }: ScreenShellProps) {
  const body = <View style={[styles.content, contentStyle]}>{children}</View>;

  return <SafeAreaView style={styles.safeArea}>{scroll ? <ScrollView contentContainerStyle={styles.scrollContent}>{body}</ScrollView> : body}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
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
