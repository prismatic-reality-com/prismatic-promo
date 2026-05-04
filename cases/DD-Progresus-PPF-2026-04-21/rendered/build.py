#!/usr/bin/env python3
"""
DD Workspace static HTML renderer.

Renders 5 critical DD markdown documents into presentation-quality HTML,
plus an index page. Output goes alongside this script.

Engine: python-markdown (stdlib-friendly), with extensions:
  - tables, fenced_code, footnotes, attr_list, sane_lists, toc, def_list
"""
import os
import re
import sys
from datetime import date
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
OUT = Path(__file__).resolve().parent

MD_EXT = [
    'tables', 'fenced_code', 'footnotes', 'attr_list',
    'sane_lists', 'toc', 'def_list', 'admonition', 'meta',
]

EXT_CONFIG = {
    'toc': {'permalink': False, 'toc_depth': '2-4'},
}


def render_md(text: str) -> str:
    md = markdown.Markdown(extensions=MD_EXT, extension_configs=EXT_CONFIG)
    text = strip_backlinks(text)
    return md.convert(text)


def strip_backlinks(t: str) -> str:
    return re.sub(
        r'<!-- BACKLINKS_START -->.*?<!-- BACKLINKS_END -->',
        '',
        t,
        flags=re.DOTALL,
    ).strip()


def rewrite_md_links(html: str) -> str:
    """Convert .md links to ../reader.html?file=... for cross-document nav."""
    def _sub(m):
        file = m.group(1)
        hash_part = m.group(2) or ''
        if file.startswith('http'):
            return m.group(0)
        normalized = file.lstrip('./')
        return f'href="../reader.html?file={normalized}{hash_part}"'
    return re.sub(r'href="([^"]+\.md)(#[^"]*)?"', _sub, html)


def extract_toc(html: str):
    """Pull out h2 + h3 headings with their anchor ids."""
    toc = []
    for m in re.finditer(r'<h([23])([^>]*)>(.*?)</h\1>', html, flags=re.DOTALL):
        level = int(m.group(1))
        attrs = m.group(2)
        inner = re.sub(r'<[^>]+>', '', m.group(3)).strip()
        id_match = re.search(r'id="([^"]+)"', attrs)
        if id_match:
            toc.append((level, id_match.group(1), inner))
    return toc


def toc_html(toc, title: str) -> str:
    if not toc:
        return ''
    items = ''.join(
        f'<li class="lvl-{lvl}"><a href="#{anchor}">{text}</a></li>'
        for lvl, anchor, text in toc
    )
    return (
        f'<aside class="toc-sidebar">'
        f'<div class="toc-title">{title}</div>'
        f'<ul>{items}</ul></aside>'
    )


def enhance_red_flags(html: str) -> str:
    """Severity badges + per-RF cards.

    RED-FLAGS.md structure: `## SEVERITY HEADING` group with `### RF-N: ...` children.
    We walk top-down, tracking the current severity bucket from the h2, and wrap
    each RF- h3 block as a card.
    """
    # Inline severity badges (only in table cells / prose, not in headings we'll
    # re-style later). Simple pass — avoid replacing inside already-created
    # badges.
    sev_class = {
        'KRITICKÉ': 'crit', 'KRITICKÁ': 'crit', 'KRITICKÝ': 'crit', 'KRITICKÝCH': 'crit',
        'VYSOKÉ': 'high', 'VYSOKÁ': 'high', 'VYSOKÝ': 'high', 'VYSOKÝCH': 'high',
        'STŘEDNÍ': 'med', 'STŘEDNÍCH': 'med',
        'NÍZKÉ': 'low', 'NÍZKÁ': 'low', 'NÍZKÝ': 'low', 'NÍZKÝCH': 'low',
        'CRITICAL': 'crit', 'HIGH': 'high', 'MEDIUM': 'med', 'LOW': 'low',
    }

    def inline_badge(m):
        sev = m.group(1)
        cls = sev_class.get(sev, 'med')
        return f'<span class="badge-sev {cls}">{sev}</span>'

    html = re.sub(
        r'\b(KRITICK[ÉÁÝ]|KRITICKÝCH|VYSOK[ÉÁÝ]|VYSOKÝCH|STŘEDNÍ|STŘEDNÍCH|NÍZK[ÉÁÝ]|NÍZKÝCH|CRITICAL|HIGH|MEDIUM|LOW)\b',
        inline_badge,
        html,
    )

    # Split by h2 into buckets; each bucket inherits severity from heading text
    sev_map = [
        ('crit', ['kritick', 'critical', '🔴']),
        ('high', ['vysok', 'high', '🟠']),
        ('med', ['střední', 'stredni', 'medium', '🟡']),
        ('low', ['vyřešen', 'vyresen', 'degradovan', 'nízk', 'nizk',
                 'resolved', 'downgraded', 'low', '🟢']),
    ]

    def detect_sev(heading_text: str) -> str:
        t = heading_text.lower()
        for sev, kws in sev_map:
            if any(k in t for k in kws):
                return sev
        return 'med'

    # Wrap each ### RF- section. We do a two-phase approach: first detect
    # the severity from the most-recent h2 before each h3.
    out = []
    pos = 0
    cur_sev = 'med'

    h_re = re.compile(
        r'<(h2|h3)([^>]*)>(.*?)</\1>',
        flags=re.DOTALL,
    )
    # Build a list of (start, end, tag, attrs, inner) for all h2/h3
    matches = list(h_re.finditer(html))
    # Add sentinel to capture trailing body
    segments = []
    for i, m in enumerate(matches):
        end_body = matches[i + 1].start() if i + 1 < len(matches) else len(html)
        segments.append((m.start(), m.end(), end_body, m.group(1), m.group(2), m.group(3)))

    # Build output by slicing and rewriting
    last = 0
    for start, hdr_end, body_end, tag, attrs, inner in segments:
        out.append(html[last:start])
        inner_plain = re.sub(r'<[^>]+>', '', inner).strip()
        if tag == 'h2':
            cur_sev = detect_sev(inner_plain)
            out.append(html[start:hdr_end])
            last = hdr_end
        elif tag == 'h3' and inner_plain.startswith('RF-'):
            body = html[hdr_end:body_end]
            out.append(
                f'<section class="rf-card {cur_sev}">'
                f'<h3{attrs}>{inner}</h3>{body}</section>'
            )
            last = body_end
        else:
            out.append(html[start:hdr_end])
            last = hdr_end
    out.append(html[last:])
    return ''.join(out)


def enhance_playbook(html: str) -> str:
    """Add Copy buttons on blockquotes (scripts)."""
    return re.sub(
        r'<blockquote>(.*?)</blockquote>',
        lambda m: (
            '<blockquote>'
            '<button class="copy-btn" onclick="copyQuote(this)">Kopírovat</button>'
            f'{m.group(1)}</blockquote>'
        ),
        html,
        flags=re.DOTALL,
    )


def head(title: str, body_class: str = '') -> str:
    cls = f' class="{body_class}"' if body_class else ''
    return f'''<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Project Mycelium DD</title>
<meta name="robots" content="noindex,nofollow">
<meta name="generator" content="DD rendered/build.py — python-markdown">
<link rel="stylesheet" href="styles.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
</head>
<body{cls}>
'''


def banner(text: str = '') -> str:
    t = text or 'DŮVĚRNÉ · PODPORA DD NA STRANĚ PRODÁVAJÍCÍHO · PROJECT MYCELIUM'
    return f'<div class="classification crit">{t}</div>\n'


def toolbar(title: str, raw_file: str = None, interactive_href: str = None) -> str:
    actions = []
    if interactive_href:
        actions.append(f'<a class="btn" href="{interactive_href}">Interaktivní verze</a>')
    if raw_file:
        from urllib.parse import quote
        actions.append(f'<a class="btn" href="../reader.html?file={quote(raw_file)}">Otevřít ve čtečce</a>')
    actions.append('<button onclick="window.print()" class="btn primary">Tisk / PDF</button>')
    return (
        f'<div class="toolbar no-print">'
        f'<div class="crumbs"><a href="../index.html">Portál</a> › '
        f'<a href="index.html">Renderované</a> › {title}</div>'
        f'<div class="actions">{"".join(actions)}</div></div>\n'
    )


def page_footer(title: str, version: str) -> str:
    d = date.today().isoformat()
    return (
        f'<div class="page-footer">'
        f'<span>{title} · {version} · {d}</span>'
        f'<span>Project Mycelium DD — pouze pro tým prodávajícího</span>'
        f'</div>\n'
    )


COPY_SCRIPT = '''<script>
function copyQuote(btn){
  var bq = btn.parentElement;
  var text = bq.innerText.replace(/^\\s*Kopírovat\\s*/, "");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function(){
      btn.classList.add("copied");
      btn.textContent = "Zkopírováno";
      setTimeout(function(){ btn.classList.remove("copied"); btn.textContent = "Kopírovat"; }, 1600);
    });
  }
}
</script>'''


# ---------- Renderers ----------

def render_one_pager() -> int:
    src = (ROOT / 'EXECUTIVE-ONE-PAGER.md').read_text(encoding='utf-8')
    html = rewrite_md_links(render_md(src))
    page = (
        head('Manažerský one-pager') + banner() +
        toolbar('Manažerský one-pager', raw_file='EXECUTIVE-ONE-PAGER.md') +
        '<article class="doc one-pager">\n' + html + '\n' +
        page_footer('Manažerský one-pager', 'v1.0') +
        '</article>\n</body></html>'
    )
    out = OUT / 'one-pager.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def render_red_flags() -> int:
    src = (ROOT / 'RED-FLAGS.md').read_text(encoding='utf-8')
    html = rewrite_md_links(render_md(src))
    html = enhance_red_flags(html)
    chips = (
        '<div class="chips">'
        '<span class="chip crit">18 KRITICKÝCH</span>'
        '<span class="chip high">12 VYSOKÝCH</span>'
        '<span class="chip low">6 VYŘEŠENÝCH</span>'
        '<span class="chip info">4 DISCLOSURE SCHEDULE</span>'
        '</div>'
    )
    page = (
        head('Dashboard rizikových signálů') + banner() +
        toolbar(
            'Report rizikových signálů',
            raw_file='RED-FLAGS.md',
            interactive_href='../06-reports/red-flags-dashboard.html',
        ) +
        '<article class="doc">\n'
        '<h1>Riziková upozornění — Project Mycelium</h1>\n'
        '<p><strong>Konsolidovaný registr na straně prodávajícího</strong> '
        'významných rizik ověřených proti datovým podkladům, se stavem nápravy '
        'a obrannou strategií vůči kupujícímu.</p>\n'
        + chips + '\n<hr>\n' + html + '\n' +
        page_footer('Dashboard rizikových signálů', 'v1.0') +
        '</article>\n</body></html>'
    )
    out = OUT / 'red-flags.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def render_playbook() -> int:
    src = (ROOT / 'PPF-PLAYBOOK.md').read_text(encoding='utf-8')
    html = rewrite_md_links(render_md(src))
    html = enhance_playbook(html)
    toc = extract_toc(html)
    page = (
        head('PPF Playbook') + banner() +
        toolbar('PPF Playbook', raw_file='PPF-PLAYBOOK.md') +
        '<div class="layout-with-toc">\n' +
        toc_html(toc, 'Obsah playbooku') + '\n' +
        '<article class="doc">\n' + html + '\n' +
        page_footer('PPF Playbook', 'v2.0') +
        '</article>\n</div>\n' + COPY_SCRIPT + '\n</body></html>'
    )
    out = OUT / 'playbook.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def render_master_report() -> int:
    src = (ROOT / '06-reports' / 'MASTER-DD-REPORT-v1.0.md').read_text(encoding='utf-8')
    html = rewrite_md_links(render_md(src))
    toc = extract_toc(html)
    title_block = (
        '<div class="title-block">'
        '<div>'
        '<div class="tb-h">Projekt</div>'
        '<div class="tb-v">Mycelium — DD na straně prodávajícího</div>'
        '<div class="tb-h" style="margin-top:10px">Cíl</div>'
        '<div class="tb-v">Nový Zeleneč a.s. (greenfield 42 ha)</div>'
        '</div>'
        '<div>'
        '<div class="tb-h">Protistrana</div>'
        '<div class="tb-v">PPF reality 2 s.r.o. (IČO 24654744)</div>'
        '<div class="tb-h" style="margin-top:10px">Struktura</div>'
        '<div class="tb-v">Share deal na III. alpha s.r.o.</div>'
        '</div>'
        '<div>'
        '<div class="tb-h">Klasifikace</div>'
        '<div class="tb-v">Pouze tým prodávajícího</div>'
        '<div class="tb-h" style="margin-top:10px">Verze · Datum</div>'
        '<div class="tb-v">v1.0 · 2026-04-21</div>'
        '</div>'
        '</div>'
    )
    page = (
        head('Hlavní DD report') + banner() +
        toolbar('Hlavní DD report', raw_file='06-reports/MASTER-DD-REPORT-v1.0.md') +
        '<div class="layout-with-toc">\n' +
        toc_html(toc, 'Kapitoly') + '\n' +
        '<article class="doc">\n' + title_block + '\n' + html + '\n' +
        page_footer('Hlavní DD report', 'v1.0') +
        '</article>\n</div>\n</body></html>'
    )
    out = OUT / 'master-report.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def render_valuation() -> int:
    src = (ROOT / '06-reports' / 'VALUATION-DEFENSE-MEMO.md').read_text(encoding='utf-8')
    html = rewrite_md_links(render_md(src))
    sidebar = (
        '<aside class="pricing-sidebar">'
        '<h4>Cenový rozklad</h4>'
        '<div class="px"><span>Hranice odchodu</span><span>3,7 mld.</span></div>'
        '<div class="px"><span>Střed čistého aktiva</span><span>4,5 mld.</span></div>'
        '<div class="px"><span>Cílové rozpětí</span><span>5,0–6,0 mld.</span></div>'
        '<div class="px"><span>Strop kotvy</span><span>6,5 mld.</span></div>'
        '<div class="px"><span>Rozsah DCF</span><span>5,4–7,5 mld.</span></div>'
        '<div class="px" style="margin-top:8px;opacity:0.7;">'
        '<span>Jednotka</span><span>Kč</span></div>'
        '</aside>'
    )
    page = (
        head('Memo obhajoby ocenění', body_class='valuation-root') +
        banner('DŮVĚRNÉ · OBHAJOBA OCENĚNÍ · PROJECT MYCELIUM') +
        toolbar(
            'Memo obhajoby ocenění',
            raw_file='06-reports/VALUATION-DEFENSE-MEMO.md',
            interactive_href='../06-reports/valuation-calculator.html',
        ) +
        '<article class="doc valuation">\n' + sidebar + '\n' + html + '\n' +
        page_footer('Memo obhajoby ocenění', 'v1.0') +
        '</article>\n</body></html>'
    )
    out = OUT / 'valuation.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def render_index(sizes: dict) -> int:
    cards = [
        ('one-pager.html', 'Manažerský one-pager',
         'Karta na ruku — top 5 faktů, top 5 otázek, 3 červené linie, 3 body páky. Jeden list A4.',
         '5 faktů · 5 otázek · 3 červené linie · A4'),
        ('red-flags.html', 'Report rizikových signálů',
         'Registr rizik kategorizovaných podle závažnosti s obrannou strategií vůči kupujícímu a křížovými odkazy do dataroomu.',
         '18 KRITICKÝCH · 12 VYSOKÝCH · 6 VYŘEŠENÝCH'),
        ('playbook.html', 'PPF Playbook',
         'Otázky Q1–Q20 očekávané od PPF s připravenými odpověďmi, červenými liniemi a kopírovatelnými skripty.',
         '20 otázek · 5 červených linií · skripty'),
        ('master-report.html', 'Hlavní DD report',
         'Publikační kvalita konsolidovaného memoranda o due diligence na straně prodávajícího. Plná důkazní základna.',
         '7 kapitol · plné důkazy · v1.0'),
        ('valuation.html', 'Memo obhajoby ocenění',
         'Finanční memo — DCF + komparace pozemků + precedenty + likvidační triangulace. Cenový rozklad.',
         'Min 3,7 mld. · Střed 4,5 mld. · Strop 6,5 mld.'),
    ]
    grid_items = []
    for f, t, d, s in cards:
        sz = sizes.get(f, 0) / 1024
        grid_items.append(
            f'<a class="idx-card" href="{f}">'
            f'<div class="idx-title">{t}</div>'
            f'<div class="idx-desc">{d}</div>'
            f'<div class="idx-stats">{s}</div>'
            f'<div class="idx-meta"><span>Aktualizováno 2026-04-21</span><span>{sz:.1f} KB</span></div>'
            f'<div class="idx-actions"><span class="idx-btn">Otevřít</span>'
            f'<span class="idx-btn ghost">Tisk</span></div>'
            f'</a>'
        )
    grid = '\n'.join(grid_items)
    styles = (
        '<style>'
        '.idx-header{max-width:1200px;margin:32px auto 16px;padding:0 24px;}'
        '.idx-header h1{font-size:28px;margin:0 0 4px 0;}'
        '.idx-header p{color:var(--ink-soft);margin:0;}'
        '.idx-note{max-width:1200px;margin:16px auto;padding:14px 20px;background:#fffbeb;border:1px solid #fde68a;border-radius:4px;color:#78350f;font-size:13px;}'
        '.idx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px;max-width:1200px;margin:24px auto;padding:0 24px;}'
        '.idx-card{display:block;background:#fff;border:1px solid var(--rule);border-left:4px solid var(--accent);border-radius:6px;padding:20px 22px;text-decoration:none;color:inherit;transition:box-shadow .15s,transform .15s;}'
        '.idx-card:hover{box-shadow:0 4px 14px rgba(0,0,0,.08);transform:translateY(-2px);border-left-color:var(--crit);}'
        '.idx-title{font-size:17px;font-weight:700;color:var(--ink);margin-bottom:6px;}'
        '.idx-desc{font-size:13.5px;color:var(--ink-soft);line-height:1.5;min-height:58px;}'
        '.idx-stats{font-family:var(--mono);font-size:11px;color:var(--crit);margin-top:10px;padding:6px 10px;background:var(--accent-soft);border-radius:3px;display:inline-block;letter-spacing:0.03em;}'
        '.idx-meta{display:flex;justify-content:space-between;margin-top:12px;font-family:var(--mono);font-size:11px;color:var(--ink-soft);border-top:1px solid var(--rule);padding-top:8px;}'
        '.idx-actions{display:flex;gap:8px;margin-top:12px;}'
        '.idx-btn{flex:1;text-align:center;padding:6px 10px;border:1px solid var(--rule);border-radius:3px;font-size:12px;font-weight:500;color:var(--ink);background:var(--bg-soft);}'
        '.idx-btn.ghost{background:#fff;color:var(--ink-soft);}'
        '</style>'
    )
    page = (
        head('Renderovaný balíček — Index') + banner() +
        '<div class="toolbar">'
        '<div class="crumbs"><a href="../index.html">Portál</a> › Renderovaný balíček</div>'
        '<div class="actions"><a class="btn" href="../index.html">Zpět na portál</a></div>'
        '</div>\n' + styles + '\n'
        '<header class="idx-header">'
        '<h1>Renderované DD dokumenty</h1>'
        '<p>Statické HTML optimalizované pro tisk, obsah nevyžaduje JavaScript.</p>'
        '</header>\n'
        '<div class="idx-note">'
        'Toto jsou <strong>předem renderované statické HTML</strong> verze klíčových DD dokumentů — '
        'optimalizované pro tisk, PDF export a offline čtení. '
        'Pro interaktivní čtení s vyhledáváním/navigací použijte '
        '<a href="../reader.html">../reader.html</a>. '
        'Pro editaci raw markdownu otevřete soubor <code>.md</code> přímo.'
        '</div>\n'
        '<div class="idx-grid">\n' + grid + '\n</div>\n' +
        page_footer('Index renderovaných dokumentů', 'v1.0') +
        '</body></html>'
    )
    out = OUT / 'index.html'
    out.write_text(page, encoding='utf-8')
    return out.stat().st_size


def main():
    print('DD renderer — python-markdown')
    sizes = {}
    sizes['one-pager.html'] = render_one_pager()
    sizes['red-flags.html'] = render_red_flags()
    sizes['playbook.html'] = render_playbook()
    sizes['master-report.html'] = render_master_report()
    sizes['valuation.html'] = render_valuation()
    sizes['index.html'] = render_index(sizes)

    print('\nRendered files:')
    for fname, sz in sizes.items():
        print(f'  {fname:<24}  {sz/1024:>7.1f} KB')


if __name__ == '__main__':
    main()
