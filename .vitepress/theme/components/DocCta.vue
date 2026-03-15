<template>
  <section class="py-20 bg-dark">
    <div class="container">
      <div class="flex flex-wrap items-center justify-between gap-6 text-white">
        <div>
          <h2 class="text-3xl font-semibold mb-3">{{ t('docCta.title') }}</h2>
          <p class="text-dark-700">{{ t('docCta.desc') }}</p>
        </div>
        <div class="flex flex-wrap gap-4">
          <a
            :href="apiLink"
            class="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {{ t('docCta.actions.api') }}
          </a>
          <a
            :href="devLink"
            class="inline-flex items-center justify-center border border-white/40 text-white px-6 py-3 rounded-lg"
          >
            {{ t('docCta.actions.dev') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import { useI18n } from '../i18n';

const { localePath } = useData();
const { t } = useI18n();

const localeBase = computed(() => localePath?.value ?? '/');
const withLocale = (path: string) =>
  localeBase.value === '/' ? `/${path}` : `${localeBase.value}${path}`;

const apiLink = computed(() => withLocale('guide/otools-api'));
const devLink = computed(() => withLocale('guide/dev'));
</script>
