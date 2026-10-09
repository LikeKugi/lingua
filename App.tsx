import React, {useEffect, useState} from 'react';
import {Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {ExplainScreen} from './src/screens/ExplainScreen';
import {HistoryScreen} from './src/screens/HistoryScreen';
import {PromptsScreen} from './src/screens/PromptsScreen';
import {SettingsScreen} from './src/screens/SettingsScreen';
import {SystemPromptScreen} from './src/screens/SystemPromptScreen';
import {UI} from './src/i18n/strings';
import {useSettingsStore} from './src/store/settingsStore';
import {colors} from './src/theme';

type TabId = 'explain' | 'history' | 'prompts' | 'system' | 'settings';

const tabs: Array<{id: TabId; title: string; icon: string}> = [
  {id: 'explain', title: UI.tabs.explain, icon: '✳'},
  {id: 'history', title: UI.tabs.history, icon: '◷'},
  {id: 'prompts', title: UI.tabs.prompts, icon: '≋'},
  {id: 'system', title: UI.tabs.system, icon: '“'},
  {id: 'settings', title: UI.tabs.settings, icon: '⚙︎'},
];

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('explain');
  const insets = useSafeAreaInsets();
  const hydrateApiKey = useSettingsStore(state => state.hydrateApiKey);

  useEffect(() => {
    void hydrateApiKey();
  }, [hydrateApiKey]);

  return (
    <View style={[styles.root, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />
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

      <View style={styles.screenArea}>
        <View style={[styles.screen, activeTab !== 'explain' && styles.hiddenScreen]}>
          <ExplainScreen onOpenSettings={() => setActiveTab('settings')} />
        </View>
        <View style={[styles.screen, activeTab !== 'history' && styles.hiddenScreen]}>
          <HistoryScreen />
        </View>
        <View style={[styles.screen, activeTab !== 'prompts' && styles.hiddenScreen]}>
          <PromptsScreen />
        </View>
        <View style={[styles.screen, activeTab !== 'system' && styles.hiddenScreen]}>
          <SystemPromptScreen />
        </View>
        <View style={[styles.screen, activeTab !== 'settings' && styles.hiddenScreen]}>
          <SettingsScreen />
        </View>
      </View>

      <View style={[styles.tabBar, {paddingBottom: Math.max(insets.bottom, 8)}]}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              accessibilityRole="tab"
              accessibilityState={{selected: active}}
              accessibilityLabel={tab.title}
              onPress={() => setActiveTab(tab.id)}
              style={styles.tabButton}>
              <View style={[styles.tabIconWrap, active && styles.activeTabIconWrap]}>
                <Text style={[styles.tabIcon, active && styles.activeTabIcon]}>{tab.icon}</Text>
              </View>
              <Text numberOfLines={1} style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
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
  screenArea: {flex: 1},
  screen: {flex: 1},
  hiddenScreen: {display: 'none'},
  tabBar: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tabButton: {width: '20%', alignItems: 'center', justifyContent: 'center', gap: 3},
  tabIconWrap: {width: 32, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  activeTabIconWrap: {backgroundColor: colors.forest},
  tabIcon: {fontSize: 17, color: colors.muted, lineHeight: 20, fontWeight: '700'},
  activeTabIcon: {color: colors.lime},
  tabLabel: {fontSize: 9, color: colors.muted, fontWeight: '600'},
  activeTabLabel: {color: colors.forest, fontWeight: '800'},
});

export default App;
