import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function formatTime(sec: number): string {
  const time = Math.max(0, Math.floor(sec));
  const min = Math.floor(time / 60);
  const rem = time % 60;
  return `${String(min).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

function HudCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function MeterCell({
  label,
  value,
  ratio,
  fillColor,
}: {
  label: string;
  value: string;
  ratio: number;
  fillColor: string;
}) {
  return (
    <View style={styles.meterCell}>
      <View style={styles.meterHead}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.valueSmall}>{value}</Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${Math.max(5, Math.round(clamp01(ratio) * 100))}%`, backgroundColor: fillColor }]} />
      </View>
    </View>
  );
}

interface BattleHUDProps {
  wave: number;
  timeLeftSec: number;
  watt: number;
  wattMax: number;
  baseHp: number;
  baseMaxHp: number;
}

export function BattleHUD({ wave, timeLeftSec, watt, wattMax, baseHp, baseMaxHp }: BattleHUDProps) {
  const wattRatio = wattMax > 0 ? watt / wattMax : 0;
  const baseRatio = baseMaxHp > 0 ? baseHp / baseMaxHp : 0;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <View style={styles.strip}>
        <HudCell label="TIME" value={formatTime(timeLeftSec)} />
        <HudCell label="WAVE" value={`${wave}`} />
        <MeterCell label="WATT" value={`${Math.round(watt)}/${wattMax}`} ratio={wattRatio} fillColor="#6fe7ff" />
        <MeterCell label="BASE HP" value={`${Math.max(0, Math.round(baseHp))}/${baseMaxHp}`} ratio={baseRatio} fillColor="#8bf3b4" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 5,
    left: 6,
    right: 6,
    zIndex: 20,
  },
  strip: {
    minHeight: 44,
    borderWidth: 2,
    borderColor: '#4a6587',
    backgroundColor: 'rgba(8, 16, 28, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cell: {
    minWidth: 56,
    borderWidth: 1,
    borderColor: '#486384',
    backgroundColor: 'rgba(17, 37, 58, 0.86)',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  label: {
    color: '#9ebfd9',
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  value: {
    marginTop: 0,
    color: '#e7f4ff',
    fontSize: 11,
    fontWeight: '900',
  },
  valueSmall: {
    color: '#dff0ff',
    fontSize: 8,
    fontWeight: '900',
  },
  meterCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#486384',
    backgroundColor: 'rgba(17, 37, 58, 0.86)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 90,
  },
  meterHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    gap: 6,
  },
  meterTrack: {
    height: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#445f80',
    backgroundColor: '#112237',
  },
  meterFill: {
    height: '100%',
  },
});
