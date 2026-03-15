<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from '../i18n';

const { t, tm } = useI18n();

const compareMeta = [
  {
    key: 'home',
    colors: ['#1d4ed8', '#0ea5e9'],
    light: '/crop/home-light.png',
    dark: '/crop/home.png',
  },
  {
    key: 'git',
    colors: ['#0f172a', '#1d4ed8'],
    progressColors: ['#1d4ed8', '#60a5fa'],
    light: '/crop/git-light.png',
    dark: '/crop/git.png',
  },
  {
    key: 'dbm',
    colors: ['#0f766e', '#2dd4bf'],
    light: '/crop/dbm-light.png',
    dark: '/crop/dbm.png',
  },
  {
    key: 'ssh',
    colors: ['#0f766e', '#22c55e'],
    light: '/crop/ssh-light.png',
    dark: '/crop/ssh.png',
  },
  {
    key: 'servrun',
    colors: ['#7c3aed', '#a78bfa'],
    light: '/crop/servrun-light.png',
    dark: '/crop/servrun.png',
  },
  {
    key: 'ollama',
    colors: ['#6d28d9', '#a855f7'],
    light: '/crop/ollama-light.png',
    dark: '/crop/ollama.png',
  },
  {
    key: 'audio',
    colors: ['#f97316', '#facc15'],
    light: '/crop/audio-light.png',
    dark: '/crop/audio.png',
  },
  {
    key: 'http',
    colors: ['#0ea5e9', '#38bdf8'],
    light: '/crop/http-light.png',
    dark: '/crop/http.png',
  },
];

const compareTabs = computed(() =>
  compareMeta.map((meta) => {
    const text = (tm(`pluginShowcase.tabs.${meta.key}`) as {
      label?: string;
      subtitle?: string;
      features?: Array<{ title: string; desc: string }>;
    }) || {};
    return {
      ...meta,
      label: text.label ?? meta.key,
      subtitle: text.subtitle ?? '',
      features: text.features ?? [],
    };
  })
);

const compareTabIndex = ref(0);
const compareWrap = ref<HTMLElement | null>(null);
const compareRatio = ref(0);
const compareDragging = ref(false);
const autoPaused = ref(false);
let compareWindowBound = false;
let compareRaf: number | null = null;
let compareHoldTimer: number | null = null;
let autoTabTimer: number | null = null;
const progressKey = ref(0);
const autoIntervalMs = 5000;
const compareHoldMs = 1000;
const compareSlideMs = 3000;

const activeCompare = computed(() => compareTabs.value[compareTabIndex.value] ?? compareTabs.value[0]);
const comparePercent = computed(() => Math.round(compareRatio.value * 100));
const stageDim = computed(() => {
  const dim = (1 - compareRatio.value) * 0.55;
  return Math.min(0.55, Math.max(0, dim)).toFixed(3);
});

const bumpProgress = () => {
  progressKey.value += 1;
};

const activateCompareTab = (index: number, restartAuto = true) => {
  compareTabIndex.value = index;
  animateCompareToRight();
  bumpProgress();
  if (restartAuto && !autoPaused.value) {
    restartAutoTabs();
  }
};

const setCompareTab = (index: number) => {
  activateCompareTab(index, true);
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
  event.preventDefault();
  clearCompareRaf();
  clearCompareHold();
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

const clearCompareRaf = () => {
  if (compareRaf !== null) {
    window.cancelAnimationFrame(compareRaf);
    compareRaf = null;
  }
};

const clearCompareHold = () => {
  if (compareHoldTimer !== null) {
    window.clearTimeout(compareHoldTimer);
    compareHoldTimer = null;
  }
};

const animateCompareToRight = () => {
  clearCompareRaf();
  clearCompareHold();
  compareRatio.value = 0;
  const startAnimation = () => {
    const start = window.performance.now();
    const duration = compareSlideMs;
    const step = (now: number) => {
      if (compareDragging.value) {
        clearCompareRaf();
        return;
      }
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      compareRatio.value = eased;
      if (t < 1) {
        compareRaf = window.requestAnimationFrame(step);
      } else {
        compareRaf = null;
      }
    };
    compareRaf = window.requestAnimationFrame(step);
  };

  compareHoldTimer = window.setTimeout(() => {
    compareHoldTimer = null;
    if (!compareDragging.value) {
      startAnimation();
    }
  }, compareHoldMs);
};

const stopAutoTabs = () => {
  if (autoTabTimer !== null) {
    window.clearInterval(autoTabTimer);
    autoTabTimer = null;
  }
};

const startAutoTabs = () => {
  if (autoPaused.value) return;
  stopAutoTabs();
  autoTabTimer = window.setInterval(() => {
    if (compareDragging.value) return;
    const next = (compareTabIndex.value + 1) % compareTabs.value.length;
    activateCompareTab(next, false);
  }, autoIntervalMs);
};

const restartAutoTabs = () => {
  startAutoTabs();
};

const pauseAutoTabs = () => {
  autoPaused.value = true;
  stopAutoTabs();
};

const resumeAutoTabs = () => {
  autoPaused.value = false;
  const next = (compareTabIndex.value + 1) % compareTabs.value.length;
  activateCompareTab(next, false);
  startAutoTabs();
};

onMounted(() => {
  animateCompareToRight();
  bumpProgress();
  startAutoTabs();
});

onBeforeUnmount(() => {
  clearCompareRaf();
  clearCompareHold();
  unbindCompareWindowEvents();
  stopAutoTabs();
});
</script>

<template>
  <section id="plugins" class="py-20">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-6">
        <h2 class="text-3xl font-bold text-dark mb-4">{{ t('pluginShowcase.title') }}</h2>
        <p class="text-body-color">{{ t('pluginShowcase.subtitle') }}</p>
      </div>
      <div class="tabs-compare-panel plugin-compare-panel">
        <div class="tabs-compare-layout">
          <div
            class="plugin-compare-stage"
            :style="{
              '--stage-from': activeCompare.colors?.[0],
              '--stage-to': activeCompare.colors?.[1],
              '--stage-dim': stageDim,
            }"
            @mouseenter="pauseAutoTabs"
            @mouseleave="resumeAutoTabs"
          >
            <div class="plugin-compare-grid">
              <span v-for="n in 12" :key="n"></span>
            </div>
            <div class="plugin-compare-content">
            <div
              ref="compareWrap"
              class="tabs-compare-screen"
              :class="{ 'is-dragging': compareDragging }"
              :style="{ '--compare-percent': `${comparePercent}%` }"
              @pointerdown="startCompare"
              @pointermove="moveCompare"
                @pointerup="endCompare"
                @pointerleave="endCompare"
                @pointercancel="endCompare"
              >
                <img
                  class="tabs-compare-base"
                  :src="activeCompare.dark"
                  :alt="`${activeCompare.label} ${t('common.dark')}`"
                  loading="lazy"
                />
                <div class="tabs-compare-top">
                  <img
                    class="tabs-compare-image"
                    :src="activeCompare.light"
                    :alt="`${activeCompare.label} ${t('common.light')}`"
                    loading="lazy"
                  />
                </div>
                <div class="tabs-compare-handle" :style="{ left: `${comparePercent}%` }">
                  <span class="tabs-compare-line"></span>
                  <span class="tabs-compare-knob"></span>
                </div>
              <div class="tabs-compare-hint">{{ t('common.compareHint') }}</div>
            </div>
              <div class="plugin-compare-features">
                <div
                  v-for="feature in activeCompare.features"
                  :key="feature.title"
                  class="plugin-feature-card"
                >
                  <div class="plugin-feature-title">{{ feature.title }}</div>
                  <div class="plugin-feature-desc">{{ feature.desc }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="tabs-compare-tabs tabs-compare-tabs-vertical">
            <button
              v-for="(tab, index) in compareTabs"
              :key="tab.key"
              class="tabs-compare-tab"
              :class="{ active: index === compareTabIndex }"
              :style="
                index === compareTabIndex
                  ? {
                      '--tab-progress-from': tab.progressColors?.[0] ?? tab.colors?.[0],
                      '--tab-progress-to': tab.progressColors?.[1] ?? tab.colors?.[1],
                    }
                  : {}
              "
              @mouseenter="setCompareTab(index)"
              @focus="setCompareTab(index)"
              @click="setCompareTab(index)"
            >
              <span
                v-if="index === compareTabIndex"
                :key="`progress-${progressKey}`"
                class="tabs-compare-tab-progress"
              ></span>
              <span class="tabs-compare-tab-content">
                <span class="tabs-compare-tab-title">{{ tab.label }}</span>
                <span class="tabs-compare-tab-sub">{{ tab.subtitle }}</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
