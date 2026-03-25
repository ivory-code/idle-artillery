import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface StatRowProps {
  label: string;
  value: string | number;
  valueColor?: string;
}

export function StatRow({ label, value, valueColor = colors.text }: StatRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: colors.textDim,
    fontSize: 13,
  },
  value: {
    fontWeight: '700',
    fontSize: 13,
  },
});
