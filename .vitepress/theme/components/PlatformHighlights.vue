<template>
  <section class="section">
    <div class="section-head">
      <h2>平台定位</h2>
      <p>海洋生态、高性能、可扩展，面向专业场景的桌面级工具平台。</p>
    </div>
    <div class="card-grid">
      <el-card shadow="never">
        <el-tag type="success" effect="plain">生态</el-tag>
        <h3>海洋生态工具族</h3>
        <p>统一的插件目录、版本管理与运行时，让工具像海洋生物一样协同进化。</p>
      </el-card>
      <el-card shadow="never">
        <el-tag type="warning" effect="plain">性能</el-tag>
        <h3>高性能桌面内核</h3>
        <p>结合本地能力与原生插件，执行速度更快，稳定性更高。</p>
      </el-card>
      <el-card shadow="never">
        <el-tag type="info" effect="plain">协作</el-tag>
        <h3>Tabs 多任务化</h3>
        <p>每个工具都是一个任务页，支持并行操作与上下文切换。</p>
      </el-card>
    </div>
  </section>
</template>

<style scoped>
.el-card {
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.9);
}

h3 {
  margin: 12px 0 8px;
  color: #0f172a;
}

p {
  margin: 0;
  color: #475569;
  line-height: 1.6;
}
</style>
