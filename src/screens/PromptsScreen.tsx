import React, {useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type {PromptTemplate} from '../types';
import {Card, PageHeader, PrimaryButton, SecondaryButton} from '../components/Interface';
import {UI} from '../i18n/strings';
import {usePromptsStore} from '../store/promptsStore';
import {colors, common} from '../theme';

export function PromptsScreen() {
  const prompts = usePromptsStore(state => state.prompts);
  const addPrompt = usePromptsStore(state => state.addPrompt);
  const updatePrompt = usePromptsStore(state => state.updatePrompt);
  const togglePrompt = usePromptsStore(state => state.togglePrompt);
  const removePrompt = usePromptsStore(state => state.removePrompt);
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<PromptTemplate | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setBody('');
    setVisible(true);
  };
  const openEdit = (prompt: PromptTemplate) => {
    setEditing(prompt);
    setTitle(prompt.title);
    setBody(prompt.body);
    setVisible(true);
  };
  const save = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert(UI.common.error, UI.prompts.requiredFields);
      return;
    }
    if (editing) {
      updatePrompt({...editing, title: title.trim(), body: body.trim()});
    } else {
      addPrompt({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: title.trim(),
        body: body.trim(),
        enabled: true,
        builtin: false,
      });
    }
    setVisible(false);
  };

  return (
    <>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={common.page}>
        <PageHeader eyebrow={UI.prompts.eyebrow} title={UI.prompts.title} intro={UI.prompts.intro} />
        <PrimaryButton title={UI.prompts.add} icon="＋" onPress={openNew} />
        <View style={styles.list}>
          {prompts.map(prompt => (
            <Card key={prompt.id} style={styles.promptCard}>
              <View style={styles.promptTop}>
                <View style={styles.promptTitleBlock}>
                  <View style={styles.promptMeta}>
                    <Text style={styles.promptKind}>{prompt.builtin ? UI.prompts.builtin : UI.prompts.custom}</Text>
                    <View style={[styles.enabledDot, !prompt.enabled && styles.disabledDot]} />
                    <Text style={[styles.enabledLabel, !prompt.enabled && styles.disabledLabel]}>
                      {prompt.enabled ? UI.prompts.enabled : UI.prompts.disabled}
                    </Text>
                  </View>
                  <Text style={styles.promptTitle}>{prompt.title}</Text>
                </View>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityState={{checked: prompt.enabled}}
                  onPress={() => togglePrompt(prompt.id)}
                  style={[styles.toggleTrack, prompt.enabled && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, prompt.enabled && styles.toggleKnobActive]} />
                </Pressable>
              </View>
              <Text style={styles.promptBody}>{prompt.body}</Text>
              <View style={styles.promptActions}>
                <Pressable onPress={() => openEdit(prompt)} style={styles.promptAction}>
                  <Text style={styles.promptActionIcon}>↗</Text>
                  <Text style={styles.promptActionText}>{UI.prompts.edit}</Text>
                </Pressable>
                {!prompt.builtin ? (
                  <Pressable
                    onPress={() =>
                      Alert.alert(UI.prompts.delete, prompt.title, [
                        {text: UI.common.cancel, style: 'cancel'},
                        {text: UI.common.confirm, style: 'destructive', onPress: () => removePrompt(prompt.id)},
                      ])
                    }
                    style={styles.promptAction}>
                    <Text style={[styles.promptActionIcon, styles.deleteIcon]}>×</Text>
                    <Text style={[styles.promptActionText, styles.deleteText]}>{UI.prompts.delete}</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>

      <Modal transparent animationType="slide" visible={visible} onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.editorSheet} onPress={() => undefined}>
            <View style={styles.sheetHandle} />
            <Text style={common.eyebrow}>{editing ? UI.prompts.editTitle : UI.prompts.editorTitle}</Text>
            <Text style={styles.editorLabel}>{UI.prompts.titleLabel}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={UI.prompts.titlePlaceholder}
              placeholderTextColor={colors.faint}
              style={styles.editorInput}
            />
            <Text style={[styles.editorLabel, styles.bodyLabel]}>{UI.prompts.bodyLabel}</Text>
            <TextInput
              value={body}
              onChangeText={setBody}
              placeholder={UI.prompts.bodyPlaceholder}
              placeholderTextColor={colors.faint}
              multiline
              textAlignVertical="top"
              style={[styles.editorInput, styles.editorBody]}
            />
            <View style={styles.editorButtons}>
              <SecondaryButton title={UI.common.cancel} onPress={() => setVisible(false)} />
              <View style={styles.saveButton}>
                <PrimaryButton title={UI.prompts.save} onPress={save} />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  list: {gap: 12, marginTop: 17},
  promptCard: {padding: 16},
  promptTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  promptTitleBlock: {flex: 1},
  promptMeta: {flexDirection: 'row', alignItems: 'center', gap: 6},
  promptKind: {color: colors.forest, fontSize: 8, fontWeight: '900', letterSpacing: 1.1},
  enabledDot: {width: 4, height: 4, borderRadius: 3, backgroundColor: colors.forest, marginLeft: 3},
  disabledDot: {backgroundColor: colors.faint},
  enabledLabel: {color: colors.forest, fontSize: 9},
  disabledLabel: {color: colors.faint},
  promptTitle: {color: colors.ink, fontFamily: 'serif', fontSize: 19, fontWeight: '600', marginTop: 7},
  toggleTrack: {width: 42, height: 25, borderRadius: 14, backgroundColor: '#E4E3DA', justifyContent: 'center', padding: 3},
  toggleActive: {backgroundColor: colors.forest},
  toggleKnob: {width: 19, height: 19, borderRadius: 10, backgroundColor: colors.surface},
  toggleKnobActive: {alignSelf: 'flex-end', backgroundColor: colors.lime},
  promptBody: {color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 9},
  promptActions: {flexDirection: 'row', gap: 17, borderTopWidth: 1, borderColor: colors.line, marginTop: 14, paddingTop: 11},
  promptAction: {flexDirection: 'row', alignItems: 'center', gap: 5},
  promptActionIcon: {fontSize: 14, color: colors.forest, fontWeight: '700'},
  promptActionText: {fontSize: 11, color: colors.forest, fontWeight: '700'},
  deleteIcon: {color: colors.coral, fontSize: 18, lineHeight: 18},
  deleteText: {color: colors.coral},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18, 34, 27, 0.34)'},
  editorSheet: {backgroundColor: colors.paper, borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingTop: 10, paddingHorizontal: 22, paddingBottom: 27},
  sheetHandle: {width: 36, height: 4, borderRadius: 3, backgroundColor: '#CFD0C6', alignSelf: 'center', marginBottom: 22},
  editorLabel: {color: colors.ink, fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 8},
  bodyLabel: {marginTop: 17},
  editorInput: {minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 13, backgroundColor: '#F7F6F0', color: colors.ink, fontSize: 14, paddingHorizontal: 13, paddingVertical: 12},
  editorBody: {height: 130, paddingTop: 13},
  editorButtons: {flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 21},
  saveButton: {flex: 1},
});
