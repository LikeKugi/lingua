import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEFAULT_PROMPTS} from '../constants/defaultPrompts';
import type {PromptTemplate} from '../types';

type PromptsState = {
  prompts: PromptTemplate[];
  addPrompt: (prompt: PromptTemplate) => void;
  updatePrompt: (prompt: PromptTemplate) => void;
  togglePrompt: (id: string) => void;
  removePrompt: (id: string) => void;
};

export const usePromptsStore = create<PromptsState>()(
  persist(
    set => ({
      prompts: DEFAULT_PROMPTS,
      addPrompt: prompt => set(state => ({prompts: [prompt, ...state.prompts]})),
      updatePrompt: prompt =>
        set(state => ({
          prompts: state.prompts.map(item =>
            item.id === prompt.id ? prompt : item,
          ),
        })),
      togglePrompt: id =>
        set(state => ({
          prompts: state.prompts.map(item =>
            item.id === id ? {...item, enabled: !item.enabled} : item,
          ),
        })),
      removePrompt: id =>
        set(state => ({
          prompts: state.prompts.filter(item => item.id !== id || item.builtin),
        })),
    }),
    {
      name: 'prompts:v1',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
