#!/usr/bin/env python3
"""把首页 `home.*` 文案注入 6 个非中英语种（ja / ko / fr / es / de / ru）。
幂等：重复运行只覆盖对应语言的 home 段，不动其它键。
每个语言的文案是与 zh/en 结构完全一致的 dict，放在 scripts/home-copy/<lang>.py。
"""
import json, pathlib, collections, importlib.util, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
LOCALES = ROOT / '.vitepress' / 'theme' / 'locales'
COPY_DIR = pathlib.Path(__file__).resolve().parent / 'home-copy'


def load_payload(lang: str) -> dict:
    """从 scripts/home-copy/<lang>.py 读取 PAYLOAD。"""
    spec = importlib.util.spec_from_file_location(f'home_copy_{lang}', COPY_DIR / f'{lang}.py')
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.PAYLOAD


def merge(dst, src):
    for k, v in src.items():
        if isinstance(v, dict) and isinstance(dst.get(k), dict):
            merge(dst[k], v)
        else:
            dst[k] = v


def inject(lang: str) -> None:
    payload = load_payload(lang)
    p = LOCALES / f'{lang}.json'
    data = json.loads(p.read_text(encoding='utf-8'), object_pairs_hook=collections.OrderedDict)
    data['home'] = payload
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'✓ {lang}.json: injected home.*')


if __name__ == '__main__':
    langs = sys.argv[1:] or ['ja', 'ko', 'fr', 'es', 'de', 'ru']
    for l in langs:
        inject(l)
