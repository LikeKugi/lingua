import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {HistoryItem} from '../types';

type HistoryState = {
  items: HistoryItem[];
  addItem: (item: HistoryItem) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    set => ({
      items: [],
      addItem: item => set(state => ({items: [item, ...state.items]})),
      removeItem: id =>
        set(state => ({items: state.items.filter(item => item.id !== id)})),
      clear: () => set({items: []}),
    }),
    {
      name: 'history:v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
