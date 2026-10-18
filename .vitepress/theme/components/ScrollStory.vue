<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { actMeta, accentOf, logoUrl, pluginName, shotUrl, storyScenes } from '../home/homeData';

const { t, tm, localeKey } = useI18n();

const scenes = computed(() =>
  storyScenes.map((s) => ({
    ...s,
    accent: accentOf(s.plugin),
    logo: withBase(logoUrl(s.plugin)),
    src: withBase(shotUrl(s.plugin, s.scene, localeKey.value)),
    name: pluginName[s.plugin] ?? s.plugin,
    actLabel: (tm(`home.story.acts.${s.act}`) as string) ?? s.act,
    tagline: (tm(`home.story.scenes.${s.key}.tagline`) as string) ?? '',
    features: (tm(`home.story.scenes.${s.key}.features`) as string[]) ?? [],
  })),
);

const active = ref(0);
const track = ref<HTMLElement | null>(null);
const progress = ref(0); // 0~1 当前幕在全序列中的进度
let raf: number | null = null;

// 滚动驱动：把 track 内的滚动位置映射到当前幕。
// track 高度 = scenes 数 × 每幕滚动距离（用 CSS 变量 --ot-story-h 控制）。
const compute = () => {
  raf = null;
  const el = track.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) {
    active.value = 0;
    progress.value = 0;
    return;
  }
  // 已滚过 track 的像素
  const scrolled = Math.min(Math.max(-rect.top, 0), total);
  const ratio = scrolled / total;
  progress.value = ratio;
  const idx = Math.min(scenes.value.length - 1, Math.floor(ratio * scenes.value.length));
  active.value = idx;
};

const onScroll = () => {
  if (raf === null) raf = window.requestAnimationFrame(compute);
};

const onResize = () => {
  syncNarrow();
  onScroll();
};

onMounted(() => {
  syncNarrow();
  compute();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('resize', onResize);
  if (raf !== null) window.cancelAnimationFrame(raf);
});

const cur = computed(() => scenes.value[active.value]);
const actAccent = computed(() => actMeta[cur.value.act].accent);

// 每幕滚动距离（vh）。给足距离让切换有"锁定"感。
// 移动端缩小到 62vh，避免产生过长的空白滚动。
const isNarrow = ref(false);
const sceneVh = computed(() => (isNarrow.value ? 62 : 78));
const trackHeight = computed(() => `${scenes.value.length * sceneVh.value + 100}vh`);

const syncNarrow = () => {
  isNarrow.value = window.innerWidth < 1024;
};

onMounted(() => {
  syncNarrow();
});
</script>

<template>
  <section id="story" class="ot-section ot-story">
    <div class="ot-wrap ot-center" style="margin-bottom: 40px">
      <span class="ot-eyebrow">{{ t('home.story.eyebrow') }}</span>
      <h2 class="ot-h2" v-html="t('home.story.title')"></h2>
      <p class="ot-sub">{{ t('home.story.subtitle') }}</p>
    </div>

    <div ref="track" class="ot-story-track" :style="{ height: trackHeight }">
      <div class="ot-story-sticky">
        <!-- 顶部渐隐遮罩，避免与导航重叠 -->
        <div class="ot-story-progress">
          <span
            v-for="(s, i) in scenes"
            :key="s.key"
            :class="{ 'is-on': i === active }"
          ></span>
        </div>

        <div class="ot-story-layout">
          <!-- 左：文案 -->
          <div class="ot-story-copy">
            <Transition name="ot-story-copy" mode="out-in">
              <div :key="cur.key">
                <span
                  class="ot-story-act"
                  :style="{ '--act-a': actAccent[0], '--act-b': actAccent[1] }"
                >
                  {{ actMeta[cur.act].icon }} {{ cur.actLabel }}
                </span>
                <h3 class="ot-story-name">{{ cur.name }}</h3>
                <p class="ot-story-tagline">{{ cur.tagline }}</p>
                <div class="ot-story-features">
                  <div v-for="(f, i) in cur.features" :key="i" class="ot-story-feature">
                    <i></i><span>{{ f }}</span>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 右：截图舞台 -->
          <div class="ot-story-stage" :style="{ '--ot-accent': cur.accent[0] }">
            <img
              v-for="(s, i) in scenes"
              :key="s.key"
              :class="{ 'is-on': i === active }"
              :src="s.src"
              :alt="s.name"
              loading="lazy"
            />
          </div>
        </div>

        <div class="ot-story-foot">
          <span>
            <img
              :src="cur.logo"
              alt=""
              style="width: 18px; height: 18px; border-radius: 5px; vertical-align: -4px; margin-right: 8px"
            />
            {{ cur.name }}
          </span>
          <span>{{ active + 1 }} / {{ scenes.length }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
