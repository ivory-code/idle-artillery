import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface PanelCardProps extends PropsWithChildren {
  title?: string;
}

export function PanelCard({ title, children }: PanelCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 15,
  },
});
