#!/usr/bin/env python3
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INLINE_DIR = ROOT / "assets" / "js" / "inline"
INLINE_DIR.mkdir(parents=True, exist_ok=True)

CANONICAL_BOOTSTRAP_CSS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
CANONICAL_BOOTSTRAP_JS = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"

CSS_URL_MAP = {
    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css": CANONICAL_BOOTSTRAP_CSS,
}

JS_URL_MAP = {
    "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/js/bootstrap.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3/dist/js/bootstrap.bundle.min.js": CANONICAL_BOOTSTRAP_JS,
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js": CANONICAL_BOOTSTRAP_JS,
}

SCROLLING_NAV_PATHS = [
    'href="css/scrolling-nav2.css"',
    'href="./../../css/scrolling-nav2.css"',
]

POPPER_RE = re.compile(r"^\s*<script[^>]+src=\"[^\"]*popper[^\"]*\"[^>]*></script>\s*$", re.IGNORECASE | re.MULTILINE)

HTML_FILES = [
    p for p in ROOT.rglob("*.html") if "archive/original-version" not in p.as_posix()
]


def find_case_insensitive(haystack: str, needle: str, start: int = 0) -> int:
    return haystack.lower().find(needle.lower(), start)


def extract_inline_scripts(content: str, rel_path: Path) -> str:
    out: list[str] = []
    i = 0
    script_idx = 0

    while i < len(content):
        comment_start = content.find("<!--", i)
        script_start = find_case_insensitive(content, "<script", i)

        if script_start == -1:
            out.append(content[i:])
            break

        if comment_start != -1 and comment_start <= script_start:
            out.append(content[i:comment_start])
            comment_end = content.find("-->", comment_start + 4)
            if comment_end == -1:
                out.append(content[comment_start:])
                break
            out.append(content[comment_start:comment_end + 3])
            i = comment_end + 3
            continue

        out.append(content[i:script_start])

        tag_end = content.find(">", script_start)
        if tag_end == -1:
            out.append(content[script_start:])
            break

        open_tag = content[script_start:tag_end + 1]
        close_tag_start = find_case_insensitive(content, "</script>", tag_end + 1)
        if close_tag_start == -1:
            out.append(content[script_start:])
            break

        inner = content[tag_end + 1:close_tag_start]
        full_block = content[script_start:close_tag_start + len("</script>")]

        has_src = re.search(r"\bsrc\s*=", open_tag, flags=re.IGNORECASE) is not None
        script_type = re.search(r"type\s*=\s*['\"]([^'\"]+)['\"]", open_tag, flags=re.IGNORECASE)
        is_json_like = bool(script_type and "json" in script_type.group(1).lower())

        if has_src or is_json_like or inner.strip() == "":
            out.append(full_block)
        else:
            script_idx += 1
            slug = rel_path.as_posix().replace("/", "__").replace(" ", "_")
            js_name = f"{slug}--inline-{script_idx:02d}.js"
            js_path = INLINE_DIR / js_name
            js_path.write_text(inner, encoding="utf-8")

            attrs = open_tag[len("<script"):-1].rstrip()
            if attrs:
                new_tag = f"<script{attrs} src=\"/assets/js/inline/{js_name}\"></script>"
            else:
                new_tag = f"<script src=\"/assets/js/inline/{js_name}\"></script>"
            out.append(new_tag)

        i = close_tag_start + len("</script>")

    return "".join(out)


def normalize_links(content: str) -> str:
    for old, new in CSS_URL_MAP.items():
        content = content.replace(old, new)

    content = re.sub(
        r"(<link[^>]+href=\")css/bootstrap\.min\.css(\"[^>]*>)",
        rf"\1{CANONICAL_BOOTSTRAP_CSS}\2",
        content,
        flags=re.IGNORECASE,
    )

    for old, new in JS_URL_MAP.items():
        content = content.replace(old, new)

    content = re.sub(
        r"(<script[^>]+src=\")js/bootstrap(?:\.min)?\.js(\"[^>]*></script>)",
        rf"\1{CANONICAL_BOOTSTRAP_JS}\2",
        content,
        flags=re.IGNORECASE,
    )

    for old in SCROLLING_NAV_PATHS:
        content = content.replace(old, 'href="/assets/css/site.css"')

    if '/assets/css/site.css' in content and '/assets/css/bootstrap-legacy-compat.css' not in content:
        content = content.replace(
            '/assets/css/site.css" rel="stylesheet">',
            '/assets/css/site.css" rel="stylesheet">\n    <link rel="stylesheet" href="/assets/css/bootstrap-legacy-compat.css">',
        )

    content = POPPER_RE.sub("", content)

    if '/assets/js/bootstrap-legacy-bridge.js' not in content and '</body>' in content:
        content = content.replace(
            '</body>',
            '    <script src="/assets/js/bootstrap-legacy-bridge.js"></script>\n</body>'
        )

    return content


def main() -> None:
    for html_path in HTML_FILES:
        rel = html_path.relative_to(ROOT)
        original = html_path.read_text(encoding="utf-8")
        updated = normalize_links(original)
        updated = extract_inline_scripts(updated, rel)

        if updated != original:
            html_path.write_text(updated, encoding="utf-8")


if __name__ == "__main__":
    main()
