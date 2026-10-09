# AGENTS.md

Файл-инструкция для ИИ-агентов (Claude Code, Cursor, Windsurf и т.п.) по разработке мобильного приложения **AI Error Explainer** на React Native + Expo Router.

---

## 1. Обзор проекта

**Название:** AI Error Explainer
**Платформа:** React Native (Expo SDK 51+) + Expo Router
**Назначение:** Приложение помогает пользователю понять, в чём он ошибся при выполнении языковых заданий (грамматика, синтаксис, лексика). Пользователь вводит задание, свой вариант ответа и правильный вариант — приложение отправляет запрос к LLM (OpenAI-совместимый провайдер) и отображает разбор ошибки.

**Целевая аудитория:** изучающие иностранные языки, студенты, преподаватели.

---

## 2. Технологический стек

- **React Native** + **Expo** (managed workflow)
- **Expo Router** (file-based routing, `app/` директория)
- **TypeScript** (strict mode)
- **Zustand** — глобальное состояние (настройки, история)
- **AsyncStorage** (`@react-native-async-storage/async-storage`) — локальное персистентное хранилище
- **fetch** или **axios** — HTTP-запросы к OpenAI-совместимому API
- **expo-secure-store** — для хранения API-ключа (безопаснее, чем AsyncStorage)
- **@expo/vector-icons** — иконки
- **expo-localization** — определение языка устройства

Стилизация: `StyleSheet` (без внешних UI-библиотек, чтобы не усложнять). Тёмная/светлая тема опционально.

---

## 3. Структура проекта

```
ai-error-explainer/
├── app/
│   ├── _layout.tsx              # Root layout, провайдеры, инициализация
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Tab navigator
│   │   ├── index.tsx            # Экран "Объяснение" (главный)
│   │   ├── history.tsx          # Экран "История"
│   │   ├── settings.tsx         # Экран "Настройки"
│   │   ├── system-prompt.tsx    # Экран "System Prompt"
│   │   └── prompts.tsx          # Экран "Промпты"
│   └── +not-found.tsx
├── src/
│   ├── api/
│   │   ├── client.ts            # Обёртка над fetch к OpenAI API
│   │   └── models.ts            # Запрос списка моделей у провайдера
│   ├── store/
│   │   ├── settingsStore.ts     # Zustand + persist (AsyncStorage/SecureStore)
│   │   ├── historyStore.ts      # Zustand + persist
│   │   └── promptsStore.ts      # Zustand + persist
│   ├── types/
│   │   └── index.ts             # Типы: Settings, HistoryItem, Prompt и т.д.
│   ├── constants/
│   │   ├── defaultPrompts.ts    # Предустановленные промпты
│   │   └── languages.ts         # Список языков для ответа
│   ├── lib/
│   │   ├── buildPrompt.ts       # Сборка финального промпта для LLM
│   │   └── storage.ts           # Хелперы AsyncStorage
│   └── components/
│       ├── TaskInput.tsx        # Компонент ввода задания (слова / предложение)
│       ├── WordListEditor.tsx   # Редактор списка слов
│       ├── HistoryCard.tsx
│       └── ...
├── assets/
├── app.json
├── package.json
├── tsconfig.json
└── AGENTS.md
```

---

## 4. Функциональные требования

### 4.1. Экран «Настройки» (`settings.tsx`)

Поля:

| Поле | Тип | Хранение | Описание |
|------|-----|----------|----------|
| API Key | string (secure) | expo-secure-store | Токен провайдера |
| Base URL | string | AsyncStorage | Адрес OpenAI-совместимого API (по умолчанию `https://api.openai.com/v1`) |
| Model | string (picker) | AsyncStorage | Выбор из списка, подгружаемого через `GET {baseUrl}/models` |
| Prompt Suffix | string (multiline) | AsyncStorage | Дополнение к промпту (добавляется в конец system prompt) |
| Response Language | string (picker) | AsyncStorage | Язык, на котором ИИ должен отвечать (ru, en, de, ...) |

Поведение:
- Кнопка «Загрузить модели» → запрос к `{baseUrl}/models` с `Authorization: Bearer {apiKey}` → заполнение выпадающего списка.
- Кнопка «Проверить подключение» — быстрый тест.
- Валидация URL и наличия ключа.
- Сохранение автоматическое (debounced) или по кнопке «Сохранить».

### 4.2. Экран «Объяснение» (`index.tsx`)

Форма:

1. **Тип задания** — переключатель (Segmented Control):
    - `words` — набор слов
    - `sentence` — предложение
2. **Ввод задания:**
    - если `words`: динамический список TextInput с кнопками «+ добавить слово» и «×» удаления. Значения сохраняются в массив `string[]`.
    - если `sentence`: один multiline TextInput.
3. **Ваш вариант (ошибочный)** — TextInput (multiline).
4. **Правильный вариант** — TextInput (multiline).
5. **Кнопка «Объяснить»** — активна, когда заполнены все обязательные поля и настроены API key / base URL / model.
6. **Область ответа** — под кнопкой отображается стримингом (или сразу) ответ модели. Поддерживается markdown-рендеринг (использовать `react-native-markdown-display`).

После получения ответа:
- Сохранить запись в `historyStore` (см. 4.3).
- Очистить форму — **опционально**, лучше оставить, чтобы пользователь мог сравнить.

Состояния: `idle | loading | success | error`. Ошибки сети/API выводить в Alert + inline.

### 4.3. Экран «История» (`history.tsx`)

- Список карточек: дата, тип задания, краткий фрагмент задания, вариант пользователя, превью ответа.
- Тап → раскрытие / переход на детальный просмотр (можно `app/history/[id].tsx`).
- Свайп или кнопка «Удалить» для удаления записи.
- Кнопка «Очистить всё».
- Хранение: Zustand + persist в AsyncStorage. Ключ `history:v1`.

Тип записи:
```ts
type HistoryItem = {
  id: string;              // uuid
  createdAt: number;       // timestamp
  taskType: 'words' | 'sentence';
  task: string | string[];
  userAnswer: string;
  correctAnswer: string;
  response: string;
  model: string;
  language: string;
};
```

### 4.4. Экран «System Prompt» (`system-prompt.tsx`)

- Многострочное поле с базовым system prompt.
- По умолчанию заполняется значением из `defaultPrompts.ts` (BASE_SYSTEM_PROMPT).
- Кнопка «Сбросить к стандартному».
- Сохраняется в `settingsStore`.
- Финальный системный промпт = `systemPrompt` + `\n\n` + `promptSuffix` (из настроек) + `\n\nОтвет дай на языке: {responseLanguage}`.

### 4.5. Экран «Промпты» (`prompts.tsx`)

- Список пользовательских промптов-шаблонов (few-shot / инструкции для конкретных типов заданий).
- Первые промпты предустановлены в `defaultPrompts.ts` (см. ниже).
- CRUD: добавление, редактирование, удаление, включение/отключение.
- Активные промпты добавляются в системный промпт перед запросом.

Тип:
```ts
type PromptTemplate = {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  builtin: boolean; // предустановленный — нельзя удалить, только отключить
};
```

---

## 5. Логика запроса к LLM

Файл `src/lib/buildPrompt.ts` собирает сообщения:

```ts
messages = [
  { role: 'system', content: systemPrompt + suffix + prompts + languageInstruction },
  { role: 'user', content: userPrompt }
]
```

`userPrompt` формируется так:

- Если `taskType === 'words'`:
  ```
  Задание: составить предложение из слов: [word1, word2, ...]
  ```
- Если `taskType === 'sentence'`:
  ```
  Задание: исходное предложение — "<task>"
  ```

Далее всегда:
```
Мой вариант: "<userAnswer>"
Правильный вариант: "<correctAnswer>"

Объясни, в чём именно я ошибся: разбери грамматику, синтаксис и лексику.
Ответ дай структурировано и на языке: <language>.
```

Запрос:
```ts
POST {baseUrl}/chat/completions
Headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
Body: { model, messages, temperature: 0.3, stream: false }
```

Обработка ошибок: 401 → «Неверный API-ключ», 404 → «Модель/URL не найдены», network → «Проверьте подключение».

---

## 6. Предустановленные промпты (`src/constants/defaultPrompts.ts`)

```ts
export const BASE_SYSTEM_PROMPT = `Ты — опытный преподаватель иностранных языков.
Твоя задача — объяснять учащемуся его ошибки.
Ты должен:
- разобрать грамматику (почему форма слова неверна),
- разобрать синтаксис (почему порядок/структура неверны),
- разобрать лексику (почему слово не подходит по смыслу),
- предложить корректный вариант и кратко пояснить правило.
Отвечай дружелюбно, структурировано, без воды.`;

export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'builtin-grammar',
    title: 'Грамматика',
    body: 'Обрати особое внимание на грамматические ошибки: времена, согласование, падежи, артикли.',
    enabled: true,
    builtin: true,
  },
  {
    id: 'builtin-syntax',
    title: 'Синтаксис',
    body: 'Проверь порядок слов, структуру предложения, согласование подлежащего и сказуемого.',
    enabled: true,
    builtin: true,
  },
  {
    id: 'builtin-lexis',
    title: 'Лексика',
    body: 'Проверь уместность выбранных слов, коллокации, идиоматичность.',
    enabled: true,
    builtin: true,
  },
  {
    id: 'builtin-examples',
    title: 'Примеры',
    body: 'Приведи 2–3 примера корректного употребления правила.',
    enabled: true,
    builtin: true,
  },
];
```

---

## 7. Хранение данных

- **API key** → `expo-secure-store` (`SecureStore.setItemAsync('apiKey', ...)`).
- **Остальные настройки, история, промпты** → AsyncStorage через `zustand/middleware` `persist`.
- Версионирование ключей: `settings:v1`, `history:v1`, `prompts:v1`.
- При миграции схемы — писать migrate-функции в `persist`.

Пример store:

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      baseUrl: 'https://api.openai.com/v1',
      model: '',
      promptSuffix: '',
      responseLanguage: 'ru',
      systemPrompt: BASE_SYSTEM_PROMPT,
      setBaseUrl: (v) => set({ baseUrl: v }),
      // ...
    }),
    {
      name: 'settings:v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ ...s, apiKey: undefined }), // apiKey — в SecureStore
    }
  )
);
```

---

## 8. Навигация (Expo Router)

`app/(tabs)/_layout.tsx` — 5 табов:

| Файл | Заголовок | Иконка (Ionicons) |
|------|-----------|-------------------|
| index | Объяснить | `chatbubbles-outline` |
| history | История | `time-outline` |
| prompts | Промпты | `list-outline` |
| system-prompt | System Prompt | `cog-outline` |
| settings | Настройки | `settings-outline` |

---

## 9. Соглашения по коду

- TypeScript strict, без `any`.
- Функциональные компоненты, хуки.
- Именование файлов компонентов — PascalCase, хуков — camelCase.
- Все строки UI — выносить в `src/i18n/` (хотя бы константой, для будущей локализации).
- Комментарии — только там, где не очевидно.
- Не добавлять зависимости без необходимости; для иконок — `@expo/vector-icons`.
- API-запросы — только в `src/api/`, компоненты не ходят в сеть напрямую.
- Обработка ошибок: try/catch, `console.warn` для dev, Alert для пользователя.

---

## 10. Пошаговый план разработки (для агента)

1. **Инициализация**: `npx create-expo-app@latest ai-error-explainer -t tabs` (TypeScript). Установить зависимости: `expo-router`, `zustand`, `@react-native-async-storage/async-storage`, `expo-secure-store`, `react-native-markdown-display`, `uuid`, `expo-localization`.
2. **Типы и константы**: создать `src/types/index.ts`, `src/constants/defaultPrompts.ts`, `src/constants/languages.ts`.
3. **Сторы**: `settingsStore`, `historyStore`, `promptsStore` (Zustand + persist).
4. **API-клиент**: `src/api/client.ts` (chat completions), `src/api/models.ts` (список моделей).
5. **Сборка промпта**: `src/lib/buildPrompt.ts`.
6. **Экраны**:
    1. `settings.tsx`
    2. `system-prompt.tsx`
    3. `prompts.tsx`
    4. `index.tsx` (объяснение) + компоненты `TaskInput`, `WordListEditor`
    5. `history.tsx` (+ опционально `history/[id].tsx`)
7. **Навигация**: настроить `(tabs)/_layout.tsx` с 5 табами.
8. **Тестирование**: ручной прогон каждого сценария на iOS/Android, обработка ошибок сети, пустых полей, отсутствия ключа.
9. **Полировка**: пустые состояния, лоадеры, тосты, темы.

---

## 11. Definition of Done

- [ ] Все 5 экранов реализованы и доступны через таб-бар.
- [ ] API-ключ хранится в SecureStore, остальное — в AsyncStorage.
- [ ] Список моделей подгружается с провайдера.
- [ ] Запрос к LLM уходит с корректно собранным промптом.
- [ ] Ответ сохраняется в историю и отображается с markdown.
- [ ] История сохраняется между запусками и позволяет удалять/очищать записи.
- [ ] System prompt и список промптов редактируются и персистятся.
- [ ] Все ошибки (сеть, ключ, модель) обрабатываются и показываются пользователю.
- [ ] TypeScript компилируется без ошибок (`tsc --noEmit`).
- [ ] Проект собирается через `npx expo start`, работает в Expo Go.

---

## 12. Что НЕ делать

- Не использовать Redux / MobX — только Zustand.
- Не хранить API-ключ в AsyncStorage.
- Не делать запросы к LLM из компонентов напрямую.
- Не использовать нативные модули, требующие eject из Expo.
- Не хардкодить строки UI в компонентах (по возможности выносить).
- Не подключать тяжёлые UI-киты (NativeBase, Paper) — базовый StyleSheet.

---

## 13. Полезные команды

```bash
npx expo start              # запуск дев-сервера
npx expo start --clear      # с очисткой кэша
npx tsc --noEmit            # проверка типов
npx expo-doctor             # диагностика проекта
```

---

Следуй этому документу как единому источнику правды. При неоднозначностях — уточняй у пользователя, не додумывай молча.
