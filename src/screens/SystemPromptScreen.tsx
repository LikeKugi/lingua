import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {Card, Field, PageHeader, SecondaryButton} from '../components/Interface';
import {UI} from '../i18n/strings';
import {useSettingsStore} from '../store/settingsStore';
import {colors, common} from '../theme';

export function SystemPromptScreen() {
  const prompt = useSettingsStore(state => state.systemPrompt);
  const setPrompt = useSettingsStore(state => state.setSystemPrompt);
  const reset = useSettingsStore(state => state.resetSystemPrompt);

  return (
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={common.page}>
      <PageHeader eyebrow={UI.system.eyebrow} title={UI.system.title} intro={UI.system.intro} />
      <Card style={styles.promptCard}>
        <View style={styles.cardTop}>
          <View style={styles.promptGlyph}><Text style={styles.promptGlyphText}>“ ”</Text></View>
          <View style={styles.savedMark}>
            <View style={styles.savedDot} />
            <Text style={styles.savedText}>{UI.system.saved}</Text>
          </View>
        </View>
        <Field
          label=""
          value={prompt}
          onChangeText={setPrompt}
          multiline
          input={{
            style: styles.promptInput,
            autoCapitalize: 'sentences',
            autoCorrect: true,
          }}
        />
        <Text style={styles.promptCount}>{prompt.length} {UI.common.characterCount}</Text>
      </Card>
      <View style={styles.resetWrap}>
        <SecondaryButton title={UI.system.reset} onPress={reset} icon="↺" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  promptCard: {padding: 17},
  cardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14},
  promptGlyph: {width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.lime},
  promptGlyphText: {fontFamily: 'serif', color: colors.forest, fontSize: 17, fontWeight: '700'},
  savedMark: {flexDirection: 'row', alignItems: 'center', gap: 6},
  savedDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest},
  savedText: {color: colors.muted, fontSize: 10},
  promptInput: {minHeight: 290, fontSize: 14, lineHeight: 23, padding: 15},
  promptCount: {alignSelf: 'flex-end', color: colors.faint, fontSize: 10, marginTop: 9},
  resetWrap: {marginTop: 14},
});
