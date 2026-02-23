#!/usr/bin/env python3
from __future__ import annotations

import os
import re
import shutil
from pathlib import Path
from difflib import SequenceMatcher

ROOT = Path(__file__).resolve().parents[1]
COMMENT_RE = re.compile(r'<!--.*?-->', re.S)
REF_RE = re.compile(r'(?:src|href)="([^"]+)"|url\(([^)]+)\)')
SKIP_PREFIXES = ("http://", "https://", "//", "mailto:", "tel:", "#", "data:", "javascript:")
SKIP_PARTIALS = ("........", "NEW-CREA", "......")

ALLOWED_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".pdf", ".mp4"}


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


def collect_missing() -> list[Path]:
    missing: list[Path] = []
    seen = set()
    for html in ROOT.rglob("*.html"):
        rel = html.relative_to(ROOT).as_posix()
        if rel.startswith("archive/original-version/"):
            continue
        content = COMMENT_RE.sub("", html.read_text(encoding="utf-8", errors="ignore"))
        for m in REF_RE.finditer(content):
            raw = clean(m.group(1) or m.group(2) or "")
            if should_skip(raw):
                continue
            target = resolve(html.parent, raw)
            if not target.exists() and target.suffix.lower() in ALLOWED_EXTS and target.is_relative_to(ROOT):
                if target not in seen:
                    seen.add(target)
                    missing.append(target)
    for css in ROOT.rglob("*.css"):
        rel = css.relative_to(ROOT).as_posix()
        if rel.startswith("archive/original-version/"):
            continue
        content = css.read_text(encoding="utf-8", errors="ignore")
        for m in re.finditer(r'url\(([^)]+)\)', content):
            raw = clean(m.group(1))
            if should_skip(raw):
                continue
            target = resolve(css.parent, raw)
            if not target.exists() and target.suffix.lower() in ALLOWED_EXTS and target.is_relative_to(ROOT):
                if target not in seen:
                    seen.add(target)
                    missing.append(target)
    return missing


def candidate_score(target: Path, cand: Path) -> float:
    t = target.as_posix().lower()
    c = cand.as_posix().lower()
    return SequenceMatcher(None, t, c).ratio()


def main() -> None:
    missing = collect_missing()

    all_files = [
        p for p in ROOT.rglob("*")
        if p.is_file() and "archive/original-version" not in p.as_posix()
    ]

    by_name: dict[str, list[Path]] = {}
    for f in all_files:
        by_name.setdefault(f.name.lower(), []).append(f)

    copied = 0
    unresolved = []

    for target in missing:
        name = target.name.lower()
        cands = by_name.get(name, [])
        if not cands:
            # fallback for common typos: remove accents, singular/plural drift
            stem = target.stem.lower().replace('é', 'e').replace('è', 'e').replace('à', 'a').replace('ç', 'c')
            cands = [c for c in all_files if c.suffix.lower() == target.suffix.lower() and stem in c.stem.lower()]
        if not cands:
            unresolved.append(target)
            continue

        best = max(cands, key=lambda c: candidate_score(target, c))
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(best, target)
        copied += 1
        by_name.setdefault(target.name.lower(), []).append(target)

    print(f"Copied {copied} missing assets")
    if unresolved:
        print("Unresolved:")
        for p in unresolved:
            print(p.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
