<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { useReveal } from '../home/useReveal';
import { accentOf, logoUrl, pluginName, replaceGroups, shotUrl } from '../home/homeData';

const { t, tm, localeKey } = useI18n();
const { root } = useReveal();

const groups = computed(() =>
  replaceGroups.map((g) => ({
    ...g,
    title: (tm(`home.replace.groups.${g.key}.title`) as string) ?? g.key,
    sub: (tm(`home.replace.groups.${g.key}.sub`) as string) ?? '',
    accent: g.key === 'office' ? ['#5b8def', '#2f5bb0'] : g.key === 'creative' ? ['#ec4899', '#8b5cf6'] : ['#fb923c', '#dc2626'],
    items: g.items.map((it) => ({
      ...it,
      accent: accentOf(it.plugin)[0],
      logo: withBase(logoUrl(it.plugin)),
      shot: withBase(shotUrl(it.plugin, it.scene, localeKey.value)),
      name: pluginName[it.plugin] ?? it.plugin,
      note: (tm(`home.replace.items.${it.id}`) as string) ?? '',
    })),
  })),
);
</script>

<template>
  <section id="replace" ref="root" class="ot-section">
    <div class="ot-wrap">
      <div class="ot-center">
        <span class="ot-eyebrow ot-reveal">{{ t('home.replace.eyebrow') }}</span>
        <h2 class="ot-h2 ot-reveal" style="--d: 60ms" v-html="t('home.replace.title')"></h2>
        <p class="ot-sub ot-reveal" style="--d: 120ms">{{ t('home.replace.subtitle') }}</p>
      </div>

      <div class="ot-replace-groups">
        <div
          v-for="(g, gi) in groups"
          :key="g.key"
          class="ot-replace-group ot-reveal"
          :style="{
            '--rg-accent-0': g.accent[0],
            '--rg-accent-1': g.accent[1],
            '--d': `${gi * 90}ms`,
          }"
        >
          <div class="ot-replace-head">
            <span class="ot-rg-icon">{{ g.icon }}</span>
            <div>
              <h3>{{ g.title }}</h3>
              <p>{{ g.sub }}</p>
            </div>
          </div>

          <div class="ot-replace-grid">
            <div
              v-for="it in g.items"
              :key="it.id"
              class="ot-replace-card"
              :style="{ '--rc-accent': it.accent }"
            >
              <span class="ot-rc-badge">{{ t('home.replace.badge') }}</span>
              <span class="ot-rc-thumb"><img :src="it.shot" :alt="it.name" loading="lazy" /></span>
              <span class="ot-rc-body">
                <span class="ot-rc-from">{{ it.from }}</span>
                <span class="ot-rc-to">
                  <img :src="it.logo" :alt="it.name" loading="lazy" />
                  {{ it.name }}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
