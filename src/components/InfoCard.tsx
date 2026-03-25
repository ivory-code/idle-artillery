import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface InfoCardProps {
  title: string;
  subtitle?: string;
  rightLabel?: string;
}

export function InfoCard({ title, subtitle, rightLabel }: InfoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightLabel ? <Text style={styles.rightLabel}>{rightLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panelAlt,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flexShrink: 1,
    paddingRight: 8,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  rightLabel: {
    color: colors.accent,
    fontWeight: '700',
    fontSize: 12,
  },
});
