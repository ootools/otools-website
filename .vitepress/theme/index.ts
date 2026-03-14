import DefaultTheme from 'vitepress/theme';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './custom.css';
import HeroIntro from './components/HeroIntro.vue';
import PlatformHighlights from './components/PlatformHighlights.vue';
import PluginShowcase from './components/PluginShowcase.vue';
import TabsWorkflow from './components/TabsWorkflow.vue';
import ApiMatrix from './components/ApiMatrix.vue';
import DocCta from './components/DocCta.vue';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.use(ElementPlus);
    app.component('HeroIntro', HeroIntro);
    app.component('PlatformHighlights', PlatformHighlights);
    app.component('PluginShowcase', PluginShowcase);
    app.component('TabsWorkflow', TabsWorkflow);
    app.component('ApiMatrix', ApiMatrix);
    app.component('DocCta', DocCta);
  },
};
