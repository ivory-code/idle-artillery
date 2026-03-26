import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ASSET_KEYS, getDeployButtonSkins, getUiAsset, getUnitAsset } from '../assets';
import { BattleTopHUD } from '../components/game-ui/BattleTopHUD';
import { DeploymentButton } from '../components/game-ui/DeploymentButton';
import { GamePanel } from '../components/game-ui/GamePanel';
import { MechUnitCard } from '../components/game-ui/MechUnitCard';
import { ResultRewardCard } from '../components/game-ui/ResultRewardCard';
import { palette } from '../components/game-ui/palette';

const deployButtonSkins = getDeployButtonSkins();

function toUnitArchetype(role) {
  if (role === 'Support') return 'support';
  return 'artillery';
}

const mockUnits = [
  {
    id: 'u1',
    name: 'Mint Bastion',
    archetype: 'Bulwark',
    rarity: 'rare',
    cost: 26,
    modules: { weapon: 'Guard Barrel', body: 'Titan Hull', mobility: 'Grip Treads', core: 'Aegis Core' },
  },
  {
    id: 'u2',
    name: 'Petal Rail',
    archetype: 'Sharpshot',
    rarity: 'epic',
    cost: 34,
    modules: { weapon: 'Rail Lance', body: 'Needle Chassis', mobility: 'Slide Legs', core: 'Focus Core' },
  },
  {
    id: 'u3',
    name: 'Spark Volley',
    archetype: 'Barrage',
    rarity: 'common',
    cost: 20,
    modules: { weapon: 'Burst Barrel', body: 'Light Hull', mobility: 'Dash Wheels', core: 'Tempo Core' },
  },
];

export function GameUIShowcaseScreen() {
  const [watt, setWatt] = useState(72);
  const [cooldowns, setCooldowns] = useState({ u1: 0, u2: 2.3, u3: 0 });

  const onDeploy = (id, cost) => {
    if (watt < cost) return;
    setWatt((prev) => prev - cost);
    setCooldowns((prev) => ({ ...prev, [id]: 2.4 }));
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <BattleTopHUD wave={4} timeLeftSec={183} watt={watt} wattMax={120} wattRegen={7.5} baseHp={1170} baseMaxHp={1600} threat="spike" />

        <GamePanel
          title="Deploy Control"
          rightBadge="MANUAL"
          frameSource={getUiAsset(ASSET_KEYS.ui.hudTopFrame)}
          backgroundSource={getUiAsset(ASSET_KEYS.ui.hudFrames)}
        >
          <View style={styles.deployRow}>
            {mockUnits.map((unit) => (
              <View key={unit.id} style={styles.deployCol}>
                <DeploymentButton
                  name={unit.name}
                  role={unit.archetype}
                  cost={unit.cost}
                  cooldownSec={cooldowns[unit.id] || 0}
                  availableWatt={watt}
                  onPress={() => onDeploy(unit.id, unit.cost)}
                  skinSources={deployButtonSkins}
                  iconSource={getUnitAsset({ team: 'ally', archetype: toUnitArchetype(unit.archetype) })}
                />
              </View>
            ))}
          </View>
        </GamePanel>

        <GamePanel title="Unit Cards" rightBadge="ASSEMBLY" frameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)} backgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}>
          <View style={styles.cardRow}>
            {mockUnits.map((unit) => (
              <View key={`card_${unit.id}`} style={styles.cardCol}>
                <MechUnitCard
                  name={unit.name}
                  archetype={unit.archetype}
                  cost={unit.cost}
                  rarity={unit.rarity}
                  modules={unit.modules}
                  unitImageSource={getUnitAsset({ team: 'ally', archetype: toUnitArchetype(unit.archetype) })}
                  panelFrameSource={getUiAsset(ASSET_KEYS.ui.unitCardFrame)}
                  panelBackgroundSource={getUiAsset(ASSET_KEYS.ui.assemblyConsoleMain)}
                  rarityFrameSource={unit.rarity === 'rare' || unit.rarity === 'epic' ? getUiAsset(ASSET_KEYS.ui.rarityRare) : getUiAsset(ASSET_KEYS.ui.rarityCommon)}
                />
              </View>
            ))}
          </View>
        </GamePanel>

        <ResultRewardCard result="Victory" score={2340} scrap={190} coreBits={4} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    padding: 12,
    gap: 10,
    paddingBottom: 20,
  },
  deployRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  deployCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
  cardRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  cardCol: {
    flex: 1,
    paddingHorizontal: 4,
  },
});
