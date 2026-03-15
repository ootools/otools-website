<template>
  <section id="tabs" class="py-20 bg-[#f8faff]">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-bold text-dark mb-4">{{ t('tabsWorkflow.title') }}</h2>
        <p class="text-body-color">{{ t('tabsWorkflow.subtitle') }}</p>
      </div>
      <div class="grid gap-6 lg:grid-cols-3">
        <div v-for="(item, index) in items" :key="index" class="bg-white rounded-2xl p-6 shadow-testimonial">
          <div class="text-primary text-2xl font-semibold mb-4">{{ String(index + 1).padStart(2, '0') }}</div>
          <h3 class="text-xl font-semibold text-dark mb-2">{{ item.title }}</h3>
          <p class="text-body-color">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const { t, tm } = useI18n();
const items = computed(() => (tm('tabsWorkflow.items') as Array<{ title: string; desc: string }>) ?? []);
</script>
