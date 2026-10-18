import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import './custom.css';
import './home/home.css';

// ── 首页（全新设计：深色沉浸叙事）─────────────────────────────────────────────
import HomeHero from './components/HomeHero.vue';
import LogoMarquee from './components/LogoMarquee.vue';
import ReplaceMatrix from './components/ReplaceMatrix.vue';
import ScrollStory from './components/ScrollStory.vue';
import McpGateway from './components/McpGateway.vue';
import PlatformEdge from './components/PlatformEdge.vue';
import PluginWall from './components/PluginWall.vue';
import HomeCta from './components/HomeCta.vue';
import DevPorting from './components/DevPorting.vue';

// ── 旧首页组件（保留注册，兼容 features 等页面与历史引用）──────────────────────
import HeroIntro from './components/HeroIntro.vue';
import OriginStory from './components/OriginStory.vue';
import PlatformHighlights from './components/PlatformHighlights.vue';
import TabsWorkflow from './components/TabsWorkflow.vue';
import PluginShowcase from './components/PluginShowcase.vue';
import ApiMatrix from './components/ApiMatrix.vue';
import DocCta from './components/DocCta.vue';
import PluginLanding from './components/PluginLanding.vue';
import PluginGrid from './components/PluginGrid.vue';

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // 新首页
    app.component('HomeHero', HomeHero);
    app.component('LogoMarquee', LogoMarquee);
    app.component('ReplaceMatrix', ReplaceMatrix);
    app.component('ScrollStory', ScrollStory);
    app.component('McpGateway', McpGateway);
    app.component('PlatformEdge', PlatformEdge);
    app.component('PluginWall', PluginWall);
    app.component('HomeCta', HomeCta);
    app.component('DevPorting', DevPorting);

    // 旧组件
    app.component('HeroIntro', HeroIntro);
    app.component('OriginStory', OriginStory);
    app.component('PlatformHighlights', PlatformHighlights);
    app.component('TabsWorkflow', TabsWorkflow);
    app.component('PluginShowcase', PluginShowcase);
    app.component('ApiMatrix', ApiMatrix);
    app.component('DocCta', DocCta);
    app.component('PluginLanding', PluginLanding);
    app.component('PluginGrid', PluginGrid);
  },
};
