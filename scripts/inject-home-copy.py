#!/usr/bin/env python3
"""把首页 `home.*` 文案注入 zh.json / en.json（中英精写）。
幂等：重复运行只覆盖 home 段，不动其它键。"""
import json, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCALES = ROOT / '.vitepress' / 'theme' / 'locales'

ZH = {
    "hero": {
        "eyebrow": "免费开源 · 一次装齐 40+ 生产力工具",
        "titleLine1": "一个平台，",
        "titleLine2": "替代一整排商业软件",
        "desc": "OTools 把 <b>办公套件、创意设计、开发运维</b> 装进同一个桌面工作台：WPS、Photoshop、Premiere、Git、Navicat 们做的事，这里全部<b>免费</b>，还能被 <b>一个 MCP</b> 统一驱动。",
        "ctaDownload": "免费获取内测版",
        "ctaDocs": "查看文档",
        "badges": ["完全免费，无订阅无广告", "一个 MCP 驱动全部插件", "Rust 内核，约 20MB", "Windows / macOS"],
        "scroll": "向下滚动探索",
        "modalTitle": "加入内测",
        "modalDesc": "扫码加入内测微信群，获取下载地址与更新通知。",
        "windows": {
            "documents": {"title": "文字与文档", "sub": "写作 / 排版 / 导出 PDF"},
            "ps": {"title": "图像编辑", "sub": "图层 / 蒙版 / 滤镜"},
            "git": {"title": "代码版本控制", "sub": "多仓库 / Diff / AI 提交"},
            "video": {"title": "视频剪辑", "sub": "时间线 / 多轨 / 导出"},
            "dbm": {"title": "数据库管理", "sub": "多库连接 / 查询 / 表结构"}
        }
    },
    "marquee": {"label": "40+ 插件，持续更新"},
    "replace": {
        "eyebrow": "平替清单",
        "title": "用一套 OTools，<em>替掉一整排付费软件</em>",
        "subtitle": "不是「轻量版」或「阉割版」——这些插件就是按真实工作流做的完整工具，且免费提供。",
        "badge": "免费",
        "groups": {
            "office": {"title": "办公套件", "sub": "对标 WPS Office 与 Microsoft 365"},
            "creative": {"title": "创意设计", "sub": "对标 Adobe Creative Cloud 全家桶"},
            "dev": {"title": "开发运维", "sub": "对标开发者常用的付费工具链"}
        },
        "items": {
            "word": "长文写作、样式排版、导出 PDF 与 DOCX",
            "excel": "大数据量表格、公式计算、图表可视化",
            "ppt": "模板化演示、版式设计、动画与放映",
            "pdf": "阅读批注、页面组织、表单与加密",
            "indesign": "多页版式、主页与样式、印刷级导出",
            "photoshop": "图层编辑、蒙版、滤镜与批量处理",
            "illustrator": "钢笔与布尔运算、渐变、矢量导出",
            "premiere": "多轨时间线、转场、字幕与渲染导出",
            "aftereffects": "合成、关键帧与特效渲染",
            "audition": "多轨音频、波形编辑、效果链",
            "lightroom": "照片图库、调色、RAW 与批量导出",
            "blender": "三维建模、材质、动画与渲染",
            "autocad": "二维制图、图层与命令、DXF 交换",
            "canva": "拼图排版、滤镜外观、一键导出",
            "github-desktop": "仓库总览、暂存提交、历史与 Diff",
            "navicat": "多库连接、SQL 查询、表结构管理",
            "iterm": "SSH 会话、SFTP 文件、端口转发",
            "laragon": "本地 Nginx / PHP / MySQL / Redis 一键管理",
            "mqttx": "MQTT 连接、订阅发布、消息追踪",
            "filezilla": "双栏 FTP 传输、TLS 加密",
            "scrcpy": "安卓投屏、鼠标键盘控制、无线连接"
        }
    },
    "story": {
        "eyebrow": "三大工作流",
        "title": "一条滚动，<em>看完整个工作台</em>",
        "subtitle": "继续向下滚动，逐个看清 OTools 真实运行时的界面与能力。",
        "acts": {"office": "办公文档", "creative": "创意设计", "dev": "开发运维"},
        "scenes": {
            "documents": {"tagline": "从空白页到成稿，排版、样式、导出一次到位。", "features": ["模板化新建文档，开箱即写", "样式与版式所见即所得", "导出 PDF / DOCX，本地处理不上传"]},
            "spreadsheet": {"tagline": "海量单元格依然顺滑，公式与图表随手可用。", "features": ["示例与预算模板直接开用", "公式计算与图表可视化", "导入导出 Excel 兼容格式"]},
            "presentation": {"tagline": "模板驱动的演示创作，从大纲到放映一气呵成。", "features": ["多套内置演示模板", "幻灯片版式与视觉设计", "动画过渡与全屏放映"]},
            "pdfcraft": {"tagline": "阅读、整理、安全处理，一个 PDF 工作台搞定。", "features": ["阅读批注与页面组织", "合并拆分、表单与加密", "Rust / WASM 内核，秒开大文件"]},
            "ps": {"tagline": "图层、蒙版、滤镜齐备的桌面级图像编辑。", "features": ["图层与蒙版精细编辑", "滤镜与色彩调整管线", "批量导出，支持多种格式"]},
            "vectorcraft": {"tagline": "钢笔、布尔运算与渐变，矢量设计一应俱全。", "features": ["钢笔工具与节点编辑", "布尔运算与路径管理", "渐变填充与 SVG 导出"]},
            "video": {"tagline": "多轨时间线剪辑，模板、字幕、转场全内置。", "features": ["模板工程一键开剪", "多轨时间线与文本轨", "转场、特效与渲染导出"]},
            "audio": {"tagline": "多轨录音、波形编辑与效果链，播客制作轻松完成。", "features": ["多轨会话与轨道管理", "波形级精细剪辑", "效果链与音频导出"]},
            "three": {"tagline": "三维建模、材质与动画，浏览器里的创作空间。", "features": ["场景布局与视口操作", "建模与几何节点", "材质着色与渲染预览"]},
            "lightcraft": {"tagline": "照片图库与调色，RAW 工作流也从容应对。", "features": ["图库导入与照片管理", "调色与显影参数", "RAW 解析与批量导出"]},
            "git": {"tagline": "多仓库总览、可视化 Diff，还有 AI 帮你写提交信息。", "features": ["多仓库并行与状态总览", "可视化 Diff，支持逐块重置", "AI 生成提交信息与内置终端"]},
            "dbm": {"tagline": "一个界面连接 MySQL、PostgreSQL、MongoDB。", "features": ["多类型数据库统一连接", "SQL 查询与结果网格", "表结构、索引与备份"]},
            "term": {"tagline": "SSH 终端与 SFTP 文件协同，运维一屏完成。", "features": ["多会话 SSH 终端", "内置 SFTP 文件传输", "端口转发与隧道"]},
            "servrun": {"tagline": "Nginx / PHP / MySQL / Redis 本地环境一键起。", "features": ["9 类服务统一管理", "虚拟主机与配置生成", "一键启停与日志查看"]},
            "scrcpy": {"tagline": "安卓投屏到桌面，鼠标键盘直接操控。", "features": ["USB / 无线投屏", "鼠标键盘反向控制", "多设备管理与文件传输"]}
        }
    },
    "mcp": {
        "eyebrow": "一个 MCP 驱动全部",
        "title": "让 AI 用<em>一个 MCP 端点</em>，操控你的全部插件",
        "subtitle": "Claude Code、Codex、Cursor 等任意 AI 编码工具，接入 OTools 宿主 MCP 网关后，就能跨插件编排任务——不再需要为每个工具单独接一遍。",
        "core": "MCP GATEWAY",
        "coreSub": "单一端点",
        "panelTitle": "otools-mcp · 已连接 40+ 插件",
        "points": [
            {"icon": "🔌", "title": "单一端点，聚合所有插件", "desc": "外部 AI 只接一个 MCP，即可调用全部已授权插件，无需逐个配置。"},
            {"icon": "🎛️", "title": "按需授权，工具面可控", "desc": "默认不暴露，用户勾选后才开放；大工具面还有搜索式按名调用。"},
            {"icon": "🧩", "title": "跨插件任务编排", "desc": "一条自然语言指令，即可串联办公、创意与开发插件完成多步任务。"}
        ],
        "commands": [
            {"prompt": "把季度报告导出 PDF，并生成一份配套演示稿"},
            {"prompt": "检查这批图片，批量调色后导出 WebP"},
            {"prompt": "看下当前分支改动，写一条提交信息并提交"}
        ]
    },
    "platform": {
        "eyebrow": "平台底座",
        "title": "免费、轻量、高性能的<em>桌面工作台</em>",
        "subtitle": "插件再多也不笨重：Tabs 多任务、Rust 原生内核，把 40+ 工具装进一个约 20MB 的桌面外壳。",
        "cards": {
            "free": {"title": "完全免费开源", "desc": "无订阅、无广告、无功能墙。办公与创作工具本该人人可用。"},
            "mcp": {"title": "一个 MCP 全接管", "desc": "对外只暴露一个 MCP 端点，AI 一次接入即可驱动全部插件。"},
            "tabs": {"title": "Tabs 多任务并行", "desc": "多个工具同屏并行，上下文不丢失，切换零重载成本。"},
            "rust": {"title": "Rust 原生高性能", "desc": "核心与插件底层由 Rust 驱动，启动快、占用低、运行稳。"}
        },
        "stats": {
            "plugins": "官方插件与工具",
            "free": "永久免费使用",
            "mcp": "统一 MCP 端点",
            "size": "桌面安装包体积"
        }
    },
    "grid": {
        "eyebrow": "插件全景",
        "title": "每一个，都是<em>能直接干活</em>的工具",
        "subtitle": "覆盖办公、创意与开发运维的官方插件，安装即用，随 OTools 一同更新。"
    },
    "dev": {
        "eyebrow": "OTools 是一个平台",
        "title": "插件大多<em>移植自开源项目</em>，你也可以移植自己需要的",
        "subtitle": "OTools 不是一个大而全的软件，而是一个可扩展的桌面插件平台。官方插件里有相当一部分来自优秀的开源项目——把它们移植进 OTools，就能跨平台、免安装、还能被一个 MCP 统一驱动。缺什么工具？自己移植一个就好。",
        "ctaDev": "开始移植插件",
        "ctaApi": "查看 OTools API",
        "sourcesLabel": "从开源项目出发 · 已在 OTools 中可用",
        "steps": {
            "choose": {"title": "挑一个开源项目", "desc": "任何 Web / Rust / WASM 形态的开源工具都可以作为移植起点，不限语言与框架。"},
            "port": {"title": "用 OTools 接口接入", "desc": "生成 Web / Vue 工程骨架，按需声明 fs、shell、dialog 等权限，也能挂 Rust 原生库提性能。"},
            "publish": {"title": "打包上架插件市场", "desc": "打包后一键发布到插件市场，让所有 OTools 用户都能装上你移植的工具。"}
        }
    },
    "cta": {
        "eyebrow": "现在就能用",
        "title": "把这一排软件，<em>换成一个 OTools</em>",
        "desc": "免费获取桌面版，装上 40+ 插件，再用一个 MCP 把它们全部接入你的 AI 工作流。",
        "download": "免费获取内测版",
        "docs": "使用文档",
        "api": "OTools API",
        "note": "免费开源 · 插件市场持续更新 · 支持 Windows 与 macOS"
    }
}

EN = {
    "hero": {
        "eyebrow": "Free & open source · 40+ productivity tools in one",
        "titleLine1": "One platform,",
        "titleLine2": "a whole shelf of paid apps replaced",
        "desc": "OTools packs <b>office suites, creative design, and dev ops</b> into a single desktop workbench. Everything WPS, Photoshop, Premiere, Git and Navicat do — <b>free of charge</b>, and drivable by <b>one MCP</b>.",
        "ctaDownload": "Get the free beta",
        "ctaDocs": "Read the docs",
        "badges": ["Completely free, no subscriptions", "One MCP drives every plugin", "Rust core, ~20MB", "Windows / macOS"],
        "scroll": "Scroll to explore",
        "modalTitle": "Join the beta",
        "modalDesc": "Scan the QR code to join our WeChat group for downloads and updates.",
        "windows": {
            "documents": {"title": "Writing & documents", "sub": "Draft / layout / export PDF"},
            "ps": {"title": "Image editing", "sub": "Layers / masks / filters"},
            "git": {"title": "Version control", "sub": "Multi-repo / diff / AI commit"},
            "video": {"title": "Video editing", "sub": "Timeline / multitrack / export"},
            "dbm": {"title": "Database manager", "sub": "Connections / queries / schema"}
        }
    },
    "marquee": {"label": "40+ plugins, updated continuously"},
    "replace": {
        "eyebrow": "The replacement list",
        "title": "Replace a whole shelf of paid apps with <em>one OTools</em>",
        "subtitle": "Not slimmed-down editions. These plugins are full tools built for real workflows — and they are free.",
        "badge": "Free",
        "groups": {
            "office": {"title": "Office suite", "sub": "Against WPS Office and Microsoft 365"},
            "creative": {"title": "Creative design", "sub": "Against the Adobe Creative Cloud suite"},
            "dev": {"title": "Dev & ops", "sub": "Against the paid toolchain devs rely on"}
        },
        "items": {
            "word": "Long-form writing, styled layout, PDF & DOCX export",
            "excel": "Large sheets, formulas, charts and visualization",
            "ppt": "Template-driven decks, layout design, animation",
            "pdf": "Read & annotate, organize pages, forms and security",
            "indesign": "Multi-page layout, masters & styles, print-grade export",
            "photoshop": "Layer editing, masks, filters and batch processing",
            "illustrator": "Pen & boolean ops, gradients, vector export",
            "premiere": "Multitrack timeline, transitions, captions, render",
            "aftereffects": "Compositing, keyframes and effect rendering",
            "audition": "Multitrack audio, waveform editing, effect chains",
            "lightroom": "Photo library, color grading, RAW and batch export",
            "blender": "3D modeling, materials, animation and rendering",
            "autocad": "2D drafting, layers & commands, DXF exchange",
            "canva": "Collage layout, filters and one-click export",
            "github-desktop": "Repo overview, staging, history and diffs",
            "navicat": "Multi-DB connections, SQL queries, schema management",
            "iterm": "SSH sessions, SFTP files and port forwarding",
            "laragon": "One-click local Nginx / PHP / MySQL / Redis",
            "mqttx": "MQTT connections, publish/subscribe, message tracing",
            "filezilla": "Dual-pane FTP transfer with TLS",
            "scrcpy": "Android mirroring with mouse & keyboard control"
        }
    },
    "story": {
        "eyebrow": "Three workflows",
        "title": "One scroll through <em>the entire workbench</em>",
        "subtitle": "Keep scrolling to see exactly what OTools looks like and can do at runtime.",
        "acts": {"office": "Documents", "creative": "Creative", "dev": "Dev & ops"},
        "scenes": {
            "documents": {"tagline": "From blank page to final draft — layout, styles and export in one pass.", "features": ["Template-driven new documents", "WYSIWYG styles and layout", "Export PDF / DOCX, processed locally"]},
            "spreadsheet": {"tagline": "Massive sheets stay smooth, with formulas and charts at hand.", "features": ["Sample and budget templates ready to use", "Formula calculation and charts", "Excel-compatible import & export"]},
            "presentation": {"tagline": "Template-driven deck creation, from outline to presenting.", "features": ["A range of built-in templates", "Slide layout and visual design", "Animations and full-screen presenting"]},
            "pdfcraft": {"tagline": "Read, organize and secure — a complete PDF workbench.", "features": ["Read, annotate and organize pages", "Merge, split, forms and encryption", "Rust / WASM core opens big files instantly"]},
            "ps": {"tagline": "Desktop-grade image editing with layers, masks and filters.", "features": ["Precise layer and mask editing", "Filters and color adjustment pipeline", "Batch export in multiple formats"]},
            "vectorcraft": {"tagline": "Pen, boolean ops and gradients — vector design in full.", "features": ["Pen tool and node editing", "Boolean operations and path control", "Gradient fills and SVG export"]},
            "video": {"tagline": "Multitrack editing with templates, captions and transitions built in.", "features": ["Open a template project and start cutting", "Multitrack timeline and text track", "Transitions, effects and render export"]},
            "audio": {"tagline": "Multitrack recording, waveform editing and effect chains.", "features": ["Multitrack sessions and track management", "Waveform-level fine editing", "Effect chains and audio export"]},
            "three": {"tagline": "3D modeling, materials and animation in a creative space.", "features": ["Scene layout and viewport control", "Modeling and geometry nodes", "Material shading and render preview"]},
            "lightcraft": {"tagline": "Photo library and grading, RAW workflow included.", "features": ["Library import and photo management", "Color grading and develop parameters", "RAW decoding and batch export"]},
            "git": {"tagline": "Multi-repo overview, visual diffs, and AI-written commit messages.", "features": ["Parallel repos with status overview", "Visual diff with per-hunk reset", "AI commit messages and built-in terminal"]},
            "dbm": {"tagline": "Connect MySQL, PostgreSQL and MongoDB from one screen.", "features": ["Unified multi-database connections", "SQL queries and result grid", "Schema, indexes and backup"]},
            "term": {"tagline": "SSH terminal and SFTP files together — ops in one screen.", "features": ["Multi-session SSH terminal", "Built-in SFTP file transfer", "Port forwarding and tunnels"]},
            "servrun": {"tagline": "Local Nginx / PHP / MySQL / Redis in one click.", "features": ["Nine service types managed in one place", "Virtual hosts and config generation", "One-click start/stop and logs"]},
            "scrcpy": {"tagline": "Mirror Android to your desktop and control it directly.", "features": ["USB and wireless mirroring", "Reverse mouse & keyboard control", "Multi-device management and file transfer"]}
        }
    },
    "mcp": {
        "eyebrow": "One MCP to drive them all",
        "title": "Let AI drive <em>every plugin</em> through one MCP endpoint",
        "subtitle": "Connect any AI coding tool — Claude Code, Codex, Cursor — to the OTools host MCP gateway and orchestrate tasks across plugins, instead of wiring each tool separately.",
        "core": "MCP GATEWAY",
        "coreSub": "Single endpoint",
        "panelTitle": "otools-mcp · 40+ plugins connected",
        "points": [
            {"icon": "🔌", "title": "One endpoint, all plugins", "desc": "External AI connects to a single MCP and can call every authorized plugin — no per-plugin setup."},
            {"icon": "🎛️", "title": "Granular control", "desc": "Nothing is exposed by default; users opt in. Large tool surfaces get search-based calls by name."},
            {"icon": "🧩", "title": "Cross-plugin orchestration", "desc": "One natural-language instruction can chain office, creative and dev plugins through a multi-step task."}
        ],
        "commands": [
            {"prompt": "Export the quarterly report to PDF and build a matching deck"},
            {"prompt": "Check these images, grade them and export WebP"},
            {"prompt": "Review my branch changes, write a commit message and commit"}
        ]
    },
    "platform": {
        "eyebrow": "The foundation",
        "title": "A free, lightweight, high-performance <em>desktop workbench</em>",
        "subtitle": "No matter how many plugins — Tabs multitasking and a Rust-native core keep 40+ tools inside a ~20MB desktop shell.",
        "cards": {
            "free": {"title": "Completely free & open source", "desc": "No subscriptions, no ads, no feature walls. Office and creative tools should be for everyone."},
            "mcp": {"title": "One MCP takes over", "desc": "A single external MCP endpoint that lets AI drive every plugin after one setup."},
            "tabs": {"title": "Tabs multitasking", "desc": "Many tools side by side with no lost context and zero reload cost when switching."},
            "rust": {"title": "Rust-native performance", "desc": "Core and plugin runtimes are Rust-powered: fast start, low footprint, rock stable."}
        },
        "stats": {
            "plugins": "Official plugins & tools",
            "free": "Free forever",
            "mcp": "Unified MCP endpoint",
            "size": "Desktop installer size"
        }
    },
    "grid": {
        "eyebrow": "The full plugin wall",
        "title": "Every one of them is <em>a tool you can work in</em>",
        "subtitle": "Official plugins across office, creative and dev ops — install and go, updated alongside OTools."
    },
    "dev": {
        "eyebrow": "OTools is a platform",
        "title": "Most plugins are <em>ported from open-source projects</em> — port the one you need",
        "subtitle": "OTools is not one big all-in-one app — it is an extensible desktop plugin platform. A good share of the official plugins started as excellent open-source projects: ported into OTools they run cross-platform, need no install, and are drivable by a single MCP. Missing a tool? Just port it.",
        "ctaDev": "Start porting a plugin",
        "ctaApi": "Explore the OTools API",
        "sourcesLabel": "From open source · already available in OTools",
        "steps": {
            "choose": {"title": "Pick an open-source project", "desc": "Any open-source tool — web, Rust or WASM — can be a starting point. No language or framework restrictions."},
            "port": {"title": "Wire it up with OTools APIs", "desc": "Generate a web / Vue project skeleton, declare fs, shell or dialog permissions as needed, and add a Rust native library for performance."},
            "publish": {"title": "Ship to the plugin marketplace", "desc": "Package it and publish to the marketplace so every OTools user can install the tool you ported."}
        }
    },
    "cta": {
        "eyebrow": "Ready today",
        "title": "Swap that shelf of apps for <em>one OTools</em>",
        "desc": "Get the free desktop app, install 40+ plugins, then wire them all into your AI workflow with a single MCP.",
        "download": "Get the free beta",
        "docs": "Documentation",
        "api": "OTools API",
        "note": "Free & open source · Plugin marketplace keeps growing · Windows and macOS"
    }
}


def merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            merge(dst[k], v)
        else:
            dst[k] = v


for fname, payload in (('zh.json', ZH), ('en.json', EN)):
    p = LOCALES / fname
    data = json.loads(p.read_text(encoding='utf-8'), object_pairs_hook=collections.OrderedDict)
    data['home'] = payload
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {fname}: injected home.* ({len(payload)} sections)')
