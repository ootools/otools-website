<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';
import { useReveal } from '../home/useReveal';
import { platformCards, heroStats } from '../home/homeData';

const { t, tm } = useI18n();
const { root } = useReveal();

const accents: Record<string, [string, string]> = {
  free: ['#34d399', '#059669'],
  mcp: ['#4f8cff', '#22d3ee'],
  tabs: ['#a855f7', '#6366f1'],
  rust: ['#fb923c', '#f43f5e'],
};

const cards = computed(() =>
  platformCards.map((c) => ({
    ...c,
    accent: accents[c.key] ?? ['#4f8cff', '#22d3ee'],
    title: (tm(`home.platform.cards.${c.key}.title`) as string) ?? c.key,
    desc: (tm(`home.platform.cards.${c.key}.desc`) as string) ?? '',
  })),
);

const stats = computed(() =>
  heroStats.map((s) => ({
    ...s,
    label: (tm(`home.platform.stats.${s.key}`) as string) ?? s.key,
  })),
);
</script>

<template>
  <section id="platform" ref="root" class="ot-section">
    <div class="ot-wrap">
      <div class="ot-center">
        <span class="ot-eyebrow ot-reveal">{{ t('home.platform.eyebrow') }}</span>
        <h2 class="ot-h2 ot-reveal" style="--d: 60ms" v-html="t('home.platform.title')"></h2>
        <p class="ot-sub ot-reveal" style="--d: 120ms">{{ t('home.platform.subtitle') }}</p>
      </div>

      <div class="ot-platform-grid">
        <div
          v-for="(c, i) in cards"
          :key="c.key"
          class="ot-platform-card ot-reveal"
          :style="{ '--pc-accent': c.accent[0], '--d': `${i * 80}ms` }"
        >
          <div class="ot-pc-icon">{{ c.icon }}</div>
          <div class="ot-pc-metric">{{ c.metric }}</div>
          <h3>{{ c.title }}</h3>
          <p>{{ c.desc }}</p>
        </div>
      </div>

      <div class="ot-stats ot-reveal" style="--d: 200ms">
        <div v-for="s in stats" :key="s.key" class="ot-stat">
          <div class="ot-stat-value">{{ s.value }}</div>
          <div class="ot-stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
