import React, {useState} from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import type {HistoryItem} from '../types';
import {colors, common} from '../theme';
import {UI} from '../i18n/strings';
import {Card, EmptyMark, PageHeader} from '../components/Interface';
import {useHistoryStore} from '../store/historyStore';

export function HistoryScreen() {
  const items = useHistoryStore(state => state.items);
  const clear = useHistoryStore(state => state.clear);
  const removeItem = useHistoryStore(state => state.removeItem);
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  const confirmClear = () =>
    Alert.alert(UI.history.clear, UI.history.clearConfirm, [
      {text: UI.common.cancel, style: 'cancel'},
      {text: UI.common.confirm, style: 'destructive', onPress: clear},
    ]);

  return (
    <>
      <ScrollView contentContainerStyle={common.page}>
        <View style={styles.titleRow}>
          <PageHeader
            eyebrow={UI.history.eyebrow}
            title={UI.history.title}
            intro={UI.history.intro}
            compact
          />
          {items.length > 0 ? (
            <Pressable accessibilityRole="button" onPress={confirmClear} style={styles.clearButton}>
              <Text style={styles.clearText}>{UI.history.clear}</Text>
            </Pressable>
          ) : null}
        </View>
        {items.length === 0 ? (
          <Card style={styles.emptyCard}>
            <EmptyMark symbol="⌁" />
            <Text style={styles.emptyTitle}>{UI.history.emptyTitle}</Text>
            <Text style={styles.emptyBody}>{UI.history.emptyBody}</Text>
          </Card>
        ) : (
          <View style={styles.list}>
            {items.map(item => (
              <Pressable
                key={item.id}
                onPress={() => setSelected(item)}
                style={({pressed}) => [styles.entry, pressed && styles.entryPressed]}>
                <View style={styles.entryTop}>
                  <View style={styles.entryTag}>
                    <Text style={styles.entryTagText}>
                      {item.taskType === 'words' ? UI.history.taskWords : UI.history.taskSentence}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {new Date(item.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={UI.history.remove}
                    onPress={event => {
                      event.stopPropagation();
                      Alert.alert(UI.history.remove, undefined, [
                        {text: UI.common.cancel, style: 'cancel'},
                        {text: UI.common.confirm, style: 'destructive', onPress: () => removeItem(item.id)},
                      ]);
                    }}
                    hitSlop={12}
                    style={styles.entryRemove}>
                    <Text style={styles.entryRemoveText}>×</Text>
                  </Pressable>
                </View>
                <Text numberOfLines={2} style={styles.entryTask}>
                  {Array.isArray(item.task) ? item.task.filter(Boolean).join(' · ') : item.task}
                </Text>
                <Text numberOfLines={1} style={styles.entryAnswer}>{item.userAnswer}</Text>
                <View style={styles.entryBottom}>
                  <Text numberOfLines={1} style={styles.entryPreview}>{item.response}</Text>
                  <Text style={styles.entryArrow}>↗</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <Modal
        transparent
        animationType="slide"
        visible={selected !== null}
        onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSelected(null)}>
          <Pressable style={styles.detailSheet} onPress={() => undefined}>
            <View style={styles.sheetHandle} />
            {selected ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailMeta}>
                  <Text style={common.eyebrow}>
                    {selected.taskType === 'words' ? UI.history.taskWords : UI.history.taskSentence}
                    {'  ·  '}
                    {new Date(selected.createdAt).toLocaleString('ru-RU')}
                  </Text>
                  <Text style={styles.detailTask}>
                    {Array.isArray(selected.task) ? selected.task.filter(Boolean).join(' · ') : selected.task}
                  </Text>
                </View>
                <Text style={common.sectionLabel}>{UI.history.answer}</Text>
                <Card style={styles.detailCard}>
                  <Text style={styles.detailText}>{selected.userAnswer}</Text>
                </Card>
                <Text style={[common.sectionLabel, styles.detailLabel]}>{UI.history.correct}</Text>
                <Card style={styles.correctCard}>
                  <Text style={styles.detailText}>{selected.correctAnswer}</Text>
                </Card>
                <Text style={[common.sectionLabel, styles.detailLabel]}>{UI.history.explanation}</Text>
                <Card style={styles.detailCard}>
                  <Markdown style={markdownStyles}>{selected.response}</Markdown>
                </Card>
                <Pressable onPress={() => setSelected(null)} style={styles.closeDetail}>
                  <Text style={styles.closeDetailText}>{UI.common.done}</Text>
                </Pressable>
              </ScrollView>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  titleRow: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  clearButton: {marginTop: 8, paddingVertical: 8, paddingLeft: 8},
  clearText: {color: colors.coral, fontWeight: '700', fontSize: 12},
  emptyCard: {alignItems: 'flex-start', padding: 21, marginTop: 5},
  emptyTitle: {fontFamily: 'serif', fontSize: 22, color: colors.ink, marginTop: 19, fontWeight: '600'},
  emptyBody: {fontSize: 13, color: colors.muted, lineHeight: 20, marginTop: 7},
  list: {gap: 12},
  entry: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
  },
  entryPressed: {backgroundColor: '#F8F7F0'},
  entryTop: {flexDirection: 'row', alignItems: 'center', gap: 9},
  entryTag: {backgroundColor: colors.forestSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5},
  entryTagText: {color: colors.forest, fontSize: 9, fontWeight: '800', letterSpacing: 0.5},
  entryDate: {color: colors.muted, fontSize: 11, flex: 1},
  entryRemove: {width: 23, height: 23, alignItems: 'center', justifyContent: 'center'},
  entryRemoveText: {fontSize: 20, lineHeight: 22, color: colors.faint},
  entryTask: {color: colors.ink, fontFamily: 'serif', fontSize: 18, marginTop: 13, lineHeight: 23},
  entryAnswer: {color: colors.muted, fontSize: 12, marginTop: 8},
  entryBottom: {flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: colors.line, marginTop: 13, paddingTop: 10},
  entryPreview: {flex: 1, color: colors.faint, fontSize: 11},
  entryArrow: {color: colors.forest, fontSize: 15, marginLeft: 10},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18, 34, 27, 0.34)'},
  detailSheet: {maxHeight: '88%', backgroundColor: colors.paper, borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingTop: 10, paddingHorizontal: 22, paddingBottom: 25},
  sheetHandle: {width: 36, height: 4, borderRadius: 3, backgroundColor: '#CFD0C6', alignSelf: 'center', marginBottom: 24},
  detailMeta: {marginBottom: 22},
  detailTask: {fontFamily: 'serif', fontSize: 26, lineHeight: 31, color: colors.ink, marginTop: 10},
  detailCard: {padding: 15},
  detailText: {color: colors.ink, fontSize: 14, lineHeight: 21},
  detailLabel: {marginTop: 20},
  correctCard: {padding: 15, backgroundColor: colors.forestSoft, borderColor: '#D8E2D6'},
  closeDetail: {height: 49, borderRadius: 14, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center', marginTop: 22, marginBottom: 7},
  closeDetailText: {color: colors.surface, fontWeight: '800'},
});

const markdownStyles = {
  body: {color: colors.ink, fontSize: 13, lineHeight: 21},
  heading1: {fontFamily: 'serif', color: colors.ink, fontSize: 20},
  heading2: {fontFamily: 'serif', color: colors.ink, fontSize: 17},
  heading3: {color: colors.ink, fontSize: 14, fontWeight: '800' as const},
  strong: {color: colors.forest, fontWeight: '800' as const},
  bullet_list: {marginVertical: 4},
  ordered_list: {marginVertical: 4},
};
