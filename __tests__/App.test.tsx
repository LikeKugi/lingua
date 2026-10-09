/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {ExplainScreen} from '../src/screens/ExplainScreen';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<ExplainScreen onOpenSettings={() => {}} />);
  });
});
