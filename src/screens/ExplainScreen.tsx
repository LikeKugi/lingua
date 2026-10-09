import React, {useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import {createExplanation} from '../api/client';
import {buildMessages} from '../lib/buildPrompt';
import {useHistoryStore} from '../store/historyStore';
import {usePromptsStore} from '../store/promptsStore';
import {useSettingsStore} from '../store/settingsStore';
import type {TaskType} from '../types';
import {colors, common} from '../theme';
import {UI} from '../i18n/strings';
import {
  Card,
  EmptyMark,
  Field,
  PageHeader,
  PrimaryButton,
  SectionLabel,
} from '../components/Interface';

export function ExplainScreen({onOpenSettings}: {onOpenSettings: () => void}) {
  const [taskType, setTaskType] = useState<TaskType>('words');
  const [words, setWords] = useState(['', '']);
  const [sentence, setSentence] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {apiKey, baseUrl, model, promptSuffix, responseLanguage, systemPrompt} =
    useSettingsStore();
  const prompts = usePromptsStore(state => state.prompts);
  const addItem = useHistoryStore(state => state.addItem);
  const taskReady =
    taskType === 'words'
      ? words.some(word => word.trim().length > 0)
      : sentence.trim().length > 0;
  const canSubmit =
    taskReady &&
    userAnswer.trim().length > 0 &&
    correctAnswer.trim().length > 0 &&
    Boolean(apiKey.trim() && baseUrl.trim() && model.trim());

  const submit = async () => {
    setError('');
    setResponse('');
    const task = taskType === 'words' ? words : sentence;
    const hasTask =
      taskType === 'words'
        ? words.some(word => word.trim().length > 0)
        : sentence.trim().length > 0;
    if (!hasTask || !userAnswer.trim() || !correctAnswer.trim()) {
      setError(UI.explain.empty);
      return;
    }
    if (!apiKey.trim()) {
      setError(UI.explain.setup);
      Alert.alert(UI.settings.apiKey, UI.common.noApiKey, [
        {text: UI.common.cancel, style: 'cancel'},
        {text: UI.tabs.settings, onPress: onOpenSettings},
      ]);
      return;
    }
    if (!model.trim()) {
      setError(UI.explain.modelMissing);
      return;
    }

    setLoading(true);
    try {
      const input = {
        taskType,
        task,
        userAnswer,
        correctAnswer,
        model,
        language: responseLanguage,
      };
      const explanation = await createExplanation({
        baseUrl,
        apiKey,
        model,
        messages: buildMessages(input, systemPrompt, promptSuffix, prompts),
      });
      setResponse(explanation);
      addItem({
        ...input,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        response: explanation,
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : UI.common.genericApi;
      setError(message);
      Alert.alert(UI.common.error, message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={common.page}>
      <PageHeader
        eyebrow={UI.explain.eyebrow}
        title={UI.explain.title}
        intro={UI.explain.intro}
      />

      <View style={styles.typeWrap}>
        <SectionLabel>{UI.explain.taskType}</SectionLabel>
        <View style={styles.segment}>
          {(['words', 'sentence'] as const).map(type => {
            const selected = type === taskType;
            return (
              <Pressable
                key={type}
                onPress={() => setTaskType(type)}
                style={[styles.segmentItem, selected && styles.segmentSelected]}>
                <Text style={[styles.segmentText, selected && styles.segmentSelectedText]}>
                  {type === 'words' ? UI.explain.words : UI.explain.sentence}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.formCard}>
        {taskType === 'words' ? (
          <View>
            <Text style={common.fieldLabel}>{UI.explain.taskWords}</Text>
            <View style={styles.wordList}>
              {words.map((word, index) => (
                <View key={`word-${index}`} style={styles.wordRow}>
                  <View style={styles.wordNumber}>
                    <Text style={styles.wordNumberText}>{String(index + 1).padStart(2, '0')}</Text>
                  </View>
                  <TextInput
                    value={word}
                    onChangeText={value =>
                      setWords(current => current.map((item, position) => position === index ? value : item))
                    }
                    placeholder={UI.explain.wordPlaceholder}
                    placeholderTextColor={colors.faint}
                    autoCorrect={false}
                    style={styles.wordInput}
                  />
                  {words.length > 1 ? (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={UI.explain.deleteWord}
                      onPress={() => setWords(current => current.filter((_, position) => position !== index))}
                      style={styles.removeWord}>
                      <Text style={styles.removeWordText}>×</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => setWords(current => [...current, ''])}
              style={styles.addWord}>
              <Text style={styles.addWordIcon}>＋</Text>
              <Text style={styles.addWordText}>{UI.explain.addWord}</Text>
            </Pressable>
          </View>
        ) : (
          <Field
            label={UI.explain.taskSentence}
            value={sentence}
            onChangeText={setSentence}
            placeholder={UI.explain.sentencePlaceholder}
            multiline
          />
        )}

        <View style={styles.fieldSpacing} />
        <Field
          label={UI.explain.yourAnswer}
          value={userAnswer}
          onChangeText={setUserAnswer}
          placeholder={UI.explain.answerPlaceholder}
          multiline
        />
        <View style={styles.fieldSpacing} />
        <Field
          label={UI.explain.correctAnswer}
          value={correctAnswer}
          onChangeText={setCorrectAnswer}
          placeholder={UI.explain.answerPlaceholder}
          multiline
        />
      </Card>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorMark}>!</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.submitArea}>
        <PrimaryButton
          title={loading ? UI.explain.working : UI.explain.explainButton}
          icon="✳"
          loading={loading}
          disabled={!canSubmit}
          onPress={submit}
        />
        <Text style={styles.submitHint}>
          {model ? `${model}  ·  ${responseLanguage.toUpperCase()}` : UI.explain.modelMissing}
        </Text>
      </View>

      {response ? (
        <View style={styles.responseWrap}>
          <View style={styles.responseHeader}>
            <EmptyMark symbol="✳" />
            <View style={styles.responseHeadingText}>
              <Text style={common.eyebrow}>LINGUA · AI</Text>
              <Text style={styles.responseTitle}>{UI.explain.responseTitle}</Text>
            </View>
          </View>
          <Card style={styles.responseCard}>
            <Markdown style={markdownStyles}>{response}</Markdown>
          </Card>
          <Text style={styles.responseHint}>{UI.explain.responseHint}</Text>
        </View>
      ) : null}

      {!apiKey ? (
        <Pressable onPress={onOpenSettings} style={styles.settingsNudge}>
          <Text style={styles.nudgeIcon}>↗</Text>
          <Text style={styles.nudgeText}>{UI.explain.setup}</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  typeWrap: {marginBottom: 17},
  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 15,
    backgroundColor: '#E9E8DE',
  },
  segmentItem: {
    minHeight: 41,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  segmentSelected: {backgroundColor: colors.surface},
  segmentText: {color: colors.muted, fontSize: 13, fontWeight: '700'},
  segmentSelectedText: {color: colors.ink},
  formCard: {padding: 17},
  wordList: {gap: 8},
  wordRow: {height: 47, flexDirection: 'row', alignItems: 'center', gap: 9},
  wordNumber: {
    width: 29,
    height: 29,
    borderRadius: 10,
    backgroundColor: colors.forestSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordNumberText: {color: colors.forest, fontSize: 9, fontWeight: '800'},
  wordInput: {
    flex: 1,
    height: 43,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F7F6F0',
    color: colors.ink,
    fontSize: 14,
  },
  removeWord: {width: 28, alignItems: 'center', justifyContent: 'center'},
  removeWordText: {color: colors.muted, fontSize: 23, lineHeight: 26},
  addWord: {flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, paddingVertical: 4},
  addWordIcon: {color: colors.forest, fontSize: 18, fontWeight: '500'},
  addWordText: {color: colors.forest, fontSize: 12, fontWeight: '800'},
  fieldSpacing: {height: 16},
  submitArea: {marginTop: 16},
  submitHint: {marginTop: 11, textAlign: 'center', fontSize: 10, letterSpacing: 0.4, color: colors.muted},
  errorBox: {
    marginTop: 14,
    borderRadius: 13,
    padding: 12,
    backgroundColor: colors.coralSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  errorMark: {
    width: 19,
    height: 19,
    borderRadius: 10,
    overflow: 'hidden',
    textAlign: 'center',
    backgroundColor: colors.coral,
    color: 'white',
    fontWeight: '800',
  },
  errorText: {flex: 1, color: colors.coral, fontSize: 12, lineHeight: 17},
  responseWrap: {marginTop: 30},
  responseHeader: {flexDirection: 'row', gap: 13, alignItems: 'center', marginBottom: 14},
  responseHeadingText: {gap: 4},
  responseTitle: {color: colors.ink, fontSize: 18, fontFamily: 'serif', fontWeight: '600'},
  responseCard: {padding: 19},
  responseHint: {color: colors.muted, fontSize: 11, textAlign: 'center', marginTop: 12},
  settingsNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 21,
    paddingHorizontal: 2,
  },
  nudgeIcon: {fontSize: 17, color: colors.forest, fontWeight: '700'},
  nudgeText: {flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17},
});

const markdownStyles = {
  body: {color: colors.ink, fontSize: 14, lineHeight: 22},
  heading1: {fontFamily: 'serif', color: colors.ink, fontSize: 22},
  heading2: {fontFamily: 'serif', color: colors.ink, fontSize: 18},
  heading3: {color: colors.ink, fontSize: 15, fontWeight: '800' as const},
  strong: {color: colors.forest, fontWeight: '800' as const},
  bullet_list: {marginVertical: 5},
  ordered_list: {marginVertical: 5},
  code_inline: {backgroundColor: '#F2F0E7', color: colors.forest},
};
