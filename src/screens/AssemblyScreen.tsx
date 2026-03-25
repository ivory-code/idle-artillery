import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { InfoCard } from '../components/InfoCard';
import { ListPanel } from '../components/ListPanel';
import { PixelButton } from '../components/PixelButton';
import { ScreenShell } from '../components/ScreenShell';
import { StatCompareTable } from '../components/StatCompareTable';
import { partMap, partSlots, parts } from '../data/parts';
import { unitMap } from '../data/units';
import { buildAssemblyPreview } from '../logic/assembly';
import { getPartUpgradeCost, getUpgradeEffects } from '../logic/upgrades';
import { useGame } from '../state/GameProvider';
import { getBuildArray } from '../state/selectors';
import { colors } from '../theme/colors';

export function AssemblyScreen() {
  const { state, dispatch } = useGame();
  const buildList = getBuildArray(state);
  const [activeBuildId, setActiveBuildId] = useState<string>(buildList[0]?.id || '');

  const build = state.builds[activeBuildId];
  const unit = build ? unitMap[build.unitId] : null;

  const preview = useMemo(() => {
    if (!build) return null;
    return buildAssemblyPreview({
      build,
      partLevels: state.collection.partLevels,
      globalEffects: getUpgradeEffects(state.upgrades.levels),
    });
  }, [build, state.collection.partLevels, state.upgrades.levels]);

  if (!build || !unit || !preview) {
    return (
      <ScreenShell>
        <Text style={styles.title}>Assembly</Text>
        <Text style={styles.info}>No build found.</Text>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <Text style={styles.title}>Assembly</Text>

      <ListPanel
        title="Build Selector"
        items={buildList}
        renderItem={(item) => {
          const itemUnit = unitMap[item.unitId];
          return (
            <View>
              <InfoCard title={item.id} subtitle={itemUnit?.name || item.unitId} rightLabel={item.id === activeBuildId ? 'Active' : ''} />
              <PixelButton label={`Use ${item.id}`} onPress={() => setActiveBuildId(item.id)} />
            </View>
          );
        }}
      />

      <ListPanel
        title="Slot Meaning"
        items={partSlots}
        renderItem={(slotInfo) => (
          <InfoCard title={`${slotInfo.name} (${slotInfo.id})`} subtitle={`${slotInfo.affects.join(', ')} - ${slotInfo.description}`} />
        )}
      />

      <ListPanel
        title={`Parts on ${unit.name}`}
        items={partSlots}
        renderItem={(slotInfo) => {
          const currentPartId = build.slots[slotInfo.id];
          const currentPart = currentPartId ? partMap[currentPartId] : null;
          const currentPartLevel = currentPart ? state.collection.partLevels[currentPart.id] || 0 : 0;
          const nextPartUpgradeCost = currentPart ? getPartUpgradeCost(currentPartLevel) : 0;

          return (
            <View style={styles.slotBlock}>
              <InfoCard
                title={`${slotInfo.name}: ${currentPart ? currentPart.name : 'Empty'}`}
                subtitle={currentPart ? `${currentPart.rarity.toUpperCase()} · Lv.${currentPartLevel} · ${currentPart.slotEffects.join(', ')}` : 'No part equipped'}
              />

              {currentPart ? (
                <PixelButton
                  label={`Upgrade Part (Cost ${nextPartUpgradeCost})`}
                  onPress={() => dispatch({ type: 'UPGRADE_PART', payload: { partId: currentPart.id, cost: nextPartUpgradeCost } })}
                  disabled={state.player.scrap < nextPartUpgradeCost}
                  tone="success"
                />
              ) : null}

              <View style={styles.rowWrap}>
                <PixelButton
                  label="Unequip"
                  onPress={() => dispatch({ type: 'EQUIP_PART', payload: { buildId: build.id, slot: slotInfo.id, partId: null } })}
                  style={styles.smallBtn}
                />

                {parts
                  .filter((part) => part.slot === slotInfo.id)
                  .map((part) => (
                    <PixelButton
                      key={`${slotInfo.id}_${part.id}`}
                      label={`${part.name} (${part.rarity})`}
                      onPress={() => dispatch({ type: 'EQUIP_PART', payload: { buildId: build.id, slot: slotInfo.id, partId: part.id } })}
                      style={styles.smallBtn}
                    />
                  ))}
              </View>
            </View>
          );
        }}
      />

      <ListPanel
        title="Before -> Assembled"
        items={[{ id: 'preview' }]}
        renderItem={() => (
          <View>
            <InfoCard title={`Role Identity: ${preview.roleIdentity}`} subtitle={`Power: ${preview.power}`} rightLabel="Auto-updates" />
            <StatCompareTable baseStats={preview.baseStats} assembledStats={preview.assembledStats} statDelta={preview.statDelta} />
          </View>
        )}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  info: {
    color: colors.textDim,
  },
  slotBlock: {
    marginBottom: 10,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  smallBtn: {
    marginRight: 6,
  },
});
