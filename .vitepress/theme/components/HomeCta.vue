<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { withBase } from 'vitepress';
import { useI18n } from '../i18n';

const { t, localeKey } = useI18n();

const localeBase = computed(() =>
  localeKey.value && localeKey.value !== 'root' ? `/${localeKey.value}/` : '/',
);
const withLocale = (p: string) => (localeBase.value === '/' ? `/${p}` : `${localeBase.value}${p}`);

const docsLink = computed(() => withBase(withLocale('guide/overview')));
const apiLink = computed(() => withBase(withLocale('guide/otools-api')));

const modalOpen = ref(false);
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') modalOpen.value = false;
};
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <section class="ot-cta">
    <div class="ot-wrap ot-cta-inner">
      <span class="ot-eyebrow">{{ t('home.cta.eyebrow') }}</span>
      <h2 class="ot-cta-title" v-html="t('home.cta.title')"></h2>
      <p class="ot-sub" style="text-align: center; margin-left: auto; margin-right: auto">
        {{ t('home.cta.desc') }}
      </p>

      <div class="ot-cta-actions">
        <button type="button" class="ot-btn ot-btn--primary" @click="modalOpen = true">
          {{ t('home.cta.download') }}
        </button>
        <a class="ot-btn ot-btn--ghost" :href="docsLink">{{ t('home.cta.docs') }}</a>
        <a class="ot-btn ot-btn--ghost" :href="apiLink">{{ t('home.cta.api') }}</a>
      </div>

      <p class="ot-cta-note">{{ t('home.cta.note') }}</p>
    </div>

    <Transition name="ot-fade">
      <div v-if="modalOpen" class="ot-modal-mask" @click="modalOpen = false">
        <div class="ot-modal" @click.stop>
          <button class="ot-modal-close" @click="modalOpen = false">✕</button>
          <h3>{{ t('home.hero.modalTitle') }}</h3>
          <p>{{ t('home.hero.modalDesc') }}</p>
          <img :src="withBase('/weixin.jpg')" alt="WeChat" loading="lazy" />
        </div>
      </div>
    </Transition>
  </section>
</template>
