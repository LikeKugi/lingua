import {Platform} from 'react-native';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {getLocales} from 'expo-localization';
import {BASE_SYSTEM_PROMPT} from '../constants/defaultPrompts';
import {LANGUAGES} from '../constants/languages';

const API_KEY_STORAGE_KEY = 'apiKey';

// expo-secure-store has no web implementation; on web the key is kept in plain localStorage (not secure).
const apiKeyStorage = {
  get: async (): Promise<string | null> =>
    Platform.OS === 'web'
      ? window.localStorage.getItem(API_KEY_STORAGE_KEY)
      : SecureStore.getItemAsync(API_KEY_STORAGE_KEY),
  set: async (value: string): Promise<void> =>
    Platform.OS === 'web'
      ? window.localStorage.setItem(API_KEY_STORAGE_KEY, value)
      : SecureStore.setItemAsync(API_KEY_STORAGE_KEY, value),
  remove: async (): Promise<void> =>
    Platform.OS === 'web'
      ? window.localStorage.removeItem(API_KEY_STORAGE_KEY)
      : SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY),
};
const deviceLanguage = getLocales()[0]?.languageCode;
const initialResponseLanguage = LANGUAGES.some(language => language.code === deviceLanguage)
  ? deviceLanguage ?? 'ru'
  : 'ru';

type SettingsState = {
  apiKey: string;
  baseUrl: string;
  model: string;
  promptSuffix: string;
  responseLanguage: string;
  systemPrompt: string;
  hydrateApiKey: () => Promise<void>;
  setApiKey: (value: string) => Promise<void>;
  setBaseUrl: (value: string) => void;
  setModel: (value: string) => void;
  setPromptSuffix: (value: string) => void;
  setResponseLanguage: (value: string) => void;
  setSystemPrompt: (value: string) => void;
  resetSystemPrompt: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      apiKey: '',
      baseUrl: 'https://api.openai.com/v1',
      model: '',
      promptSuffix: '',
      responseLanguage: initialResponseLanguage,
      systemPrompt: BASE_SYSTEM_PROMPT,
      hydrateApiKey: async () => {
        try {
          const apiKey = await apiKeyStorage.get();
          set({apiKey: apiKey ?? ''});
        } catch (error) {
          console.warn('Could not read the API key from storage.', error);
        }
      },
      setApiKey: async value => {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
          await apiKeyStorage.remove();
        } else {
          await apiKeyStorage.set(trimmed);
        }
        set({apiKey: trimmed});
      },
      setBaseUrl: baseUrl => set({baseUrl}),
      setModel: model => set({model}),
      setPromptSuffix: promptSuffix => set({promptSuffix}),
      setResponseLanguage: responseLanguage => set({responseLanguage}),
      setSystemPrompt: systemPrompt => set({systemPrompt}),
      resetSystemPrompt: () => set({systemPrompt: BASE_SYSTEM_PROMPT}),
    }),
    {
      name: 'settings:v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        baseUrl: state.baseUrl,
        model: state.model,
        promptSuffix: state.promptSuffix,
        responseLanguage: state.responseLanguage,
        systemPrompt: state.systemPrompt,
      }),
    },
  ),
);
