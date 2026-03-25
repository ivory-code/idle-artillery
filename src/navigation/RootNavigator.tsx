import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import { RootStackParamList } from './routes';
import { AssemblyScreen } from '../screens/AssemblyScreen';
import { BattleScreen } from '../screens/BattleScreen';
import { HangarScreen } from '../screens/HangarScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { SquadScreen } from '../screens/SquadScreen';
import { UpgradeScreen } from '../screens/UpgradeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        id="root-stack"
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#111f36' },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Hangar" component={HangarScreen} />
        <Stack.Screen name="Assembly" component={AssemblyScreen} />
        <Stack.Screen name="Squad" component={SquadScreen} />
        <Stack.Screen name="Battle" component={BattleScreen} />
        <Stack.Screen name="Upgrade" component={UpgradeScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
