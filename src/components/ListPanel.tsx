import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { PanelCard } from './PanelCard';

interface ListPanelProps<T extends { id: string }> {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyLabel?: string;
}

export function ListPanel<T extends { id: string }>({ title, items, renderItem, emptyLabel = 'No items' }: ListPanelProps<T>) {
  return (
    <PanelCard title={title}>
      {items.length === 0 ? <Text style={styles.empty}>{emptyLabel}</Text> : null}
      {items.map((item, index) => (
        <View key={item.id || `${title}_${index}`} style={styles.rowWrap}>
          {renderItem(item, index)}
        </View>
      ))}
    </PanelCard>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    marginBottom: 8,
  },
  empty: {
    color: colors.textDim,
  },
});
