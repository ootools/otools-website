<template>
  <section id="origin" class="py-20 bg-slate-50">
    <div class="container">
      <div class="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div>
          <div
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-sm text-slate-500 shadow-sm"
          >
            {{ t('origin.label') }}
          </div>
          <h2 class="text-3xl font-bold text-dark mt-4 mb-4">{{ t('origin.title') }}</h2>
          <p class="text-body-color text-lg mb-6">
            {{ t('origin.desc') }}
          </p>
          <ol class="list-decimal list-inside space-y-3 text-body-color">
            <li v-for="(point, index) in points" :key="index">
              {{ point }}
            </li>
          </ol>
        </div>
        <div class="relative">
          <div class="absolute -top-6 -left-6 h-24 w-24 rounded-3xl bg-primary/10 blur-2xl"></div>
          <div class="absolute -bottom-8 -right-8 h-32 w-32 rounded-3xl bg-secondary/10 blur-2xl"></div>
          <div class="bg-white shadow-testimonial rounded-3xl p-8 border border-slate-100">
            <div class="text-sm uppercase tracking-[0.3em] text-slate-400">Ocean + Tools</div>
            <div class="text-5xl font-bold text-dark mt-4">OTools</div>
            <div class="mt-6 flex items-center gap-3">
              <div class="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl">🐇</div>
              <div>
                <div class="text-base font-semibold text-dark">{{ t('origin.cardTitle') }}</div>
                <div class="text-sm text-slate-500">{{ t('origin.cardDesc') }}</div>
              </div>
            </div>
            <div class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              “{{ t('origin.quote') }}”
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '../i18n';

const { t, tm } = useI18n();
const points = computed(() => (tm('origin.points') as string[]) ?? []);
</script>
