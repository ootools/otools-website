<script setup lang="ts">
import DefaultTheme from 'vitepress/theme';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useData } from 'vitepress';

const { page } = useData();
const isHome = computed(() => page.value.relativePath === 'index.md');
const menuOpen = ref(false);
const scrolled = ref(false);

const navItems = [
  { text: '首页', link: '/' },
  { text: '功能', link: '/features' },
  { text: '文档', link: '/guide/overview' },
];

const onHomeDark = computed(() => isHome.value && !scrolled.value);

const headerClass = computed(() => {
  if (isHome.value) {
    return scrolled.value ? 'bg-white/90 shadow-sm backdrop-blur' : 'bg-dark/90 backdrop-blur';
  }
  return 'bg-white/90 shadow-sm backdrop-blur';
});

const linkClass = computed(() =>
  onHomeDark.value ? 'text-white/90 hover:text-white' : 'text-dark hover:text-primary'
);

const brandTextClass = computed(() => (onHomeDark.value ? 'text-white' : 'text-dark'));

const toggleBorderClass = computed(() =>
  onHomeDark.value ? 'border-white/40' : 'border-primary/20'
);

const toggleBarClass = computed(() =>
  onHomeDark.value ? 'bg-white' : 'bg-primary'
);

const updateScroll = () => {
  scrolled.value = window.scrollY > 24;
};

onMounted(() => {
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll);
});

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const closeMenu = () => {
  menuOpen.value = false;
};
</script>

<template>
  <div class="otools-docs">
    <header
      class="site-header fixed top-0 left-0 w-full z-50 transition"
      :class="headerClass"
    >
      <div class="container">
        <div class="flex items-center justify-between py-4 lg:py-5">
          <a class="flex items-center gap-3 font-semibold" :class="brandTextClass" href="/">
            <span class="h-9 w-9 rounded-xl bg-white/20 text-white flex items-center justify-center"
              :class="isHome ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'">O</span>
            <span class="text-lg">OTools</span>
          </a>

          <button
            class="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border"
            :class="toggleBorderClass"
            @click="toggleMenu"
            aria-label="Toggle Navigation"
          >
            <span class="block w-5 h-0.5 mb-1" :class="toggleBarClass"></span>
            <span class="block w-5 h-0.5 mb-1" :class="toggleBarClass"></span>
            <span class="block w-5 h-0.5" :class="toggleBarClass"></span>
          </button>

          <nav
            class="absolute lg:static left-0 right-0 top-full bg-white/95 lg:bg-transparent border-t lg:border-none shadow-lg lg:shadow-none"
            :class="menuOpen ? 'block' : 'hidden lg:block'"
          >
            <ul class="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-8 px-6 py-4 lg:p-0">
              <li v-for="item in navItems" :key="item.link">
                <a :href="item.link" class="text-base transition" :class="linkClass" @click="closeMenu">
                  {{ item.text }}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <div class="layout-body" :class="isHome ? 'layout-home pt-0' : 'layout-doc pt-24'">
      <DefaultTheme.Layout />
    </div>
  </div>
</template>
