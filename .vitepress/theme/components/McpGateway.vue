<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';
import { accentOf, logoUrl, mcpCommands, mcpNodes, pluginName } from '../home/homeData';

const { t, tm } = useI18n();

// 节点在圆周上的角度分布（两圈：外圈 8 个、内圈 4 个）。
const placed = computed(() => {
  const outer = mcpNodes.slice(0, 8);
  const inner = mcpNodes.slice(8);
  const pos: Array<{ key: string; plugin: string; x: number; y: number; logo: string; name: string }> = [];

  outer.forEach((p, i) => {
    const ang = (i / outer.length) * Math.PI * 2 - Math.PI / 2;
    pos.push({
      key: `o-${p}`,
      plugin: p,
      x: 50 + Math.cos(ang) * 46,
      y: 50 + Math.sin(ang) * 46,
      logo: withBase(logoUrl(p)),
      name: pluginName[p] ?? p,
    });
  });
  inner.forEach((p, i) => {
    const ang = (i / inner.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / 4;
    pos.push({
      key: `i-${p}`,
      plugin: p,
      x: 50 + Math.cos(ang) * 24,
      y: 50 + Math.sin(ang) * 24,
      logo: withBase(logoUrl(p)),
      name: pluginName[p] ?? p,
    });
  });
  return pos;
});

// 指令轮播：打出一个 prompt，逐条点亮命中的插件节点。
const cmdIndex = ref(0);
const shownCalls = ref(0);
const typed = ref('');
const hitPlugins = computed(() => new Set(mcpCommands[cmdIndex.value].calls.map((c) => c.plugin)));

let typeTimer: number | null = null;
let callTimer: number | null = null;
let cmdTimer: number | null = null;

const runCommand = () => {
  const cmd = mcpCommands[cmdIndex.value];
  const text = (tm(`home.mcp.commands.${cmdIndex.value}.prompt`) as string) ?? cmd.prompt;
  typed.value = '';
  shownCalls.value = 0;
  let i = 0;
  const step = () => {
    i += 1;
    typed.value = text.slice(0, i);
    if (i < text.length) {
      typeTimer = window.setTimeout(step, 34);
    } else {
      // 逐条"执行"
      const push = () => {
        shownCalls.value += 1;
        if (shownCalls.value < cmd.calls.length) {
          callTimer = window.setTimeout(push, 520);
        }
      };
      callTimer = window.setTimeout(push, 380);
    }
  };
  step();
};

const nextCommand = () => {
  cmdIndex.value = (cmdIndex.value + 1) % mcpCommands.length;
  runCommand();
};

const clearTimers = () => {
  for (const tm of [typeTimer, callTimer, cmdTimer]) if (tm !== null) window.clearTimeout(tm);
  typeTimer = callTimer = cmdTimer = null;
};

const calls = computed(() => mcpCommands[cmdIndex.value].calls);
const callPlugin = (p: string) => ({
  logo: withBase(logoUrl(p as never)),
  name: pluginName[p] ?? p,
});

onMounted(() => {
  runCommand();
  cmdTimer = window.setInterval(nextCommand, 7200);
});
onBeforeUnmount(clearTimers);
</script>

<template>
  <section id="mcp" class="ot-section ot-mcp">
    <div class="ot-wrap">
      <div class="ot-center">
        <span class="ot-eyebrow">{{ t('home.mcp.eyebrow') }}</span>
        <h2 class="ot-h2" v-html="t('home.mcp.title')"></h2>
        <p class="ot-sub">{{ t('home.mcp.subtitle') }}</p>
      </div>

      <div class="ot-mcp-layout">
        <!-- 左：中枢概念图 -->
        <div class="ot-mcp-graph">
          <div class="ot-mcp-ring"></div>
          <div class="ot-mcp-ring ot-mcp-ring--2"></div>

          <svg class="ot-mcp-links" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="otMcpGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="#4f8cff" />
                <stop offset="1" stop-color="#22d3ee" />
              </linearGradient>
            </defs>
            <line
              v-for="n in placed"
              :key="n.key"
              :x1="50"
              :y1="50"
              :x2="n.x"
              :y2="n.y"
              :class="{ 'is-hit': hitPlugins.has(n.plugin as never) }"
            />
          </svg>

          <div class="ot-mcp-core">
            <div>
              <b>{{ t('home.mcp.core') }}</b>
              <small>{{ t('home.mcp.coreSub') }}</small>
            </div>
          </div>

          <div
            v-for="n in placed"
            :key="n.key"
            class="ot-mcp-node"
            :class="{ 'is-hit': hitPlugins.has(n.plugin as never) }"
            :style="{ left: `${n.x}%`, top: `${n.y}%` }"
            :title="n.name"
          >
            <img :src="n.logo" :alt="n.name" loading="lazy" />
          </div>
        </div>

        <!-- 右：指令演示 + 特性 -->
        <div>
          <div class="ot-mcp-panel">
            <div class="ot-mcp-panel-head">
              <span class="ot-dot ot-dot--r"></span>
              <span class="ot-dot ot-dot--y"></span>
              <span class="ot-dot ot-dot--g"></span>
              <span style="margin-left: 6px">{{ t('home.mcp.panelTitle') }}</span>
            </div>
            <div class="ot-mcp-panel-body">
              <div class="ot-mcp-cmd">
                <span class="ot-prompt-char">›</span>
                <span class="ot-typing">{{ typed }}</span>
              </div>
              <div class="ot-mcp-calls">
                <div
                  v-for="(c, i) in calls.slice(0, shownCalls)"
                  :key="`${cmdIndex}-${i}`"
                  class="ot-mcp-call"
                  :style="{ animationDelay: '0ms' }"
                >
                  <img :src="callPlugin(c.plugin).logo" :alt="callPlugin(c.plugin).name" />
                  <code>{{ c.tool }}</code>
                  <span class="ot-ok">✓</span>
                </div>
              </div>
            </div>
          </div>

          <div class="ot-mcp-points">
            <div v-for="(p, i) in (tm('home.mcp.points') as Array<{ icon: string; title: string; desc: string }>)" :key="i" class="ot-mcp-point">
              <span class="ot-mp-icon">{{ p.icon }}</span>
              <div>
                <b>{{ p.title }}</b>
                <span>{{ p.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
