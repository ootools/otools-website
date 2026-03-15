import { computed } from 'vue';
import { useData } from 'vitepress';

import zh from './locales/zh.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import ru from './locales/ru.json';

type Messages = Record<string, any>;

const messages: Record<string, Messages> = {
  root: zh,
  en,
  ja,
  ko,
  fr,
  es,
  de,
  ru,
};

const getByPath = (obj: Messages | undefined, key: string) => {
  if (!obj) return undefined;
  return key.split('.').reduce<any>((acc, part) => (acc ? acc[part] : undefined), obj);
};

export const useI18n = () => {
  const { localeIndex } = useData();
  const localeKey = computed(() => localeIndex?.value || 'root');

  const localeMessages = computed(() => messages[localeKey.value] ?? messages.root);

  const t = (key: string, fallback?: string) => {
    const value = getByPath(localeMessages.value, key);
    if (typeof value === 'string') return value;
    const rootValue = getByPath(messages.root, key);
    if (typeof rootValue === 'string') return rootValue;
    return fallback ?? key;
  };

  const tm = (key: string) => {
    const value = getByPath(localeMessages.value, key);
    if (value !== undefined) return value;
    return getByPath(messages.root, key);
  };

  return { t, tm, localeKey };
};
