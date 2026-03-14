<template>
  <section class="section">
    <div class="section-head">
      <h2>Tabs 多任务化工作流</h2>
      <p>从发现工具到并行任务执行，统一在 OTools 的标签体系中完成。</p>
    </div>
    <el-card class="table-card" shadow="never">
      <el-steps align-center finish-status="success">
        <el-step title="发现工具" description="通过海洋生态插件与内置模块获取能力" />
        <el-step title="固定到 Tabs" description="常用工具常驻标签页，保持上下文" />
        <el-step title="并行处理" description="多任务并行，减少切换成本" />
      </el-steps>
    </el-card>
  </section>
</template>

<style scoped>
.el-steps {
  padding: 12px 0;
}
</style>
