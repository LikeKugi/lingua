export const LANGUAGES = [
  {code: 'ru', label: 'Русский'},
  {code: 'en', label: 'English'},
  {code: 'de', label: 'Deutsch'},
  {code: 'fr', label: 'Français'},
  {code: 'es', label: 'Español'},
  {code: 'it', label: 'Italiano'},
  {code: 'pt', label: 'Português'},
  {code: 'zh', label: '中文'},
  {code: 'ja', label: '日本語'},
  {code: 'ko', label: '한국어'},
] as const;

export const languageLabel = (code: string) =>
  LANGUAGES.find(language => language.code === code)?.label ?? code;
