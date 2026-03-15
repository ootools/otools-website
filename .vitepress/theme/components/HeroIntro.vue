<template>
  <section id="home" class="relative overflow-hidden bg-dark pt-28 pb-20 min-h-[calc(100vh-50px)] flex items-center">
    <div class="container">
      <div class="flex flex-wrap -mx-4 items-center">
        <div class="w-full lg:w-5/12 px-4">
          <h1 class="text-white font-bold text-4xl sm:text-5xl leading-tight mb-6 typing-line">
            <span class="typing-ghost">{{ fullTitle }}</span>
            <span class="typing-text" :class="{ 'show-cursor': typingPhase === 'title' }">{{ typedTitle }}</span>
          </h1>
          <p class="text-gray-300 text-lg mb-8 typing-line typing-paragraph">
            <span class="typing-ghost">{{ fullDesc }}</span>
            <span class="typing-text" :class="{ 'show-cursor': typingPhase === 'desc' }">{{ typedDesc }}</span>
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-lg shadow-lg transition hover:bg-primary/90"
              @click="openDownloadModal"
            >
              {{ t('hero.cta.download') }}
            </button>
            <a
              :href="docsLink"
              class="inline-flex items-center justify-center border border-white/40 text-white px-8 py-3 rounded-lg transition hover:bg-white/10"
            >
              {{ t('hero.cta.docs') }}
            </a>
          </div>
          <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/80">
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">40+</div>
              <div class="text-sm">{{ t('hero.stats.ecosystem') }}</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Tabs</div>
              <div class="text-sm">{{ t('hero.stats.tabs') }}</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Rust</div>
              <div class="text-sm">{{ t('hero.stats.rust') }}</div>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-7/12 px-4 mt-12 lg:mt-0">
          <div class="hero-app">
            <div class="hero-app-tabs">
              <button
                v-for="(tab, index) in tabs"
                :key="tab.key"
                class="hero-tab"
                :class="{ active: index === activeTab }"
                @mouseenter="activeTab = index"
                @click="openOverlay(index)"
              >
                <span class="tab-dot"></span>
                {{ tab.label }}
              </button>
            </div>
            <div class="hero-app-body">
              <div class="hero-app-screen" :style="screenStyle" @click="openOverlay(activeTab)">
                <div class="hero-app-overlay">
                  <div class="screen-title">{{ tabs[activeTab].title }}</div>
                  <div class="screen-desc">{{ tabs[activeTab].desc }}</div>
                </div>
                <div class="screen-grid">
                  <span v-for="n in 8" :key="n"></span>
                </div>
              </div>
              <div class="hero-mini-cards">
                <div
                  v-for="(card, index) in tabs[activeTab].cards"
                  :key="card.title"
                  class="hero-mini-card"
                  :style="{ animationDelay: `${index * 0.08}s` }"
                >
                  <div class="mini-title">{{ card.title }}</div>
                  <div class="mini-text">{{ card.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="hero-overlay">
      <div v-if="overlayOpen" class="hero-overlay" @click="closeOverlay">
        <div class="hero-overlay-card" :class="{ 'compare-mode': hasCompareImages }" @click.stop>
          <div class="hero-overlay-inner">
            <div class="hero-overlay-header">
              <div class="overlay-title">
                {{ tabs[overlayTab].title }}
              </div>
              <button class="overlay-close" @click="closeOverlay">✕</button>
            </div>
            <div class="hero-overlay-body" :style="overlayStyle">
            <div
              v-if="hasCompareImages"
              ref="compareWrap"
              class="hero-compare"
              :class="{ 'is-dragging': compareDragging }"
              :style="{ '--compare-percent': `${comparePercent}%` }"
              @pointerdown="startCompare"
              @pointermove="moveCompare"
                @pointerup="endCompare"
                @pointerleave="endCompare"
                @pointercancel="endCompare"
              >
                <img
                  class="hero-compare-base"
                  :src="overlayImages.dark"
                  :alt="`${tabs[overlayTab].title} ${t('common.dark')}`"
                  loading="lazy"
                />
                <div class="hero-compare-top">
                  <img
                    class="hero-compare-image"
                    :src="overlayImages.light"
                    :alt="`${tabs[overlayTab].title} ${t('common.light')}`"
                    loading="lazy"
                  />
                </div>
              <div class="hero-compare-handle" :style="{ left: `${comparePercent}%` }">
                <span class="hero-compare-line"></span>
                <span class="hero-compare-knob"></span>
              </div>
              <div class="hero-compare-hint">{{ t('common.compareHint') }}</div>
            </div>
              <div v-else class="overlay-caption">{{ t('common.overlayPlaceholder') }}</div>
            </div>
            <div class="hero-overlay-footer">
              {{ tabs[overlayTab].desc }}
            </div>
          </div>
          <button
            class="hero-overlay-nav hero-overlay-prev"
            @click.stop="prevOverlayTab"
            :aria-label="t('common.prev')"
          >
            ‹
          </button>
          <button
            class="hero-overlay-nav hero-overlay-next"
            @click.stop="nextOverlayTab"
            :aria-label="t('common.next')"
          >
            ›
          </button>
        </div>
      </div>
    </transition>

    <transition name="hero-overlay">
      <div v-if="downloadModalOpen" class="hero-overlay beta-overlay" @click="closeDownloadModal">
        <div class="beta-overlay-card" @click.stop>
          <div class="beta-overlay-header">
            <div class="beta-overlay-title">{{ t('hero.betaModal.title') }}</div>
            <button class="beta-overlay-close" @click="closeDownloadModal">✕</button>
          </div>
          <div class="beta-overlay-body">
            <img class="beta-qr" src="/weixin.jpg" alt="WeChat QR" loading="lazy" />
            <p class="beta-overlay-desc">{{ t('hero.betaModal.desc') }}</p>
          </div>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';
import { useI18n } from '../i18n';

const { localePath } = useData();
const { t, tm } = useI18n();

const localeBase = computed(() => localePath?.value ?? '/');
const withLocale = (path: string) => (localeBase.value === '/' ? `/${path}` : `${localeBase.value}${path}`);
const docsLink = computed(() => withLocale('guide/overview'));

const tabMeta = [
  {
    key: 'home',
    colors: ['#1d4ed8', '#0ea5e9'],
    imageLight: '/crop/home-light.png',
    imageDark: '/crop/home.png',
  },
  {
    key: 'git',
    colors: ['#0f172a', '#1d4ed8'],
    imageLight: '/crop/git-light.png',
    imageDark: '/crop/git.png',
  },
  {
    key: 'dbm',
    colors: ['#0f766e', '#2dd4bf'],
    imageLight: '/crop/dbm-light.png',
    imageDark: '/crop/dbm.png',
  },
  {
    key: 'ssh',
    colors: ['#0f766e', '#22c55e'],
    imageLight: '/crop/ssh-light.png',
    imageDark: '/crop/ssh.png',
  },
  {
    key: 'servrun',
    colors: ['#7c3aed', '#a78bfa'],
    imageLight: '/crop/servrun-light.png',
    imageDark: '/crop/servrun.png',
  },
  {
    key: 'ollama',
    colors: ['#6d28d9', '#a855f7'],
    imageLight: '/crop/ollama-light.png',
    imageDark: '/crop/ollama.png',
  },
  {
    key: 'audio',
    colors: ['#f97316', '#facc15'],
    imageLight: '/crop/audio-light.png',
    imageDark: '/crop/audio.png',
  },
  {
    key: 'http',
    colors: ['#0ea5e9', '#38bdf8'],
    imageLight: '/crop/http-light.png',
    imageDark: '/crop/http.png',
  },
];

const tabs = computed(() =>
  tabMeta.map((meta) => {
    const text = (tm(`hero.tabs.${meta.key}`) as {
      label?: string;
      title?: string;
      desc?: string;
      cards?: Array<{ title: string; desc: string }>;
    }) || {};
    return {
      ...meta,
      label: text.label ?? meta.key,
      title: text.title ?? '',
      desc: text.desc ?? '',
      cards: text.cards ?? [],
    };
  })
);

const activeTab = ref(0);
const overlayOpen = ref(false);
const overlayTab = ref(0);
const downloadModalOpen = ref(false);
const compareWrap = ref<HTMLElement | null>(null);
const compareRatio = ref(0.5);
const compareDragging = ref(false);
let compareWindowBound = false;
const typedTitle = ref('');
const typedDesc = ref('');
const typingPhase = ref<'title' | 'desc' | 'done'>('title');
const fullTitle = computed(() => t('hero.title'));
const fullDesc = computed(() => t('hero.desc'));
const titlePrefixTyped = computed(() => t('hero.titlePrefix'));
const titleSuffix = computed(() => t('hero.titleSuffix'));
let typingTimer: number | null = null;
let typingStopped = false;
let tabTimer: number | null = null;

const screenStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs.value[activeTab.value].colors[0]}, ${tabs.value[activeTab.value].colors[1]})`,
}));

const overlayStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs.value[overlayTab.value].colors[0]}, ${tabs.value[overlayTab.value].colors[1]})`,
}));

const overlayImages = computed(() => {
  const tab = tabs.value[overlayTab.value];
  const light = tab.imageLight || tab.imageDark || '';
  const dark = tab.imageDark || tab.imageLight || '';
  return { light, dark };
});

const hasCompareImages = computed(() => Boolean(overlayImages.value.light && overlayImages.value.dark));

const comparePercent = computed(() => Math.round(compareRatio.value * 100));

const openOverlay = (index: number) => {
  activeTab.value = index;
  overlayTab.value = index;
  overlayOpen.value = true;
  compareRatio.value = 0.5;
  compareDragging.value = false;
};

const openDownloadModal = () => {
  downloadModalOpen.value = true;
};

const closeDownloadModal = () => {
  downloadModalOpen.value = false;
};

const closeOverlay = () => {
  overlayOpen.value = false;
  compareDragging.value = false;
  unbindCompareWindowEvents();
};

const prevOverlayTab = () => {
  overlayTab.value = (overlayTab.value - 1 + tabs.value.length) % tabs.value.length;
  activeTab.value = overlayTab.value;
  compareRatio.value = 0.5;
};

const nextOverlayTab = () => {
  overlayTab.value = (overlayTab.value + 1) % tabs.value.length;
  activeTab.value = overlayTab.value;
  compareRatio.value = 0.5;
};

const updateCompareFromEvent = (event: PointerEvent) => {
  const wrap = compareWrap.value;
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  compareRatio.value = rect.width ? x / rect.width : 0.5;
};

const bindCompareWindowEvents = () => {
  if (compareWindowBound) return;
  compareWindowBound = true;
  window.addEventListener('pointermove', moveCompare);
  window.addEventListener('pointerup', endCompare);
  window.addEventListener('pointercancel', endCompare);
};

const unbindCompareWindowEvents = () => {
  if (!compareWindowBound) return;
  compareWindowBound = false;
  window.removeEventListener('pointermove', moveCompare);
  window.removeEventListener('pointerup', endCompare);
  window.removeEventListener('pointercancel', endCompare);
};

const startCompare = (event: PointerEvent) => {
  if (!hasCompareImages.value) return;
  event.preventDefault();
  compareDragging.value = true;
  updateCompareFromEvent(event);
  compareWrap.value?.setPointerCapture?.(event.pointerId);
  bindCompareWindowEvents();
};

const moveCompare = (event: PointerEvent) => {
  if (!compareDragging.value) return;
  updateCompareFromEvent(event);
};

const endCompare = (event: PointerEvent) => {
  if (!compareDragging.value) return;
  compareDragging.value = false;
  compareWrap.value?.releasePointerCapture?.(event.pointerId);
  unbindCompareWindowEvents();
};

const clearTypingTimer = () => {
  if (typingTimer !== null) {
    window.clearTimeout(typingTimer);
    typingTimer = null;
  }
};

const clearTabTimer = () => {
  if (tabTimer !== null) {
    window.clearInterval(tabTimer);
    tabTimer = null;
  }
};

const startTabAuto = () => {
  clearTabTimer();
  tabTimer = window.setInterval(() => {
    if (overlayOpen.value) return;
    activeTab.value = (activeTab.value + 1) % tabs.value.length;
  }, 5000);
};

const typeText = (text: string, target: typeof typedTitle, speed: number, prefix = '') =>
  new Promise<void>((resolve) => {
    let index = 0;
    const step = () => {
      if (typingStopped) {
        resolve();
        return;
      }
      index += 1;
      target.value = `${prefix}${text.slice(0, index)}`;
      if (index < text.length) {
        typingTimer = window.setTimeout(step, speed);
      } else {
        resolve();
      }
    };
    step();
  });

const eraseMiddle = (text: string, start: number, count: number, target: typeof typedTitle, speed: number) =>
  new Promise<void>((resolve) => {
    let removed = 0;
    const step = () => {
      if (typingStopped) {
        resolve();
        return;
      }
      removed += 1;
      const head = text.slice(0, start);
      const tail = text.slice(start + removed);
      target.value = head + tail;
      if (removed < count) {
        typingTimer = window.setTimeout(step, speed);
      } else {
        resolve();
      }
    };
    step();
  });

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    typingTimer = window.setTimeout(resolve, ms);
  });

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    overlayOpen.value = false;
    downloadModalOpen.value = false;
  }
};

onMounted(() => {
  void (async () => {
    while (!typingStopped) {
      typedTitle.value = '';
      typedDesc.value = '';
      typingPhase.value = 'title';
      await typeText(titlePrefixTyped.value, typedTitle, 95);
      if (typingStopped) return;
      await wait(1000);
      await eraseMiddle(titlePrefixTyped.value, 1, 4, typedTitle, 140);
      if (typingStopped) return;
      await wait(220);
      await typeText(titleSuffix.value, typedTitle, 95, typedTitle.value);
      if (typingStopped) return;
      typingPhase.value = 'desc';
      await wait(180);
      await typeText(fullDesc.value, typedDesc, 65);
      typingPhase.value = 'done';
      await wait(4200);
    }
  })();
  startTabAuto();
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  typingStopped = true;
  clearTypingTimer();
  clearTabTimer();
  unbindCompareWindowEvents();
  window.removeEventListener('keydown', onKeydown);
});
</script>
