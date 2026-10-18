import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * 滚动进场：给根节点下所有 `.ot-reveal` 元素在进入视口时加 `is-in`。
 * 首页各区块共用，避免每块重复写 IntersectionObserver。
 */
export const useReveal = () => {
  const root = ref<HTMLElement | null>(null);
  let io: IntersectionObserver | null = null;

  onMounted(() => {
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io?.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    root.value?.querySelectorAll('.ot-reveal').forEach((el) => io?.observe(el));
  });

  onBeforeUnmount(() => io?.disconnect());

  return { root };
};
