<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const plugins = [
  {
    name: '飞鱼 HTTP',
    desc: 'HTTP 调试与自动化',
    tags: ['调试', 'API', '流程'],
    shots: [
      { title: '请求编排', colors: ['#0ea5e9', '#38bdf8'] },
      { title: '响应洞察', colors: ['#0284c7', '#0ea5e9'] },
    ],
  },
  {
    name: '白鲸 TTS',
    desc: '高质量语音合成',
    tags: ['音频', 'TTS', '生产力'],
    shots: [
      { title: '语音库', colors: ['#6366f1', '#818cf8'] },
      { title: '试听面板', colors: ['#4338ca', '#6366f1'] },
    ],
  },
  {
    name: '乌贼 Ollama',
    desc: '本地模型管理',
    tags: ['AI', '本地', '模型'],
    shots: [
      { title: '模型总览', colors: ['#14b8a6', '#2dd4bf'] },
      { title: '运行监控', colors: ['#0f766e', '#14b8a6'] },
    ],
  },
  {
    name: '海草 Markdown',
    desc: '文档与笔记',
    tags: ['文档', '知识库', '协作'],
    shots: [
      { title: '双栏编辑', colors: ['#f97316', '#fb923c'] },
      { title: '知识树', colors: ['#ea580c', '#f97316'] },
    ],
  },
  {
    name: '海洋馆(市场)',
    desc: '插件市场入口',
    tags: ['生态', '市场', '更新'],
    shots: [
      { title: '精选插件', colors: ['#94a3b8', '#cbd5f5'] },
      { title: '版本详情', colors: ['#64748b', '#94a3b8'] },
    ],
  },
];

const activeIndex = ref(0);
const activeShotIndex = ref(0);
const autoPlay = ref(true);
let timer: number | null = null;

const activePlugin = computed(() => plugins[activeIndex.value] || plugins[0]);
const activeShots = computed(() => activePlugin.value.shots);
const activeShot = computed(() => activeShots.value[activeShotIndex.value]);
const shotStyle = computed(() => ({
  background: `linear-gradient(135deg, ${activeShot.value.colors[0]}, ${activeShot.value.colors[1]})`,
}));

const setActive = (index: number) => {
  if (index === activeIndex.value) return;
  activeIndex.value = index;
  activeShotIndex.value = 0;
};

const nextShot = () => {
  activeShotIndex.value = (activeShotIndex.value + 1) % activeShots.value.length;
};

const prevShot = () => {
  activeShotIndex.value =
    (activeShotIndex.value - 1 + activeShots.value.length) % activeShots.value.length;
};

const toggleAuto = () => {
  autoPlay.value = !autoPlay.value;
};

const startAutoPlay = () => {
  if (timer !== null) return;
  timer = window.setInterval(() => {
    if (!autoPlay.value) return;
    nextShot();
  }, 3200);
};

const stopAutoPlay = () => {
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
};

onMounted(() => startAutoPlay());
onBeforeUnmount(() => stopAutoPlay());
</script>

<template>
  <section id="plugins" class="py-20">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-bold text-dark mb-4">插件视觉展示</h2>
        <p class="text-body-color">大图展示 + 悬停切换 + 自动演示，预留真实截图替换。</p>
      </div>
      <div class="grid gap-10 lg:grid-cols-[2fr,1fr] items-start">
        <div class="space-y-4" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
          <div
            class="rounded-3xl overflow-hidden shadow-xl border border-white/80 min-h-[360px] relative"
            :style="shotStyle"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent"></div>
            <div class="relative p-8 text-white space-y-2">
              <span class="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-sm">
                {{ activePlugin.name }}
              </span>
              <h3 class="text-2xl font-semibold">{{ activeShot.title }}</h3>
              <p class="text-white/80">{{ activePlugin.desc }}</p>
            </div>
          </div>
          <div class="flex flex-wrap gap-3">
            <button
              class="px-4 py-2 rounded-lg bg-primary text-white shadow"
              @click="prevShot"
            >
              上一张
            </button>
            <button
              class="px-4 py-2 rounded-lg bg-primary text-white shadow"
              @click="nextShot"
            >
              下一张
            </button>
            <button
              class="px-4 py-2 rounded-lg border border-primary text-primary"
              @click="toggleAuto"
            >
              {{ autoPlay ? '关闭自动演示' : '开启自动演示' }}
            </button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="(shot, index) in activeShots"
              :key="shot.title"
              class="px-3 py-1 rounded-full border border-primary/30 text-primary text-sm"
              :class="index === activeShotIndex ? 'bg-primary/10' : 'bg-white'"
              @mouseenter="activeShotIndex = index"
            >
              {{ shot.title }}
            </button>
          </div>
        </div>
        <div class="space-y-4">
          <div
            v-for="(plugin, index) in plugins"
            :key="plugin.name"
            class="rounded-2xl border p-4 transition shadow-input cursor-pointer"
            :class="index === activeIndex ? 'border-primary bg-white' : 'border-gray-200 bg-white/80'"
            @mouseenter="setActive(index)"
            @click="setActive(index)"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-semibold text-dark">{{ plugin.name }}</div>
                <div class="text-body-color text-sm">{{ plugin.desc }}</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-2 mt-3">
              <span
                v-for="tag in plugin.tags"
                :key="tag"
                class="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
