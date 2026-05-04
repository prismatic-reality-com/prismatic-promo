#!/usr/bin/env python3
"""
Cross-linker for dashboard HTMLs.

Wraps inline references to source files / RF-IDs / IČOs in anchor tags pointing
to the appropriate viewer (reader.html for .md, direct path for .html).

Idempotent: skips spans already inside <a>...</a>.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent

# Dashboards + portal pages + rendered docs
DASHBOARDS = [
    # Portal & navigation
    "index.html",
    "executive-briefing.html",
    "export-pack.html",
    "sitemap.html",
    "md-index.html",
    "knowledge-graph.html",
    "search.html",
    "keyboard-help.html",
    # 06-reports
    "06-reports/red-flags-dashboard.html",
    "06-reports/valuation-calculator.html",
    "06-reports/deal-journey.html",
    "06-reports/pressure-radar.html",
    "06-reports/roadmap-gantt.html",
    "06-reports/relationships-matrix.html",
    "06-reports/geo-deal-overview.html",
    # 01-intel
    "01-intel/ppf-governance.html",
    "01-intel/stakeholder-map.html",
    # 02-entity
    "02-entity/entity-graph.html",
    "02-entity/parcel-map.html",
    "02-entity/entity-offices-map.html",
    "02-entity/geo-parcel-map.html",
    # 03-financial
    "03-financial/bond-stack.html",
    "03-financial/tax-calculator.html",
    # 04-legal
    "04-legal/dancore-timeline.html",
    # 08-comms-templates
    "08-comms-templates/comms-hub.html",
]

# Files that exist (used to validate link targets)
EXISTING_FILES: set[str] = set()


def discover_files() -> None:
    for p in ROOT.rglob("*"):
        if p.is_file():
            rel = str(p.relative_to(ROOT)).replace("\\", "/")
            EXISTING_FILES.add(rel)


def rel_prefix(html_rel: str) -> str:
    depth = html_rel.count("/")
    return "./" if depth == 0 else "../" * depth


def reader_link(prefix: str, target: str, fragment: str = "") -> str:
    """Build a reader.html?file=… link with prefix."""
    if fragment:
        return f"{prefix}reader.html?file={quote(target, safe='/.-_')}{fragment}"
    return f"{prefix}reader.html?file={quote(target, safe='/.-_')}"


# Reference patterns. Each entry returns (matched_text, href) or None to skip.
# Order matters — longer/more specific patterns first.

RF_PATH = "RED-FLAGS.md"  # at workspace root

# Czech statute references → relevant memo / template
STATUTE_TARGETS = {
    "§23a ZoB":      ("08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md", ""),
    "§ 23a ZoB":     ("08-comms-templates/CNB-23A-CLEARANCE-REQUEST.md", ""),
    "§19 ZDP":       ("03-financial/TAX-STRUCTURE-MEMO.md", ""),
    "§ 19 ZDP":      ("03-financial/TAX-STRUCTURE-MEMO.md", ""),
    "§56 ZDPH":      ("03-financial/TAX-STRUCTURE-MEMO.md", ""),
    "§ 56 ZDPH":     ("03-financial/TAX-STRUCTURE-MEMO.md", ""),
    "§21a ZoÚ":      ("03-financial/sbirka-listin-audit.md", ""),
    "§ 21a ZoÚ":     ("03-financial/sbirka-listin-audit.md", ""),
    "§21 ZoDluh":    ("08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md", ""),
    "§ 21 ZoDluh":   ("08-comms-templates/BONDHOLDER-CONSENT-SOLICITATION.md", ""),
    "§21a":          ("03-financial/sbirka-listin-audit.md", ""),
    "§ 21a":         ("03-financial/sbirka-listin-audit.md", ""),
}

# IČO → context file. For unknown IČO, fall back to entity-graph.html
ICO_TARGETS = {
    "27825981": ("02-entity/confirmed-entities.md", ""),  # Nový Zeleneč a.s.
    "10800123": ("02-entity/entity-structure.md", ""),    # RD Rýmařov Invest III. alpha
    "10978216": ("02-entity/confirmed-entities.md", ""),  # PROGRESUS Group
    "09932836": ("02-entity/confirmed-entities.md", ""),  # PROGRESUS invest holding
    "13995758": ("02-entity/confirmed-entities.md", ""),  # PROGRESUS invest holding core
    "21515841": ("02-entity/confirmed-entities.md", ""),  # PROGRESUS RD Rýmařov III
    "17053161": ("02-entity/confirmed-entities.md", ""),  # PROGRESUS RD Rýmařov
    "09963758": ("02-entity/confirmed-entities.md", ""),  # RD Rýmařov Invest Holding
    "27890104": ("02-entity/confirmed-entities.md", ""),  # Nuka Estates v likvidaci
    "14148978": ("02-entity/entity-structure.md", ""),    # PROGRESUS Developments
    "24654744": ("01-intel/ppf-dd-profile.md", ""),       # PPF reality 2 (kupující SPV)
    "24225657": ("01-intel/ppf-dd-profile.md", ""),
    "24908151": ("01-intel/ppf-dd-profile.md", ""),
    "24908487": ("01-intel/ppf-dd-profile.md", ""),
    "25099345": ("01-intel/ppf-dd-profile.md", ""),
    "27638987": ("01-intel/ppf-dd-profile.md", ""),
    "29030072": ("01-intel/ppf-dd-profile.md", ""),
    "10907718": ("01-intel/ppf-dd-profile.md", ""),
    "19696477": ("01-intel/ppf-dd-profile.md", ""),
}


def build_patterns(prefix: str) -> list[tuple[re.Pattern, callable]]:
    pats: list[tuple[re.Pattern, callable]] = []

    # 1) Bold MD path references like **04-legal/DANCORE-FORENSIC-DOSSIER.md**
    # Match path like dir/file.md (exclude trailing punctuation)
    md_path_re = re.compile(
        r"\b((?:[\w\-]+/)+[A-Z0-9][\w\-\.]*\.md)\b",
        re.IGNORECASE,
    )

    def md_path_handler(m: re.Match) -> str | None:
        path = m.group(1)
        if path in EXISTING_FILES:
            return reader_link(prefix, path)
        return None

    pats.append((md_path_re, md_path_handler))

    # 2) Bare root-level .md filenames (no dir): RED-FLAGS.md, MASTER-FINDINGS.md, …
    root_md_re = re.compile(r"\b([A-Z][A-Z0-9\-]+\.md)\b")

    def root_md_handler(m: re.Match) -> str | None:
        path = m.group(1)
        if path in EXISTING_FILES:
            return reader_link(prefix, path)
        return None

    pats.append((root_md_re, root_md_handler))

    # 3) RF-XX references → link to RED-FLAGS.md#rf-XX (lowercase fragment)
    rf_re = re.compile(r"\bRF-(\d+)\b")

    def rf_handler(m: re.Match) -> str | None:
        if RF_PATH not in EXISTING_FILES:
            return None
        return reader_link(prefix, RF_PATH, fragment=f"#rf-{m.group(1)}")

    pats.append((rf_re, rf_handler))

    # 4) HTML dashboards: e.g., 06-reports/red-flags-dashboard.html
    html_path_re = re.compile(
        r"\b((?:[\w\-]+/)+[a-z][\w\-]+\.html)\b"
    )

    def html_path_handler(m: re.Match) -> str | None:
        path = m.group(1)
        if path in EXISTING_FILES:
            return f"{prefix}{path}"
        return None

    pats.append((html_path_re, html_path_handler))

    # 5) Statute / paragraph references
    statute_re = re.compile(
        r"(§\s?(?:23a\s+ZoB|19\s+ZDP|56\s+ZDPH|21a\s+ZoÚ|21\s+ZoDluh|21a))",
        re.IGNORECASE,
    )

    def statute_handler(m: re.Match) -> str | None:
        # Normalize the match key
        raw = m.group(1)
        # Try exact key, then a normalized variant
        target = STATUTE_TARGETS.get(raw)
        if not target:
            # Normalize: remove extra spaces
            norm = re.sub(r"\s+", " ", raw).strip()
            target = STATUTE_TARGETS.get(norm) or STATUTE_TARGETS.get(norm.replace(" ", ""))
        if target and target[0] in EXISTING_FILES:
            return reader_link(prefix, target[0], fragment=target[1])
        return None

    pats.append((statute_re, statute_handler))

    # 6) IČO numbers (8-digit, possibly preceded by "IČO" or standalone)
    ico_re = re.compile(r"\bIČO\s*(\d{8})\b|\b(\d{8})\b(?=\s*(?:·|—|\.|,|\)|$|\s+[A-ZÁ-Ž]))")

    def ico_handler(m: re.Match) -> str | None:
        ico = m.group(1) or m.group(2)
        if not ico:
            return None
        target = ICO_TARGETS.get(ico)
        if target and target[0] in EXISTING_FILES:
            return reader_link(prefix, target[0])
        # Fall back to entity-graph.html for any 8-digit IČO
        if "02-entity/entity-graph.html" in EXISTING_FILES:
            return f"{prefix}02-entity/entity-graph.html"
        return None

    pats.append((ico_re, ico_handler))

    # 7) Court spis: "30 Co 228/2019-1538" → DANCORE dossier
    spis_re = re.compile(r"\b(\d{1,3}\s+(?:Co|C|Cm|Sm|To|Tdo|EPR)\s+\d+/\d{4}(?:-\d+)?)\b")

    def spis_handler(m: re.Match) -> str | None:
        if "04-legal/DANCORE-FORENSIC-DOSSIER.md" in EXISTING_FILES:
            return reader_link(prefix, "04-legal/DANCORE-FORENSIC-DOSSIER.md")
        return None

    pats.append((spis_re, spis_handler))

    return pats


# We need to skip:
# - text inside <script>, <style>
# - text inside attributes (href=, etc.)
# - text already inside an <a> element
# - text inside <code> (preserve technical literals as-is)
SKIP_BLOCKS = re.compile(
    r"(<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)",
    re.IGNORECASE | re.DOTALL,
)


def linkify_text_node(text: str, patterns: list[tuple[re.Pattern, callable]]) -> str:
    """Apply all patterns to a plain text segment."""
    # We process patterns sequentially, but to avoid double-wrapping we mark
    # already-linked spans by replacing with sentinel.
    SENT_OPEN = "\x01LNK_OPEN\x01"
    SENT_CLOSE = "\x01LNK_CLOSE\x01"

    for pat, handler in patterns:
        def _sub(m: re.Match) -> str:
            href = handler(m)
            if href is None:
                return m.group(0)
            return f'{SENT_OPEN}{href}{SENT_CLOSE}{m.group(0)}{SENT_OPEN}/a{SENT_CLOSE}'

        text = pat.sub(_sub, text)

    text = text.replace(
        f"{SENT_OPEN}/a{SENT_CLOSE}",
        '</a>',
    )
    text = re.sub(
        re.escape(SENT_OPEN) + r"([^\x01]+)" + re.escape(SENT_CLOSE),
        r'<a class="dd-xref" href="\1">',
        text,
    )
    return text


# Tokenizer that walks the HTML and only linkifies text segments outside
# protected zones.
TOKEN_RE = re.compile(
    r"(<script\b[^>]*>.*?</script>"
    r"|<style\b[^>]*>.*?</style>"
    r"|<a\b[^>]*>.*?</a>"
    r"|<code\b[^>]*>.*?</code>"
    r"|<kbd\b[^>]*>.*?</kbd>"
    r"|<pre\b[^>]*>.*?</pre>"
    r"|<!--.*?-->"
    r"|<[^>]+>"
    r")",
    re.DOTALL | re.IGNORECASE,
)


def linkify_html(html: str, patterns) -> str:
    out = []
    pos = 0
    for m in TOKEN_RE.finditer(html):
        # Text before token: linkify
        text = html[pos:m.start()]
        if text:
            out.append(linkify_text_node(text, patterns))
        # The token itself: pass through unchanged
        out.append(m.group(0))
        pos = m.end()
    if pos < len(html):
        out.append(linkify_text_node(html[pos:], patterns))
    return "".join(out)


def process_file(rel_path: str) -> bool:
    fp = ROOT / rel_path
    if not fp.exists():
        return False
    html = fp.read_text(encoding="utf-8")
    prefix = rel_prefix(rel_path)
    patterns = build_patterns(prefix)
    new_html = linkify_html(html, patterns)
    if new_html == html:
        return False
    fp.write_text(new_html, encoding="utf-8")
    return True


def main() -> int:
    discover_files()
    print(f"[cross-link] discovered {len(EXISTING_FILES)} files in workspace")
    changed = 0
    for d in DASHBOARDS:
        if process_file(d):
            print(f"  ✓ {d}")
            changed += 1
        else:
            print(f"  · {d} (no change)")
    print(f"[cross-link] {changed}/{len(DASHBOARDS)} dashboards updated")
    return 0


if __name__ == "__main__":
    sys.exit(main())
