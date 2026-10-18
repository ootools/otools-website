<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { useReveal } from '../home/useReveal';
import { pluginLandingKeys, pluginLandingMeta } from '../plugins/registry';

const { t, localeKey } = useI18n();
const { root } = useReveal();

const cards = computed(() =>
  pluginLandingKeys.map((key) => ({
    key,
    name: pluginLandingMeta[key].name,
    colors: pluginLandingMeta[key].colors,
    logo: withBase(`/plugin-logos/${key}.svg`),
    href: withBase(
      localeKey.value === 'root' ? `/plugins/${key}` : `/${localeKey.value}/plugins/${key}`,
    ),
  })),
);
</script>

<template>
  <section id="plugins" ref="root" class="ot-section ot-section--tight">
    <div class="ot-wrap">
      <div class="ot-center">
        <span class="ot-eyebrow ot-reveal">{{ t('home.grid.eyebrow') }}</span>
        <h2 class="ot-h2 ot-reveal" style="--d: 60ms" v-html="t('home.grid.title')"></h2>
        <p class="ot-sub ot-reveal" style="--d: 120ms">{{ t('home.grid.subtitle') }}</p>
      </div>

      <div class="ot-grid">
        <a
          v-for="c in cards"
          :key="c.key"
          class="ot-grid-card"
          :style="{ '--gc-0': c.colors[0], '--gc-1': c.colors[1] }"
          :href="c.href"
        >
          <img :src="c.logo" :alt="c.name" loading="lazy" />
          <span>{{ c.name }}</span>
        </a>
      </div>
    </div>
  </section>
</template>
