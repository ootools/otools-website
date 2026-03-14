<template>
  <section id="home" class="relative overflow-hidden bg-dark pt-28 pb-20">
    <div class="container">
      <div class="flex flex-wrap -mx-4 items-center">
        <div class="w-full lg:w-1/2 px-4">
          <h1 class="text-white font-bold text-4xl sm:text-5xl leading-tight mb-6">
            OTools 高性能工具平台-小身躯大能量
          </h1>
          <div class="text-white text-1xl">还在用SourceTree?Navicat?XShell?PHPStudy?，试试我们仅用小于1%的空间占用却完成更优秀的新时代替代体验吧</div>
          <p class="text-dark-700 text-lg mb-8">
            以 Tabs 多任务化为核心，统一插件生态、原生能力与桌面运行时。
            致力于让每个工具都成为可组合的工作流模块。
          </p>
          <div class="flex flex-wrap items-center gap-4">
            <a
              href="/features"
              class="inline-flex items-center justify-center bg-primary text-white px-8 py-3 rounded-lg shadow-lg transition hover:bg-primary/90"
            >
              下载内测版(20M)
            </a>
            <a
              href="/guide/overview"
              class="inline-flex items-center justify-center border border-white/40 text-white px-8 py-3 rounded-lg transition hover:bg-white/10"
            >
              开发者文档
            </a>
          </div>
          <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-white/80">
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">40+</div>
              <div class="text-sm">丰富的插件生态</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Tabs</div>
              <div class="text-sm">多任务并行机制</div>
            </div>
            <div class="bg-white/10 border border-white/10 rounded-xl p-4">
              <div class="text-2xl font-semibold">Native</div>
              <div class="text-sm">高性能插件扩展</div>
            </div>
          </div>
        </div>
        <div class="w-full lg:w-1/2 px-4 mt-12 lg:mt-0">
          <div class="bg-white rounded-2xl shadow-2xl p-6">
            <div class="flex items-center gap-2 mb-4">
              <span class="h-3 w-3 rounded-full bg-warning"></span>
              <span class="h-3 w-3 rounded-full bg-secondary"></span>
              <span class="h-3 w-3 rounded-full bg-primary"></span>
            </div>
            <div class="space-y-4">
              <div class="bg-body-color/10 rounded-xl p-4">
                <h4 class="font-semibold text-dark mb-1">插件市场</h4>
                <p class="text-body-color text-sm">插件版本、评分与更新动态一站式呈现。</p>
              </div>
              <div class="bg-body-color/10 rounded-xl p-4">
                <h4 class="font-semibold text-dark mb-1">开发者中心</h4>
                <p class="text-body-color text-sm">Web + Rust 原生能力一键构建。</p>
              </div>
              <div class="bg-body-color/10 rounded-xl p-4">
                <h4 class="font-semibold text-dark mb-1">Tabs 工作流</h4>
                <p class="text-body-color text-sm">多任务并行，保持上下文。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
