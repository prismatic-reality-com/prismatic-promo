#!/usr/bin/env python3
"""
build-entity-index.py
=====================
Scans every Markdown file in the workspace for occurrences of a curated set
of entities (companies, IČOs, key persons, projects) and emits
``_assets/entity-mentions.json``:

    {
      "entities": {
        "PPF reality 2 s.r.o.": [
          {"path": "01-intel/README.md", "count": 5,
           "title": "...", "snippet": "..."},
          ...
        ],
        ...
      },
      "files": {
        "01-intel/README.md": [
          {"entity": "PPF", "count": 12},
          {"entity": "Progresus", "count": 7},
          ...
        ]
      },
      "meta": {
        "generated": "2026-04-27T...",
        "entity_count": N,
        "file_count": M,
        "total_mentions": K
      }
    }

The script is idempotent — run it any time to refresh the index:

    python3 _assets/build-entity-index.py
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
SKIP_DIRS = {"_assets", "rendered", "raw", "raw-cuzk", ".git", "node_modules"}
OUTPUT = ROOT / "_assets" / "entity-mentions.json"

# ---------------------------------------------------------------------------
# Curated entity list
# ---------------------------------------------------------------------------
# Each entry is (display_id, [aliases...]).  display_id is what the UI shows
# and what the URLs use (?focus=, ?highlight=).  Aliases include both the
# canonical name and shorter forms used in the prose.
# Order matters: longer / more specific names first so we do not double-count
# (we mask matched ranges before scanning the next entity).
ENTITIES: List[Tuple[str, List[str]]] = [
    # -- Holdings & key Progresus group entities ----------------------------
    ("PROGRESUS Group a.s.", ["PROGRESUS Group a.s.", "PROGRESUS Group"]),
    ("PROGRESUS invest holding s.r.o.",
        ["PROGRESUS invest holding s.r.o.", "PROGRESUS invest holding"]),
    ("Progresus invest holding core a.s.",
        ["Progresus invest holding core a.s.", "Progresus invest holding core"]),
    ("Progresus Invest Holding a.s.",
        ["Progresus Invest Holding a.s."]),
    ("RD Rýmařov Invest Holding a.s.",
        ["RD Rýmařov Invest Holding a.s.", "RD Rýmařov Invest Holding"]),
    ("PROGRESUS Gardens a.s.", ["PROGRESUS Gardens a.s.", "PROGRESUS Gardens"]),
    ("PROGRESUS IT s.r.o.", ["PROGRESUS IT s.r.o.", "PROGRESUS IT"]),
    ("PROGRESUS Marketing s.r.o.",
        ["PROGRESUS Marketing s.r.o.", "PROGRESUS Marketing"]),
    ("PROGRESUS Service center s.r.o.",
        ["PROGRESUS Service center s.r.o.", "PROGRESUS Service center"]),
    ("PROGRESUS R & D Alpha s.r.o.",
        ["PROGRESUS R & D Alpha s.r.o.", "PROGRESUS R & D Alpha",
         "PROGRESUS R&D Alpha"]),
    ("PROGRESUS Development Services s.r.o.",
        ["PROGRESUS Development Services s.r.o.",
         "PROGRESUS Development Services"]),
    ("PROGRESUS Developments s.r.o.",
        ["PROGRESUS Developments s.r.o.", "PROGRESUS Developments"]),
    ("PROGRESUS Developments Delta I s.r.o.",
        ["PROGRESUS Developments Delta I s.r.o.",
         "PROGRESUS Developments Delta I"]),
    ("PROGRESUS Development Acquisitions s.r.o.",
        ["PROGRESUS Development Acquisitions s.r.o.",
         "PROGRESUS Development Acquisitions"]),
    ("PROGRESUS Factories Acquisitions Alfa s.r.o.",
        ["PROGRESUS Factories Acquisitions Alfa s.r.o.",
         "PROGRESUS Factories Acquisitions Alfa"]),
    ("PROGRESUS RD Rýmařov IV a.s.",
        ["PROGRESUS RD Rýmařov IV a.s.", "PROGRESUS RD Rýmařov IV"]),
    ("PROGRESUS RD Rýmařov III a.s.",
        ["PROGRESUS RD Rýmařov III a.s.", "PROGRESUS RD Rýmařov III"]),
    ("PROGRESUS RD Rýmařov a.s.",
        ["PROGRESUS RD Rýmařov a.s."]),
    ("RD Rýmařov Invest Develop a.s.",
        ["RD Rýmařov Invest Develop a.s.", "RD Rýmařov Invest Develop"]),
    ("Nový Zeleneč a.s.",
        ["Nový Zeleneč a.s.", "Nový Zeleneč"]),
    ("RD Rýmařov Invest III. alpha s.r.o.",
        ["RD Rýmařov Invest III. alpha s.r.o.",
         "RD Rýmařov Invest III. alpha"]),
    ("Inženýrské a technické služby Mstětice s.r.o.",
        ["Inženýrské a technické služby Mstětice s.r.o.",
         "Inženýrské a technické služby Mstětice"]),
    ("Nuka Estates s.r.o.",
        ["Nuka Estates s.r.o. v likvidaci", "Nuka Estates s.r.o.",
         "Nuka Estates"]),
    ("Ravantino Group", ["Ravantino Group", "Ravantino"]),
    ("MARSEA MIA s.r.o.", ["MARSEA MIA s.r.o.", "MARSEA MIA"]),
    ("Vitrablok", ["Vitrablok", "Seves Glass Block"]),
    ("RD Rýmařov", ["RD Rýmařov"]),  # operational entity / brand

    # -- PPF group ---------------------------------------------------------
    ("PPF reality 2 s.r.o.",
        ["PPF reality 2 s.r.o.", "PPF reality 2"]),
    ("PPF a.s.", ["PPF a.s.", "PPF group", "PPF Group"]),
    ("PPF Real Estate Holding",
        ["PPF Real Estate Holding B.V.", "PPF Real Estate Holding"]),
    ("PPF Banka", ["PPF banka", "PPF Banka"]),
    ("PPF", ["PPF"]),

    # -- DANCORE family ----------------------------------------------------
    ("DANCORE LLC", ["DANCORE LLC", "Dancore LLC"]),
    ("DANCORE", ["DANCORE", "Dancore"]),

    # -- Karlin Group / parallel bidder ------------------------------------
    ("Karlin Group", ["Karlin Group", "Karlín Group"]),

    # -- Project codes -----------------------------------------------------
    ("CASPER", ["CASPER"]),
    ("RONDAX", ["RONDAX"]),
    ("HP (Hospodářské Pozemky)",
        ["Hospodářské Pozemky", "HP sharing ban", "HP (Hospodářské Pozemky)"]),

    # -- Key persons -------------------------------------------------------
    ("Petr Kellner", ["Petr Kellner"]),
    ("Renáta Kellnerová", ["Renáta Kellnerová", "Renata Kellnerova"]),
    ("Josef Lébr", ["Josef Lébr", "Josef Lebr"]),
    ("Pavlína Zdařilová", ["Pavlína Zdařilová", "Pavlina Zdarilova"]),
    ("Jan Vlček", ["Jan Vlček"]),
    ("Karel Komárek", ["Karel Komárek"]),

    # -- Quinlan / luxembourg ----------------------------------------------
    ("Quinlan Private Residential II",
        ["Quinlan Private Residential II Reporting S.à.r.l.",
         "Quinlan Private Residential II"]),

    # -- Regulators / institutions -----------------------------------------
    ("ČNB", ["Česká národní banka", "ČNB"]),
    ("ÚOHS", ["ÚOHS", "Úřad pro ochranu hospodářské soutěže"]),
    ("ČÚZK", ["ČÚZK", "Český úřad zeměměřický a katastrální"]),
    ("ARES", ["ARES"]),
    ("Hlídač státu", ["Hlídač státu"]),
]

# IČO numbers — also worth indexing as separate "entities".
ICO_LIST: List[str] = [
    "27825981", "10800123", "10978216", "09932836", "13995758",
    "21515841", "17053161", "09963758", "27890104", "14148978",
    "24654744", "24225657", "24908151", "24908487", "25099345",
    "27638987", "29030072", "10907718", "19696477", "10977414",
    "10916644", "10958452", "13956728", "13957384", "14270447",
    "26861054", "14295521", "18031919", "18031862", "10745246",
    "03454029",
]
for ico in ICO_LIST:
    ENTITIES.append((f"IČO {ico}", [f"IČO {ico}", ico]))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def iter_md_files() -> List[Path]:
    files: List[Path] = []
    for p in ROOT.rglob("*.md"):
        rel = p.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        files.append(p)
    return sorted(files)


def first_heading(text: str) -> str:
    for line in text.splitlines():
        s = line.strip()
        if s.startswith("# "):
            return s.lstrip("# ").strip()
    return ""


def make_snippet(text: str, idx: int, span: int = 90) -> str:
    start = max(0, idx - span)
    end = min(len(text), idx + span)
    snip = text[start:end].replace("\n", " ").replace("\r", " ")
    snip = re.sub(r"\s+", " ", snip).strip()
    if start > 0:
        snip = "…" + snip
    if end < len(text):
        snip = snip + "…"
    return snip


def build_pattern(alias: str) -> re.Pattern:
    """Word-boundary, case-insensitive pattern for an alias."""
    escaped = re.escape(alias)
    # Use lookarounds instead of \b because aliases may end in punctuation
    # (".", ")") which breaks default word boundaries.
    pattern = r"(?<![A-Za-z0-9_])" + escaped + r"(?![A-Za-z0-9_])"
    return re.compile(pattern, re.IGNORECASE)


def scan_file(text: str, patterns: List[Tuple[str, List[re.Pattern]]]
              ) -> Dict[str, Tuple[int, int]]:
    """
    For each entity, count non-overlapping occurrences in `text` and remember
    the index of the first hit (for snippet generation).  Mask matched ranges
    so that "PPF reality 2 s.r.o." does not also count as "PPF".
    """
    masked = bytearray(b"\x00" * len(text))  # 0 = free, 1 = consumed
    results: Dict[str, Tuple[int, int]] = {}

    for display, regexes in patterns:
        count = 0
        first_idx = -1
        for rgx in regexes:
            for m in rgx.finditer(text):
                start, end = m.start(), m.end()
                # Skip if any byte in the range is already consumed.
                if any(masked[i] for i in range(start, end)):
                    continue
                count += 1
                if first_idx == -1:
                    first_idx = start
                for i in range(start, end):
                    masked[i] = 1
        if count:
            results[display] = (count, first_idx)
    return results


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    md_files = iter_md_files()
    print(f"[entity-index] scanning {len(md_files)} markdown files…")

    # Pre-compile patterns once.
    patterns: List[Tuple[str, List[re.Pattern]]] = [
        (display, [build_pattern(a) for a in aliases])
        for display, aliases in ENTITIES
    ]

    by_entity: Dict[str, List[Dict]] = {display: [] for display, _ in ENTITIES}
    by_file: Dict[str, List[Dict]] = {}
    total_mentions = 0

    for path in md_files:
        try:
            text = path.read_text(encoding="utf-8", errors="replace")
        except OSError as exc:
            print(f"[entity-index] WARN: cannot read {path}: {exc}",
                  file=sys.stderr)
            continue
        rel = str(path.relative_to(ROOT)).replace("\\", "/")
        title = first_heading(text) or rel
        hits = scan_file(text, patterns)
        if not hits:
            continue
        per_file_list: List[Dict] = []
        for display, (count, first_idx) in hits.items():
            snippet = make_snippet(text, first_idx) if first_idx >= 0 else ""
            by_entity[display].append({
                "path": rel,
                "count": count,
                "title": title,
                "snippet": snippet,
            })
            per_file_list.append({"entity": display, "count": count})
            total_mentions += count
        per_file_list.sort(key=lambda r: r["count"], reverse=True)
        by_file[rel] = per_file_list

    # Sort each entity's list by count desc, drop empty entities.
    by_entity = {
        k: sorted(v, key=lambda r: r["count"], reverse=True)
        for k, v in by_entity.items() if v
    }

    payload = {
        "meta": {
            "generated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "entity_count": len(by_entity),
            "file_count": len(by_file),
            "total_mentions": total_mentions,
            "scanned_files": len(md_files),
        },
        "entities": by_entity,
        "files": by_file,
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=False),
        encoding="utf-8",
    )

    print(f"[entity-index] entities indexed : {payload['meta']['entity_count']}")
    print(f"[entity-index] files with hits  : {payload['meta']['file_count']}")
    print(f"[entity-index] total mentions    : {payload['meta']['total_mentions']}")
    print(f"[entity-index] output            : {OUTPUT.relative_to(ROOT)}")
    print(f"[entity-index] output size       : {OUTPUT.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    sys.exit(main())
