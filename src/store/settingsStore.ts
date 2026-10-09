import {Platform} from 'react-native';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {getLocales} from 'expo-localization';
import {BASE_SYSTEM_PROMPT} from '../constants/defaultPrompts';
import {LANGUAGES} from '../constants/languages';

const API_KEY_STORAGE_KEY = 'apiKey';
// expo-secure-store has no web implementation; on web the key lives in memory for the session only.
export const isApiKeyPersisted = Platform.OS !== 'web';
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
        if (!isApiKeyPersisted) {
          return;
        }
        try {
          const apiKey = await SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
          set({apiKey: apiKey ?? ''});
        } catch (error) {
          console.warn('Could not read the API key from secure storage.', error);
        }
      },
      setApiKey: async value => {
        const trimmed = value.trim();
        if (!isApiKeyPersisted) {
          set({apiKey: trimmed});
          return;
        }
        if (trimmed.length === 0) {
          await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
        } else {
          await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, trimmed);
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
