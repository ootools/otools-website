import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import './custom.css';
import HeroIntro from './components/HeroIntro.vue';
import PlatformHighlights from './components/PlatformHighlights.vue';
import TabsWorkflow from './components/TabsWorkflow.vue';
import PluginShowcase from './components/PluginShowcase.vue';
import ApiMatrix from './components/ApiMatrix.vue';
import DocCta from './components/DocCta.vue';

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HeroIntro', HeroIntro);
    app.component('PlatformHighlights', PlatformHighlights);
    app.component('TabsWorkflow', TabsWorkflow);
    app.component('PluginShowcase', PluginShowcase);
    app.component('ApiMatrix', ApiMatrix);
    app.component('DocCta', DocCta);
  },
};
