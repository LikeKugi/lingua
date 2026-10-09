import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {checkConnection, loadModels} from '../api/client';
import {LANGUAGES, languageLabel} from '../constants/languages';
import {ChoiceSheet, Field, PageHeader, SecondaryButton, SectionLabel, Card} from '../components/Interface';
import {UI} from '../i18n/strings';
import {useSettingsStore} from '../store/settingsStore';
import {colors, common} from '../theme';

export function SettingsScreen() {
  const {
    apiKey,
    baseUrl,
    model,
    promptSuffix,
    responseLanguage,
    setApiKey,
    setBaseUrl,
    setModel,
    setPromptSuffix,
    setResponseLanguage,
  } = useSettingsStore();
  const [apiKeyDraft, setApiKeyDraft] = useState(apiKey);
  const [models, setModels] = useState<string[]>([]);
  const [modelSheet, setModelSheet] = useState(false);
  const [languageSheet, setLanguageSheet] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [checking, setChecking] = useState(false);
  const [keySaved, setKeySaved] = useState(Boolean(apiKey));
  const [connectionMessage, setConnectionMessage] = useState('');
  const [connectionGood, setConnectionGood] = useState(false);

  useEffect(() => {
    setApiKeyDraft(apiKey);
    setKeySaved(Boolean(apiKey));
  }, [apiKey]);

  const saveKey = async () => {
    try {
      await setApiKey(apiKeyDraft);
      setKeySaved(true);
      setConnectionMessage('');
      Alert.alert(UI.settings.apiKey, UI.settings.keySaved);
    } catch (error) {
      const message = error instanceof Error ? error.message : UI.common.error;
      setKeySaved(false);
      Alert.alert(UI.common.error, message);
    }
  };

  const fetchModels = async () => {
    setConnectionMessage('');
    setLoadingModels(true);
    try {
      const result = await loadModels(baseUrl, apiKey);
      setModels(result);
      setConnectionGood(true);
      setConnectionMessage(`${UI.settings.modelsLoaded}: ${result.length}`);
      if (result.length === 0) {
        Alert.alert(UI.common.error, UI.settings.noModels);
      } else {
        setModelSheet(true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : UI.common.genericApi;
      setConnectionGood(false);
      setConnectionMessage(message);
      Alert.alert(UI.common.error, message);
    } finally {
      setLoadingModels(false);
    }
  };

  const testConnection = async () => {
    setConnectionMessage('');
    setChecking(true);
    try {
      await checkConnection(baseUrl, apiKey);
      setConnectionGood(true);
      setConnectionMessage(UI.settings.connected);
      Alert.alert(UI.settings.checkConnection, UI.settings.connected);
    } catch (error) {
      const message = error instanceof Error ? error.message : UI.common.genericApi;
      setConnectionGood(false);
      setConnectionMessage(message);
      Alert.alert(UI.common.error, message);
    } finally {
      setChecking(false);
    }
  };

  const modelOptions = [
    ...(model && !models.includes(model) ? [model] : []),
    ...models,
  ].map(value => ({value, label: value}));

  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={common.page}>
        <PageHeader eyebrow={UI.settings.eyebrow} title={UI.settings.title} intro={UI.settings.intro} />
        <SectionLabel>{UI.settings.provider}</SectionLabel>
        <Card style={styles.settingsCard}>
          <Field
            label={UI.settings.apiKey}
            value={apiKeyDraft}
            onChangeText={value => {
              setApiKeyDraft(value);
              setKeySaved(false);
            }}
            placeholder={UI.settings.apiKeyPlaceholder}
            secure
            input={{autoCapitalize: 'none', autoCorrect: false}}
            right={keySaved ? <Text style={styles.secureLabel}>●  {UI.settings.keySaved}</Text> : null}
          />
          <View style={styles.saveKeyButton}>
            <SecondaryButton
              title={UI.settings.saveKey}
              icon={keySaved ? '✓' : '⌑'}
              onPress={saveKey}
            />
          </View>
          <View style={styles.formGap} />
          <Field
            label={UI.settings.baseUrl}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="https://api.openai.com/v1"
            input={{keyboardType: 'url', autoCapitalize: 'none', autoCorrect: false}}
          />
          <View style={styles.formGap} />
          <View>
            <Text style={common.fieldLabel}>{UI.settings.model}</Text>
            <Pressable onPress={() => setModelSheet(true)} style={styles.modelSelect}>
              <Text numberOfLines={1} style={[styles.modelValue, !model && styles.modelPlaceholder]}>
                {model || UI.settings.modelPlaceholder}
              </Text>
              <Text style={styles.modelChevron}>⌄</Text>
            </Pressable>
          </View>
          <View style={styles.modelButtons}>
            <Pressable
              onPress={fetchModels}
              disabled={loadingModels}
              style={({pressed}) => [styles.modelButton, pressed && styles.modelButtonPressed]}>
              {loadingModels ? <ActivityIndicator size="small" color={colors.forest} /> : <Text style={styles.actionGlyph}>↓</Text>}
              <Text style={styles.modelButtonText}>{UI.settings.loadModels}</Text>
            </Pressable>
            <Pressable
              onPress={testConnection}
              disabled={checking}
              style={({pressed}) => [styles.modelButton, pressed && styles.modelButtonPressed]}>
              {checking ? <ActivityIndicator size="small" color={colors.forest} /> : <Text style={styles.actionGlyph}>⌁</Text>}
              <Text style={styles.modelButtonText}>{UI.settings.checkConnection}</Text>
            </Pressable>
          </View>
          {connectionMessage ? (
            <View style={[styles.connectionStatus, !connectionGood && styles.connectionError]}>
              <View style={[styles.connectionDot, !connectionGood && styles.connectionDotError]} />
              <Text style={[styles.connectionText, !connectionGood && styles.connectionTextError]}>{connectionMessage}</Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.preferenceSection}>
          <SectionLabel>{UI.settings.language.toUpperCase()}</SectionLabel>
          <Pressable onPress={() => setLanguageSheet(true)} style={styles.languageSelect}>
            <View style={styles.languageGlyph}><Text style={styles.languageGlyphText}>文</Text></View>
            <View style={styles.languageTextBlock}>
              <Text style={styles.languageLabel}>{UI.settings.language}</Text>
              <Text style={styles.languageValue}>{languageLabel(responseLanguage)}</Text>
            </View>
            <Text style={styles.modelChevron}>⌄</Text>
          </Pressable>
        </View>

        <View style={styles.preferenceSection}>
          <SectionLabel>{UI.settings.suffix.toUpperCase()}</SectionLabel>
          <Card style={styles.settingsCard}>
            <Field
              label={UI.settings.suffix}
              value={promptSuffix}
              onChangeText={setPromptSuffix}
              placeholder={UI.settings.suffixPlaceholder}
              multiline
            />
            <Text style={styles.suffixHint}>{UI.settings.suffixHint}</Text>
          </Card>
        </View>
      </ScrollView>

      <ChoiceSheet
        visible={modelSheet}
        title={UI.settings.chooseModel}
        options={modelOptions}
        selected={model}
        emptyMessage={UI.settings.noModels}
        onChoose={value => {
          setModel(value);
          setModelSheet(false);
        }}
        onClose={() => setModelSheet(false)}
      />
      <ChoiceSheet
        visible={languageSheet}
        title={UI.settings.chooseLanguage}
        options={LANGUAGES.map(language => ({value: language.code, label: language.label}))}
        selected={responseLanguage}
        onChoose={value => {
          setResponseLanguage(value);
          setLanguageSheet(false);
        }}
        onClose={() => setLanguageSheet(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  settingsCard: {padding: 16},
  secureLabel: {fontSize: 9, color: colors.forest, fontWeight: '700'},
  saveKeyButton: {marginTop: 10, alignSelf: 'flex-start'},
  formGap: {height: 17},
  modelSelect: {minHeight: 49, borderWidth: 1, borderColor: colors.line, backgroundColor: '#F7F6F0', borderRadius: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center'},
  modelValue: {flex: 1, fontSize: 14, color: colors.ink},
  modelPlaceholder: {color: colors.faint},
  modelChevron: {color: colors.forest, fontSize: 19, fontWeight: '700', marginLeft: 12},
  modelButtons: {flexDirection: 'row', gap: 8, marginTop: 10},
  modelButton: {flex: 1, minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6, paddingHorizontal: 7},
  modelButtonPressed: {backgroundColor: '#F1F0E8'},
  actionGlyph: {color: colors.forest, fontSize: 15, fontWeight: '800'},
  modelButtonText: {fontSize: 10, fontWeight: '700', color: colors.ink, flexShrink: 1},
  connectionStatus: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12},
  connectionError: {},
  connectionDot: {width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest},
  connectionDotError: {backgroundColor: colors.coral},
  connectionText: {color: colors.forest, fontSize: 11, flex: 1},
  connectionTextError: {color: colors.coral},
  preferenceSection: {marginTop: 25},
  languageSelect: {minHeight: 69, borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center'},
  languageGlyph: {width: 39, height: 39, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center'},
  languageGlyphText: {fontSize: 17, color: colors.forest, fontWeight: '700'},
  languageTextBlock: {flex: 1, marginLeft: 12},
  languageLabel: {fontSize: 10, color: colors.muted},
  languageValue: {fontSize: 15, color: colors.ink, fontWeight: '700', marginTop: 3},
  suffixHint: {fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 9},
});
