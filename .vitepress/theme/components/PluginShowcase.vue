<script setup lang="ts">
const plugins = [
  { name: '飞鱼 HTTP', desc: 'HTTP 调试与自动化', status: '内置' },
  { name: '白鲸 TTS', desc: '高质量语音合成', status: '内置' },
  { name: '乌贼 Ollama', desc: '本地模型管理', status: '内置' },
  { name: '海草 Markdown', desc: '文档与笔记', status: '内置' },
  { name: '海星工具箱', desc: '常用小工具集合', status: '内置' },
  { name: '海豚音频工坊', desc: '音频处理与实验', status: '内置' },
  { name: '旗鱼抓包', desc: '网络抓包与回放', status: '内置' },
  { name: '海洋馆(市场)', desc: '插件市场入口', status: '内置' },
  { name: '水母证件照', desc: '证件照处理', status: '内置' },
  { name: '蓝鲸磁盘助手', desc: '磁盘扫描与清理', status: '内置' },
  { name: '沙丁鱼导航', desc: '书签与导航', status: '内置' },
  { name: '海螺 CFTunnel', desc: '内网穿透', status: '内置' },
  { name: '海岛工坊(开发)', desc: '开发者中心', status: '内置' },
  { name: '礁石便签', desc: '轻量便签', status: '内置' },
  { name: '思维导图', desc: '结构化思考', status: '插件' },
  { name: '在线 PS', desc: '在线设计', status: '插件' },
];
</script>

<template>
  <section class="section">
    <div class="section-head">
      <h2>插件生态预览</h2>
      <p>每个卡片预留截图位置，便于后续补充视觉素材。</p>
    </div>
    <el-row :gutter="20">
      <el-col
        v-for="item in plugins"
        :key="item.name"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card class="plugin-card" shadow="never">
          <div class="shot-placeholder">
            <span>插件截图占位</span>
          </div>
          <div class="plugin-info">
            <strong>{{ item.name }}</strong>
            <small>{{ item.desc }}</small>
            <el-tag size="small" effect="plain">{{ item.status }}</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>
