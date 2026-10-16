<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from '../i18n';
import { withBase } from 'vitepress';
import { pluginLandingMeta, type PluginLandingKey } from '../plugins/registry';

const props = defineProps<{ plugin: PluginLandingKey }>();

const { t, localeKey } = useI18n();

const meta = computed(() => pluginLandingMeta[props.plugin]);

const base = withBase(`/plugins/${props.plugin}`);

// 站点语言 → 截图语言。
// ⚠️ 两边的语言集合**不一样**：插件自带语言包是
// zh-CN/en-US/de-DE/es-ES/ja-JP/ko-KR/ru-RU/ar-SA（没有 fr），
// 站点是 zh/en/ja/ko/fr/es/de/ru（没有 ar）。
// 所以站点法语页取不到 fr 截图 —— 回退到英语而不是中文，
// 至少语种距离更近；阿拉伯语截图已随产物落盘（`*-ar-SA-*.webp`），
// 插件补上 fr 语言包后只要把这里的回退去掉即可。
const SHOT_LANG: Record<string, string> = {
  root: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'en-US', // 插件暂无 fr 语言包
  es: 'es-ES',
  de: 'de-DE',
  ru: 'ru-RU',
};
const shotLang = computed(() => SHOT_LANG[localeKey.value] ?? 'zh-CN');

// 截图统一用 WebP（体积约为 PNG 的 1/3，UI 小字在原生 2x 分辨率下无可见损失）。
// 目录里同时存在 `<name>-<theme>.webp`（中文副本，SEO/OG 与不支持 JS 的场景兜底）
// 与 `<name>-<lang>-<theme>.webp`（逐语言副本）。
// ⚠️ forceDarkShot（创作类软件：修图 / 3D / 音频 / 视频）固定取暗黑文件——
// 行业惯例就是暗色界面（PS / Premiere / Blender / DAW 莫不如此），亮色站点下
// 展示暗色 UI 反而对味。此时 hero 的亮/暗双图槽都指向暗黑文件，CSS 的 .dark
// 切换无论命中哪一槽，用户看到的都是同一张暗黑截图。
const shot = (name: string, theme: 'light' | 'dark') =>
  `${base}/${name}-${shotLang.value}-${meta.value.forceDarkShot ? 'dark' : theme}.webp`;

// ── 主题（明/暗）────────────────────────────────────────────────────────────
const isDark = ref(false);
let themeObserver: MutationObserver | null = null;
const syncTheme = () => {
  isDark.value = document.documentElement.classList.contains('dark');
};

// ── 功能实景（图文交替）────────────────────────────────────────────────────
const showcaseRows = computed(() =>
  meta.value.features
    .map((f, i) => ({ ...f, i }))
    .filter((f) => f.shot),
);

// ── 截图画廊 ───────────────────────────────────────────────────────────────
const activeShot = ref(0);
const gallery = computed(() => meta.value.screenshots);
const currentShot = computed(() => gallery.value[activeShot.value] ?? gallery.value[0]);
const currentTheme = computed(() => (isDark.value ? 'dark' : 'light'));
const currentSrc = computed(() => shot(currentShot.value.key, currentTheme.value));

const selectShot = (i: number) => { activeShot.value = i; };

// ── 滚动进场动画 ───────────────────────────────────────────────────────────
const revealRoot = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

onMounted(() => {
  syncTheme();
  themeObserver = new MutationObserver(syncTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );
  revealRoot.value?.querySelectorAll('.pl-reveal').forEach((el) => io?.observe(el));
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  io?.disconnect();
});

const releaseUrl = computed(() => meta.value.releases);
const logoUrl = computed(() => withBase(`/plugin-logos/${props.plugin}.svg`));
const guideLink = withBase('/guide/overview');

// 是否提供独立 APP 版下载。puter 插件与 video 目前只上插件市场，不发布独立 APP，
// 此时隐藏「下载独立版」CTA 与独立下载卡，插件卡升级为主卡。
const isStandalone = computed(() => meta.value.standalone !== false);

// 截图缺语言兜底：插件只自带 zh-CN / en-US，其余站点语种（de/ja/ko/es/ru，fr→en）
// 请求不到对应 `<scene>-<lang>-<theme>.webp` 时，回退到 neutral 副本 `<scene>-<theme>.webp`。
const onImgError = (e) => {
  const img = e.target;
  if (img.dataset.shotFallback) return;
  const src = img.getAttribute('src') || '';
  const neutral = src.replace(/-(?:zh-CN|en-US|ja-JP|ko-KR|es-ES|de-DE|ru-RU|fr-FR|ar-SA)-(light|dark)\.webp$/, '-$1.webp');
  if (neutral && neutral !== src) {
    img.dataset.shotFallback = '1';
    img.src = neutral;
  }
};
</script>

<template>
  <div ref="revealRoot" class="pl-root"
    :style="{ '--pl-from': meta.colors[0], '--pl-to': meta.colors[1], '--pl-ink': meta.colors[1] }">
    <!-- Hero -->
    <section class="pl-hero" :style="{ '--pl-from': meta.colors[0], '--pl-to': meta.colors[1] }">
      <div class="pl-hero-bg" aria-hidden="true">
        <span v-for="n in 18" :key="n" class="pl-hero-dot" :style="{ '--i': n }"></span>
      </div>
      <div class="pl-container pl-hero-inner">
        <div class="pl-hero-text pl-reveal">
          <div class="pl-badge">
            <img :src="logoUrl" :alt="meta.name" class="pl-badge-logo" />
            <span>{{ t(`pluginLanding.${plugin}.badge`) }}</span>
          </div>
          <h1 class="pl-title">{{ meta.name }}</h1>
          <p class="pl-tagline">{{ t(`pluginLanding.${plugin}.tagline`) }}</p>
          <p class="pl-sub">{{ t(`pluginLanding.${plugin}.sub`) }}</p>
          <div class="pl-cta">
            <a v-if="isStandalone" class="pl-btn pl-btn-primary" :href="releaseUrl" target="_blank" rel="noopener">
              {{ t('pluginLanding.downloadStandalone') }}
            </a>
            <a class="pl-btn" :class="isStandalone ? 'pl-btn-ghost' : 'pl-btn-primary'" :href="guideLink">
              {{ t('pluginLanding.getPlugin') }}
            </a>
          </div>
          <ul class="pl-hero-points">
            <li v-for="(p, i) in meta.highlights" :key="i">{{ t(`pluginLanding.${plugin}.highlights.${i}`) }}</li>
          </ul>
        </div>

        <div class="pl-hero-shot pl-reveal" :style="{ '--d': '120ms' }">
          <div class="pl-window">
            <div class="pl-window-bar">
              <span class="pl-dot pl-dot-r"></span><span class="pl-dot pl-dot-y"></span><span class="pl-dot pl-dot-g"></span>
              <span class="pl-window-title">{{ meta.name }}</span>
            </div>
            <img :src="shot(meta.screenshots[0].key, 'light')" :alt="meta.name" class="pl-window-img pl-window-light" @error="onImgError" />
            <img :src="shot(meta.screenshots[0].key, 'dark')" :alt="meta.name" class="pl-window-img pl-window-dark" @error="onImgError" />
          </div>
        </div>
      </div>
    </section>

    <!-- 截图画廊 -->
    <section class="pl-section">
      <div class="pl-container">
        <header class="pl-section-head pl-reveal">
          <h2>{{ t('pluginLanding.galleryTitle') }}</h2>
          <p>{{ t('pluginLanding.gallerySub') }}</p>
        </header>
        <div class="pl-gallery pl-reveal">
          <div class="pl-gallery-stage">
            <img :src="currentSrc" :alt="currentShot.label" class="pl-gallery-img" @error="onImgError" />
          </div>
          <div class="pl-gallery-thumbs">
            <button
              v-for="(s, i) in gallery"
              :key="s.key"
              class="pl-thumb"
              :class="{ active: i === activeShot }"
              @click="selectShot(i)"
            >
              <img :src="shot(s.key, currentTheme)" :alt="s.label" @error="onImgError" />
              <span>{{ t(`pluginLanding.${plugin}.screens.${i}`) }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能实景：图文交替 -->
    <section class="pl-section pl-showcase-sec">
      <div class="pl-container">
        <header class="pl-section-head pl-reveal">
          <h2>{{ t('pluginLanding.showcaseTitle') }}</h2>
          <p>{{ t('pluginLanding.showcaseSub') }}</p>
        </header>
        <div class="pl-showcase">
          <article
            v-for="(row, idx) in showcaseRows"
            :key="row.key"
            class="pl-show pl-reveal"
            :class="{ 'pl-show--rev': idx % 2 === 1 }"
            :style="{ '--d': `${idx * 80}ms` }"
          >
            <div class="pl-show-media">
              <div class="pl-window">
                <div class="pl-window-bar">
                  <span class="pl-dot pl-dot-r"></span><span class="pl-dot pl-dot-y"></span><span class="pl-dot pl-dot-g"></span>
                  <span class="pl-window-title">{{ meta.name }}</span>
                </div>
                <img :src="shot(row.shot, 'light')" :alt="row.shot" class="pl-window-img pl-window-light" @error="onImgError" />
                <img :src="shot(row.shot, 'dark')" :alt="row.shot" class="pl-window-img pl-window-dark" @error="onImgError" />
              </div>
            </div>
            <div class="pl-show-text">
              <span class="pl-show-num">{{ String(idx + 1).padStart(2, '0') }}</span>
              <h3>{{ t(`pluginLanding.${plugin}.features.${row.i}.title`) }}</h3>
              <p>{{ t(`pluginLanding.${plugin}.features.${row.i}.desc`) }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="pl-section pl-section-alt">
      <div class="pl-container">
        <header class="pl-section-head pl-reveal">
          <h2>{{ t('pluginLanding.featuresTitle') }}</h2>
          <p>{{ t('pluginLanding.featuresSub') }}</p>
        </header>
        <div class="pl-features">
          <article
            v-for="(f, i) in meta.features"
            :key="i"
            class="pl-feature pl-reveal"
            :style="{ '--d': `${i * 70}ms` }"
          >
            <div class="pl-feature-icon" :style="{ '--ic-from': meta.colors[0], '--ic-to': meta.colors[1] }">
              <img :src="logoUrl" alt="" />
            </div>
            <h3>{{ t(`pluginLanding.${plugin}.features.${i}.title`) }}</h3>
            <p>{{ t(`pluginLanding.${plugin}.features.${i}.desc`) }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- 下载 -->
    <section class="pl-section" id="download">
      <div class="pl-container">
        <header class="pl-section-head pl-reveal">
          <h2>{{ t(isStandalone ? 'pluginLanding.downloadTitle' : 'pluginLanding.downloadTitlePlugin') }}</h2>
          <p>{{ t(isStandalone ? 'pluginLanding.downloadSub' : 'pluginLanding.downloadSubPlugin') }}</p>
        </header>
        <div class="pl-downloads">
          <article v-if="isStandalone" class="pl-dl-card pl-dl-primary pl-reveal" :style="{ '--pl-from': meta.colors[0], '--pl-to': meta.colors[1] }">
            <div class="pl-dl-tag">{{ t('pluginLanding.recommended') }}</div>
            <h3>{{ t('pluginLanding.standaloneTitle') }}</h3>
            <p>{{ t('pluginLanding.standaloneDesc') }}</p>
            <ul class="pl-dl-list">
              <li>macOS · .dmg</li>
              <li>Windows · .exe</li>
              <li>Linux · .AppImage / .deb / .rpm</li>
            </ul>
            <a class="pl-btn pl-btn-primary pl-btn-block" :href="releaseUrl" target="_blank" rel="noopener">
              {{ t('pluginLanding.downloadStandalone') }}
            </a>
            <p class="pl-dl-note">{{ t('pluginLanding.standaloneNote') }}</p>
          </article>

          <article class="pl-dl-card pl-reveal" :class="{ 'pl-dl-primary': !isStandalone }" :style="{ '--d': '120ms' }">
            <div v-if="!isStandalone" class="pl-dl-tag">{{ t('pluginLanding.recommended') }}</div>
            <h3>{{ t('pluginLanding.pluginTitle') }}</h3>
            <p>{{ t('pluginLanding.pluginDesc') }}</p>
            <ol class="pl-dl-steps">
              <li>{{ t('pluginLanding.pluginStep1') }}</li>
              <li>{{ t('pluginLanding.pluginStep2') }}</li>
              <li>{{ t('pluginLanding.pluginStep3') }}</li>
            </ol>
            <a class="pl-btn pl-btn-block" :class="isStandalone ? 'pl-btn-ghost' : 'pl-btn-primary'" :href="guideLink">
              {{ t('pluginLanding.getPlugin') }}
            </a>
            <p v-if="!isStandalone" class="pl-dl-note">{{ t('pluginLanding.standaloneSoon') }}</p>
            <p v-else class="pl-dl-note">{{ t('pluginLanding.pluginNote') }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pl-root { --pl-radius: 16px; }
.pl-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* Hero */
.pl-hero { position: relative; overflow: hidden; padding: 96px 0 72px; }
.pl-hero-bg { position: absolute; inset: 0; pointer-events: none; }
.pl-hero-dot {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  background: var(--pl-to); opacity: .18;
  left: calc(var(--i) * 5.4%); top: calc((var(--i) * 37) % 90%);
  animation: pl-float 7s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.35s);
}
@keyframes pl-float {
  0%, 100% { transform: translateY(0); opacity: .12; }
  50% { transform: translateY(-16px); opacity: .3; }
}
.pl-hero-inner { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 48px; align-items: center; }
.pl-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px 6px 8px;
  border-radius: 999px; font-size: 13px; font-weight: 600;
  background: color-mix(in srgb, var(--pl-from) 10%, transparent);
  color: var(--pl-ink); margin-bottom: 18px;
}
.pl-badge-logo { width: 22px; height: 22px; border-radius: 6px; }
.pl-title { font-size: 52px; line-height: 1.06; font-weight: 800; margin: 0 0 14px; letter-spacing: -0.02em; }
.pl-tagline { font-size: 20px; font-weight: 600; color: var(--vp-c-text-1); margin: 0 0 10px; }
.pl-sub { font-size: 15px; line-height: 1.7; color: var(--vp-c-text-2); margin: 0 0 26px; }
.pl-cta { display: flex; gap: 12px; flex-wrap: wrap; }
.pl-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 12px 22px; border-radius: 12px; font-size: 15px; font-weight: 600;
  text-decoration: none; transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.pl-btn-primary {
  background: linear-gradient(135deg, var(--pl-from), var(--pl-to)); color: #fff;
  box-shadow: 0 8px 22px color-mix(in srgb, var(--pl-from) 30%, transparent);
}
.pl-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 28px color-mix(in srgb, var(--pl-from) 40%, transparent); }
.pl-btn-ghost { border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-1); }
.pl-btn-ghost:hover { background: var(--vp-c-bg-soft); transform: translateY(-2px); }
.pl-btn-block { width: 100%; }
.pl-hero-points { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 8px; }
.pl-hero-points li { position: relative; padding-left: 22px; font-size: 14px; color: var(--vp-c-text-2); }
.pl-hero-points li::before {
  content: ''; position: absolute; left: 0; top: 7px; width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pl-from), var(--pl-to));
}

/* 窗口截图 */
.pl-window {
  position: relative; border-radius: var(--pl-radius); overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, .18); border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transform: perspective(1400px) rotateY(-4deg) rotateX(2deg);
  transition: transform .5s cubic-bezier(.22,1,.36,1);
}
.pl-hero-shot:hover .pl-window { transform: perspective(1400px) rotateY(0) rotateX(0); }
.pl-window-bar { display: flex; align-items: center; gap: 6px; padding: 10px 14px; background: var(--vp-c-bg-soft); border-bottom: 1px solid var(--vp-c-divider); }
.pl-dot { width: 10px; height: 10px; border-radius: 50%; }
.pl-dot-r { background: #ff5f57; } .pl-dot-y { background: #febc2e; } .pl-dot-g { background: #28c840; }
.pl-window-title { margin-left: 10px; font-size: 12px; color: var(--vp-c-text-3); }
.pl-window-img { display: block; width: 100%; }
.pl-window-dark { display: none; }
.dark .pl-window-light { display: none; }
.dark .pl-window-dark { display: block; }

/* 区块 */
.pl-section { padding: 80px 0; }
.pl-section-alt { background: var(--vp-c-bg-soft); }
.pl-section-head { text-align: center; max-width: 720px; margin: 0 auto 44px; }
.pl-section-head h2 { font-size: 34px; font-weight: 700; margin: 0 0 10px; letter-spacing: -0.01em; }
.pl-section-head p { color: var(--vp-c-text-2); font-size: 15px; margin: 0; }

/* 画廊 */
.pl-gallery-stage {
  border-radius: var(--pl-radius); overflow: hidden; border: 1px solid var(--vp-c-divider);
  box-shadow: 0 16px 44px rgba(15, 23, 42, .12); background: var(--vp-c-bg);
}
.pl-gallery-img { display: block; width: 100%; }
.pl-gallery-thumbs { display: flex; gap: 12px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px; }
.pl-thumb {
  flex: 0 0 190px; border: 1px solid var(--vp-c-divider); border-radius: 10px; overflow: hidden;
  background: var(--vp-c-bg); cursor: pointer; padding: 0; text-align: left;
  transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.pl-thumb img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top left; }
.pl-thumb span { display: block; padding: 8px 10px; font-size: 12px; color: var(--vp-c-text-2); }
.pl-thumb:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15, 23, 42, .12); }
.pl-thumb.active { border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px color-mix(in srgb, var(--vp-c-brand-1) 18%, transparent); }

/* 功能实景：图文交替 */
.pl-showcase { display: grid; gap: 30px; }
.pl-show {
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 36px; align-items: center;
  padding: 18px; border-radius: var(--pl-radius); border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
}
.pl-show--rev .pl-show-media { order: 2; }
.pl-show-media { min-width: 0; }
.pl-show-media .pl-window { transform: none; box-shadow: 0 18px 46px rgba(15, 23, 42, .14); }
.pl-show-media .pl-window:hover { transform: translateY(-3px); transition: transform .25s ease; }
.pl-show-text { position: relative; padding-left: 4px; }
.pl-show-num {
  display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .04em;
  color: var(--pl-ink); background: color-mix(in srgb, var(--pl-from) 12%, transparent);
  padding: 3px 10px; border-radius: 999px; margin-bottom: 14px;
}
.pl-show-text h3 { font-size: 22px; margin: 0 0 12px; letter-spacing: -0.01em; }
.pl-show-text p { font-size: 15px; line-height: 1.75; color: var(--vp-c-text-2); margin: 0; }
@media (max-width: 860px) {
  .pl-show { grid-template-columns: 1fr; gap: 18px; }
  .pl-show--rev .pl-show-media { order: 0; }
}
@media (prefers-reduced-motion: reduce) { .pl-show-media .pl-window:hover { transform: none; } }

/* 特性 */
.pl-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
.pl-feature {
  padding: 26px 22px; border-radius: var(--pl-radius); border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg); transition: transform .22s ease, box-shadow .22s ease;
}
.pl-feature:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(15, 23, 42, .12); }
.pl-feature-icon {
  width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center; margin-bottom: 14px;
  background: linear-gradient(135deg, var(--ic-from), var(--ic-to));
}
.pl-feature-icon img { width: 100%; height: 100%; border-radius: 12px; display: block; }
.pl-feature h3 { font-size: 17px; margin: 0 0 8px; }
.pl-feature p { font-size: 14px; line-height: 1.7; color: var(--vp-c-text-2); margin: 0; }

/* 下载 */
.pl-downloads { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; }
.pl-dl-card {
  position: relative; padding: 30px 26px; border-radius: var(--pl-radius);
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
}
.pl-dl-primary { border-color: color-mix(in srgb, var(--pl-from) 45%, transparent); }
.pl-dl-tag {
  position: absolute; top: -12px; left: 24px; padding: 4px 12px; border-radius: 999px;
  font-size: 12px; font-weight: 700; color: #fff;
  background: linear-gradient(135deg, var(--pl-from), var(--pl-to));
}
.pl-dl-card h3 { font-size: 20px; margin: 0 0 10px; }
.pl-dl-card > p { font-size: 14px; line-height: 1.7; color: var(--vp-c-text-2); margin: 0 0 16px; }
.pl-dl-list { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 8px; }
.pl-dl-list li { font-size: 14px; color: var(--vp-c-text-2); padding-left: 20px; position: relative; }
.pl-dl-list li::before { content: '↓'; position: absolute; left: 0; color: var(--pl-ink); font-weight: 700; }
.pl-dl-steps { margin: 0 0 20px; padding-left: 20px; display: grid; gap: 8px; }
.pl-dl-steps li { font-size: 14px; line-height: 1.6; color: var(--vp-c-text-2); }
.pl-dl-note { margin: 14px 0 0; font-size: 12.5px; color: var(--vp-c-text-3); }

/* 进场动画 */
.pl-reveal { opacity: 0; transform: translateY(22px); transition: opacity .6s cubic-bezier(.22,1,.36,1), transform .6s cubic-bezier(.22,1,.36,1); transition-delay: var(--d, 0ms); }
.pl-reveal.is-visible { opacity: 1; transform: none; }

@media (max-width: 900px) {
  .pl-hero-inner { grid-template-columns: 1fr; }
  .pl-title { font-size: 38px; }
  .pl-window { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-reveal { opacity: 1; transform: none; transition: none; }
  .pl-hero-dot { animation: none; }
}
</style>
