#!/usr/bin/env python3
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARCHIVE = ROOT / "archive" / "original-version"

COMMENT_RE = re.compile(r'<!--.*?-->', re.S)
SCRIPT_RE = re.compile(r'<script\b[^>]*>.*?</script>', re.S | re.I)
STYLE_RE = re.compile(r'<style\b[^>]*>.*?</style>', re.S | re.I)
TAG_RE = re.compile(r'<[^>]+>')
WS_RE = re.compile(r'\s+')


def visible_text(path: Path) -> str:
    s = path.read_text(encoding="utf-8", errors="ignore")
    s = COMMENT_RE.sub("", s)
    s = SCRIPT_RE.sub("", s)
    s = STYLE_RE.sub("", s)
    s = TAG_RE.sub(" ", s)
    s = WS_RE.sub(" ", s).strip()
    return s


def main() -> int:
    failures = []
    for current in ROOT.rglob("*.html"):
        rel = current.relative_to(ROOT)
        if rel.as_posix().startswith("archive/original-version/"):
            continue
        original = ARCHIVE / rel
        if not original.exists():
            failures.append((rel.as_posix(), "missing archived counterpart"))
            continue
        if visible_text(current) != visible_text(original):
            failures.append((rel.as_posix(), "visible text differs"))

    if failures:
        for rel, reason in failures:
            print(f"FAIL {rel}: {reason}")
        return 1

    print("OK: visible text matches archived originals for all HTML pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
