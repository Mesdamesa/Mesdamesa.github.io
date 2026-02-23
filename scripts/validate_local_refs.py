#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

HTML_RE = re.compile(r'(?:src|href)="([^"]+)"|url\(([^)]+)\)')
COMMENT_RE = re.compile(r'<!--.*?-->', re.S)
CSS_URL_RE = re.compile(r'url\(([^)]+)\)')

SKIP_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "#", "data:", "javascript:")
SKIP_PARTIALS = ("........", "NEW-CREA", "......")


def clean(v: str) -> str:
    return v.strip().strip('"\'')


def should_skip(url: str) -> bool:
    if not url:
        return True
    if url.startswith(SKIP_PREFIXES):
        return True
    if any(part in url for part in SKIP_PARTIALS):
        return True
    return False


def resolve(base: Path, url: str) -> Path:
    p = url.split("?", 1)[0].split("#", 1)[0]
    if p.startswith("/"):
        return ROOT / p.lstrip("/")
    return (base / p).resolve()


def main() -> int:
    missing = []

    for html in ROOT.rglob("*.html"):
        rel = html.relative_to(ROOT).as_posix()
        if rel.startswith("archive/original-version/"):
            continue
        content = COMMENT_RE.sub("", html.read_text(encoding="utf-8", errors="ignore"))
        for m in HTML_RE.finditer(content):
            raw = clean(m.group(1) or m.group(2) or "")
            if should_skip(raw):
                continue
            target = resolve(html.parent, raw)
            if not target.exists():
                missing.append((rel, raw))

    for css in ROOT.rglob("*.css"):
        rel = css.relative_to(ROOT).as_posix()
        if rel.startswith("archive/original-version/"):
            continue
        content = css.read_text(encoding="utf-8", errors="ignore")
        for m in CSS_URL_RE.finditer(content):
            raw = clean(m.group(1))
            if should_skip(raw):
                continue
            target = resolve(css.parent, raw)
            if not target.exists():
                missing.append((rel, raw))

    if missing:
        for file_rel, ref in missing:
            print(f"MISSING {file_rel} -> {ref}")
        return 1

    print("OK: all local href/src/url() references resolve")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
