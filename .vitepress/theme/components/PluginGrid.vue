<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { pluginLandingKeys, pluginLandingMeta } from '../plugins/registry';

const { t, localeKey } = useI18n();
const root = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

// 卡片链接跟随当前语言：非根语言（en/ja/ko/fr/es/de/ru）跳到各自的
// `<lang>/plugins/<key>` 页面，否则日语用户点卡会落到中文页。
const cards = computed(() =>
  pluginLandingKeys.map((key) => ({
    key,
    name: pluginLandingMeta[key].name,
    colors: pluginLandingMeta[key].colors,
    logo: withBase(`/plugin-logos/${key}.svg`),
    href: withBase(localeKey.value === 'root' ? `/plugins/${key}` : `/${localeKey.value}/plugins/${key}`),
  })),
);

onMounted(() => {
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io?.unobserve(e.target); }
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
  );
  root.value?.querySelectorAll('.pg-reveal').forEach((el) => io?.observe(el));
});
onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <section id="plugin-pages" ref="root" class="pg-section">
    <div class="pg-container">
      <header class="pg-head pg-reveal">
        <h2>{{ t('pluginGrid.title') }}</h2>
        <p>{{ t('pluginGrid.subtitle') }}</p>
      </header>
      <div class="pg-grid">
        <a
          v-for="(c, i) in cards"
          :key="c.key"
          class="pg-card pg-reveal"
          :style="{ '--pg-from': c.colors[0], '--pg-to': c.colors[1], '--pg-ink': c.colors[1], '--d': `${i * 60}ms` }"
          :href="c.href"
        >
          <span class="pg-icon"><img :src="c.logo" :alt="c.name" /></span>
          <span class="pg-name">{{ c.name }}</span>
          <span class="pg-tagline">{{ t(`pluginLanding.${c.key}.tagline`) }}</span>
          <span class="pg-more">{{ t('pluginGrid.more') }} →</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pg-section { padding: 72px 0; }
.pg-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
.pg-head { text-align: center; max-width: 720px; margin: 0 auto 40px; }
.pg-head h2 { font-size: 34px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.01em; }
.pg-head p { color: var(--vp-c-text-2); font-size: 15px; margin: 0; }
.pg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
.pg-card {
  position: relative; display: flex; flex-direction: column; gap: 6px;
  padding: 24px 22px; border-radius: 16px; border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); text-decoration: none; overflow: hidden;
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
}
.pg-card::before {
  content: ''; position: absolute; inset: 0 auto auto 0; width: 100%; height: 3px;
  background: linear-gradient(90deg, var(--pg-from), var(--pg-to));
  transform: scaleX(0); transform-origin: left; transition: transform .28s ease;
}
.pg-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(15, 23, 42, .12); border-color: color-mix(in srgb, var(--pg-from) 40%, transparent); }
.pg-card:hover::before { transform: scaleX(1); }
.pg-icon {
  width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 8px;
  background: linear-gradient(135deg, var(--pg-from), var(--pg-to));
}
.pg-icon img { width: 26px; height: 26px; filter: brightness(0) invert(1); }
.pg-name { font-size: 18px; font-weight: 700; color: var(--vp-c-text-1); }
.pg-tagline { font-size: 13.5px; line-height: 1.6; color: var(--vp-c-text-2); min-height: 42px; }
.pg-more { margin-top: 6px; font-size: 13px; font-weight: 600; color: var(--pg-ink); }
.pg-reveal { opacity: 0; transform: translateY(18px); transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1); transition-delay: var(--d, 0ms); }
.pg-reveal.is-visible { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { .pg-reveal { opacity: 1; transform: none; transition: none; } }
</style>
