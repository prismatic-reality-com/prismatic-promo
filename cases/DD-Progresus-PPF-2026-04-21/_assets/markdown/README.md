# markdown/ — Offline Markdown rendering bundle

Vendorované UMD/browser-ready knihovny, které pohání `reader.html`. Vše běží
plně offline po jednorázovém načtení pracovního prostoru; po prvním vykreslení
není potřeba síťový přístup.

## Obsah bundlu

| Soubor | Knihovna | Verze | Účel | Licence |
|---|---|---|---|---|
| `markdown-it.min.js` | markdown-it | 14.x | Jádrový CommonMark + GFM parser | MIT |
| `markdownItAnchor.umd.js` | markdown-it-anchor | 9.x | Automatická ID nadpisů + kotevní odkazy | Unlicense |
| `markdown-it-task-lists.js` | markdown-it-task-lists | 2.x | GFM `[ ]` / `[x]` checkboxy | ISC |
| `markdown-it-footnote.min.js` | markdown-it-footnote | 4.x | `[^1]` poznámky pod čarou se zpětnými odkazy | MIT |
| `markdown-it-mark.min.js` | markdown-it-mark | 4.x | `==zvýrazněno==` → mark tag | MIT |
| `markdown-it-deflist.min.js` | markdown-it-deflist | 3.x | Definiční seznamy | MIT |
| `markdown-it-emoji.min.js` | markdown-it-emoji | 3.x | `:fire:` shortcody | MIT |
| `markdown-it-attrs.browser.js` | markdown-it-attrs | 4.x | Syntax atributů pro nadpisy/odkazy | MIT |
| `markdown-it-container.min.js` | markdown-it-container | 4.x | `::: warning` callouty | MIT |
| `highlight.min.js` | highlight.js (common bundle) | 11.9.0 | Zvýrazňování syntaxe (~190 jazyků) | BSD-3-Clause |
| `highlight-github-dark.min.css` | highlight.js theme | 11.9.0 | Dark-mode téma kódu | BSD-3-Clause |
| `highlight-github.min.css` | highlight.js theme | 11.9.0 | Light-mode téma kódu | BSD-3-Clause |
| `mermaid.min.js` | Mermaid | 11.x | Vývojové diagramy, sequence, gantt, ER | MIT |
| `purify.min.js` | DOMPurify | 3.x | XSS sanitizace | Apache-2.0 / MPL-2.0 |
| `custom.css` | — | — | Stylování textu, callouty, chrome bloků kódu, RF badge, print CSS | Workspace-local |

## Nahrazené / nedostupné

- **markdown-it-toc-done-right** — žádný UMD build na CDN (pouze CJS).
  Nahrazeno **inline TOC generátorem** v `reader.html`, který po vykreslení
  prochází DOM a sestavuje TOC z ID `h2..h4` emitovaných pluginem
  `markdown-it-anchor`. IntersectionObserver sleduje aktuální sekci.

## Vystavené UMD globální proměnné

Načtení skriptů v pořadí `<script src>` zpřístupní následující na
`window`:

```
markdownit                 // core factory:  const md = markdownit({...})
markdownItAnchor           // plugin
markdownitTaskLists        // plugin
markdownitFootnote         // plugin
markdownitMark             // plugin
markdownitDeflist          // plugin
markdownitEmoji            // plugin.full / plugin.light / plugin.bare
markdownItAttrs            // plugin
markdownitContainer        // plugin factory:  md.use(plugin, 'warning', {...})
hljs                       // highlight.js instance with common languages
mermaid                    // diagram renderer
DOMPurify                  // sanitize(html, opts) returns safe html string
```

## Politika upgradu

- Udržujte URL na jsDelivr `@<major>` tagu, aby patch/minor aktualizace byly
  taženy transparentně při novém vendorování.
- Zafixujte `highlight.js` na přesnou verzi, aby nedocházelo k driftu
  tématu/CSS.
- Zafixujte `mermaid` na `@11` — v12 je breaking přepis.
- Pro obnovení všech bundlů spusťte znovu níže uvedené download příkazy.

### Příkazy pro opětovné stažení

```bash
cd _assets/markdown && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-anchor@9/dist/markdownItAnchor.umd.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-task-lists@2/dist/markdown-it-task-lists.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-footnote@4/dist/markdown-it-footnote.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-mark@4/dist/markdown-it-mark.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-deflist@3/dist/markdown-it-deflist.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-emoji@3/dist/markdown-it-emoji.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-attrs@4/markdown-it-attrs.browser.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/markdown-it-container@4/dist/markdown-it-container.min.js && \
curl -fsSL  -o highlight.min.js https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js && \
curl -fsSL  -o highlight-github-dark.min.css https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github-dark.min.css && \
curl -fsSL  -o highlight-github.min.css       https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css && \
curl -fsSLO https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js && \
curl -fsSLO https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js
```

## Použití (minimální)

Načtěte script tagy v pořadí (jádro, pak pluginy, pak highlight, pak
mermaid, pak DOMPurify), poté nakonfigurujte `markdownit` s callbackem
`highlight`, který deleguje na `hljs.highlight(str, { language, ignoreIllegals: true }).value`,
zřetězte volání `.use()` pro každý plugin (anchor, task-lists, footnote, mark,
deflist, emoji.full, attrs), zaregistrujte `::: name` kontejnery, které
chcete (warning/danger/info/note/success/tip), poté renderujte přes
`md.render(source)`, sanitizujte přes `DOMPurify.sanitize(html, { ADD_ATTR: ['target'] })`
a nastavte výsledek jako HTML kontejneru pro vykreslený markdown přes
`Element.innerHTML` — pouze proto, že DOMPurify již odstranil nebezpečné
uzly.

Viz `reader.html` pro kanonickou referenční implementaci včetně lazy
načítání Mermaidu, generování TOC, kopírovacích tlačítek a rozlišování
relativních odkazů.

## Bezpečnost

- **Veškeré vykreslené HTML je propuštěno přes DOMPurify.** Na `markdown-it`
  je také nastaveno `html: false`, aby raw script/iframe tagy nikdy
  nedosáhly sanitizéru ani jednou cestou (belt + braces).
- Relativní odkazy jsou vyhodnocovány vůči kořeni pracovního prostoru;
  jakákoliv vyhodnocená cesta unikající z pracovního prostoru je blokována
  v `reader.html`.
- Vstup pro Mermaid je rovněž propuštěn přes vlastní `mermaidAPI.render` od
  Mermaidu, který injekce skriptů ve výchozím nastavení odmítá.

## Footprint

Celková velikost bundlu je přibližně **3,5 MB nekomprimovaně** (dominuje
Mermaid s 3,1 MB). Mermaid se načítá lazy pouze tehdy, je-li přítomen blok
kódu `mermaid`, čímž se udržuje rychlé první vykreslení.

---
*Naposledy obnoveno: 2026-04-21. Vlastník: reader.html (Pass 10A).*

<!-- BACKLINKS_START -->

---

## 🔗 Zpětné odkazy

*Žádné příchozí odkazy ve znalostním grafu.*

## 🏷️ Související soubory (podle shody tagů)

*Žádné silně související soubory (shoda tagů pod prahem 0,3).*

## 🌐 Pohled grafu

[Otevřít v portálu](../../index.html) · [Mapa stránek](../../sitemap.html) · [Hledat](../../search.html) · Focus ID: `_assets%2Fmarkdown%2FREADME.md`

---
*Automaticky vygenerováno skriptem `_assets/build-backlinks.py` · 2026-04-21*
<!-- BACKLINKS_END -->
