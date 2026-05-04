#!/usr/bin/env python3
"""
Route Audit — HTML link/reference integrity check for DD workspace.

Scans every *.html file in the workspace, extracts all local routing
references (href, src, ?file=, data-md-src), and verifies that the
referenced files exist on disk.

Usage:
    python3 _assets/test-routes.py         # run audit, write report, print summary
    python3 _assets/test-routes.py --fail-on-broken  # exit 1 if broken routes exist

Report is written to _assets/ROUTE-AUDIT.md.

External URLs (http://, https://, mailto:, tel:, data:), anchor-only
references (#...), and placeholder refs ({{...}}, javascript:) are skipped.
"""
from __future__ import annotations

import argparse
import html
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "_assets"
REPORT = ASSETS / "ROUTE-AUDIT.md"

# Patterns that indicate non-local references we should skip entirely.
SKIP_PREFIXES = (
    "http://", "https://", "//",
    "mailto:", "tel:", "sms:", "data:", "blob:",
    "javascript:", "file:", "about:", "ws://", "wss://",
)

# Regex: grabs attribute values for href, src, data-md-src (double or single quoted).
# The (?<![:@a-zA-Z-]) lookbehind excludes Alpine.js `:href`, `@href`, `x-href`
# and attribute-name suffixes like `data-href` that are not real hrefs.
ATTR_RE = re.compile(
    r"""(?<![:@a-zA-Z-])(?P<attr>href|src|data-md-src)\s*=\s*(?P<q>["'])(?P<val>[^"']*)(?P=q)""",
    re.IGNORECASE,
)

# Values that look like JS expressions (concatenation, dotted access, function calls).
# If we see these, the attribute is an inline JS expression, not a static path.
JS_EXPR_RE = re.compile(r"""(\s\+\s|[\${}()`]|^[a-zA-Z_$][\w$]*(\.[\w$]+)+$)""")

# Inline ?file= references inside JS / onclick strings
FILE_PARAM_RE = re.compile(r"""reader\.html\?file=(?P<val>[^\s"'<>)]+)""", re.IGNORECASE)

# A file reference on a single line containing a `?file=` query; we want the path
# after the first `?file=`. Case-insensitive.
QS_FILE_RE = re.compile(r"""[?&]file=(?P<val>[^\s"'<>&#]+)""", re.IGNORECASE)


def should_skip(ref: str) -> bool:
    if not ref:
        return True
    r = ref.strip()
    if not r:
        return True
    low = r.lower()
    if low.startswith(SKIP_PREFIXES):
        return True
    if r.startswith("#"):
        return True
    if r.startswith("{{") or "{{" in r:
        return True  # templating placeholder
    if r.startswith("<") or "${" in r:
        return True  # JS template literal placeholder
    # Value looks like a JS expression rather than a path
    if JS_EXPR_RE.search(r):
        return True
    # Ellipsis placeholders / Czech doc examples: "…", "...", "…anchor"
    if r == "…" or r == "..." or r.startswith("…"):
        return True
    return False


def normalize(ref: str) -> str:
    """Strip query/fragment, decode percent-encoding, return path only."""
    r = html.unescape(ref).strip()
    # Split off fragment first (urlsplit also handles this)
    parts = urlsplit(r)
    path = unquote(parts.path)
    return path


def resolve_target(source_file: Path, ref: str, attr: str = "") -> Path:
    """Resolve a relative or root-absolute ref against the source html file.

    For ?file= query parameters (attr == '?file='), the path is interpreted
    relative to the workspace root — reader.html lives at root and loads
    markdown paths from there regardless of where the linking HTML sits.
    """
    if attr == "?file=":
        return (ROOT / ref.lstrip("/")).resolve()
    if ref.startswith("/"):
        return (ROOT / ref.lstrip("/")).resolve()
    return (source_file.parent / ref).resolve()


def within_workspace(p: Path) -> bool:
    try:
        p.relative_to(ROOT)
        return True
    except ValueError:
        return False


def scan_file(html_path: Path) -> list[dict]:
    """Return a list of route dicts for a single HTML file."""
    text = html_path.read_text(encoding="utf-8", errors="replace")
    seen: list[dict] = []

    # 1) Ordinary href / src / data-md-src attributes
    for m in ATTR_RE.finditer(text):
        val = m.group("val")
        if should_skip(val):
            continue
        # If the value is itself a reader.html?file=... link, also verify target
        line = text.count("\n", 0, m.start()) + 1
        path = normalize(val)
        if not path:
            # pure-fragment (#foo) — urlsplit returned empty path
            continue
        seen.append(
            {
                "attr": m.group(1).lower(),
                "ref": val,
                "path": path,
                "line": line,
            }
        )
        # If this attribute carries a ?file= param, also record that pointer.
        qm = QS_FILE_RE.search(val)
        if qm:
            target = unquote(qm.group("val"))
            seen.append(
                {
                    "attr": "?file=",
                    "ref": val,
                    "path": target,
                    "line": line,
                }
            )

    # 2) Inline reader.html?file= in JS / strings (separate from attr matches above)
    for m in FILE_PARAM_RE.finditer(text):
        val = m.group("val")
        if should_skip(val):
            continue
        line = text.count("\n", 0, m.start()) + 1
        target = normalize(val)  # strip #fragment + ?query, decode percent-encoding
        if not target:
            continue
        seen.append(
            {
                "attr": "?file=",
                "ref": f"reader.html?file={val}",
                "path": target,
                "line": line,
            }
        )

    return seen


def classify(source_file: Path, route: dict) -> dict:
    path = route["path"]
    if not path:
        route["status"] = "SKIP"
        route["reason"] = "empty after normalize"
        return route

    resolved = resolve_target(source_file, path, route.get("attr", ""))

    if not within_workspace(resolved):
        route["status"] = "SKIP"
        route["reason"] = "outside workspace"
        return route

    if resolved.exists():
        route["status"] = "OK"
        route["resolved"] = str(resolved.relative_to(ROOT))
        return route

    route["status"] = "BROKEN"
    route["resolved"] = str(resolved.relative_to(ROOT)) if within_workspace(resolved) else str(resolved)
    return route


def is_source_archive(path: Path) -> bool:
    """Skip raw evidence captures — scraped 3rd-party HTML with external deps."""
    parts = [p.lower() for p in path.parts]
    # any raw/ or raw-*/ directory
    for p in parts:
        if p == "raw" or p.startswith("raw-") or p.startswith("raw_"):
            return True
    return False


def run_audit() -> dict:
    html_files = sorted(
        p for p in ROOT.rglob("*.html")
        if "node_modules" not in p.parts
        and not is_source_archive(p)
        and not p.name.endswith(".clean")
    )

    per_file: dict[str, dict] = {}
    total = 0
    broken: list[tuple[Path, dict]] = []

    for hf in html_files:
        routes = [classify(hf, r) for r in scan_file(hf)]
        ok = [r for r in routes if r["status"] == "OK"]
        bad = [r for r in routes if r["status"] == "BROKEN"]
        skipped = [r for r in routes if r["status"] == "SKIP"]
        per_file[str(hf.relative_to(ROOT))] = {
            "total": len(routes),
            "ok": len(ok),
            "broken": len(bad),
            "skipped": len(skipped),
            "broken_routes": bad,
        }
        total += len(routes)
        for b in bad:
            broken.append((hf, b))

    return {
        "files": per_file,
        "html_count": len(html_files),
        "total_routes": total,
        "broken": broken,
    }


def render_report(result: dict) -> str:
    lines = []
    lines.append(f"# Audit odkazů — 2026-04-21")
    lines.append("")
    lines.append("Automaticky vygenerováno skriptem `_assets/test-routes.py`. Spusťte znovu pro obnovení.")
    lines.append("")
    lines.append("## Shrnutí")
    lines.append("")
    lines.append(f"- Zkontrolováno HTML: **{result['html_count']}**")
    lines.append(f"- Lokálních odkazů celkem: **{result['total_routes']}**")
    lines.append(f"- Rozbitých odkazů: **{len(result['broken'])}**")
    lines.append("")
    lines.append("## Rozbité odkazy (k řešení)")
    lines.append("")
    if not result["broken"]:
        lines.append("_Žádné — všechny lokální reference jsou platné._")
    else:
        for hf, r in result["broken"]:
            rel = hf.relative_to(ROOT)
            lines.append(
                f"- `{rel}` → `{r['attr']}=\"{r['ref']}\"` — soubor nenalezen "
                f"(řádek {r['line']}, vyřešeno na `{r.get('resolved','?')}`)"
            )
    lines.append("")
    lines.append("## Rozpis po souborech")
    lines.append("")
    lines.append("| Soubor | Celkem | OK | Rozbité | Přeskočeno |")
    lines.append("|---|---:|---:|---:|---:|")
    for f in sorted(result["files"]):
        info = result["files"][f]
        lines.append(
            f"| `{f}` | {info['total']} | {info['ok']} | {info['broken']} | {info['skipped']} |"
        )
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--fail-on-broken", action="store_true")
    args = ap.parse_args()

    result = run_audit()
    REPORT.write_text(render_report(result), encoding="utf-8")

    print(f"[route-audit] HTMLs scanned: {result['html_count']}")
    print(f"[route-audit] Total routes:  {result['total_routes']}")
    print(f"[route-audit] Broken:        {len(result['broken'])}")
    print(f"[route-audit] Report:        {REPORT.relative_to(ROOT)}")

    if result["broken"]:
        print("\nBroken routes:")
        for hf, r in result["broken"][:25]:
            rel = hf.relative_to(ROOT)
            print(f"  {rel}:{r['line']}  {r['attr']}={r['ref']}  -> {r.get('resolved','?')}")
        if len(result["broken"]) > 25:
            print(f"  ... and {len(result['broken']) - 25} more (see report)")
        if args.fail_on_broken:
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
