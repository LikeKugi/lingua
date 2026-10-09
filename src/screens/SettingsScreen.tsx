import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ApiError, checkConnection, loadModels} from '../api/client';
import {LANGUAGES, languageLabel} from '../constants/languages';
import {ChoiceSheet, Field, PageHeader, SecondaryButton, SectionLabel, Card} from '../components/Interface';
import {UI} from '../i18n/strings';
import {notify} from '../lib/notify';
import {useSettingsStore} from '../store/settingsStore';
import {colors, common} from '../theme';

type ConnectionState =
  | {status: 'idle'}
  | {status: 'checking'}
  | {status: 'success'; detail: string; checkedAt: number}
  | {status: 'error'; detail: string; checkedAt: number};

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.status ? `${error.message} (${UI.common.httpStatus} ${error.status})` : error.message;
  }
  return error instanceof Error ? error.message : UI.common.genericApi;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
}

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
  const [keySaved, setKeySaved] = useState(Boolean(apiKey));
  const [connection, setConnection] = useState<ConnectionState>({status: 'idle'});
  const checking = connection.status === 'checking';

  useEffect(() => {
    setApiKeyDraft(apiKey);
    setKeySaved(Boolean(apiKey));
  }, [apiKey]);

  const saveKey = async () => {
    try {
      await setApiKey(apiKeyDraft);
      setKeySaved(true);
      notify(UI.settings.apiKey, UI.settings.keySaved);
    } catch (error) {
      const message = error instanceof Error ? error.message : UI.common.error;
      setKeySaved(false);
      notify(UI.common.error, message);
    }
  };

  // Persist a key the user typed but did not save explicitly, once it is known to work.
  const saveDraftKeyIfNeeded = async (): Promise<boolean> => {
    if (keySaved || apiKeyDraft.trim() === apiKey) {
      return true;
    }
    try {
      await setApiKey(apiKeyDraft);
      setKeySaved(true);
      return true;
    } catch (error) {
      console.warn('Could not save the API key after a successful check.', error);
      return false;
    }
  };

  const fetchModels = async () => {
    setLoadingModels(true);
    try {
      const result = await loadModels(baseUrl, apiKeyDraft);
      setModels(result);
      const saved = await saveDraftKeyIfNeeded();
      setConnection({
        status: 'success',
        detail: saved ? `${UI.settings.modelsLoaded}: ${result.length}` : UI.settings.keySaveFailed,
        checkedAt: Date.now(),
      });
      if (result.length === 0) {
        notify(UI.common.error, UI.settings.noModels);
      } else {
        setModelSheet(true);
      }
    } catch (error) {
      const detail = describeError(error);
      setConnection({status: 'error', detail, checkedAt: Date.now()});
      notify(UI.settings.notConnected, detail);
    } finally {
      setLoadingModels(false);
    }
  };

  const testConnection = async () => {
    setConnection({status: 'checking'});
    try {
      const modelCount = await checkConnection(baseUrl, apiKeyDraft);
      const saved = await saveDraftKeyIfNeeded();
      setConnection({
        status: 'success',
        detail: saved ? `${UI.settings.modelsLoaded}: ${modelCount}` : UI.settings.keySaveFailed,
        checkedAt: Date.now(),
      });
    } catch (error) {
      const detail = describeError(error);
      setConnection({status: 'error', detail, checkedAt: Date.now()});
      notify(UI.settings.notConnected, detail);
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
              setConnection({status: 'idle'});
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
            onChangeText={value => {
              setBaseUrl(value);
              setConnection({status: 'idle'});
            }}
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
              accessibilityRole="button"
              style={({pressed}) => [styles.modelButton, pressed && styles.modelButtonPressed]}>
              {checking ? <ActivityIndicator size="small" color={colors.forest} /> : <Text style={styles.actionGlyph}>⌁</Text>}
              <Text style={styles.modelButtonText}>{UI.settings.checkConnection}</Text>
            </Pressable>
          </View>
          {connection.status === 'checking' ? (
            <View accessibilityLiveRegion="polite" style={[styles.connectionStatus, styles.connectionChecking]}>
              <ActivityIndicator size="small" color={colors.forest} />
              <Text style={styles.connectionTitle}>{UI.settings.checking}</Text>
            </View>
          ) : null}
          {connection.status === 'success' || connection.status === 'error' ? (
            <View
              accessibilityLiveRegion="polite"
              style={[styles.connectionStatus, connection.status === 'success' ? styles.connectionSuccess : styles.connectionError]}>
              <View style={[styles.connectionBadge, connection.status === 'error' && styles.connectionBadgeError]}>
                <Text style={styles.connectionBadgeText}>{connection.status === 'success' ? '✓' : '✕'}</Text>
              </View>
              <View style={styles.connectionBody}>
                <Text style={[styles.connectionTitle, connection.status === 'error' && styles.connectionTextError]}>
                  {connection.status === 'success' ? UI.settings.connected : UI.settings.notConnected}
                </Text>
                <Text style={[styles.connectionText, connection.status === 'error' && styles.connectionTextError]}>
                  {connection.detail}
                </Text>
                <Text style={styles.connectionTime}>
                  {UI.settings.checkedAt} {formatTime(connection.checkedAt)}
                </Text>
              </View>
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
  connectionStatus: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1},
  connectionChecking: {alignItems: 'center', borderColor: colors.line, backgroundColor: '#F7F6F0'},
  connectionSuccess: {borderColor: colors.forest, backgroundColor: colors.forestSoft},
  connectionError: {borderColor: colors.coral, backgroundColor: colors.coralSoft},
  connectionBadge: {width: 24, height: 24, borderRadius: 12, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center'},
  connectionBadgeError: {backgroundColor: colors.coral},
  connectionBadgeText: {color: colors.surface, fontSize: 13, fontWeight: '900'},
  connectionBody: {flex: 1, gap: 3},
  connectionTitle: {color: colors.forest, fontSize: 13, fontWeight: '800'},
  connectionText: {color: colors.forest, fontSize: 12, lineHeight: 17},
  connectionTextError: {color: colors.coral},
  connectionTime: {color: colors.muted, fontSize: 10},
  preferenceSection: {marginTop: 25},
  languageSelect: {minHeight: 69, borderRadius: 17, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center'},
  languageGlyph: {width: 39, height: 39, borderRadius: 13, backgroundColor: colors.lime, alignItems: 'center', justifyContent: 'center'},
  languageGlyphText: {fontSize: 17, color: colors.forest, fontWeight: '700'},
  languageTextBlock: {flex: 1, marginLeft: 12},
  languageLabel: {fontSize: 10, color: colors.muted},
  languageValue: {fontSize: 15, color: colors.ink, fontWeight: '700', marginTop: 3},
  suffixHint: {fontSize: 11, color: colors.muted, lineHeight: 16, marginTop: 9},
});
