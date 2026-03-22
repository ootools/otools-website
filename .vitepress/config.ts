import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'OTools 高性能AI工作流平台',
  description: '高性能桌面工具平台 · Tabs 多任务化 · 桌面版小程序生态',
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'OTools 高性能AI工作流平台',
      description: '高性能桌面工具平台 · Tabs 多任务化 · 桌面版小程序生态',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      title: 'OTools High-Performance AI Workflow Platform',
      description: 'High-performance desktop tools · Tabs multitasking · Desktop mini-app ecosystem',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Features', link: '/en/features' },
          { text: 'Docs', link: '/en/guide/overview' },
        ],
        sidebar: {
          '/en/guide/': [
            {
              text: 'Documentation',
              items: [
                { text: 'Overview', link: '/en/guide/overview' },
                { text: 'OTools API', link: '/en/guide/otools-api' },
                { text: 'Developer Mode', link: '/en/guide/dev' },
                { text: 'Migration', link: '/en/guide/migration' },
                { text: 'macOS Installation Issues', link: '/en/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'OTools Ocean Ecosystem · High-Performance AI Workflow Platform',
          copyright: 'Copyright © OTools',
        },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      title: 'OTools 高性能AIワークフロープラットフォーム',
      description: '高性能デスクトップツール · Tabs マルチタスク · デスクトップ版ミニアプリのエコシステム',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          { text: '機能', link: '/ja/features' },
          { text: 'ドキュメント', link: '/ja/guide/overview' },
        ],
        sidebar: {
          '/ja/guide/': [
            {
              text: 'ドキュメント',
              items: [
                { text: '概要', link: '/ja/guide/overview' },
                { text: 'OTools API', link: '/ja/guide/otools-api' },
                { text: '開発者モード', link: '/ja/guide/dev' },
                { text: '移行', link: '/ja/guide/migration' },
                { text: 'macOS インストール問題', link: '/ja/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'OTools 海洋エコシステム · 高性能AIワークフロープラットフォーム',
          copyright: 'Copyright © OTools',
        },
      },
    },
    ko: {
      label: '한국어',
      lang: 'ko-KR',
      title: 'OTools 고성능 AI 워크플로 플랫폼',
      description: '고성능 데스크톱 도구 · Tabs 멀티태스킹 · 데스크톱 미니앱 생태계',
      themeConfig: {
        nav: [
          { text: '홈', link: '/ko/' },
          { text: '기능', link: '/ko/features' },
          { text: '문서', link: '/ko/guide/overview' },
        ],
        sidebar: {
          '/ko/guide/': [
            {
              text: '문서',
              items: [
                { text: '개요', link: '/ko/guide/overview' },
                { text: 'OTools API', link: '/ko/guide/otools-api' },
                { text: '개발자 모드', link: '/ko/guide/dev' },
                { text: '마이그레이션', link: '/ko/guide/migration' },
                { text: 'macOS 설치 문제', link: '/ko/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'OTools 해양 생태계 · 고성능 AI 워크플로 플랫폼',
          copyright: 'Copyright © OTools',
        },
      },
    },
    fr: {
      label: 'Français',
      lang: 'fr-FR',
      title: 'OTools Plateforme de flux de travail IA haute performance',
      description: 'Outils de bureau haute performance · Multitâche Tabs · Écosystème de mini‑apps desktop',
      themeConfig: {
        nav: [
          { text: 'Accueil', link: '/fr/' },
          { text: 'Fonctionnalités', link: '/fr/features' },
          { text: 'Documentation', link: '/fr/guide/overview' },
        ],
        sidebar: {
          '/fr/guide/': [
            {
              text: 'Documentation',
              items: [
                { text: 'Aperçu', link: '/fr/guide/overview' },
                { text: 'API OTools', link: '/fr/guide/otools-api' },
                { text: 'Mode développeur', link: '/fr/guide/dev' },
                { text: 'Migration', link: '/fr/guide/migration' },
                { text: 'Problèmes d\'installation macOS', link: '/fr/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'Écosystème océanique OTools · Plateforme IA haute performance',
          copyright: 'Copyright © OTools',
        },
      },
    },
    es: {
      label: 'Español',
      lang: 'es-ES',
      title: 'OTools Plataforma de flujo de trabajo IA de alto rendimiento',
      description: 'Herramientas de escritorio de alto rendimiento · Multitarea Tabs · Ecosistema de mini‑apps',
      themeConfig: {
        nav: [
          { text: 'Inicio', link: '/es/' },
          { text: 'Funciones', link: '/es/features' },
          { text: 'Documentación', link: '/es/guide/overview' },
        ],
        sidebar: {
          '/es/guide/': [
            {
              text: 'Documentación',
              items: [
                { text: 'Resumen', link: '/es/guide/overview' },
                { text: 'API de OTools', link: '/es/guide/otools-api' },
                { text: 'Modo desarrollador', link: '/es/guide/dev' },
                { text: 'Migración', link: '/es/guide/migration' },
                { text: 'Problemas de instalación en macOS', link: '/es/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'Ecosistema oceánico OTools · Plataforma IA de alto rendimiento',
          copyright: 'Copyright © OTools',
        },
      },
    },
    de: {
      label: 'Deutsch',
      lang: 'de-DE',
      title: 'OTools Hochleistungs‑KI‑Workflow‑Plattform',
      description: 'Leistungsstarke Desktop‑Tools · Tabs‑Multitasking · Desktop‑Mini‑App‑Ökosystem',
      themeConfig: {
        nav: [
          { text: 'Startseite', link: '/de/' },
          { text: 'Funktionen', link: '/de/features' },
          { text: 'Dokumentation', link: '/de/guide/overview' },
        ],
        sidebar: {
          '/de/guide/': [
            {
              text: 'Dokumentation',
              items: [
                { text: 'Überblick', link: '/de/guide/overview' },
                { text: 'OTools API', link: '/de/guide/otools-api' },
                { text: 'Entwicklermodus', link: '/de/guide/dev' },
                { text: 'Migration', link: '/de/guide/migration' },
                { text: 'macOS Installationsprobleme', link: '/de/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'OTools Ozean‑Ökosystem · Hochleistungs‑KI‑Workflow‑Plattform',
          copyright: 'Copyright © OTools',
        },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru-RU',
      title: 'OTools Высокопроизводительная платформа AI‑workflow',
      description: 'Высокопроизводительные desktop‑инструменты · Tabs‑многозадачность · Экосистема мини‑приложений',
      themeConfig: {
        nav: [
          { text: 'Главная', link: '/ru/' },
          { text: 'Возможности', link: '/ru/features' },
          { text: 'Документация', link: '/ru/guide/overview' },
        ],
        sidebar: {
          '/ru/guide/': [
            {
              text: 'Документация',
              items: [
                { text: 'Обзор', link: '/ru/guide/overview' },
                { text: 'API OTools', link: '/ru/guide/otools-api' },
                { text: 'Режим разработчика', link: '/ru/guide/dev' },
                { text: 'Миграция', link: '/ru/guide/migration' },
                { text: 'Проблемы с установкой на macOS', link: '/ru/guide/mac-installation-issue' },
              ],
            },
          ],
        },
        footer: {
          message: 'OTools океанская экосистема · Высокопроизводительная платформа AI‑workflow',
          copyright: 'Copyright © OTools',
        },
      },
    },
  },
  appearance: false,
  cleanUrls: true,
  head: [
    ['meta', { name: 'theme-color', content: '#0ea5e9' }],
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  ],
  themeConfig: {
    logo: '/otools-logo.svg',
    siteTitle: 'OTools',
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
            { text: '更新日志', link: '/guide/changelog' },
            { text: 'OTools API', link: '/guide/otools-api' },
            { text: '开发者模式', link: '/guide/dev' },
            { text: '兼容', link: '/guide/migration' },
            { text: 'macOS 安装问题', link: '/guide/mac-installation-issue' },
          ],
        },
      ],
    },
    footer: {
      message: 'OTools 海洋生态 · 高性能AI工作流平台',
      copyright: 'Copyright © OTools',
    },
    outline: [2, 3],
  },
});