import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface DeployTemplate {
  id: string;
  name: string;
  role: string;
  cost: number;
  modules: {
    weapon: string;
    body: string;
    mobility: string;
    core: string;
  };
}

interface DeployTrayProps {
  templates: DeployTemplate[];
  currentWatt: number;
  cooldowns: Record<string, number>;
  onDeploy: (templateId: string) => void;
}

export function DeployTray({ templates, currentWatt, cooldowns, onDeploy }: DeployTrayProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Deploy Queue</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {templates.map((template) => {
          const cooldown = cooldowns[template.id] || 0;
          const canDeploy = currentWatt >= template.cost && cooldown <= 0;

          return (
            <Pressable key={template.id} disabled={!canDeploy} onPress={() => onDeploy(template.id)} style={[styles.card, canDeploy ? styles.cardOn : styles.cardOff]}>
              <View style={styles.cardTop}>
                <Text numberOfLines={1} style={styles.name}>
                  {template.name}
                </Text>
                <Text style={styles.cost}>{template.cost}W</Text>
              </View>

              <Text style={styles.role}>{template.role}</Text>
              <Text numberOfLines={1} style={styles.module}>
                W {template.modules.weapon}
              </Text>
              <Text numberOfLines={1} style={styles.module}>
                B {template.modules.body}
              </Text>
              <Text numberOfLines={1} style={styles.module}>
                M {template.modules.mobility}
              </Text>
              <Text numberOfLines={1} style={styles.module}>
                C {template.modules.core}
              </Text>
              {cooldown > 0 ? <Text style={styles.cooldown}>CD {cooldown.toFixed(1)}s</Text> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    padding: 10,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '800',
    marginBottom: 8,
  },
  row: {
    gap: 8,
  },
  card: {
    width: 154,
    borderRadius: 12,
    borderWidth: 2,
    padding: 8,
    minHeight: 124,
  },
  cardOn: {
    borderColor: colors.accent2,
    backgroundColor: '#173945',
  },
  cardOff: {
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    opacity: 0.55,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 12,
    flex: 1,
    marginRight: 4,
  },
  cost: {
    color: colors.warning,
    fontWeight: '800',
    fontSize: 12,
  },
  role: {
    marginTop: 4,
    color: colors.textDim,
    fontSize: 10,
    fontWeight: '700',
  },
  module: {
    marginTop: 3,
    color: colors.textDim,
    fontSize: 10,
  },
  cooldown: {
    marginTop: 6,
    color: colors.bad,
    fontSize: 10,
    fontWeight: '800',
  },
});
