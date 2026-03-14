<script setup lang="ts">
const apis = [
  {
    group: '系统能力',
    items: '剪贴板、文件与路径、通知、Shell 打开与管理',
  },
  {
    group: '运行时信息',
    items: '平台、版本、插件 UUID、运行环境变量',
  },
  {
    group: 'Native 能力',
    items: '原生插件加载、调用、探测、热更新',
  },
  {
    group: '插件状态',
    items: '本地状态与同步状态、支持 scheme 多文件存储',
  },
];
</script>

<template>
  <section class="section">
    <div class="section-head">
      <h2>OTools API 总览</h2>
      <p>所有能力通过 <code>window.otools</code> 统一暴露。</p>
    </div>
    <el-card class="table-card" shadow="never">
      <el-table :data="apis" style="width: 100%" border>
        <el-table-column prop="group" label="能力分组" width="160" />
        <el-table-column prop="items" label="包含内容" />
      </el-table>
    </el-card>
  </section>
</template>
