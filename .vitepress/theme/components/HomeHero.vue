<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { accentOf, heroWindows, logoUrl, pluginName, shotUrl } from '../home/homeData';

const { t, tm, localeKey } = useI18n();

const slides = computed(() =>
  heroWindows.map((w) => ({
    ...w,
    accent: accentOf(w.plugin),
    logo: withBase(logoUrl(w.plugin)),
    src: withBase(shotUrl(w.plugin, w.scene, localeKey.value)),
    name: pluginName[w.plugin] ?? w.plugin,
    title: (tm(`home.hero.windows.${w.key}.title`) as string) ?? '',
    sub: (tm(`home.hero.windows.${w.key}.sub`) as string) ?? '',
  })),
);

const active = ref(0);
let timer: number | null = null;
const paused = ref(false);

const go = (i: number) => {
  active.value = (i + slides.value.length) % slides.value.length;
};

const start = () => {
  stop();
  timer = window.setInterval(() => {
    if (!paused.value) go(active.value + 1);
  }, 3600);
};
const stop = () => {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
};

// 文案链接
const localeBase = computed(() =>
  localeKey.value && localeKey.value !== 'root' ? `/${localeKey.value}/` : '/',
);
const withLocale = (p: string) => (localeBase.value === '/' ? `/${p}` : `${localeBase.value}${p}`);

const docsLink = computed(() => withBase(withLocale('guide/overview')));
const featuresLink = computed(() => withBase(withLocale('features')));

// 二维码弹窗
const modalOpen = ref(false);
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') modalOpen.value = false;
};

onMounted(() => {
  start();
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  stop();
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <section id="home" class="ot-hero">
    <div class="ot-hero-bg">
      <div class="ot-hero-grid"></div>
      <span class="ot-glow ot-glow--a"></span>
      <span class="ot-glow ot-glow--b"></span>
      <span class="ot-glow ot-glow--c"></span>
    </div>

    <div class="ot-wrap">
      <div class="ot-hero-inner">
        <!-- 左：文案 -->
        <div class="ot-hero-copy">
          <span class="ot-eyebrow">{{ t('home.hero.eyebrow') }}</span>
          <h1 class="ot-hero-title">
            {{ t('home.hero.titleLine1') }}
            <span class="ot-line-2">{{ t('home.hero.titleLine2') }}</span>
          </h1>
          <p class="ot-hero-desc" v-html="t('home.hero.desc')"></p>

          <div class="ot-hero-actions">
            <button type="button" class="ot-btn ot-btn--primary" @click="modalOpen = true">
              {{ t('home.hero.ctaDownload') }}
            </button>
            <a class="ot-btn ot-btn--ghost" :href="docsLink">
              {{ t('home.hero.ctaDocs') }}
            </a>
          </div>

          <div class="ot-hero-badges">
            <span v-for="(b, i) in (tm('home.hero.badges') as string[])" :key="i">{{ b }}</span>
          </div>
        </div>

        <!-- 右：3D 窗口轮播 -->
        <div
          class="ot-stage"
          :style="{ '--ot-accent': slides[active].accent[0] }"
          @mouseenter="paused = true"
          @mouseleave="paused = false"
        >
          <div class="ot-window">
            <div class="ot-window-frame">
              <div class="ot-window-bar">
                <span class="ot-dot ot-dot--r"></span>
                <span class="ot-dot ot-dot--y"></span>
                <span class="ot-dot ot-dot--g"></span>
                <span class="ot-window-title">
                  OTools · <b>{{ slides[active].name }}</b>
                </span>
              </div>
              <div class="ot-window-body">
                <img
                  v-for="(s, i) in slides"
                  :key="s.key"
                  :class="{ 'is-on': i === active }"
                  :src="s.src"
                  :alt="s.name"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <!-- 悬浮插件徽章 -->
          <div class="ot-stage-chip">
            <img :src="slides[active].logo" :alt="slides[active].name" />
            <div>
              <div class="ot-chip-name">{{ slides[active].name }}</div>
              <div class="ot-chip-sub">{{ slides[active].title }}</div>
            </div>
          </div>

          <!-- 指示点 -->
          <div class="ot-stage-dots">
            <button
              v-for="(s, i) in slides"
              :key="s.key"
              :class="{ 'is-on': i === active }"
              type="button"
              :aria-label="s.name"
              @click="go(i)"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <div class="ot-scroll-hint">
      <i></i>
      {{ t('home.hero.scroll') }}
    </div>

    <Transition name="ot-fade">
      <div v-if="modalOpen" class="ot-modal-mask" @click="modalOpen = false">
        <div class="ot-modal" @click.stop>
          <button class="ot-modal-close" @click="modalOpen = false">✕</button>
          <h3>{{ t('home.hero.modalTitle') }}</h3>
          <p>{{ t('home.hero.modalDesc') }}</p>
          <img :src="withBase('/weixin.jpg')" alt="WeChat" loading="lazy" />
        </div>
      </div>
    </Transition>
  </section>
</template>
