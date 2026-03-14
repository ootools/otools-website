<template>
  <section class="section hero-intro">
    <el-card class="hero-card" shadow="never">
      <div class="hero-badge">
        <el-tag type="info" effect="dark">OTools</el-tag>
        <span>海洋生态高性能工具平台</span>
      </div>
      <h1>让桌面成为可扩展的小程序平台</h1>
      <p>
        OTools 以 Tabs 多任务化为核心，提供统一入口、统一运行时与插件生态，
        让每个工具都成为可组合的生产力模块。
      </p>
      <div class="hero-actions">
        <el-button type="primary" plain tag="a" href="/features">快速了解</el-button>
        <el-button tag="a" href="/guide/overview">开发者文档</el-button>
      </div>
    </el-card>
      <div class="hero-panel">
        <div class="hero-panel-item">
          <strong>生态化工具</strong>
          <p>从内置工具到开发者插件，统一资源管理与能力调用。</p>
        </div>
      <div class="hero-panel-item">
        <strong>多任务 Tabs</strong>
        <p>并行打开多个工具与页面，保持上下文、不中断流程。</p>
      </div>
      <div class="hero-panel-item">
        <strong>高性能体验</strong>
        <p>桌面端能力 + 原生插件扩展，兼顾速度与稳定性。</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-panel-item strong {
  display: block;
  font-size: 16px;
  margin-bottom: 6px;
}

.hero-panel-item p {
  margin: 0;
  font-size: 13px;
  color: #475569;
}
</style>
