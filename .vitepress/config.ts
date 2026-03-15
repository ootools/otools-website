import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'OTools 高性能AI工作流平台',
  description: '高性能桌面工具平台 · Tabs 多任务化 · 桌面版小程序生态',
  appearance: false,
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0ea5e9' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  ],
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '功能', link: '/features' },
      { text: '文档', link: '/guide/overview' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '文档',
          items: [
            { text: '概览', link: '/guide/overview' },
            { text: 'OTools API', link: '/guide/otools-api' },
            { text: '开发者模式', link: '/guide/dev' },
          ],
        },
      ],
    },
    outline: [2, 3],
    footer: {
      message: 'OTools 海洋生态 · 高性能AI工作流平台',
      copyright: 'Copyright © OTools',
    },
  },
});
