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
  <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-testimonial">
    <table class="w-full text-left">
      <thead class="bg-[#f5f7fb]">
        <tr>
          <th class="px-6 py-4 text-dark">能力分组</th>
          <th class="px-6 py-4 text-dark">包含内容</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in apis" :key="item.group" class="border-t">
          <td class="px-6 py-4 font-medium text-dark">{{ item.group }}</td>
          <td class="px-6 py-4 text-body-color">{{ item.items }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
