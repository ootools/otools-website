#!/usr/bin/env node
/**
 * 给 8 种语言的 pluginLanding 文案补齐「新增截图场景」。
 *
 * 背景：registry.ts 的 screenshots / features 增删了条目后，locale 里的
 * `screens`（按索引对齐 registry.screenshots）与 `features`（按索引对齐
 * registry.features）不会自动跟着变 —— 少一条就是渲染出 undefined，
 * 多一条就整体错位（i=1 显示的其实是 i=2 的文案）。VitePress 也不校验这个。
 *
 * 这里显式按语言给齐，避免手工改 8 个 JSON 时漏语言或错位。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCALES_DIR = path.resolve(__dirname, '../.vitepress/theme/locales');

// ── git：新增 files / terminal 两个场景 ──────────────────────────────────
// registry 顺序：workspace, files, history, terminal
const GIT_SCREENS = {
  zh: ['工作区', '文件浏览', '提交历史', '内置终端'],
  en: ['Workspace', 'File browser', 'History', 'Terminal'],
  ja: ['ワークスペース', 'ファイル一覧', 'コミット履歴', 'ターミナル'],
  ko: ['워크스페이스', '파일 탐색', '커밋 기록', '터미널'],
  fr: ['Espace de travail', 'Explorateur de fichiers', 'Historique', 'Terminal'],
  es: ['Área de trabajo', 'Explorador de archivos', 'Historial', 'Terminal'],
  de: ['Arbeitsbereich', 'Dateibrowser', 'Historie', 'Terminal'],
  ru: ['Рабочая область', 'Обзор файлов', 'История', 'Терминал'],
};

// git features 顺序：repos, files, diff, ai, terminal
const GIT_FEATURES = {
  zh: {
    files: { title: '文件浏览', desc: '按目录树查看与打开仓库文件，编辑后可直接回到变更列表暂存提交。' },
    terminal: { title: '内置终端', desc: '在同一个窗口里执行 git 命令，配合仓库上下文切换目录，不必另开终端。' },
  },
  en: {
    files: { title: 'File browser', desc: 'Browse and open repository files from the tree, edit and jump straight back to the changes list to stage.' },
    terminal: { title: 'Built-in terminal', desc: 'Run git commands in the same window and switch directories with the repo context — no separate terminal.' },
  },
  ja: {
    files: { title: 'ファイル一覧', desc: 'ツリーからリポジトリのファイルを表示・開き、編集後は変更一覧に戻ってステージングできます。' },
    terminal: { title: '内蔵ターミナル', desc: '同じウィンドウで git コマンドを実行。リポジトリのコンテキストに合わせてディレクトリを切り替えられるため、別にターミナルを開き直す必要がありません。' },
  },
  ko: {
    files: { title: '파일 탐색', desc: '트리에서 저장소 파일을 열어 보고 편집한 뒤, 변경 목록으로 돌아와 바로 스테이징할 수 있습니다.' },
    terminal: { title: '내장 터미널', desc: '같은 창에서 git 명령을 실행하고 저장소 컨텍스트에 맞춰 디렉터리를 전환할 수 있어 별도 터미널이 필요 없습니다.' },
  },
  fr: {
    files: { title: 'Explorateur de fichiers', desc: 'Parcourez et ouvrez les fichiers du dépôt depuis l’arborescence, modifiez puis revenez à la liste des modifications pour indexer.' },
    terminal: { title: 'Terminal intégré', desc: 'Exécutez les commandes git dans la même fenêtre et changez de dossier selon le dépôt, sans ouvrir un second terminal.' },
  },
  es: {
    files: { title: 'Explorador de archivos', desc: 'Explora y abre los archivos del repositorio desde el árbol, edítalos y vuelve a la lista de cambios para prepararlos.' },
    terminal: { title: 'Terminal integrado', desc: 'Ejecuta comandos git en la misma ventana y cambia de directorio según el repositorio, sin abrir otra terminal.' },
  },
  de: {
    files: { title: 'Dateibrowser', desc: 'Repository-Dateien im Baum ansehen und öffnen, bearbeiten und direkt zur Änderungsliste zurückkehren, um zu stagen.' },
    terminal: { title: 'Integriertes Terminal', desc: 'git-Befehle im selben Fenster ausführen und passend zum Repository das Verzeichnis wechseln — ohne zweites Terminal.' },
  },
  ru: {
    files: { title: 'Обзор файлов', desc: 'Открывайте файлы репозитория из дерева, редактируйте их и возвращайтесь к списку изменений, чтобы проиндексировать.' },
    terminal: { title: 'Встроенный терминал', desc: 'Выполняйте команды git в том же окне и переключайте каталог вместе с контекстом репозитория — без второго терминала.' },
  },
};

// ── servrun：画廊要列全 9 个服务场景 ────────────────────────────────────────
// registry 顺序：dashboard, nginx, mysql, php, redis, mongodb, postgresql, memcached, rabbitmq
const SERVRUN_SCREENS = {
  zh: ['服务面板', 'Nginx 服务详情', 'MySQL 服务详情', 'PHP 服务详情', 'Redis 服务详情', 'MongoDB 服务详情', 'PostgreSQL 服务详情', 'Memcached 服务详情', 'RabbitMQ 服务详情'],
  en: ['Services', 'Nginx detail', 'MySQL detail', 'PHP detail', 'Redis detail', 'MongoDB detail', 'PostgreSQL detail', 'Memcached detail', 'RabbitMQ detail'],
  ja: ['サービス一覧', 'Nginx の詳細', 'MySQL の詳細', 'PHP の詳細', 'Redis の詳細', 'MongoDB の詳細', 'PostgreSQL の詳細', 'Memcached の詳細', 'RabbitMQ の詳細'],
  ko: ['서비스 패널', 'Nginx 상세', 'MySQL 상세', 'PHP 상세', 'Redis 상세', 'MongoDB 상세', 'PostgreSQL 상세', 'Memcached 상세', 'RabbitMQ 상세'],
  fr: ['Panneau des services', 'Détail Nginx', 'Détail MySQL', 'Détail PHP', 'Détail Redis', 'Détail MongoDB', 'Détail PostgreSQL', 'Détail Memcached', 'Détail RabbitMQ'],
  es: ['Panel de servicios', 'Detalle de Nginx', 'Detalle de MySQL', 'Detalle de PHP', 'Detalle de Redis', 'Detalle de MongoDB', 'Detalle de PostgreSQL', 'Detalle de Memcached', 'Detalle de RabbitMQ'],
  de: ['Dienstübersicht', 'Nginx-Details', 'MySQL-Details', 'PHP-Details', 'Redis-Details', 'MongoDB-Details', 'PostgreSQL-Details', 'Memcached-Details', 'RabbitMQ-Details'],
  ru: ['Панель служб', 'Подробности Nginx', 'Подробности MySQL', 'Подробности PHP', 'Подробности Redis', 'Подробности MongoDB', 'Подробности PostgreSQL', 'Подробности Memcached', 'Подробности RabbitMQ'],
};

// ── term：画廊要 connected + sftp（原来是空的 workspace）────────────────────
const TERM_SCREENS = {
  zh: ['已连接主机', 'SFTP 文件管理'],
  en: ['Connected host', 'SFTP file manager'],
  ja: ['接続済みホスト', 'SFTP ファイル管理'],
  ko: ['연결된 호스트', 'SFTP 파일 관리'],
  fr: ['Hôte connecté', 'Gestionnaire de fichiers SFTP'],
  es: ['Host conectado', 'Gestor de archivos SFTP'],
  de: ['Verbundener Host', 'SFTP-Dateimanager'],
  ru: ['Подключённый хост', 'Менеджер файлов SFTP'],
};

// ── mqtt / dbm：画廊顺序变了（第一张换成有数据的场景），标签顺序要跟着换 ────
const MQTT_SCREENS = {
  // registry 顺序：session, list, form
  zh: ['会话与消息流', '连接列表', '新建连接'],
  en: ['Session and messages', 'Connections', 'New connection'],
  ja: ['セッションとメッセージ', '接続一覧', '新規接続'],
  ko: ['세션과 메시지', '연결 목록', '새 연결'],
  fr: ['Session et messages', 'Liste des connexions', 'Nouvelle connexion'],
  es: ['Sesión y mensajes', 'Lista de conexiones', 'Nueva conexión'],
  de: ['Sitzung und Nachrichten', 'Verbindungsliste', 'Neue Verbindung'],
  ru: ['Сессия и сообщения', 'Список подключений', 'Новое подключение'],
};

const DBM_SCREENS = {
  // registry 顺序：tables, query, structure
  zh: ['数据表', '查询结果', '表结构'],
  en: ['Tables', 'Query result', 'Schema'],
  ja: ['テーブル', 'クエリ結果', 'テーブル定義'],
  ko: ['테이블', '쿼리 결과', '테이블 구조'],
  fr: ['Tables', 'Résultat de requête', 'Structure'],
  es: ['Tablas', 'Resultado de consulta', 'Esquema'],
  de: ['Tabellen', 'Abfrageergebnis', 'Schema'],
  ru: ['Таблицы', 'Результат запроса', 'Структура'],
};

const PLAN = {
  'otools-git': (L) => ({ screens: GIT_SCREENS[L], features: GIT_FEATURES[L] }),
  'otools-servrun': (L) => ({ screens: SERVRUN_SCREENS[L] }),
  'otools-term': (L) => ({ screens: TERM_SCREENS[L] }),
  'otools-mqtt': (L) => ({ screens: MQTT_SCREENS[L] }),
  'otools-dbm': (L) => ({ screens: DBM_SCREENS[L] }),
};

const changed = [];
for (const L of ['zh', 'en', 'ja', 'ko', 'fr', 'es', 'de', 'ru']) {
  const file = path.join(LOCALES_DIR, `${L}.json`);
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const pl = json.pluginLanding;
  if (!pl) throw new Error(`${L}.json 缺 pluginLanding`);

  for (const [key, build] of Object.entries(PLAN)) {
    const node = pl[key];
    if (!node) { console.warn(`⚠ ${L}/${key} 不存在，跳过`); continue; }
    const plan = build(L);

    if (plan.screens) {
      if (node.screens.length !== plan.screens.length) {
        changed.push(`${L}/${key}.screens ${node.screens.length}→${plan.screens.length}`);
      }
      node.screens = plan.screens;
    }

    if (plan.features) {
      // git：按语义插入 —— 原 [0]=repos [1]=diff [2]=ai，
      // 新顺序 repos, files, diff, ai, terminal
      const before = node.features;
      const next = [];
      next[0] = before[0];                                  // repos
      next[1] = { ...plan.features.files };                 // files（新增）
      next[2] = before[1];                                  // diff
      next[3] = before[2];                                  // ai
      next[4] = { ...plan.features.terminal };              // terminal（新增）
      if (before.length !== 5) changed.push(`${L}/${key}.features ${before.length}→5`);
      node.features = next;
    }
  }

  fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n');
}

console.log('调整条目：');
for (const c of changed) console.log('  ·', c);
console.log(`\n✓ 8 个 locale 已更新（${changed.length} 处长度变化）`);
