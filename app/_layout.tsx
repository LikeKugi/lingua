import React, {useEffect} from 'react';
import {Stack} from 'expo-router';
import {StatusBar} from 'expo-status-bar';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {View} from 'react-native';
import {useSettingsStore} from '../src/store/settingsStore';
import {colors} from '../src/theme';

function RouterRoot() {
  const insets = useSafeAreaInsets();
  const hydrateApiKey = useSettingsStore(state => state.hydrateApiKey);

  useEffect(() => {
    void hydrateApiKey();
  }, [hydrateApiKey]);

  return (
    <View style={{flex: 1, paddingTop: insets.top, backgroundColor: colors.paper}}>
      <StatusBar style="dark" />
      <Stack screenOptions={{headerShown: false}} />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RouterRoot />
    </SafeAreaProvider>
  );
}
