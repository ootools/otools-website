<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData } from 'vitepress';

const { page } = useData();
const navHidden = ref(false);
const navScrolled = ref(false);
let lastScrollY = 0;
const logoLightSrc = '/otools-logo.svg';
const logoDarkSrc = '/otools-logo-white.svg';

const isHome = computed(() => {
  const rel = page.value.relativePath;
  return rel === 'index.md' || rel.endsWith('/index.md');
});

const navScrollThreshold = computed(() => (isHome.value ? 120 : 24));

const getNavLogos = () =>
  Array.from(
    document.querySelectorAll<HTMLImageElement>('.VPNavBarTitle .logo, .VPNavScreenTitle .logo')
  );

const updateScroll = () => {
  const currentY = window.scrollY;
  navScrolled.value = currentY > navScrollThreshold.value;

  const transparentNav = isHome.value && currentY <= navScrollThreshold.value;
  const root = document.documentElement;
  root.classList.toggle('home-nav-transparent', transparentNav);

  for (const logo of getNavLogos()) {
    if (!logo.dataset.srcLight) {
      logo.dataset.srcLight = logo.getAttribute('src') || logoLightSrc;
    }
    if (!logo.dataset.srcDark) {
      logo.dataset.srcDark = logoDarkSrc;
    }
    const targetSrc = transparentNav ? logo.dataset.srcDark : logo.dataset.srcLight;
    if (targetSrc && logo.getAttribute('src') !== targetSrc) {
      logo.setAttribute('src', targetSrc);
    }
  }

  const delta = currentY - lastScrollY;
  if (currentY < 80) {
    navHidden.value = false;
  } else if (delta > 6 && currentY > 140) {
    navHidden.value = true;
  } else if (delta < -2) {
    navHidden.value = false;
  }

  lastScrollY = currentY;
};

onMounted(() => {
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
});

watch(
  () => page.value.relativePath,
  () => {
    requestAnimationFrame(updateScroll);
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll);
  document.documentElement.classList.remove('home-nav-transparent');
  for (const logo of getNavLogos()) {
    if (logo.dataset.srcLight) {
      logo.setAttribute('src', logo.dataset.srcLight);
    }
  }
});
</script>

<template>
  <div
    class="otools-docs"
    :class="[isHome ? 'layout-home' : 'layout-doc', navHidden ? 'nav-hidden' : '', navScrolled ? 'nav-scrolled' : '']"
  >
    <DefaultTheme.Layout />
  </div>
</template>
