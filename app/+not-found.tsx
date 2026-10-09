import React from 'react';
import {Link, Stack} from 'expo-router';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../src/theme';
import {UI} from '../src/i18n/strings';

export default function NotFoundRoute() {
  return (
    <View style={styles.page}>
      <Stack.Screen options={{title: UI.notFound.title}} />
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>{UI.notFound.body}</Text>
      <Link href="/" style={styles.link}>{UI.notFound.back}</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {flex: 1, backgroundColor: colors.paper, padding: 24, justifyContent: 'center'},
  code: {fontSize: 11, letterSpacing: 2, color: colors.forest, fontWeight: '800'},
  title: {fontFamily: 'serif', fontSize: 29, color: colors.ink, marginTop: 10},
  link: {fontSize: 14, fontWeight: '700', color: colors.forest, marginTop: 18},
});
