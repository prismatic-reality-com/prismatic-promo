#!/usr/bin/env python3
"""
Build `rendered/all-in-one.html` — single-file portable bundle.

Concatenates the five pre-rendered DD docs into one self-contained HTML with
inlined `styles.css`. Each major doc starts on a new printed page and carries
a classification header. Designed to be emailable and print-clean.

Run:  python3 rendered/build_all_in_one.py
"""
import re
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
ORDER = [
    ('one-pager.html',     'Manažerský one-pager',     'v1.0'),
    ('red-flags.html',     'Report rizikových signálů', 'v1.0'),
    ('playbook.html',      'PPF Playbook',             'v2.0'),
    ('master-report.html', 'Hlavní DD report',         'v1.0'),
    ('valuation.html',     'Memo obhajoby ocenění',    'v1.0'),
]

ARTICLE_RE = re.compile(r'<article\b[^>]*>(.*?)</article>', re.DOTALL)
TOC_ASIDE_RE = re.compile(r'<aside class="toc-sidebar">.*?</aside>', re.DOTALL)
LAYOUT_OPEN_RE = re.compile(r'<div class="layout-with-toc">', re.DOTALL)
LAYOUT_CLOSE_RE = re.compile(r'</div>\s*</body>', re.DOTALL)


def extract_article(html: str, title: str) -> str:
    """Pull the <article>…</article> block and wrap with a section divider."""
    m = ARTICLE_RE.search(html)
    if not m:
        raise RuntimeError(f'No <article> in source for {title}')
    body = m.group(1)
    # Rewrite relative reader links (../reader.html?file=X) to keep them
    # working if the file is emailed next to the workspace, or anchor-only if
    # the reader is unavailable. Leave them intact; recipients can click.
    return body


def rewrite_heading_ids(body: str, prefix: str) -> str:
    """Make anchor IDs unique per-doc so TOC + deep-links don't collide."""
    # id="xxx" -> id="prefix-xxx"
    body = re.sub(
        r'(<[^>]+\s)id="([^"]+)"',
        lambda m: f'{m.group(1)}id="{prefix}-{m.group(2)}"',
        body,
    )
    # href="#xxx" -> href="#prefix-xxx"
    body = re.sub(
        r'href="#([^"]+)"',
        lambda m: f'href="#{prefix}-{m.group(1)}"',
        body,
    )
    return body


def doc_cover(title: str, version: str, slug: str, idx: int, total: int) -> str:
    return (
        f'<section class="aio-divider" id="{slug}-cover">'
        f'<div class="aio-stamp">Project Mycelium · DD na straně prodávajícího · {idx}/{total}</div>'
        f'<h1 class="aio-doc-title">{title}</h1>'
        f'<p class="aio-doc-sub">{version} · 2026-04-21 · DŮVĚRNÉ</p>'
        f'</section>\n'
    )


def main():
    styles = (HERE / 'styles.css').read_text(encoding='utf-8')
    total = len(ORDER)
    today = date.today().isoformat()

    # Table of contents
    toc_links = []
    for i, (_, title, version) in enumerate(ORDER, 1):
        slug = Path(_).stem
        toc_links.append(
            f'<li><a href="#{slug}-cover"><span class="aio-toc-num">{i:02d}</span>'
            f'<span class="aio-toc-t">{title}</span>'
            f'<span class="aio-toc-v">{version}</span></a></li>'
        )

    cover = f'''<section class="aio-cover">
  <div class="aio-bar">DŮVĚRNÉ · PROJECT MYCELIUM · PODPORA DD NA STRANĚ PRODÁVAJÍCÍHO</div>
  <h1 class="aio-title">Project Mycelium</h1>
  <p class="aio-subtitle">Due diligence na straně prodávajícího — sloučený dokumentový balíček</p>
  <div class="aio-meta">
    <div><span class="aio-lbl">Cíl</span><span class="aio-val">Nový Zeleneč a.s. — greenfield 42 ha</span></div>
    <div><span class="aio-lbl">Protistrana</span><span class="aio-val">PPF reality 2 s.r.o. (IČO 24654744)</span></div>
    <div><span class="aio-lbl">Struktura</span><span class="aio-val">Share deal na RD Rýmařov Invest III. alpha s.r.o.</span></div>
    <div><span class="aio-lbl">Ocenění</span><span class="aio-val">Kotva 6,5 · Cíl 5–6 · Min 3,7 mld. Kč</span></div>
    <div><span class="aio-lbl">Datum balíčku</span><span class="aio-val">{today}</span></div>
    <div><span class="aio-lbl">Dokumenty</span><span class="aio-val">{total} · jeden přenosný soubor</span></div>
  </div>
  <nav class="aio-toc">
    <h2>Obsah</h2>
    <ol>{"".join(toc_links)}</ol>
  </nav>
  <p class="aio-note">HTML balíček v jednom souboru — otevřete lokálně nebo přepošlete jako e-mailovou přílohu. Každý dokument níže je předem renderovaný pro tisk a offline čtení.</p>
</section>
'''

    sections = []
    for idx, (fname, title, version) in enumerate(ORDER, 1):
        src = (HERE / fname).read_text(encoding='utf-8')
        body = extract_article(src, title)
        slug = Path(fname).stem
        body = rewrite_heading_ids(body, slug)
        sections.append(doc_cover(title, version, slug, idx, total))
        sections.append(f'<section class="aio-doc aio-{slug}">\n{body}\n</section>\n')

    aio_css = '''
/* =============================================================
   all-in-one bundle overrides (prepended to styles.css)
   ============================================================= */
.aio-cover{max-width:900px;margin:0 auto;padding:48px 40px 64px;page-break-after:always;}
.aio-bar{background:var(--crit);color:#fff;padding:8px 14px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-align:center;margin-bottom:40px;}
.aio-title{font-size:48px;line-height:1.1;margin:0 0 8px;font-weight:700;}
.aio-subtitle{font-size:18px;color:var(--ink-soft);margin:0 0 32px;}
.aio-meta{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px;border-top:2px solid var(--ink);border-bottom:2px solid var(--ink);padding:16px 0;margin-bottom:32px;}
.aio-meta>div{display:flex;flex-direction:column;gap:2px;font-size:13px;}
.aio-lbl{text-transform:uppercase;letter-spacing:.08em;font-size:10px;color:var(--ink-soft);}
.aio-val{font-family:var(--mono);color:var(--ink);}
.aio-toc{border:1px solid var(--rule);border-left:4px solid var(--accent);padding:20px 24px;margin-bottom:24px;}
.aio-toc h2{font-size:18px;margin:0 0 12px;}
.aio-toc ol{list-style:none;padding:0;margin:0;}
.aio-toc li{border-bottom:1px dashed var(--rule);}
.aio-toc li:last-child{border-bottom:none;}
.aio-toc a{display:flex;gap:14px;align-items:baseline;padding:8px 0;text-decoration:none;color:var(--ink);}
.aio-toc a:hover{color:var(--crit);}
.aio-toc-num{font-family:var(--mono);color:var(--accent);font-size:12px;width:24px;}
.aio-toc-t{flex:1;font-weight:500;}
.aio-toc-v{font-family:var(--mono);font-size:11px;color:var(--ink-soft);}
.aio-note{font-size:12px;color:var(--ink-soft);border-top:1px solid var(--rule);padding-top:12px;}
.aio-divider{page-break-before:always;padding:48px 40px;background:var(--ink);color:#fff;max-width:900px;margin:0 auto;border-radius:0;}
.aio-stamp{font-family:var(--mono);font-size:10px;letter-spacing:.12em;opacity:.75;margin-bottom:8px;}
.aio-doc-title{color:#fff;font-size:32px;margin:0 0 6px;}
.aio-doc-sub{color:#cbd5e1;font-family:var(--mono);font-size:12px;margin:0;}
.aio-doc{max-width:900px;margin:0 auto;padding:32px 40px;page-break-inside:auto;}
/* Hide interactive toolbars when embedded */
.aio-doc .toolbar,.aio-doc .no-print{display:none!important;}
/* Reset any inherited layouts that depended on columns */
.aio-doc .layout-with-toc,.aio-doc .toc-sidebar,.aio-doc .pricing-sidebar{display:none;}
@media print{
  .aio-cover,.aio-divider,.aio-doc{max-width:none;padding:18mm;}
  .aio-divider{background:#000;}
  a[href^="#"]::after,a[href]::after{content:"";}
}
'''

    footer = (
        f'<footer class="aio-foot">'
        f'Project Mycelium · DD na straně prodávajícího · Sloučený dokument · '
        f'Vygenerováno {today} · Able Group'
        f'</footer>'
    )

    html = f'''<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Project Mycelium DD — sloučený dokument</title>
<meta name="robots" content="noindex,nofollow">
<meta name="generator" content="rendered/build_all_in_one.py">
<style>
{styles}
{aio_css}
.aio-foot{{max-width:900px;margin:32px auto 0;padding:16px 40px;border-top:1px solid var(--rule);font-family:var(--mono);font-size:11px;color:var(--ink-soft);text-align:center;}}
</style>
</head>
<body>
{cover}
{"".join(sections)}
{footer}
</body>
</html>
'''
    out = HERE / 'all-in-one.html'
    out.write_text(html, encoding='utf-8')
    size = out.stat().st_size
    print(f'Wrote {out}')
    print(f'Size: {size:,} bytes ({size/1024:.1f} KB, {size/1024/1024:.2f} MB)')


if __name__ == '__main__':
    main()
