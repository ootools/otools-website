<template>
  <section id="home" class="relative overflow-hidden bg-dark pt-28 pb-20 min-h-[calc(100vh-50px)] flex items-center">
    <div class="container">
      <div class="flex flex-wrap -mx-4 items-center">
        <div class="w-full lg:w-5/12 px-4">
          <h1 class="text-white font-bold text-4xl sm:text-5xl leading-tight mb-6">
            OTools 高性能工具平台-小身躯大能量
          </h1>
          <p class="text-gray-300 text-lg mb-8">
            以 Tabs 多任务化为核心，统一插件生态、原生能力与桌面运行时。
            让每个工具都成为可组合的AI工作流模块。
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
              <div class="hero-app-screen" :style="screenStyle">
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
        <div class="hero-overlay-card" @click.stop>
          <div class="hero-overlay-header">
            <div class="overlay-title">
              {{ tabs[overlayTab].title }}
            </div>
            <button class="overlay-close" @click="closeOverlay">✕</button>
          </div>
          <div class="hero-overlay-body" :style="overlayStyle">
            <div class="overlay-caption">主程序截图占位</div>
          </div>
          <div class="hero-overlay-footer">
            {{ tabs[overlayTab].desc }}
          </div>
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
    title: '海洋生态入口',
    desc: '工具聚合与插件快速访问。',
    colors: ['#1d4ed8', '#0ea5e9'],
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
    colors: ['#334155', '#64748b'],
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
    desc: '本地模型管理与运行。',
    colors: ['#6d28d9', '#a855f7'],
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

const screenStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs[activeTab.value].colors[0]}, ${tabs[activeTab.value].colors[1]})`,
}));

const overlayStyle = computed(() => ({
  background: `linear-gradient(135deg, ${tabs[overlayTab.value].colors[0]}, ${tabs[overlayTab.value].colors[1]})`,
}));

const openOverlay = (index: number) => {
  activeTab.value = index;
  overlayTab.value = index;
  overlayOpen.value = true;
};

const closeOverlay = () => {
  overlayOpen.value = false;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    overlayOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>
