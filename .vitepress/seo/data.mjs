/**
 * 全站 SEO / GEO 数据源（构建期使用，Node 环境）。
 *
 * ⚠️ 为什么数据放在这里而不是 locale JSON：
 *  - **竞品关键词**是语言无关的产品名（phpstudy / mqttx …），放locale 会污染翻译；
 *  - **品类长尾词**必须逐语言写死，运行时从页面组件里凑不出来；
 *  - 这一层同时被 `transformPageData`（写进 HTML head）和 `scripts/gen-seo.mjs`
 *    （写 sitemap / llms.txt）消费，两边共用一份定义，不会互相脱节。
 *
 * 竞品词的作用：用户搜「phpstudy 替代」「mqttx alternative」时能命中我们。
 * 这是长尾流量里转化最高的一类词，必须显式写出来，不要指望正文里自然出现。
 */

/** 语言前缀 → hreflang。与 .vitepress/config.ts 的 locales 一致。 */
export const LOCALES = [
  { prefix: '', hreflang: 'zh-CN', ogLocale: 'zh_CN' },
  { prefix: 'en', hreflang: 'en-US', ogLocale: 'en_US' },
  { prefix: 'ja', hreflang: 'ja-JP', ogLocale: 'ja_JP' },
  { prefix: 'ko', hreflang: 'ko-KR', ogLocale: 'ko_KR' },
  { prefix: 'fr', hreflang: 'fr-FR', ogLocale: 'fr_FR' },
  { prefix: 'es', hreflang: 'es-ES', ogLocale: 'es_ES' },
  { prefix: 'de', hreflang: 'de-DE', ogLocale: 'de_DE' },
  { prefix: 'ru', hreflang: 'ru-RU', ogLocale: 'ru_RU' },
];

/**
 * 「X 替代」这个句式必须逐语言写。
 * 直接拼 `${竞品} 替代` 会让德语页的 keywords 里出现中文（构建产物实测过）。
 */
export const VS_FORMAT = {
  '': '${c} 替代',
  en: '${c} alternative',
  ja: '${c} 代替',
  ko: '${c} 대안',
  fr: 'alternative à ${c}',
  es: 'alternativa a ${c}',
  de: '${c} Alternative',
  ru: 'альтернатива ${c}',
};

export const LOCALE_BY_PREFIX = Object.fromEntries(LOCALES.map((l) => [l.prefix, l]));

/** 相对路径 → 语言前缀。第一段命中 locales 就是该语言，否则算根（中文）。 */
export function localePrefixOf(relativePath) {
  const first = String(relativePath).split('/')[0];
  return LOCALES.some((l) => l.prefix && l.prefix === first) ? first : '';
}

/**
 * 每个插件的 SEO 档案。
 *
 * - `competitors`：竞品/替代品关键词，产品名本身不翻译，8 语言共用。
 * - `terms`：品类长尾词 + **品牌修饰词**（如「Git 客户端」/「Git client」），
 *   必须**逐语言**给全：搜索行为是语言相关的，
 *   而硬编码中文品牌词会漏进德语/日语页的 keywords（构建产物实测过）。
 * - `advantages`：对比优势，写给 llms.txt 与 JSON-LD 的 ItemList，
 *   AI 检索尤其吃「A 相比 B 好在哪」这种显式对比。
 */
export const PLUGIN_SEO = {
  'otools-git': {
    name: 'Git',
    competitors: [
      'SourceTree', 'GitKraken', 'GitHub Desktop', 'TortoiseGit',
      'Fork', 'Tower', 'Git Extensions', 'Lazygit', 'git-credential-manager',
    ],
    terms: {
      '': ['Git 插件', 'Git 独立版', 'Git 客户端', 'Git 图形化界面', 'Git 可视化工具', 'Git 仓库管理', 'Git 提交历史查看', 'Git 分支管理', 'Git 冲突解决工具', 'Git 桌面客户端'],
      en: ['Git plugin', 'Git standalone', 'git gui client', 'git desktop app', 'git client', 'git gui', 'git desktop client', 'git repository manager', 'git history viewer', 'git branch manager', 'git conflict resolver', 'git gui windows'],
      ja: ['Git プラグイン', 'Git 独立版', 'git クライアント Windows', 'git クライアント', 'git GUI', 'git 可視化ツール', 'git リポジトリ管理', 'git 履歴閲覧', 'git ブランチ管理', 'git デスクトップ'],
      ko: ['Git 플러그인', 'Git 독립형', 'git 클라이언트 Windows', 'git 클라이언트', 'git GUI', 'git 시각화 도구', 'git 저장소 관리', 'git 기록 보기', 'git 브랜치 관리', 'git 데스크톱'],
      fr: ['plugin git', 'git autonome', 'client git windows', 'outil git', 'client git', 'interface graphique git', 'outil git visuel', 'gestionnaire de dépôt git', 'historique git', 'gestion des branches git'],
      es: ['plugin git', 'git independiente', 'cliente git windows', 'herramienta git', 'cliente git', 'interfaz gráfica git', 'herramienta visual git', 'gestor de repositorios git', 'historial git', 'gestor de ramas git'],
      de: ['git plugin', 'git eigenständig', 'git client windows', 'git werkzeug', 'git client', 'git gui', 'visuelles git tool', 'git repository manager', 'git verlauf ansehen', 'git branch verwaltung'],
      ru: ['git плагин', 'git автономный', 'git клиент windows', 'инструмент git', 'git клиент', 'git gui', 'визуальный git инструмент', 'менеджер репозиториев', 'история git', 'управление ветками git'],
    },
    advantages: [
      '不依赖 Java/JRE 的原生桌面实现，启动即用，不需要像 Eclipse 系工具那样先配 JDK。',
      '仓库列表、提交历史、文件树、Diff、终端四合一，同屏完成「看改动 → 写命令 → 再看结果」，不必在多个窗口间来回切。',
      '每个功能都有独立版可下载，能单独当纯 Git GUI 用，不必先装整个平台。',
      '支持 SSH / HTTPS 凭据管理、签名提交与 .gitignore 可视化编辑，新仓库上手不需要背命令。',
    ],
  },

  'otools-dbm': {
    name: 'DBM',
    competitors: [
      'Navicat', 'DBeaver', 'DataGrip', 'HeidiSQL', 'Sequel Pro',
      'TablePlus', 'Beekeeper Studio', 'phpMyAdmin', 'Adminer', 'Toad for Oracle',
    ],
    terms: {
      '': ['DBM 插件', '数据库管理插件', '数据库客户端独立版', '数据库管理工具', 'SQL 客户端', 'SQL 查询工具', 'MySQL 客户端', 'PostgreSQL 客户端', 'SQLite 可视化工具', '数据库图形化界面', 'SQL 脚本编辑器', '数据库连接管理'],
      en: ['DBM plugin', 'database plugin', 'standalone database client', 'db admin tool', 'database management tool', 'sql client', 'sql query tool', 'mysql client', 'postgresql client', 'sqlite gui', 'database gui', 'sql script editor', 'db connection manager'],
      ja: ['DBM プラグイン', 'データベース プラグイン', 'DB クライアント 独立版', 'データベース管理ツール', 'SQL クライアント', 'SQL クエリツール', 'MySQL クライアント', 'PostgreSQL クライアント', 'SQLite GUI', 'DB 接続管理'],
      ko: ['DBM 플러그인', '데이터베이스 플러그인', '독립형 DB 클라이언트', '데이터베이스 관리 도구', 'SQL 클라이언트', 'SQL 질의 도구', 'MySQL 클라이언트', 'PostgreSQL 클라이ян트', 'SQLite GUI', 'DB 연결 관리'],
      fr: ['plugin dbm', 'plugin base de données', 'client base de données autonome', 'outil de gestion de base de données', 'client SQL', 'outil de requête SQL', 'client MySQL', 'client PostgreSQL', 'interface SQLite', 'gestionnaire de connexions'],
      es: ['plugin dbm', 'plugin de base de datos', 'cliente de base de datos independiente', 'herramienta de gestión de bases de datos', 'cliente SQL', 'herramienta de consultas SQL', 'cliente MySQL', 'cliente PostgreSQL', 'interfaz SQLite', 'gestor de conexiones'],
      de: ['dbm plugin', 'datenbank plugin', 'eigenständiger datenbank client', 'Datenbankverwaltungstool', 'SQL-Client', 'SQL-Abfragewerkzeug', 'MySQL-Client', 'PostgreSQL-Client', 'SQLite-GUI', 'Datenbankverbindungen'],
      ru: ['плагин dbm', 'плагин баз данных', 'автономный клиент бд', 'менеджер баз данных', 'sql клиент', 'инструмент sql запросов', 'mysql клиент', 'postgresql клиент', 'sqlite gui', 'управление подключениями'],
    },
    advantages: [
      '单文件多数据库：一个工作区同时挂MySQL / PostgreSQL / SQLite / SQL Server 等十六种数据库，切换不用换软件。',
      '表结构页把「新增 / 修改 / 删除」三种状态并排展示，改字段前就能确认影响面，比逐条点开确认快得多。',
      '查询页支持多结果集并排对比，JSON 结果自动格式化，调试存储过程与复杂 join 时不用先手工整理输出。',
      '内置备份与导出到文件的能力，备份链路不依赖额外的命令行工具。',
    ],
  },

  'otools-term': {
    name: 'Term',
    competitors: [
      'Xshell', 'MobaXterm', 'FinalShell', 'PuTTY', 'SecureCRT',
      'Tabby', 'WezTerm', 'Electerm', 'Royal TS', 'Termius', 'WinSCP', 'Termscp',
    ],
    terms: {
      '': ['Term 插件', 'SSH 工具插件', '终端插件独立版', 'SSH 客户端', 'SFTP 客户端', '终端模拟器', '远程登录工具', 'SSH 终端', '端口转发工具', '批量 SSH 管理', 'Linux 远程桌面客户端'],
      en: ['Term plugin', 'ssh tool plugin', 'standalone terminal app', 'ssh terminal client', 'ssh client', 'sftp client', 'terminal emulator', 'remote login tool', 'ssh terminal', 'port forwarding tool', 'ssh session manager', 'linux remote desktop client'],
      ja: ['Term プラグイン', 'SSH ツール プラグイン', 'ターミナル 独立版', 'SSH クライアント', 'SFTP クライアント', 'ターミナルエミュレータ', 'リモートログイン', 'ポートフォワーディング', 'SSH セッション管理'],
      ko: ['Term 플러그인', 'ssh 도구 플러그인', '독립형 터미널 앱', 'ssh 클라이언트', 'sftp 클라이언트', '터미널 에뮬레이터', '원격 로그인', '포트 포워딩', 'ssh 세션 관리'],
      fr: ['plugin term', 'plugin ssh', 'terminal autonome', 'client ssh windows', 'client ssh', 'client sftp', 'émulateur de terminal', 'outil de connexion à distance', 'transfert de port', 'gestionnaire de sessions ssh'],
      es: ['plugin term', 'plugin ssh', 'terminal independiente', 'cliente ssh windows', 'cliente ssh', 'cliente sftp', 'emulador de terminal', 'herramienta de acceso remoto', 'redirección de puertos', 'gestor de sesiones ssh'],
      de: ['term plugin', 'ssh werkzeug plugin', 'eigenständiges terminal', 'ssh client windows', 'ssh client', 'sftp client', 'terminal emulator', 'fernzugriff werkzeug', 'portweiterleitung', 'ssh sitzungsverwaltung'],
      ru: ['плагин term', 'плагин ssh', 'автономный терминал', 'ssh клиент windows', 'ssh клиент', 'sftp клиент', 'эмулятор терминала', 'инструмент удалённого доступа', 'проброс портов', 'менеджер ssh сессий'],
    },
    advantages: [
      'SSH 与 SFTP 同一个窗口：左侧远程文件树、右侧终端，拖拽上传的同时能敲命令看结果，不用在两个工具间来回切。',
      '会话配置集中管理，主机、端口、账号、密钥分组保存，新机器接入只需填一次。',
      '端口转发可视化配置，本地服务（数据库、调试端口）可以直接映射到远程，省掉手写 ssh -L 的记忆负担。',
      '终端渲染与文件传输走不同的并发通道，大文件传输不会把交互式命令卡住。',
    ],
  },

  'otools-mqtt': {
    name: 'MQTT',
    competitors: [
      'MQTTX', 'EQMX', 'MQTT Explorer', 'MQTTBox', 'HiveMQ MQTT Explorer',
      'Mosquitto', 'EMQX', 'Charles', 'Wireshark', 'mqtt.js',
    ],
    terms: {
      '': ['MQTT 插件', 'MQTT 调试插件', 'MQTT 客户端独立版', 'MQTT 客户端', 'MQTT 调试工具', 'MQTT 消息查看工具', 'MQTT 订阅工具', 'MQTT 5.0 客户端', '物联网调试工具', 'MQTT 主题树', 'MQTT 消息重放'],
      en: ['MQTT plugin', 'MQTT debugging plugin', 'standalone MQTT client', 'MQTTX alternative', 'MQTT client for Windows', 'mqtt client', 'mqtt debugger', 'mqtt message viewer', 'mqtt subscribe tool', 'mqtt 5.0 client', 'iot debugging tool', 'mqtt topic tree', 'mqtt message replay', 'mqttx alternative', 'mqtt explorer alternative'],
      ja: ['MQTT プラグイン', 'MQTT デバッグ プラグイン', 'MQTT クライアント 独立版', 'MQTTX 代替', 'MQTT クライアント', 'MQTT デバッグツール', 'MQTT メッセージビューア', 'MQTT 購読ツール', 'MQTT 5.0 クライアント', 'IoT 開発ツール'],
      ko: ['MQTT 플러그인', 'MQTT 디버깅 플러그인', '독립형 MQTT 클라이언트', 'MQTTX 대안', 'mqtt 클라이언트', 'mqtt 디버깅 도구', 'mqtt 메시지 뷰어', 'mqtt 구독 도구', 'mqtt 5.0 클라이언트', 'iot 개발 도구', 'mqttx 대체'],
      fr: ['plugin mqtt', 'plugin de débogage mqtt', 'client mqtt autonome', 'alternative MQTTX', 'client mqtt', 'outil de débogage mqtt', 'visualiseur de messages mqtt', 'outil d’abonnement mqtt', 'client mqtt 5.0', 'outil de développement iot', 'alternative à mqttx'],
      es: ['plugin mqtt', 'plugin de depuración mqtt', 'cliente mqtt independiente', 'alternativa a MQTTX', 'cliente mqtt', 'herramienta de depuración mqtt', 'visor de mensajes mqtt', 'herramienta de suscripción mqtt', 'cliente mqtt 5.0', 'herramienta de desarrollo iot', 'alternativa a mqttx'],
      de: ['mqtt plugin', 'mqtt debug plugin', 'eigenständiger mqtt client', 'mqttx alternative', 'mqtt client', 'mqtt debug werkzeug', 'mqtt nachrichten viewer', 'mqtt abonnement werkzeug', 'mqtt 5.0 client', 'iot entwicklungswerkzeug'],
      ru: ['плагин mqtt', 'плагин отладки mqtt', 'автономный mqtt клиент', 'альтернатива MQTTX', 'mqtt клиент', 'инструмент отладки mqtt', 'просмотр сообщений mqtt', 'инструмент подписки mqtt', 'mqtt 5.0 клиент', 'инструмент разработки iot', 'альтернатива mqttx'],
    },
    advantages: [
      '会话打开即见消息流：连接、会话、订阅树、消息日志在同一视图里，不用先点开一堆标签才能开始调试。',
      '载荷多格式解析：纯文本 / JSON / Base64 / Hex / CBOR 一键切换，JSON 自动格式化，硬件上报的十六进制包不用手工解码。',
      '历史消息一键重发到任意主题，复现「偶发上报」类问题不必再去生产环境捞包。',
      '支持 MQTT 3.1.1 与 5.0、TLS 与遗嘱消息，Broker 侧差异不用换客户端验证。',
      '开源免费且跨平台，Windows / macOS 行为一致，不必为一台机器单独换工具。',
    ],
  },

  'otools-ftp': {
    name: 'FTP',
    competitors: [
      'FileZilla', 'WinSCP', 'FlashFXP', 'Xftp', 'Cyberduck',
      'Transmit', 'Total Commander', 'Termius', 'ForkLift',
    ],
    terms: {
      '': ['FTP 插件', 'FTP 客户端插件', '文件传输工具独立版', 'FTP 客户端', 'SFTP 客户端', '文件传输工具', 'FTP 上传下载工具', 'FTP 断点续传', '远程文件管理器', '批量文件上传'],
      en: ['FTP plugin', 'FTP client plugin', 'standalone file transfer tool', 'FTP client for Windows', 'ftp client', 'sftp client', 'file transfer tool', 'ftp upload download tool', 'ftp resume transfer', 'remote file manager', 'bulk file upload'],
      ja: ['FTP プラグイン', 'FTP クライアント プラグイン', 'ファイル転送 独立版', 'FTP クライアント', 'SFTP クライアント', 'ファイル転送ツール', 'FTP アップロード', 'リモートファイルマネージャー', '批量アップロード'],
      ko: ['FTP 플러그인', 'FTP 클라이언트 플러그인', '독립형 파일 전송 도구', 'ftp 클라이언트', 'sftp 클라이언트', '파일 전송 도구', 'ftp 업로드 다운로드', '원격 파일 관리자', '대량 업로드'],
      fr: ['plugin ftp', 'plugin client ftp', 'outil de transfert autonome', 'client ftp windows', 'client ftp', 'client sftp', 'outil de transfert de fichiers', 'outil de téléchargement ftp', 'reprise de transfert', 'gestionnaire de fichiers distant'],
      es: ['plugin ftp', 'plugin de cliente ftp', 'herramienta de transferencia independiente', 'cliente ftp windows', 'cliente ftp', 'cliente sftp', 'herramienta de transferencia de archivos', 'herramienta de subida ftp', 'reanudar transferencia', 'gestor de archivos remoto'],
      de: ['ftp plugin', 'ftp client plugin', 'eigenständiges übertragungswerkzeug', 'ftp client windows', 'ftp client', 'sftp client', 'dateiübertragungswerkzeug', 'ftp upload werkzeug', 'übertrag fortsetzen', 'entfernter dateimanager'],
      ru: ['плагин ftp', 'плагин ftp клиента', 'автономный инструмент передачи', 'ftp клиент windows', 'ftp клиент', 'sftp клиент', 'инструмент передачи файлов', 'загрузка файлов по ftp', 'возобновление передачи', 'удалённый файловый менеджер'],
    },
    advantages: [
      'FTP 与 SFTP 同一套双栏文件管理界面，切换协议不用换软件，也不用重新适应两套快捷键。',
      '队列 + 断点续传：大批量上传中断后从断点继续，不用整包重来。',
      'TLS / FTPS / SSH 密钥等安全选项直接写在连接配置里，公司内网要求加密时不用另想办法。',
      '可独立下载运行，不占平台资源，也不需要常驻后台服务。',
    ],
  },

  'otools-servrun': {
    name: 'Env',
    competitors: [
      'phpstudy', 'phpStudy', 'phpenv', 'wampserver', 'WampServer',
      'xampp', 'XAMPP', 'laragon', 'MAMP', 'ServBay', '宝塔面板',
      'btpanel', '小皮狼', 'Docker Desktop',
    ],
    terms: {
      '': ['Env 插件', 'ServRun 插件', 'phpstudy 替代品', 'phpStudy 替代', 'xampp 替代', 'wampserver 替代', '本地服务管理面板', 'phpstudy 替代', 'phpStudy 替代品', 'php 环境搭建工具', '本地服务器管理面板', 'Nginx 管理工具', 'MySQL 管理工具', 'Redis 管理工具', 'PHP 多版本管理', '虚拟主机管理工具', '一键启停服务', '本地开发环境'],
      en: ['Env plugin', 'ServRun plugin', 'phpstudy replacement', 'xampp replacement', 'wampserver alternative', 'local services dashboard', 'php dev environment manager', 'phpstudy alternative', 'phpenv alternative', 'xampp alternative', 'local server manager', 'php development environment', 'nginx management tool', 'mysql management tool', 'redis management tool', 'php version manager', 'virtual host manager', 'one click service start stop'],
      ja: ['Env プラグイン', 'ServRun プラグイン', 'phpstudy 代替ソフト', 'xampp 代替', 'ローカル サービス パネル', 'phpstudy 代替', 'ローカル サーバー 管理', 'php 開発環境構築', 'nginx 管理ツール', 'mysql 管理ツール', 'php バージョン管理', '仮想ホスト管理', 'サービス 一括 起動 停止'],
      ko: ['Env 플러그인', 'ServRun 플러그인', 'phpstudy 대체', 'xampp 대체', '로컬 서비스 대시보드', 'phpstudy 대안', 'xampp 대안', '로컬 서버 관리', 'php 개발 환경 구축', 'nginx 관리 도구', 'mysql 관리 도구', 'php 버전 관리', '가상 호스트 관리', '서비스 일괄 시작 중지'],
      fr: ['plugin env', 'plugin servrun', 'remplace phpstudy', 'alternative xampp', 'tableau de bord services locaux', 'alternative à phpstudy', 'alternative à xampp', 'alternative à wampserver', 'gestionnaire de serveur local', 'environnement de développement php', 'outil de gestion nginx', 'outil de gestion mysql', 'gestionnaire de versions php', 'gestionnaire de vhosts', 'démarrage arrêt à laクリック des services'],
      es: ['plugin env', 'plugin servrun', 'reemplazo de phpstudy', 'alternativa a xampp', 'panel de servicios locales', 'alternativa a phpstudy', 'alternativa a wampserver', 'gestor de servidor local', 'entorno de desarrollo php', 'herramienta de gestión nginx', 'herramienta de gestión mysql', 'gestor de versiones php', 'gestor de vhosts'],
      de: ['env plugin', 'servrun plugin', 'phpstudy ersatz', 'xampp alternative', 'dashboard lokale dienste', 'phpstudy alternative', 'wampserver alternative', 'lokaler server manager', 'php entwicklungsumgebung', 'nginx verwaltungswerkzeug', 'mysql verwaltungswerkzeug', 'php versionsverwaltung', 'vhost verwaltung'],
      ru: ['плагин env', 'плагин servrun', 'замена phpstudy', 'альтернатива xampp', 'панель локальных сервисов', 'альтернатива phpstudy', 'альтернатива wampserver', 'менеджер локального сервера', 'среда разработки php', 'инструмент управления nginx', 'инструмент управления mysql', 'управление версиями php', 'управление виртуальными хостами'],
    },
    advantages: [
      '不只是「装环境」：安装状态、运行状态、监听端口与版本号集中在一张面板里，哪几个服务没起来一眼看到。',
      'Nginx 虚拟主机可视化编辑，域名、根目录、SSL 证书在同一处配置，不用改完配置再去验证文件语法。',
      'PHP 多版本共存与切换，Composer 版本检测与更新内置，兼容性调试时不用反复重装整个环境。',
      '服务配置文件可在线浏览与编辑，改完能一键回滚，改坏了不用凭记忆复原。',
      '不需要额外常驻的容器运行时或面板服务，纯本地进程管理，启动快、占用低。',
    ],
  },

  'otools-scrcpy': {
    name: 'Android Mirror',
    competitors: [
      'scrcpy', 'Vysor', 'ApowerMirror', 'AirDroid', 'AnyDesk',
      'TeamViewer', '向日葵', 'ToDesk', 'LetsView', 'Samsung DeX', 'Mirroid',
    ],
    terms: {
      '': ['投屏插件', '安卓投屏工具', 'Android Mirror 插件', '免 ROOT 投屏', '安卓投屏', 'Android 投屏软件', '手机投屏电脑', '安卓远程控制', 'adb 投屏工具', '安卓设备控制工具', '手机屏幕映射电脑'],
      en: ['mirror plugin', 'android mirroring tool', 'Android Mirror plugin', 'scrcpy alternative', 'no-root android mirroring', 'android mirroring', 'android screen mirror', 'mirror phone to pc', 'android remote control', 'scrcpy gui', 'adb screen mirror tool', 'android device manager'],
      ja: ['ミラーリング プラグイン', 'Android ミラーリング ツール', 'scrcpy 代替', 'root 不要 ミラー', 'Android ミラーリング', '安卓 投屏 ツール', 'スマホ 画面 パソコン 投影', 'Android リモート 操作', 'scrcpy GUI'],
      ko: ['미러링 플러그인', '안드로이드 미러링 도구', 'scrcpy 대안', '루트 불필요 미러링', '안드로이드 미러링', '핸드폰 화면 pc 투영', '안드로이드 원격 제어', 'scrcpy gui', 'adb 화면 미러링'],
      fr: ['plugin de miroitage', 'outil de miroir android', 'alternative scrcpy', 'miroir sans root', 'miroir android', 'écran android vers pc', 'télécommande android', 'miroir scrcpy', 'gestionnaire d’appareils android'],
      es: ['plugin de espejo', 'herramienta de espejo android', 'alternativa a scrcpy', 'espejo sin root', 'espejo android', 'pantalla android a pc', 'control remoto android', 'espejo scrcpy', 'gestor de dispositivos android'],
      de: ['spiegelungs plugin', 'android spiegelung werkzeug', 'scrcpy alternative', 'spiegeln ohne root', 'android spiegelung', 'handy bild auf pc', 'android fernsteuerung', 'scrcpy gui', 'android geräteverwaltung'],
      ru: ['плагин зеркалирования', 'инструмент зеркала android', 'альтернатива scrcpy', 'зеркалирование без root', 'зеркалирование android', 'экран android на пк', 'удалённое управление android', 'scrcpy gui', 'управление устройствами android'],
    },
    advantages: [
      '基于开源 scrcpy 链路，不依赖投屏软件自带的私有服务，也不需要账号登录或付费解锁。',
      '图形化设备列表代替反复敲 adb connect，设备多的时候切换成本明显更低。',
      '控制与画面同步在同一窗口，演示、调试、录屏场景都能直接用。',
      '可独立版运行，与其他 OTools 工具互不依赖。',
    ],
  },
};

/** 站点级（非插件页）关键词，按语言。 */
export const SITE_TERMS = {
  '': ['OTools', 'AI 工作流平台', '桌面工具平台', '插件生态', 'Tabs 多任务', '开发者工具集合', '独立版桌面工具'],
  en: ['OTools', 'AI workflow platform', 'desktop tool platform', 'plugin ecosystem', 'tabs multitasking', 'developer toolbox', 'standalone desktop tools'],
  ja: ['OTools', 'AI ワークフロー プラットフォーム', 'デスクトップ ツール', 'プラグイン 生態系', 'Tabs マルチタスク', '開発者 ツール'],
  ko: ['OTools', 'AI 워크플로 플랫폼', '데스크톱 도구', '플러그인 생태계', 'Tabs 멀티태스킹', '개발자 도구'],
  fr: ['OTools', 'plateforme de workflow IA', 'outils de bureau', 'écosystème de plugins', 'multitâche par onglets', 'boîte à outils développeur'],
  es: ['OTools', 'plataforma de flujo de trabajo IA', 'herramientas de escritorio', 'ecosistema de plugins', 'multitarea por pestañas', 'caja de herramientas para desarrolladores'],
  de: ['OTools', 'KI Workflow Plattform', 'Desktop Werkzeuge', 'Plugin Ökosystem', 'Tabs Multitasking', 'Entwickler Werkzeugkasten'],
  ru: ['OTools', 'платформа AI workflow', 'настольные инструменты', 'экосистема плагинов', 'многозадачность по вкладкам', 'инструменты разработчика'],
};

/**
 * FAQ（写进 JSON-LD 的 FAQPage，也给 llms.txt 用）。
 * 刻意写成「用户真会搜的样子」——AI 检索最擅长匹配问答对。
 */
export const FAQ = {
  '': [
    {
      q: 'OTools 是什么？可以免费用吗？',
      a: 'OTools 是一个把常用桌面工具收进同一个工作台的高性能 AI 工作流平台，核心是「Tabs 多任务化」：多个工具并行打开、保持上下文、随时切换。平台与内置插件均可免费下载，Windows 与macOS 行为一致。',
    },
    {
      q: '每个工具有独立版吗？不想装整个平台行不行？',
      a: '可以。Git、DBM、Term、MQTT、FTP、Env、Android Mirror 每个工具都有独立版，可脱离平台单独下载运行，功能不阉割。适合只想要其中一个工具、或想在多台机器上轻量部署的场景。',
    },
    {
      q: 'OTools 的 Git 客户端和 SourceTree / GitKraken 有什么区别？',
      a: 'OTools 是原生桌面实现，不依赖 Java/JRE，启动即用；同时把仓库列表、提交历史、文件树、Diff、终端放在同一屏，能完成「看改动 → 写命令 → 看结果」的完整闭环，不必在多个窗口切换。它也有独立版，可以当纯 Git GUI 使用。',
    },
    {
      q: '有没有能替代 phpstudy / xampp 的本地服务管理工具？',
      a: '有，Env（原 ServRun）就是。它的差异在于不止「装环境」：安装与运行状态、监听端口、版本号集中在一张面板；Nginx 虚拟主机可视化编辑；PHP 多版本共存与切换；服务配置文件在线编辑并可一键回滚。而且是纯本地进程管理，不需要常驻容器运行时或面板服务，启动快、占用低。',
    },
    {
      q: 'MQTT 调试除了 MQTTX 还有什么选择？',
      a: 'OTools MQTT 打开会话即可看到消息流，订阅树与日志同屏；载荷支持纯文本 / JSON / Base64 / Hex / CBOR 多视图切换，JSON 自动格式化；历史消息可一键重发复现问题；支持 MQTT 3.1.1 与 5.0、TLS 与遗嘱消息。开源免费跨平台。',
    },
    {
      q: '支持哪些操作系统？需要联网吗？',
      a: 'Windows 与 macOS 都支持，界面与快捷键一致。工具本身离线可用，联网只用于下载与版本更新。',
    },
  ],
  en: [
    {
      q: 'What is OTools and is it free?',
      a: 'OTools is a high-performance desktop AI workflow platform built around "tabs multitasking": run several tools in parallel, keep context, switch instantly. The platform and its built-in plugins are free to download, with consistent behaviour on Windows and macOS.',
    },
    {
      q: 'Do I have to install the whole platform, or can I get a single tool?',
      a: 'You can get a single tool. Git, DBM, Term, MQTT, FTP, Env and Android Mirror each ship a standalone build that runs without the platform, with no feature downgrades.',
    },
    {
      q: 'How does the OTools Git client compare with SourceTree or GitKraken?',
      a: 'OTools is a native desktop app with no Java/JRE dependency, so it starts instantly. Repository list, commit history, file tree, diff and terminal live on one screen, letting you go from "review changes" to "run a command" to "see the result" without switching windows. A standalone build is also available.',
    },
    {
      q: 'Is there an alternative to phpstudy or xampp for managing local services?',
      a: 'Yes — Env (formerly ServRun). Beyond installing services, it shows install/run status, listening ports and versions on a single dashboard, offers visual Nginx vhost editing, supports coexisting PHP versions with switching, and allows editing service configs online with one-click rollback. It manages local processes directly, so no container runtime or panel service is required.',
    },
    {
      q: 'What MQTT debugging alternatives exist to MQTTX?',
      a: 'OTools MQTT shows the message stream as soon as a session opens, with the subscription tree and log in the same view. Payloads switch between plain text, JSON, Base64, Hex and CBOR with JSON auto-formatting; historical messages can be replayed to any topic; MQTT 3.1.1 and 5.0, TLS and will messages are supported. It is free and cross-platform.',
    },
    {
      q: 'Which operating systems are supported?',
      a: 'Windows and macOS, with consistent UI and shortcuts. The tools work offline; a connection is only needed for downloads and updates.',
    },
  ],
};

/** 未提供某语言 FAQ 时的回退顺序。 */
const FAQ_FALLBACK = ['', 'en'];
export function faqFor(prefix) {
  for (const p of FAQ_FALLBACK) {
    if (FAQ[p]) return FAQ[p];
  }
  return [];
}
