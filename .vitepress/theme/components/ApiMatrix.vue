<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const { t, tm } = useI18n();
const apis = computed(
  () => (tm('apiMatrix.rows') as Array<{ group: string; items: string }>) ?? []
);
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-testimonial">
    <table class="w-full text-left">
      <thead class="bg-[#f5f7fb]">
        <tr>
          <th class="px-6 py-4 text-dark">{{ t('apiMatrix.header.group') }}</th>
          <th class="px-6 py-4 text-dark">{{ t('apiMatrix.header.items') }}</th>
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
