import React from 'react';
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ASSET_KEYS, getDeployButtonSkins, getUiAsset, getUnitAsset } from '../../assets';
import { DeploymentButton } from '../game-ui/DeploymentButton';

const DEPLOY_BUTTON_SKINS = getDeployButtonSkins();

interface ProductionConsoleProps {
  runtime: any;
  templates: any[];
  isLandscape: boolean;
  onDeploy: (templateId: string) => void;
  onReset: () => void;
}

export function ProductionConsole({ runtime, templates, isLandscape, onDeploy, onReset }: ProductionConsoleProps) {
  const wattRatio = runtime.wattMax > 0 ? runtime.watt / runtime.wattMax : 0;

  return (
    <ImageBackground source={getUiAsset(ASSET_KEYS.ui.deployBar)} resizeMode="stretch" style={[styles.root, isLandscape ? styles.rootLandscape : styles.rootPortrait]} imageStyle={styles.rootImage}>
      <View style={styles.topRow}>
        <View style={styles.wattBox}>
          <View style={styles.wattHead}>
            <Text style={styles.wattLabel}>PRODUCTION WATT</Text>
            <Text style={styles.wattValue}>
              {Math.round(runtime.watt)} / {runtime.wattMax}
            </Text>
          </View>
          <View style={styles.wattTrack}>
            <ImageBackground source={getUiAsset(ASSET_KEYS.ui.wattPanel)} resizeMode="stretch" style={[styles.wattFill, { width: `${Math.max(5, Math.round(wattRatio * 100))}%` }]} imageStyle={styles.wattFillImage} />
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoChip}>K:{runtime.stats.kills}</Text>
          <Text style={styles.infoChip}>DEP:{runtime.stats.deployed}</Text>
          <Text style={styles.infoChip}>W:{runtime.wave}</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deployRow}>
        {templates.map((template: any) => (
          <View key={template.id} style={[styles.deployCol, isLandscape ? styles.deployColLandscape : null]}>
            <DeploymentButton
              name={template.name}
              role={template.role}
              cost={template.cost}
              cooldownSec={runtime.deployCooldowns[template.id] || 0}
              availableWatt={runtime.watt}
              onPress={() => onDeploy(template.id)}
              skinSources={DEPLOY_BUTTON_SKINS}
              iconSource={getUnitAsset({ team: 'ally', archetype: template.archetype })}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.supportBtn}>
          <Text style={styles.supportBtnText}>SUPPORT</Text>
        </Pressable>
        <Pressable style={styles.resetBtn} onPress={onReset}>
          <Text style={styles.resetBtnText}>RESET RUN</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: 2,
    borderColor: '#3d5674',
    backgroundColor: '#101f32',
    paddingTop: 7,
    paddingBottom: 7,
    paddingHorizontal: 10,
  },
  rootLandscape: {
    minHeight: 154,
    maxHeight: 170,
  },
  rootPortrait: {
    minHeight: 198,
  },
  rootImage: {
    opacity: 0.18,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 7,
  },
  wattBox: {
    flex: 1,
  },
  wattHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  wattLabel: {
    color: '#9bc1dd',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.35,
  },
  wattValue: {
    color: '#d4e9ff',
    fontSize: 10,
    fontWeight: '900',
  },
  wattTrack: {
    height: 10,
    borderWidth: 1,
    borderColor: '#4a678a',
    backgroundColor: '#101f33',
    overflow: 'hidden',
    borderRadius: 1,
  },
  wattFill: {
    height: '100%',
  },
  wattFillImage: {
    opacity: 0.95,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 6,
  },
  infoChip: {
    minWidth: 54,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#4d6b8e',
    backgroundColor: '#162f49',
    color: '#d8edff',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  deployRow: {
    gap: 7,
    paddingRight: 6,
  },
  deployCol: {
    width: 196,
  },
  deployColLandscape: {
    width: 210,
  },
  footer: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 8,
  },
  supportBtn: {
    flex: 1,
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#5ca8cb',
    backgroundColor: '#1b3c59',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportBtnText: {
    color: '#c8e7fb',
    fontSize: 9,
    fontWeight: '900',
  },
  resetBtn: {
    minWidth: 92,
    minHeight: 30,
    borderWidth: 1,
    borderColor: '#7788a7',
    backgroundColor: '#243a56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    color: '#c4d7ec',
    fontSize: 9,
    fontWeight: '900',
  },
});
