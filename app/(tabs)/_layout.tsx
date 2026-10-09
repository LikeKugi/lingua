import React from 'react';
import {Tabs} from 'expo-router';
import {Ionicons} from '@expo/vector-icons';
import {Text, View, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UI} from '../../src/i18n/strings';
import {colors} from '../../src/theme';

const routeIcons = {
  index: 'chatbubbles-outline',
  history: 'time-outline',
  prompts: 'list-outline',
  'system-prompt': 'cog-outline',
  settings: 'settings-outline',
} as const;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={styles.topbar}>
        <View style={styles.brandMark}>
          <Text style={styles.brandGlyph}>✳</Text>
        </View>
        <View style={styles.brandText}>
          <Text style={styles.brandName}>{UI.appName}</Text>
          <Text style={styles.brandEyebrow}>{UI.appEyebrow}</Text>
        </View>
        <View style={styles.topbarRight}>
          <View style={styles.topbarDot} />
          <Text style={styles.topbarLabel}>AI · 01</Text>
        </View>
      </View>
      <Tabs
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.forest,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: [
            styles.tabBar,
            {height: 65 + insets.bottom, paddingBottom: Math.max(insets.bottom, 8)},
          ],
          tabBarItemStyle: styles.tabItem,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({focused, color}) => {
            const iconName = routeIcons[route.name as keyof typeof routeIcons] ?? 'ellipse-outline';
            return (
              <View style={[styles.tabIconWrap, focused && styles.activeTabIconWrap]}>
                <Ionicons name={iconName} size={17} color={focused ? colors.lime : color} />
              </View>
            );
          },
        })}>
        <Tabs.Screen name="index" options={{title: UI.tabs.explain}} />
        <Tabs.Screen name="history" options={{title: UI.tabs.history}} />
        <Tabs.Screen name="prompts" options={{title: UI.tabs.prompts}} />
        <Tabs.Screen name="system-prompt" options={{title: UI.tabs.system}} />
        <Tabs.Screen name="settings" options={{title: UI.tabs.settings}} />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: colors.paper},
  topbar: {
    height: 57,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brandMark: {width: 34, height: 34, borderRadius: 12, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center'},
  brandGlyph: {color: colors.lime, fontSize: 18},
  brandText: {marginLeft: 10},
  brandName: {fontSize: 12, fontWeight: '900', letterSpacing: 1.4, color: colors.ink},
  brandEyebrow: {fontSize: 8, fontWeight: '700', letterSpacing: 1.35, color: colors.muted, marginTop: 2},
  topbarRight: {marginLeft: 'auto', minHeight: 27, paddingHorizontal: 9, borderRadius: 9, backgroundColor: '#E9EDE0', flexDirection: 'row', alignItems: 'center', gap: 6},
  topbarDot: {width: 5, height: 5, borderRadius: 3, backgroundColor: colors.forest},
  topbarLabel: {fontSize: 9, color: colors.forest, fontWeight: '900', letterSpacing: 0.7},
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 5,
  },
  tabItem: {paddingTop: 2},
  tabLabel: {fontSize: 9, fontWeight: '700', marginBottom: 2},
  tabIconWrap: {width: 32, height: 27, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  activeTabIconWrap: {backgroundColor: colors.forest},
});
