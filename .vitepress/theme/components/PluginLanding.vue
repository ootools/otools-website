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
// ⚠️ 两边的语言集合**不一样**：插件逐语言截图是
// zh-CN/en-US/de-DE/es-ES/ja-JP/ko-KR/ru-RU/ar-SA（没有 fr），
// 站点是 zh/en/ja/ko/fr/es/de/ru（没有 ar）。
const SHOT_LANG: Record<string, string> = {
  root: 'zh-CN',
  en: 'en-US',
  ja: 'ja-JP',
  ko: 'ko-KR',
  fr: 'en-US', // 插件无 fr 语言包，用英语（语种距离更近，而非中文）
  es: 'es-ES',
  de: 'de-DE',
  ru: 'ru-RU',
};

// 该插件**实际拥有**哪些语言的截图（registry 的 shotLangs；缺省 = 只有 zh-CN/en-US）。
// 缺失时回退英语，再回退中文——关键是**渲染前就选对**，
// 不请求不存在的文件（否则浏览器先 404 再 onImgError 回退，控制台一堆 404）。
const DEFAULT_SHOT_LANGS = ['zh-CN', 'en-US'];
const shotLang = computed(() => {
  const want = SHOT_LANG[localeKey.value] ?? 'zh-CN';
  const have = meta.value.shotLangs ?? DEFAULT_SHOT_LANGS;
  if (have.includes(want)) return want;
  // 回退优先级：英语 → 中文 → 该插件第一个可用语言
  if (have.includes('en-US')) return 'en-US';
  if (have.includes('zh-CN')) return 'zh-CN';
  return have[0] ?? 'zh-CN';
});

// 截图统一用 WebP（体积约为 PNG 的 1/3，UI 小字在原生 2x 分辨率下无可见损失）。
//
// ⚠️ 落地页与首页同属**深色沉浸层**（站点 `appearance:false` 固定浅色，
// 组件不再依赖明暗切换），因此这里**固定取暗色截图**：
//   · 创作类插件（ps/3d/audio/video/craft 系，forceDarkShot）本就只有暗色版；
//   · 办公类（documents/spreadsheet/presentation）也改取暗色版 —— 深色页面上
//     放浅色界面截图会「一块块发白」，观感割裂。
//     暗色版资产齐备性由校验脚本保证（每个登记场景都有 -dark.webp）。
const shot = (name: string) => `${base}/${name}-${shotLang.value}-dark.webp`;

// 截图缺该语种的逐语言副本时回退到 neutral 暗色副本（`<scene>-dark.webp`）。
const onImgError = (e) => {
  const img = e.target;
  if (img.dataset.shotFallback) return;
  const src = img.getAttribute('src') || '';
  const neutral = src.replace(
    /-(?:zh-CN|en-US|ja-JP|ko-KR|es-ES|de-DE|ru-RU|fr-FR|ar-SA)-dark\.webp$/,
    '-dark.webp',
  );
  if (neutral && neutral !== src) {
    img.dataset.shotFallback = '1';
    img.src = neutral;
  }
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
const currentSrc = computed(() => shot(currentShot.value.key));

const selectShot = (i: number) => { activeShot.value = i; };

// ── 滚动进场动画 ───────────────────────────────────────────────────────────
const revealRoot = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;

onMounted(() => {
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
  io?.disconnect();
});

const releaseUrl = computed(() => meta.value.releases);
const logoUrl = computed(() => withBase(`/plugin-logos/${props.plugin}.svg`));
const guideLink = withBase('/guide/overview');

// 是否提供独立 APP 版下载。puter 插件与 video 目前只上插件市场，不发布独立 APP，
// 此时隐藏「下载独立版」CTA 与独立下载卡，插件卡升级为主卡。
const isStandalone = computed(() => meta.value.standalone !== false);

// 截图缺语言兜底：插件只自带 zh-CN / en-US，其余站点语种（de/ja/ko/es/ru，fr→en）
// 截图缺该语种的逐语言副本时回退到 neutral 暗色副本（`<scene>-dark.webp`）。
</script>

<template>
  <div ref="revealRoot" class="pl-root"
    :style="{ '--pl-from': meta.colors[0], '--pl-to': meta.colors[1], '--pl-ink': meta.colors[1] }">
    <!-- Hero -->
    <section class="pl-hero" :style="{ '--pl-from': meta.colors[0], '--pl-to': meta.colors[1] }">
      <div class="pl-hero-bg" aria-hidden="true">
        <span class="pl-hero-grid"></span>
        <span class="pl-glow pl-glow-a"></span>
        <span class="pl-glow pl-glow-b"></span>
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
            <img :src="shot(meta.screenshots[0].key)" :alt="meta.name" class="pl-window-img" @error="onImgError" />
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
              <img :src="shot(s.key)" :alt="s.label" @error="onImgError" />
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
                <img :src="shot(row.shot)" :alt="row.shot" class="pl-window-img" @error="onImgError" />
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
/* ============================================================================
   插件落地页 · 深色沉浸（与首页同一套视觉语言）
   ----------------------------------------------------------------------------
   落地页与首页同属「深色沉浸」层（站点固定浅色 appearance:false），
   所以这里不依赖 VitePress 明暗切换，截图固定取暗色版。
   基色令牌 --ot-* 由 home.css 的 `.layout-landing` 提供；
   插件主题色仍走 --pl-from / --pl-to（registry 的 pluginAccent）。
   ========================================================================== */
.pl-root { --pl-radius: 18px; }
.pl-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* ── Hero ─────────────────────────────────────────────────────────────────── */
.pl-hero { position: relative; overflow: hidden; padding: 128px 0 86px; }
.pl-hero-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }

/* 网格底纹（与首页一致） */
.pl-hero-grid {
  position: absolute; inset: -10% -10% 0;
  background-image: linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px);
  background-size: 62px 62px;
  mask-image: radial-gradient(ellipse 76% 60% at 42% 34%, #000 30%, transparent 76%);
  -webkit-mask-image: radial-gradient(ellipse 76% 60% at 42% 34%, #000 30%, transparent 76%);
}

/* 极光光晕：用插件主题色，两团错位漂移 */
.pl-glow { position: absolute; border-radius: 50%; filter: blur(96px); }
.pl-glow-a {
  top: -22%; left: -6%; width: 46vw; height: 46vw; opacity: .34;
  background: radial-gradient(circle, var(--pl-from), transparent 66%);
  animation: pl-drift-a 24s ease-in-out infinite;
}
.pl-glow-b {
  top: 4%; right: -8%; width: 40vw; height: 40vw; opacity: .28;
  background: radial-gradient(circle, var(--pl-to), transparent 66%);
  animation: pl-drift-b 28s ease-in-out infinite;
}
@keyframes pl-drift-a {
  0%, 100% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(4%, 5%, 0) scale(1.08); }
}
@keyframes pl-drift-b {
  0%, 100% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(-5%, 4%, 0) scale(1.1); }
}

.pl-hero-inner { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr); gap: 48px; align-items: center; }

.pl-badge {
  display: inline-flex; align-items: center; gap: 9px; padding: 7px 15px 7px 9px;
  border-radius: 999px; font-size: 13px; font-weight: 600;
  border: 1px solid color-mix(in srgb, var(--pl-from) 42%, transparent);
  background: color-mix(in srgb, var(--pl-from) 14%, rgba(255,255,255,.02));
  color: var(--ot-ink); margin-bottom: 20px;
  backdrop-filter: blur(8px);
}
.pl-badge-logo { width: 22px; height: 22px; border-radius: 6px; }

.pl-title {
  font-size: clamp(38px, 4.2vw, 58px); line-height: 1.05; font-weight: 800;
  margin: 0 0 16px; letter-spacing: -0.03em;
  background: linear-gradient(100deg, #fff 12%, color-mix(in srgb, var(--pl-from) 82%, #fff) 58%, var(--pl-to));
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.pl-tagline { font-size: 20px; font-weight: 650; color: var(--ot-ink); margin: 0 0 12px; }
.pl-sub { font-size: 15.5px; line-height: 1.75; color: var(--ot-ink-2); margin: 0 0 28px; }

.pl-cta { display: flex; gap: 12px; flex-wrap: wrap; }

/* 按钮：主按钮吃主题色渐变，次按钮走深色玻璃 */
.pl-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 13px 24px; border-radius: 13px; font-size: 15px; font-weight: 650;
  text-decoration: none; cursor: pointer; border: 1px solid transparent;
  transition: transform .2s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
}
.pl-btn:hover { transform: translateY(-2px); }
.pl-btn-primary {
  background: linear-gradient(120deg, var(--pl-from), var(--pl-to)); color: #fff;
  box-shadow: 0 14px 32px -12px color-mix(in srgb, var(--pl-from) 78%, transparent);
}
.pl-btn-primary:hover { box-shadow: 0 20px 42px -12px color-mix(in srgb, var(--pl-from) 88%, transparent); }
.pl-btn-ghost {
  border-color: var(--ot-line-2); color: var(--ot-ink);
  background: var(--ot-panel); backdrop-filter: blur(10px);
}
.pl-btn-ghost:hover { background: var(--ot-panel-2); border-color: rgba(255,255,255,.26); }
.pl-btn-block { width: 100%; }

.pl-hero-points { list-style: none; padding: 0; margin: 28px 0 0; display: grid; gap: 10px; }
.pl-hero-points li { position: relative; padding-left: 24px; font-size: 14.5px; color: var(--ot-ink-2); }
.pl-hero-points li::before {
  content: ''; position: absolute; left: 0; top: 7px; width: 12px; height: 12px; border-radius: 50%;
  background: linear-gradient(135deg, var(--pl-from), var(--pl-to));
  box-shadow: 0 0 10px color-mix(in srgb, var(--pl-from) 60%, transparent);
}

/* ── 窗口截图外框（深色质感，与首页窗口一致）───────────────────────────────── */
.pl-window {
  position: relative; border-radius: var(--pl-radius); overflow: hidden;
  border: 1px solid rgba(255,255,255,.14); background: #0b0e18;
  box-shadow: 0 44px 84px -34px rgba(0,0,0,.92), 0 0 80px -34px var(--pl-to);
  transform: perspective(1800px) rotateY(-6deg) rotateX(4deg);
  transition: transform .6s cubic-bezier(.22,1,.36,1);
  will-change: transform;
}
.pl-hero-shot:hover .pl-window { transform: perspective(1800px) rotateY(-2deg) rotateX(1deg); }
.pl-window-bar {
  display: flex; align-items: center; gap: 7px; height: 38px; padding: 0 15px;
  background: linear-gradient(180deg, #161a28, #10131e);
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.pl-dot { width: 11px; height: 11px; border-radius: 50%; }
.pl-dot-r { background: #ff5f57; } .pl-dot-y { background: #febc2e; } .pl-dot-g { background: #28c840; }
.pl-window-title { margin-left: 10px; font-size: 12.5px; color: var(--ot-ink-3); letter-spacing: .02em; }
.pl-window-img { display: block; width: 100%; }

/* ── 区块 ─────────────────────────────────────────────────────────────────── */
.pl-section { padding: 90px 0; }
.pl-section-alt {
  background: linear-gradient(180deg, rgba(255,255,255,.022), transparent 62%);
  border-top: 1px solid var(--ot-line);
  border-bottom: 1px solid var(--ot-line);
}
.pl-section-head { text-align: center; max-width: 720px; margin: 0 auto 46px; }
.pl-section-head h2 {
  font-size: clamp(28px, 3.2vw, 40px); font-weight: 800; margin: 0 0 12px;
  letter-spacing: -0.025em; color: var(--ot-ink);
}
.pl-section-head p { color: var(--ot-ink-2); font-size: 15.5px; line-height: 1.7; margin: 0; }

/* ── 截图画廊 ─────────────────────────────────────────────────────────────── */
.pl-gallery-stage {
  border-radius: var(--pl-radius); overflow: hidden;
  border: 1px solid rgba(255,255,255,.14); background: #0b0e18;
  box-shadow: 0 36px 72px -34px rgba(0,0,0,.9), 0 0 70px -40px var(--pl-to);
}
.pl-gallery-img { display: block; width: 100%; }
.pl-gallery-thumbs { display: flex; gap: 12px; margin-top: 18px; overflow-x: auto; padding-bottom: 6px; }
.pl-thumb {
  flex: 0 0 190px; border: 1px solid var(--ot-line); border-radius: 12px; overflow: hidden;
  background: rgba(255,255,255,.025); cursor: pointer; padding: 0; text-align: left;
  transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.pl-thumb img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top left; opacity: .82; transition: opacity .2s ease; }
.pl-thumb span { display: block; padding: 9px 11px; font-size: 12px; color: var(--ot-ink-2); }
.pl-thumb:hover { transform: translateY(-3px); background: rgba(255,255,255,.05); border-color: var(--ot-line-2); }
.pl-thumb:hover img { opacity: 1; }
.pl-thumb.active {
  border-color: color-mix(in srgb, var(--pl-from) 62%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--pl-from) 20%, transparent);
}
.pl-thumb.active img { opacity: 1; }

/* ── 功能实景：图文交替 ───────────────────────────────────────────────────── */
.pl-showcase { display: grid; gap: 26px; }
.pl-show {
  display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 36px; align-items: center;
  padding: 20px; border-radius: var(--pl-radius);
  border: 1px solid var(--ot-line);
  background: linear-gradient(180deg, rgba(255,255,255,.038), rgba(255,255,255,.012));
  transition: border-color .28s ease, transform .28s ease;
}
.pl-show:hover { border-color: color-mix(in srgb, var(--pl-from) 34%, transparent); }
.pl-show--rev .pl-show-media { order: 2; }
.pl-show-media { min-width: 0; }
.pl-show-media .pl-window { transform: none; box-shadow: 0 18px 44px -20px rgba(0,0,0,.86); }
.pl-show-text { position: relative; padding-left: 4px; }
.pl-show-num {
  display: inline-block; font-size: 13px; font-weight: 800; letter-spacing: .04em;
  color: var(--ot-ink);
  border: 1px solid color-mix(in srgb, var(--pl-from) 42%, transparent);
  background: color-mix(in srgb, var(--pl-from) 14%, transparent);
  padding: 3px 11px; border-radius: 999px; margin-bottom: 14px;
}
.pl-show-text h3 { font-size: 22px; margin: 0 0 12px; letter-spacing: -0.01em; color: var(--ot-ink); }
.pl-show-text p { font-size: 15px; line-height: 1.75; color: var(--ot-ink-2); margin: 0; }
@media (max-width: 860px) {
  .pl-show { grid-template-columns: 1fr; gap: 18px; }
  .pl-show--rev .pl-show-media { order: 0; }
}

/* ── 特性卡 ───────────────────────────────────────────────────────────────── */
.pl-features { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
.pl-feature {
  padding: 28px 24px; border-radius: var(--pl-radius);
  border: 1px solid var(--ot-line);
  background: rgba(255,255,255,.024);
  transition: transform .26s ease, border-color .26s ease, background .26s ease;
}
.pl-feature:hover {
  transform: translateY(-5px); background: rgba(255,255,255,.05);
  border-color: color-mix(in srgb, var(--pl-from) 40%, transparent);
}
.pl-feature-icon {
  width: 48px; height: 48px; border-radius: 13px; display: grid; place-items: center; margin-bottom: 16px;
  background: linear-gradient(135deg, var(--ic-from), var(--ic-to));
  box-shadow: 0 12px 28px -12px var(--ic-from);
}
.pl-feature-icon img { width: 100%; height: 100%; border-radius: 13px; display: block; }
.pl-feature h3 { font-size: 17px; margin: 0 0 9px; color: var(--ot-ink); }
.pl-feature p { font-size: 14px; line-height: 1.7; color: var(--ot-ink-2); margin: 0; }

/* ── 下载 ─────────────────────────────────────────────────────────────────── */
.pl-downloads { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 22px; }
.pl-dl-card {
  position: relative; padding: 32px 28px; border-radius: var(--pl-radius);
  border: 1px solid var(--ot-line);
  background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.012));
}
.pl-dl-primary {
  border-color: color-mix(in srgb, var(--pl-from) 52%, transparent);
  box-shadow: 0 30px 64px -34px color-mix(in srgb, var(--pl-from) 70%, transparent);
}
.pl-dl-tag {
  position: absolute; top: -13px; left: 26px; padding: 5px 13px; border-radius: 999px;
  font-size: 12px; font-weight: 700; color: #fff;
  background: linear-gradient(120deg, var(--pl-from), var(--pl-to));
  box-shadow: 0 10px 24px -10px var(--pl-from);
}
.pl-dl-card h3 { font-size: 20px; margin: 0 0 10px; color: var(--ot-ink); }
.pl-dl-card > p { font-size: 14px; line-height: 1.7; color: var(--ot-ink-2); margin: 0 0 16px; }
.pl-dl-list { list-style: none; padding: 0; margin: 0 0 20px; display: grid; gap: 8px; }
.pl-dl-list li { font-size: 14px; color: var(--ot-ink-2); padding-left: 20px; position: relative; }
.pl-dl-list li::before { content: '↓'; position: absolute; left: 0; color: var(--pl-to); font-weight: 700; }
.pl-dl-steps { margin: 0 0 20px; padding-left: 20px; display: grid; gap: 8px; }
.pl-dl-steps li { font-size: 14px; line-height: 1.6; color: var(--ot-ink-2); }
.pl-dl-note { margin: 14px 0 0; font-size: 12.5px; color: var(--ot-ink-3); }

/* ── 进场动画 ─────────────────────────────────────────────────────────────── */
.pl-reveal {
  opacity: 0; transform: translateY(24px);
  transition: opacity .66s cubic-bezier(.22,1,.36,1), transform .66s cubic-bezier(.22,1,.36,1);
  transition-delay: var(--d, 0ms);
}
.pl-reveal.is-visible { opacity: 1; transform: none; }

@media (max-width: 900px) {
  .pl-hero { padding: 108px 0 64px; }
  .pl-hero-inner { grid-template-columns: 1fr; gap: 32px; }
  .pl-title { font-size: 40px; }
  .pl-window { transform: none; }
  .pl-section { padding: 68px 0; }
}
@media (prefers-reduced-motion: reduce) {
  .pl-reveal { opacity: 1; transform: none; transition: none; }
  .pl-glow { animation: none; }
  .pl-window { transform: none; }
}
</style>
