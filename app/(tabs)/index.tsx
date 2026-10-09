import React from 'react';
import {useRouter} from 'expo-router';
import {ExplainScreen} from '../../src/screens/ExplainScreen';

export default function ExplainRoute() {
  const router = useRouter();
  return <ExplainScreen onOpenSettings={() => router.navigate('/settings')} />;
}
