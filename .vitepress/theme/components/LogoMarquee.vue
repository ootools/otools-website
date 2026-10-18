<script setup lang="ts">
import { computed } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { pluginLandingKeys, pluginLandingMeta } from '../plugins/registry';

const { t } = useI18n();

// 跑马灯只取有真实 logo 的插件（全部落地页插件都有 logo.svg）。
// 复制一份做无缝循环。
const logos = computed(() =>
  pluginLandingKeys.map((k) => ({
    key: k,
    name: pluginLandingMeta[k].name,
    src: withBase(`/plugin-logos/${k}.svg`),
  })),
);
</script>

<template>
  <section class="ot-marquee">
    <div class="ot-marquee-label">{{ t('home.marquee.label') }}</div>
    <div class="ot-marquee-track">
      <img
        v-for="(l, i) in [...logos, ...logos]"
        :key="`${l.key}-${i}`"
        :src="l.src"
        :alt="l.name"
        :title="l.name"
        loading="lazy"
      />
    </div>
  </section>
</template>
