#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "assets" / "images"
TARGET.mkdir(parents=True, exist_ok=True)

IMG_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".avif")
URL_RE = re.compile(r'(?:src|href)="([^"]+)"|url\(([^)]+)\)')


def clean(v: str) -> str:
    return v.strip().strip('"\'')


def is_local_image(url: str) -> bool:
    if not url:
        return False
    if url.startswith(("http://", "https://", "//", "mailto:", "tel:", "#", "data:")):
        return False
    path = url.split("?", 1)[0].split("#", 1)[0]
    return path.lower().endswith(IMG_EXTS)


def resolve(html_file: Path, url: str) -> Path:
    raw = url.split("?", 1)[0].split("#", 1)[0]
    if raw.startswith("/"):
        return ROOT / raw.lstrip("/")
    return (html_file.parent / raw).resolve()


def main() -> None:
    copied = 0
    seen = set()

    for html in ROOT.rglob("*.html"):
        rel = html.relative_to(ROOT).as_posix()
        if rel.startswith("archive/original-version/"):
            continue

        content = html.read_text(encoding="utf-8")
        for m in URL_RE.finditer(content):
            u = clean(m.group(1) or m.group(2) or "")
            if not is_local_image(u):
                continue

            src = resolve(html, u)
            if not src.exists() or not src.is_file():
                continue

            src_rel = src.relative_to(ROOT)
            dest = TARGET / src_rel
            if dest in seen:
                continue
            seen.add(dest)
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dest)
            copied += 1

    print(f"Copied {copied} referenced images into {TARGET}")


if __name__ == "__main__":
    main()
