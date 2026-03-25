import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface CurrencyBarProps {
  scrap: number;
  coreBits: number;
}

export function CurrencyBar({ scrap, coreBits }: CurrencyBarProps) {
  return (
    <View style={styles.row}>
      <View style={styles.pill}>
        <Text style={styles.label}>Scrap</Text>
        <Text style={styles.value}>{scrap}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.label}>Core Bits</Text>
        <Text style={styles.value}>{coreBits}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    borderRadius: 8,
    padding: 8,
  },
  label: {
    color: colors.textDim,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14,
    marginTop: 2,
  },
});
