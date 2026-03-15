<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const compareTabs = [
  {
    key: 'home',
    label: '首页',
    subtitle: '生态入口 · 插件聚合',
    colors: ['#1d4ed8', '#0ea5e9'],
    light: '/crop/home-light.png',
    dark: '/crop/home.png',
    features: [
      { title: '插件市场', desc: '精选 + 评分 + 更新' },
      { title: '开发者中心', desc: 'Web + Rust 构建' },
      { title: 'Tabs 工作流', desc: '多任务并行' },
    ],
  },
  {
    key: 'git',
    label: 'Git',
    subtitle: 'AI 提交 · 软著文档',
    colors: ['#0f172a', '#1d4ed8'],
    progressColors: ['#1d4ed8', '#60a5fa'],
    light: '/crop/git-light.png',
    dark: '/crop/git.png',
    features: [
      { title: 'AI 生成提交信息', desc: '一键生成提交说明' },
      { title: 'AI 软著申请', desc: '自动生成软著申请表单' },
      { title: '子模块直达', desc: '快捷式子模块访问' },
    ],
  },
  {
    key: 'dbm',
    label: '数据库',
    subtitle: '多库管理 · 结构查询',
    colors: ['#0f766e', '#2dd4bf'],
    light: '/crop/dbm-light.png',
    dark: '/crop/dbm.png',
    features: [
      { title: '连接管理', desc: '多库统一管理' },
      { title: '结构浏览', desc: '表结构/索引查看' },
      { title: '数据操作', desc: '增删改查与导出' },
    ],
  },
  {
    key: 'ssh',
    label: 'SSH',
    subtitle: '终端会话 · SFTP',
    colors: ['#0f766e', '#22c55e'],
    light: '/crop/ssh-light.png',
    dark: '/crop/ssh.png',
    features: [
      { title: '终端会话', desc: '多会话并行' },
      { title: 'SFTP 文件', desc: '上传/下载/同步' },
      { title: '快捷操作', desc: '常用命令模板' },
    ],
  },
  {
    key: 'servrun',
    label: '开发环境',
    subtitle: 'Nginx/PHP/MySQL',
    colors: ['#7c3aed', '#a78bfa'],
    light: '/crop/servrun-light.png',
    dark: '/crop/servrun.png',
    features: [
      { title: '服务管理', desc: 'Nginx/PHP/MySQL' },
      { title: '配置生成', desc: 'vHost 一键配置' },
      { title: '版本切换', desc: '多版本并行' },
    ],
  },
  {
    key: 'ollama',
    label: 'Ollama',
    subtitle: '本地模型 · 性能监控',
    colors: ['#6d28d9', '#a855f7'],
    light: '/crop/ollama-light.png',
    dark: '/crop/ollama.png',
    features: [
      { title: '模型管理', desc: '版本 + 依赖' },
      { title: '性能监控', desc: 'GPU/CPU 占用' },
      { title: '会话历史', desc: '多轮对话' },
    ],
  },
  {
    key: 'audio',
    label: '音频',
    subtitle: '波形编辑 · 效果链',
    colors: ['#f97316', '#facc15'],
    light: '/crop/audio-light.png',
    dark: '/crop/audio.png',
    features: [
      { title: '波形编辑', desc: '轨道级剪辑' },
      { title: '效果链', desc: '滤波 + 混响' },
      { title: '导出管理', desc: '多格式输出' },
    ],
  },
  {
    key: 'http',
    label: 'HTTP',
    subtitle: '请求编排 · 响应洞察',
    colors: ['#0ea5e9', '#38bdf8'],
    light: '/crop/http-light.png',
    dark: '/crop/http.png',
    features: [
      { title: '请求编排', desc: '多接口批量执行' },
      { title: '响应洞察', desc: '状态与性能分析' },
      { title: '环境切换', desc: '开发/测试/生产' },
    ],
  },
];

const compareTabIndex = ref(0);
const compareWrap = ref<HTMLElement | null>(null);
const compareRatio = ref(0);
const compareDragging = ref(false);
const autoPaused = ref(false);
let compareWindowBound = false;
let compareRaf: number | null = null;
let autoTabTimer: number | null = null;
const progressKey = ref(0);

const activeCompare = computed(() => compareTabs[compareTabIndex.value]);
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

const animateCompareToRight = () => {
  clearCompareRaf();
  compareRatio.value = 0;
  const start = window.performance.now();
  const duration = 1100;
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
    const next = (compareTabIndex.value + 1) % compareTabs.length;
    activateCompareTab(next, false);
  }, 4000);
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
  const next = (compareTabIndex.value + 1) % compareTabs.length;
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
  unbindCompareWindowEvents();
  stopAutoTabs();
});
</script>

<template>
  <section id="plugins" class="py-20">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-6">
        <h2 class="text-3xl font-bold text-dark mb-4">插件视觉展示</h2>
        <p class="text-body-color">除了以下优秀的官方插件，插件市场同样还有更多优秀的第三方插件。</p>
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
                  :alt="`${activeCompare.label} 暗黑版`"
                  loading="lazy"
                />
                <div class="tabs-compare-top">
                  <img
                    class="tabs-compare-image"
                    :src="activeCompare.light"
                    :alt="`${activeCompare.label} 明亮版`"
                    loading="lazy"
                  />
                </div>
                <div class="tabs-compare-handle" :style="{ left: `${comparePercent}%` }">
                  <span class="tabs-compare-line"></span>
                  <span class="tabs-compare-knob"></span>
                </div>
              <div class="tabs-compare-hint">拖动圆形按钮对比明暗模式</div>
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
