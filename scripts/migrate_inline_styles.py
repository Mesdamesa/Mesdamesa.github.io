#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HTML_FILES = [p for p in ROOT.rglob('*.html') if 'archive/original-version' not in p.as_posix()]
OUT_CSS = ROOT / 'assets' / 'css' / 'inline-style-migrations.css'

style_to_class: dict[str, str] = {}


def class_for(style_value: str) -> str:
    key = style_value.strip()
    if key not in style_to_class:
        digest = hashlib.sha1(key.encode('utf-8')).hexdigest()[:10]
        style_to_class[key] = f'u-inline-{digest}'
    return style_to_class[key]


def parse_tag(text: str, start: int) -> tuple[str, int]:
    i = start
    quote = None
    while i < len(text):
        ch = text[i]
        if quote:
            if ch == quote:
                quote = None
        else:
            if ch in ('"', "'"):
                quote = ch
            elif ch == '>':
                return text[start:i + 1], i + 1
        i += 1
    return text[start:], len(text)


def transform_tag(tag: str) -> str:
    if tag.startswith('</') or tag.startswith('<!'):
        return tag

    m = re.search(r'\sstyle\s*=\s*("([^"]*)"|\'([^\']*)\')', tag, flags=re.I)
    if not m:
        return tag

    style_val = m.group(2) if m.group(2) is not None else m.group(3)
    style_val = style_val.strip()
    if not style_val:
        return tag[:m.start()] + tag[m.end():]

    cls = class_for(style_val)

    # Remove style attr
    tag_wo_style = tag[:m.start()] + tag[m.end():]

    class_m = re.search(r'\sclass\s*=\s*("([^"]*)"|\'([^\']*)\')', tag_wo_style, flags=re.I)
    if class_m:
        current = class_m.group(2) if class_m.group(2) is not None else class_m.group(3)
        sep = ' ' if current.strip() else ''
        new_class_val = f'{current}{sep}{cls}'
        quote = '"' if class_m.group(2) is not None else "'"
        replacement = f' class={quote}{new_class_val}{quote}'
        tag_final = tag_wo_style[:class_m.start()] + replacement + tag_wo_style[class_m.end():]
    else:
        close = '/>' if tag_wo_style.endswith('/>') else '>'
        tag_core = tag_wo_style[:-2] if close == '/>' else tag_wo_style[:-1]
        tag_final = f'{tag_core} class="{cls}"{close}'

    return tag_final


def migrate_html(content: str) -> str:
    out = []
    i = 0
    while i < len(content):
        comment_start = content.find('<!--', i)
        tag_start = content.find('<', i)

        if tag_start == -1:
            out.append(content[i:])
            break

        if comment_start != -1 and comment_start == tag_start:
            end = content.find('-->', comment_start + 4)
            if end == -1:
                out.append(content[i:])
                break
            out.append(content[i:end + 3])
            i = end + 3
            continue

        out.append(content[i:tag_start])
        tag, next_i = parse_tag(content, tag_start)
        out.append(transform_tag(tag))
        i = next_i

    return ''.join(out)


def ensure_css_link(content: str) -> str:
    link = '    <link rel="stylesheet" href="/assets/css/inline-style-migrations.css">\n'
    if '/assets/css/inline-style-migrations.css' in content:
        return content
    if '</head>' in content:
        return content.replace('</head>', link + '</head>')
    return content


def main() -> None:
    for html in HTML_FILES:
        orig = html.read_text(encoding='utf-8')
        updated = migrate_html(orig)
        updated = ensure_css_link(updated)
        if updated != orig:
            html.write_text(updated, encoding='utf-8')

    lines = ["/* Auto-generated from legacy inline style attributes. */", ""]
    for style_val, cls in sorted(style_to_class.items(), key=lambda kv: kv[1]):
        lines.append(f'.{cls} {{ {style_val} }}')
    lines.append('')
    OUT_CSS.write_text('\n'.join(lines), encoding='utf-8')


if __name__ == '__main__':
    main()
