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

  // 回退顺序：当前语言 → 英语 → 中文。
  // 新增的首页文案（home.*）目前只精写了 zh / en；日语、韩语、法语等语种缺 key 时
  // **先回退英语**，避免整站用户看到中文原文，或原始 key 直接露到界面上。
  const fallbackChain = computed<Messages[]>(() => {
    const chain: Messages[] = [localeMessages.value];
    if (localeKey.value !== 'en') chain.push(messages.en);
    if (localeKey.value !== 'root') chain.push(messages.root);
    return chain;
  });

  const t = (key: string, fallback?: string) => {
    for (const m of fallbackChain.value) {
      const value = getByPath(m, key);
      if (typeof value === 'string') return value;
    }
    return fallback ?? key;
  };

  const tm = (key: string) => {
    for (const m of fallbackChain.value) {
      const value = getByPath(m, key);
      if (value !== undefined) return value;
    }
    return undefined;
  };

  return { t, tm, localeKey };
};
