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
            <a
              href="/features"
              class="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-lg shadow-lg transition hover:bg-primary/90"
            >
              下载内测版(20M)
            </a>
            <a
              href="/guide/overview"
              class="inline-flex items-center justify-center border border-white/40 text-white px-8 py-3 rounded-lg transition hover:bg-white/10"
            >
              开发者文档
            </a>
          </div>
          <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/80">
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">40+</div>
              <div class="text-sm">丰富的插件生态</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Tabs</div>
              <div class="text-sm">多任务并行机制</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Rust</div>
              <div class="text-sm">高性能插件底层支持</div>
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
                  :alt="`${tabs[overlayTab].title} 暗黑版`"
                  loading="lazy"
                />
                <div class="hero-compare-top">
                  <img
                    class="hero-compare-image"
                    :src="overlayImages.light"
                    :alt="`${tabs[overlayTab].title} 明亮版`"
                    loading="lazy"
                  />
                </div>
              <div class="hero-compare-handle" :style="{ left: `${comparePercent}%` }">
                <span class="hero-compare-line"></span>
                <span class="hero-compare-knob"></span>
              </div>
              <div class="hero-compare-hint">拖动圆形按钮对比明暗模式</div>
            </div>
              <div v-else class="overlay-caption">主程序截图占位</div>
            </div>
            <div class="hero-overlay-footer">
              {{ tabs[overlayTab].desc }}
            </div>
          </div>
          <button class="hero-overlay-nav hero-overlay-prev" @click.stop="prevOverlayTab" aria-label="上一项">
            ‹
          </button>
          <button class="hero-overlay-nav hero-overlay-next" @click.stop="nextOverlayTab" aria-label="下一项">
            ›
          </button>
        </div>
      </div>
    </transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const tabs = [
  {
    key: 'home',
    label: '首页',
    title: '生态入口',
    desc: '工具聚合与插件快速访问。',
    colors: ['#1d4ed8', '#0ea5e9'],
    imageLight: '/crop/home-light.png',
    imageDark: '/crop/home.png',
    cards: [
      { title: '插件市场', desc: '精选 + 评分 + 更新' },
      { title: '开发者中心', desc: 'Web + Rust 构建' },
      { title: 'Tabs 工作流', desc: '多任务并行' },
    ],
  },
  {
    key: 'git',
    label: 'Git',
    title: '章鱼Git',
    desc: '新型Git仓库管理与 AI 协作。',
    colors: ['#0f172a', '#1d4ed8'],
    imageLight: '/crop/git-light.png',
    imageDark: '/crop/git.png',
    cards: [
      { title: 'AI 生成提交信息', desc: '一键生成提交说明' },
      { title: 'AI 软著申请', desc: '自动生成软著申请的表单与文档' },
      { title: '子模块直达', desc: '快捷式子模块访问' },
    ],
  },
  {
    key: 'dbm',
    label: '数据库',
    title: '鲨鱼数据库',
    desc: 'Mysql/Postgres/MongoDB等数据表结构与查询管理。',
    colors: ['#0f766e', '#2dd4bf'],
    imageLight: '/crop/dbm-light.png',
    imageDark: '/crop/dbm.png',
    cards: [
      { title: '连接管理', desc: '多库统一管理' },
      { title: '结构浏览', desc: '表结构/索引查看' },
      { title: '数据操作', desc: '增删改查与导出' },
    ],
  },
  {
    key: 'ssh',
    label: 'SSH',
    title: '墨鱼终端',
    desc: '终端与SFTP协同。',
    colors: ['#0f766e', '#22c55e'],
    imageLight: '/crop/ssh-light.png',
    imageDark: '/crop/ssh.png',
    cards: [
      { title: '终端会话', desc: '多会话并行' },
      { title: 'SFTP 文件', desc: '上传/下载/同步' },
      { title: '快捷操作', desc: '常用命令模板' },
    ],
  },
  {
    key: 'servrun',
    label: '开发环境',
    title: '珊瑚Env',
    desc: '本地Nginx/PHP/Mysql/Redis等开发环境一键管理。',
    colors: ['#7c3aed', '#a78bfa'],
    imageLight: '/crop/servrun-light.png',
    imageDark: '/crop/servrun.png',
    cards: [
      { title: '服务管理', desc: 'Nginx/PHP/MySQL' },
      { title: '配置生成', desc: 'vHost 一键配置' },
      { title: '版本切换', desc: '多版本并行' },
    ],
  },
  {
    key: 'ollama',
    label: 'Ollama',
    title: '乌贼Ollama',
    desc: '本地大模型可视化管理与运行。',
    colors: ['#6d28d9', '#a855f7'],
    imageLight: '/crop/ollama-light.png',
    imageDark: '/crop/ollama.png',
    cards: [
      { title: '模型管理', desc: '版本 + 依赖' },
      { title: '性能监控', desc: 'GPU/CPU 占用' },
      { title: '会话历史', desc: '多轮对话' },
    ],
  },
  {
    key: 'audio',
    label: '音频',
    title: '海豚音频工坊',
    desc: '音频处理与实验室。',
    colors: ['#f97316', '#facc15'],
    imageLight: '/crop/audio-light.png',
    imageDark: '/crop/audio.png',
    cards: [
      { title: '波形编辑', desc: '轨道级剪辑' },
      { title: '效果链', desc: '滤波 + 混响' },
      { title: '导出管理', desc: '多格式输出' },
    ],
  },
  {
    key: 'http',
    label: 'HTTP',
    title: '飞鱼HTTP',
    desc: '请求编排与响应洞察。',
    colors: ['#0ea5e9', '#38bdf8'],
    imageLight: '/crop/http-light.png',
    imageDark: '/crop/http.png',
    cards: [
      { title: '请求编排', desc: '多接口批量执行' },
      { title: '响应洞察', desc: '状态与性能分析' },
      { title: '环境切换', desc: '开发/测试/生产' },
    ],
  },
];

const activeTab = ref(0);
const overlayOpen = ref(false);
const overlayTab = ref(0);
const compareWrap = ref<HTMLElement | null>(null);
const compareRatio = ref(0.5);
const compareDragging = ref(false);
let compareWindowBound = false;
const typedTitle = ref('');
const typedDesc = ref('');
const typingPhase = ref<'title' | 'desc' | 'done'>('title');
const fullTitle = 'OTools 高性能AI工作流平台-小身躯大能量';
const fullDesc = '以 Tabs 多任务化为核心，统一插件生态、原生能力与桌面运行时。让每个工具都成为可组合的开放AI工作流模块。';
const titlePrefixTyped = 'OceanTools';
const titleSuffix = ' 高性能AI工作流平台-小身躯大能量';
let typingTimer: number | null = null;
let typingStopped = false;
let tabTimer: number | null = null;

const screenStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs[activeTab.value].colors[0]}, ${tabs[activeTab.value].colors[1]})`,
}));

const overlayStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs[overlayTab.value].colors[0]}, ${tabs[overlayTab.value].colors[1]})`,
}));

const overlayImages = computed(() => {
  const tab = tabs[overlayTab.value];
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

const closeOverlay = () => {
  overlayOpen.value = false;
  compareDragging.value = false;
  unbindCompareWindowEvents();
};

const prevOverlayTab = () => {
  overlayTab.value = (overlayTab.value - 1 + tabs.length) % tabs.length;
  activeTab.value = overlayTab.value;
  compareRatio.value = 0.5;
};

const nextOverlayTab = () => {
  overlayTab.value = (overlayTab.value + 1) % tabs.length;
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
    activeTab.value = (activeTab.value + 1) % tabs.length;
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
  }
};

onMounted(() => {
  void (async () => {
    while (!typingStopped) {
      typedTitle.value = '';
      typedDesc.value = '';
      typingPhase.value = 'title';
      await typeText(titlePrefixTyped, typedTitle, 95);
      if (typingStopped) return;
      await wait(1000);
      await eraseMiddle(titlePrefixTyped, 1, 4, typedTitle, 140);
      if (typingStopped) return;
      await wait(220);
      await typeText(titleSuffix, typedTitle, 95, typedTitle.value);
      if (typingStopped) return;
      typingPhase.value = 'desc';
      await wait(180);
      await typeText(fullDesc, typedDesc, 65);
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
