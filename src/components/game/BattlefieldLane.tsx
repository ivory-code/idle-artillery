import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';

interface BattleEntity {
  id: string;
  team: 'ally' | 'enemy';
  x: number;
  hp: number;
  maxHp: number;
}

interface BattlefieldLaneProps {
  entities: BattleEntity[];
  baseHp: number;
  baseMaxHp: number;
}

export function BattlefieldLane({ entities, baseHp, baseMaxHp }: BattlefieldLaneProps) {
  const baseRatio = baseMaxHp > 0 ? Math.max(0, Math.min(1, baseHp / baseMaxHp)) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.baseBox}>
        <Text style={styles.baseLabel}>BASE</Text>
        <View style={styles.baseHpTrack}>
          <View style={[styles.baseHpFill, { width: `${baseRatio * 100}%` }]} />
        </View>
      </View>

      <View style={styles.spawnGate}>
        <Text style={styles.gateText}>ENEMY</Text>
      </View>

      {entities.map((entity) => {
        const hpRatio = entity.maxHp > 0 ? Math.max(0, Math.min(1, entity.hp / entity.maxHp)) : 0;
        return (
          <View key={entity.id} style={[styles.unit, { left: `${entity.x * 100}%` }, entity.team === 'ally' ? styles.ally : styles.enemy]}>
            <View style={styles.unitHpTrack}>
              <View style={[styles.unitHpFill, { width: `${hpRatio * 100}%`, backgroundColor: entity.team === 'ally' ? colors.good : colors.bad }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 190,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panelAlt,
    marginBottom: 10,
    overflow: 'hidden',
  },
  baseBox: {
    position: 'absolute',
    left: 8,
    top: 56,
    width: 54,
    height: 78,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.accent2,
    backgroundColor: '#183849',
    padding: 6,
    justifyContent: 'space-between',
    zIndex: 5,
  },
  baseLabel: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 10,
    textAlign: 'center',
  },
  baseHpTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.bgDeep,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  baseHpFill: {
    height: '100%',
    backgroundColor: colors.good,
  },
  spawnGate: {
    position: 'absolute',
    right: 8,
    top: 56,
    width: 52,
    height: 78,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: '#42342b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  gateText: {
    color: colors.warning,
    fontWeight: '800',
    fontSize: 10,
    textAlign: 'center',
  },
  unit: {
    position: 'absolute',
    top: 80,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    zIndex: 10,
  },
  ally: {
    backgroundColor: '#3b8ed1',
    borderColor: '#a6d8ff',
  },
  enemy: {
    backgroundColor: '#d76e6e',
    borderColor: '#ffd3d3',
  },
  unitHpTrack: {
    position: 'absolute',
    left: -2,
    right: -2,
    top: -6,
    height: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgDeep,
    overflow: 'hidden',
  },
  unitHpFill: {
    height: '100%',
  },
});
