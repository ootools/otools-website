<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { useReveal } from '../home/useReveal';
import { logoUrl, pluginName, portSources, portSteps } from '../home/homeData';

const { t, tm, localeKey } = useI18n();
const { root } = useReveal();

const sources = computed(() =>
  portSources.map((s) => ({
    ...s,
    logo: withBase(logoUrl(s.plugin)),
    name: pluginName[s.plugin] ?? s.plugin,
  })),
);

const steps = computed(() =>
  portSteps.map((k) => ({
    key: k,
    title: (tm(`home.dev.steps.${k}.title`) as string) ?? k,
    desc: (tm(`home.dev.steps.${k}.desc`) as string) ?? '',
  })),
);

const localeBase = computed(() =>
  localeKey.value && localeKey.value !== 'root' ? `/${localeKey.value}/` : '/',
);
const withLocale = (p: string) => (localeBase.value === '/' ? `/${p}` : `${localeBase.value}${p}`);
const devLink = computed(() => withBase(withLocale('guide/dev')));
const apiLink = computed(() => withBase(withLocale('guide/otools-api')));
</script>

<template>
  <section id="build" ref="root" class="ot-section ot-dev">
    <div class="ot-wrap">
      <div class="ot-dev-head">
        <div>
          <span class="ot-eyebrow ot-reveal">{{ t('home.dev.eyebrow') }}</span>
          <h2 class="ot-h2 ot-reveal" style="--d: 60ms" v-html="t('home.dev.title')"></h2>
          <p class="ot-sub ot-reveal" style="--d: 120ms">{{ t('home.dev.subtitle') }}</p>
        </div>
        <div class="ot-dev-actions ot-reveal" style="--d: 180ms">
          <a class="ot-btn ot-btn--primary" :href="devLink">{{ t('home.dev.ctaDev') }}</a>
          <a class="ot-btn ot-btn--ghost" :href="apiLink">{{ t('home.dev.ctaApi') }}</a>
        </div>
      </div>

      <!-- 上游来源 → OTools 插件的映射带 -->
      <div class="ot-dev-sources ot-reveal" style="--d: 220ms">
        <div class="ot-dev-sources-label">{{ t('home.dev.sourcesLabel') }}</div>
        <div class="ot-dev-sources-track">
          <div v-for="s in sources" :key="s.plugin" class="ot-dev-chip">
            <span class="ot-dev-chip-from">{{ s.from }}</span>
            <span class="ot-dev-chip-arrow">→</span>
            <img :src="s.logo" :alt="s.name" loading="lazy" />
            <span class="ot-dev-chip-to">{{ s.name }}</span>
            <span class="ot-dev-chip-lic">{{ s.license }}</span>
          </div>
        </div>
      </div>

      <!-- 移植三步 -->
      <div class="ot-dev-steps">
        <div
          v-for="(s, i) in steps"
          :key="s.key"
          class="ot-dev-step ot-reveal"
          :style="{ '--d': `${i * 90}ms` }"
        >
          <span class="ot-dev-step-no">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
