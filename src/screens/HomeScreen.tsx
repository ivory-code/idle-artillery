import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { RootStackParamList } from '../navigation/routes';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const flowSteps = [
  { id: 'home_step_1', title: '1) Home', subtitle: 'Entry and quick context' },
  { id: 'home_step_2', title: '2) Hangar', subtitle: 'Currencies and squad snapshot' },
  { id: 'home_step_3', title: '3) Assembly', subtitle: 'Part slot decisions and stat identity' },
  { id: 'home_step_4', title: '4) Squad', subtitle: 'Slot order and formation style' },
  { id: 'home_step_5', title: '5) Battle/Result', subtitle: 'Auto-battle preview and payout' },
  { id: 'home_step_6', title: '6) Upgrade', subtitle: 'Global progression tracks' },
];

export function HomeScreen({ navigation }: Props) {
  return (
    <ScreenShell>
      <Text style={styles.title}>Tiny Barrage Workshop</Text>
      <Text style={styles.subtitle}>TypeScript MVP shell with original mock data</Text>

      <ListPanel
        title="Flow"
        items={flowSteps}
        renderItem={(item) => (
          <Text style={styles.stepText}>
            {item.title} - {item.subtitle}
          </Text>
        )}
      />

      <PixelButton label="Enter Hangar" onPress={() => navigation.replace('Hangar')} tone="success" />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.accent,
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '700',
  },
  stepText: {
    color: colors.textDim,
    lineHeight: 18,
  },
});
