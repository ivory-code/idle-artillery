import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation/RootNavigator';
import { GameProvider } from './src/state/GameProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <RootNavigator />
        <StatusBar style="light" />
      </GameProvider>
    </SafeAreaProvider>
  );
}
