import React, {type PropsWithChildren} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import {colors, common} from '../theme';
import {UI} from '../i18n/strings';

export function PageHeader(props: {
  eyebrow: string;
  title: string;
  intro: string;
  compact?: boolean;
}) {
  return (
    <View style={[styles.pageHeader, props.compact && styles.compactHeader]}>
      <Text style={common.eyebrow}>{props.eyebrow}</Text>
      <Text style={common.title}>{props.title}</Text>
      <Text style={common.intro}>{props.intro}</Text>
    </View>
  );
}

export function Field(props: {
  label: string;
  input?: TextInputProps;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secure?: boolean;
  multiline?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View>
      <View style={styles.fieldHeader}>
        <Text style={common.fieldLabel}>{props.label}</Text>
        {props.right}
      </View>
      <TextInput
        {...props.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.faint}
        secureTextEntry={props.secure}
        multiline={props.multiline}
        textAlignVertical={props.multiline ? 'top' : 'center'}
        autoCapitalize={props.input?.autoCapitalize ?? 'none'}
        autoCorrect={props.input?.autoCorrect ?? false}
        style={[
          common.input,
          props.multiline && styles.multilineInput,
          props.input?.style,
        ]}
      />
    </View>
  );
}

export function PrimaryButton(props: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      disabled={props.disabled || props.loading}
      style={({pressed}) => [
        common.primaryButton,
        (props.disabled || props.loading) && styles.disabledButton,
        pressed && !props.disabled && styles.pressedButton,
      ]}>
      {props.loading ? (
        <ActivityIndicator color="#FFFDF7" />
      ) : (
        <>
          {props.icon ? <Text style={styles.buttonIcon}>{props.icon}</Text> : null}
          <Text style={common.primaryButtonText}>{props.title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function SecondaryButton(props: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      disabled={props.disabled}
      style={({pressed}) => [
        common.secondaryButton,
        pressed && styles.pressedSecondary,
        props.disabled && styles.disabledSecondary,
      ]}>
      {props.icon ? <Text style={styles.secondaryIcon}>{props.icon}</Text> : null}
      <Text style={common.secondaryButtonText}>{props.title}</Text>
    </Pressable>
  );
}

export function Card(props: PropsWithChildren<{style?: object}>) {
  return <View style={[common.card, props.style]}>{props.children}</View>;
}

export function SectionLabel({children}: PropsWithChildren) {
  return <Text style={common.sectionLabel}>{children}</Text>;
}

export function ChoiceSheet(props: {
  visible: boolean;
  title: string;
  options: Array<{label: string; value: string}>;
  selected: string;
  emptyMessage?: string;
  onChoose: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={props.visible}
      onRequestClose={props.onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={props.onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.sheetHandle} />
          <Text style={common.eyebrow}>{props.title}</Text>
          <ScrollView style={styles.options}>
            {props.options.map(option => {
              const active = option.value === props.selected;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => props.onChoose(option.value)}
                  style={[styles.option, active && styles.activeOption]}>
                  <Text style={[styles.optionText, active && styles.activeOptionText]}>
                    {option.label}
                  </Text>
                  {active ? <Text style={styles.optionCheck}>✓</Text> : null}
                </Pressable>
              );
            })}
            {props.options.length === 0 ? (
              <Text style={styles.noOptions}>{props.emptyMessage ?? UI.common.loading}</Text>
            ) : null}
          </ScrollView>
          <Pressable onPress={props.onClose} style={styles.sheetDone}>
            <Text style={styles.sheetDoneText}>{UI.common.done}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function EmptyMark({symbol = '✳'}: {symbol?: string}) {
  return (
    <View style={styles.emptyMark}>
      <Text style={styles.emptyMarkText}>{symbol}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pageHeader: {marginBottom: 25},
  compactHeader: {marginBottom: 20},
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  multilineInput: {minHeight: 92, paddingTop: 13},
  disabledButton: {opacity: 0.62},
  pressedButton: {backgroundColor: '#183B2B', transform: [{scale: 0.99}]},
  pressedSecondary: {backgroundColor: '#F1F0E8'},
  disabledSecondary: {opacity: 0.5},
  buttonIcon: {color: colors.lime, fontSize: 18},
  secondaryIcon: {color: colors.forest, fontSize: 16, fontWeight: '700'},
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 34, 27, 0.34)',
  },
  sheet: {
    maxHeight: '78%',
    backgroundColor: colors.paper,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingTop: 10,
    paddingHorizontal: 22,
    paddingBottom: 26,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#CFD0C6',
    alignSelf: 'center',
    marginBottom: 22,
  },
  options: {marginTop: 13},
  option: {
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
  },
  activeOption: {
    backgroundColor: colors.forestSoft,
    borderRadius: 13,
    borderBottomColor: 'transparent',
  },
  optionText: {color: colors.ink, fontSize: 15},
  activeOptionText: {fontWeight: '700'},
  optionCheck: {color: colors.forest, fontSize: 17, fontWeight: '800'},
  noOptions: {color: colors.muted, paddingVertical: 20},
  sheetDone: {
    marginTop: 14,
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDoneText: {color: colors.surface, fontWeight: '800', fontSize: 14},
  emptyMark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMarkText: {color: colors.forest, fontSize: 22, fontWeight: '700'},
});
