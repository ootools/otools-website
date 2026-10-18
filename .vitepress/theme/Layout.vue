<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useData, withBase } from 'vitepress';

const { page } = useData();
const navHidden = ref(false);
const navScrolled = ref(false);
let lastScrollY = 0;
const logoLightSrc = withBase('/otools-logo.svg');
const logoDarkSrc = withBase('/otools-logo-white.svg');

const isHome = computed(() => {
  const rel = page.value.relativePath;
  return rel === 'index.md' || rel.endsWith('/index.md');
});

// 插件落地页（`plugins/<key>.md` 与 `<lang>/plugins/<key>.md`）。
// 这些页面和首页同属「深色沉浸」层（见 home.css 的 .layout-landing 规则），
// 与文档页（浅色阅读层）分开——所以组件里不能再依赖站点明暗切换。
const isPluginLanding = computed(() => {
  const rel = page.value.relativePath;
  return /(^|\/)plugins\/[^/]+\.md$/.test(rel);
});

// 深色外壳（导航透明 + 白色 logo）适用于首页与插件落地页
const usesDarkShell = computed(() => isHome.value || isPluginLanding.value);

const navScrollThreshold = computed(() => (isHome.value ? 120 : 24));

const getNavLogos = () =>
  Array.from(
    document.querySelectorAll<HTMLImageElement>('.VPNavBarTitle .logo, .VPNavScreenTitle .logo')
  );

const updateScroll = () => {
  const currentY = window.scrollY;
  navScrolled.value = currentY > navScrollThreshold.value;

  const transparentNav = usesDarkShell.value && currentY <= navScrollThreshold.value;
  const root = document.documentElement;
  root.classList.toggle('home-nav-transparent', transparentNav);

  for (const logo of getNavLogos()) {
    if (!logo.dataset.srcLight) {
      logo.dataset.srcLight = logo.getAttribute('src') || logoLightSrc;
    }
    if (!logo.dataset.srcDark) {
      logo.dataset.srcDark = logoDarkSrc;
    }
    // 首页与插件落地页整体是深色沉浸式设计，无论是否滚动、顶栏底是透明还是
    // 深色半透明，logo 都必须用白色版——否则滚动时会从白版闪回蓝底版，与新设计不搭。
    const targetSrc = usesDarkShell.value ? logo.dataset.srcDark : logo.dataset.srcLight;
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
    :class="[
      isHome ? 'layout-home' : isPluginLanding ? 'layout-landing' : 'layout-doc',
      navHidden ? 'nav-hidden' : '',
      navScrolled ? 'nav-scrolled' : '',
    ]"
  >
    <DefaultTheme.Layout />
  </div>
</template>
