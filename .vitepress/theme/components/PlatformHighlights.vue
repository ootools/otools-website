<template>
  <section id="features" class="py-20">
    <div class="container">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <h2 class="text-3xl font-bold text-dark mb-4">{{ t('platform.title') }}</h2>
        <p class="text-body-color">
          {{ t('platform.subtitle') }}
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="bg-white shadow-testimonial rounded-2xl p-6"
        >
          <div
            class="h-12 w-12 flex items-center justify-center rounded-xl mb-4"
            :class="iconStyles[index]?.className"
          >
            {{ iconStyles[index]?.icon }}
          </div>
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

const { tm, t } = useI18n();

const items = computed(() => (tm('platform.items') as Array<{ title: string; desc: string }>) ?? []);

const iconStyles = [
  { icon: '🌊', className: 'bg-primary/10 text-primary' },
  { icon: '📑', className: 'bg-secondary/10 text-secondary' },
  { icon: '⚙️', className: 'bg-warning/10 text-warning' },
  { icon: '🚀', className: 'bg-primary/10 text-primary' },
  { icon: '🧭', className: 'bg-secondary/10 text-secondary' },
  { icon: '🧩', className: 'bg-warning/10 text-warning' },
];
</script>
