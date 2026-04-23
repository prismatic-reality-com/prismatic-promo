+++
title = "Kompletni pruvodce 141 OSINT adaptery platformy Prismatic"
date = 2026-04-01
description = "Komplexni prehled vsech 141 OSINT zpravodajskych adapteru v platforme Prismatic -- ceske registry, globalni hrozby, instituce EU, sankce a dalsi."

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["osint", "adaptery", "zpravodajstvi", "ceske-registry", "hrozby", "sankce", "eu-instituce", "elixir"]
reading_time = "18 min"
keywords = ["OSINT adaptery", "open source intelligence", "cesky obchodni rejstrik", "platforma pro hrozby", "sankce screening", "EU OSINT", "Prismatic Platform OSINT", "zpravodajstvi Elixir", "ARES adapter", "VirusTotal integrace", "Shodan OSINT"]
image = "/images/blog/osint-adapters-complete-guide.png"
word_count = 3400
date_created = "2026-04-01"
date_modified = "2026-04-01"
quality_score = 85
see_also = ["building-osint-adapters-with-elixir", "capabilities", "architecture"]
image_alt = "Kompletni pruvodce OSINT adaptery platformy Prismatic - zpravodajstvi ve velkem meritku"
lang = "cs"
+++

Open-source intelligence je jen tak dobry, jak dobre jsou zdroje, ktere ho napaji. Prismatic obsahuje **141 produkcne pripravenych OSINT adapteru** pokryvajicich ceske statni registry, globalni zdroje hrozeb, databaze instituci EU, mezinarodni sankcni seznamy a dalsi. Kazdy adapter je samoregistrujici, ma nastaveny rate limiting, ochranu circuit breakerem a vysledky streamuje v realnem case pres PubSub.

Tento clanek je definitivni katalog. At uz provadite due diligence ceske firmy, sledujete skodlivou IP adresu pres threat feedy, nebo proverujete subjekt vuci globalnim sankcim -- adapter na to existuje.

---

## Architektura v kostce

Vsech 141 adapteru zije pod `prismatic_osint_sources` a implementuje jednotny behaviour kontrakt:

```elixir
@callback search(query :: String.t(), opts :: keyword()) ::
  {:ok, list(map())} | {:error, term()}

@callback metadata() :: %{
  name: String.t(),
  category: atom(),
  rate_limit_rpm: pos_integer(),
  confidence_tier: atom()
}
```

Adaptery se samoregistruji do ETS-backed `ToolRegistry` v dobe kompilace. Zadne manualni propojovani, zadne hardcoded seznamy. Pridejte novy modul adapteru, zkompilujte, a okamzite se objevi v UI toolboxu, REST API i CLI.

Kazdy adapter automaticky dostava:
- **Rate limiting** (token bucket per adapter)
- **Circuit breaker** (otevre se po 5 po sobe jdoucich selhanich, half-open retry po 30s)
- **ETS cache vysledku** (nastavitelny TTL)
- **Telemetrie** (doba provedeni, citace uspechu/neuspechu)
- **PubSub streaming** (doručovani vysledku v realnem case do LiveView UI)

---

## Ceske adaptery (35)

Nejhlubsi pokryti v cele platforme. Ceske adaptery dotazuji oficialni statni registry, financni regulatory, pravni databaze a portaly transparentnosti -- zdroje klicove pro due diligence, compliance a investigativni praci v Ceske republice.

### Obchodni a firemni registry

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **ARES** | Ministerstvo financi (ARES) | Detail firmy dle ICO -- nazev, sidlo, pravni forma, NACE kody, datum zalozeni |
| **ARES Tesla** | ARES (Tesla-enhanced) | Stejna data jako ARES se zlepssenym vykonem API a retry logikou |
| **Obchodni rejstrik** | Justice.cz OR | Vlastnicka struktura, statutarni organy, zakladni kapital, stanovy |
| **Obchodni rejstrik Fallback** | Justice.cz (s fallbackem) | Rozsirena verze s automatickymi fallback strategiemi pri nedostupnosti |
| **OR Registry** | Obchodni rejstrik | ML-enhanced extrakce z obchodniho rejstriku se strukturovanym parsovanim entit |
| **Rejstrik Firem** | rejstrik-firem.kurzy.cz | Alternativni pristup k obchodnimu rejstriku s financnimi souhrny |
| **Podnikatel.cz** | podnikatel.cz | Cesky portal obchodniho zpravodajstvi -- profily firem, analyza odvetvi |
| **CNB** | Ceska narodni banka | Regulovane financni subjekty, bankovni licence, registrace investicnich firem |
| **RES** | Cesky statisticky urad | Obchodni informace z Registru ekonomickych subjektu |

### Pravni a justicni

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Justice.cz** | Oficialni soudni rejstrik | ML-enhanced extrakce pravnich subjektu -- soudni podani, zmeny firem, insolvencni udalosti |
| **Soudni pripady** | Cesky soudni system | Historie sporu, stav pripadu, zucastnene strany, rozsudky |
| **Exekuce** | Exekutorska komora | Exekucni rizeni, aktivni exekuce, stav dluznika |
| **Infodeska** | InfoDeska.justice.cz | Elektronicka uredni deska soudu -- edikty, predvolani, uredni oznameni |
| **ISIR** | Insolvencni rejstrik | Insolvencni rizeni, navrhy na konkurz, pohledavky veritelu, reorganizacni plany |
| **Senat** | Senat CR | Zaznamy horni komory, profily senatoru, legislativni hlasovani |
| **Parlament** | Poslanecka snemovna | Zaznamy poslancu, historie hlasovani, clenstvi ve vyborech, interpelace |

### Financni a compliance

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **DPH** | Ministerstvo financi | Status registrace k DPH, validace DIC, datum registrace |
| **Nespolehlivy platce** | Ministerstvo financi | Seznam nespolehlivych platcu DPH -- oznacene subjekty s omezenym odpoctem DPH |
| **CEDR** | Centralni evidence dotaci | Prijate statni dotace, castky grantu, popisy projektu, prijemci |
| **RZP** | Zivnostensky urad | Zivnostenska opravneni, podnikatelske cinnosti, registrovane zivnosti |

### Statni sprava

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **ISVS** | Informacni system verejne spravy | Zaznamy vladniho informacniho systemu, administrativni metadata |
| **Mistni samosprava** | Obecni registry | Mistni predstavitele, clenove zastupitelstev, rozpoctova data obci |
| **CUZK** | Katastr nemovitosti | Vlastnictvi nemovitosti, pozemky, katastralni mapy, vecna bremena |
| **Datove schranky** | System datovych schranek | Overeni existence uredni datove schranky a jejiho typu |

### Regulatorni a specializovane

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **CTU** | Cesky telekomunikacni urad | Telekomunikacni licence, pridelovani frekvenci, registrace operatoru |
| **ERU** | Energeticky regulacni urad | Energeticke licence, cenova rozhodnuti, seznamy regulovanych subjektu |
| **SUKL** | Statni ustav pro kontrolu leciv | Registrace lecivych pripravku, schvaleni leciv, data o klinickych studiich |
| **SZIF** | Statni zemedelsky intervencni fond | Zemedelske dotace, distribuce fondu EU, registrace zemedelcu |
| **UOHS** | Urad pro ochranu hospodarske souteze | Rozhodnuti o hospodarske soutezi, schvaleni fuzi, poruseni verejnych zakazek |
| **Registr smluv** | Registr smluv | Verejne smlouvy nad 50 000 Kc -- smluvni strany, castky, plne texty |
| **Verejne zakazky** | Portal verejnych zakazek | Aktivni tendry, udeleni zakazek, vyber dodavatelu, nabidkove ceny |
| **Hlidac statu** | Hlidac statu (NGO) | Data o transparentnosti -- politicke dary, vlastnictvi medii, analyza smluv |
| **Forbes CZ** | Forbes Cesko | Zebricky nejbohatsich, profily firem, odhadovana cista hodnota |

### Inteligentni smerovani

| Adapter | Ucel |
|---------|------|
| **ML Intelligence** | ML-driven klasifikace dotazu, ktera automaticky smeruje na optimalni cesky registr |
| **Smart Router** | Inteligentni multi-source smerovani -- paralelni dotazy na relevantni ceske zdroje se slucovanim vysledku |

---

## Globalni adaptery (87)

Nejvetsi kategorie. Globalni adaptery pokryvaji DNS a sitovou inteligenci, IP geolokaci, analyzu malwaru, sledovani kryptomen, hledani osob, socialni media, skenovani infrastruktury a business intelligence z mezinarodniho prostredi.

### DNS a sitova inteligence

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **crt.sh** | Certificate Transparency | SSL/TLS certifikaty vydane pro domenu -- subdomeny, vydavatele, data expirace |
| **DNSDumpster** | HackerTarget | DNS enumerace -- subdomeny, MX zaznamy, TXT zaznamy, IP hostu |
| **Robtex** | Robtex | Reverzni DNS, detekce sdileneho hostingu, mapovani IP-na-domenu |
| **RIPESTAT** | RIPE NCC | Alokace IP bloku, vlastnictvi ASN, BGP routovaci prefixy, abuse kontakty |
| **Team Cymru** | Team Cymru | Reputace IP/ASN, geolokace, vyhledavani malware hashu |
| **ViewDNS** | ViewDNS.info | WHOIS, reverzni IP, propagace DNS, skenovani portu, ping |
| **SecurityTrails** | SecurityTrails | Historicke DNS zaznamy, WHOIS historie domeny, asociovane domeny |
| **PassiveTotal** | RiskIQ | Pasivni DNS resoluce, WHOIS historie, asociace SSL certifikatu |
| **BGPView** | BGPView | BGP routovaci tabulky, alokace IP prefixu, ASN peering vztahy |

### IP a geolokace

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **IPInfo** | ipinfo.io | IP geolokace, ASN, firma, detekce VPN/proxy/tor |
| **IPData** | ipdata.co | Geolokace s ASN, firmou, threat intelligence a daty o operatorovi |
| **IP2Location** | IP2Location | Geolokace, ISP, domena, typ pouziti, detekce VPN/proxy |
| **IPStack** | ipstack.com | Geolokace s menou, casovym pasmem, jazykem a daty o pripojeni |
| **IPQualityScore** | IPQualityScore | Fraud scoring -- VPN, proxy, tor, bot detekce, pravdepodobnost zneuziti |
| **MaxMind** | MaxMind GeoIP | Enterprise geolokacni databaze s presnosti na uroven mesta |

### Telefonni inteligence

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Twilio Lookup** | Twilio | Validace telefonniho cisla, identifikace operatora, typ linky |
| **NumVerify** | numverify.com | Mezinarodni validace telefonu, operator, typ linky, lokace |
| **Phone Reputation** | Vice zdroju | Agregovane hodnoceni reputace telefonniho cisla a detekce spamu |

### Malware a threat intelligence

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **VirusTotal** | VirusTotal (70+ enginu) | Analyza souboru/URL/domeny/IP pres 70+ antivirovych enginu s pomery detekce |
| **URLhaus** | abuse.ch | Zname skodlive URL, distribuční servery malwaru, hashe payloadu |
| **URLScan** | urlscan.io | Screenshot webu, DOM snapshot, nacteni zdroju, detekce technologii |
| **PhishTank** | OpenDNS | Overene phishingove URL s metadaty podani a stavem overeni |
| **MalwareBazaar** | abuse.ch | Repozitar vzorku malwaru -- hashe, signatury, YARA pravidla, klasifikace rodin |
| **ThreatCrowd** | ThreatCrowd | Asociace hrozeb domeny/IP/emailu, spojeni s malwarem, casova osa |
| **ThreatFox** | abuse.ch | Sdileni IOC -- C2 servery, konfigurace malwaru, botnet infrastruktura |
| **GreyNoise** | GreyNoise | Klasifikace internetoveho sumu -- benigni skenery vs. skodlivi aktéři |
| **AlienVault OTX** | AlienVault | Pulsy Open Threat Exchange -- IOC, reporty o hrozbach, komunitni inteligence |
| **AlienVault** | AT&T Cybersecurity | Enterprise threat intelligence feedy a korelace |
| **Pulsedive** | Pulsedive | Threat intelligence s hodnocenim rizika, obohacenim IOC, agregaci feedu |
| **IntelligenceX** | Intelligence X | Data z darknetu, uniklé databaze, obsah skrytych sluzeb Tor |

### Databaze zranitelnosti a exploitu

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Exploit-DB** | Offensive Security | Verejne exploity, shellcode, clanky -- vyhledavani dle CVE, platformy, typu |
| **NVD** | NIST | Narodni databaze zranitelnosti -- detaily CVE, CVSS skore, postizene produkty |
| **Snyk** | Snyk | Data o zranitelnostech open-source s doporucenim oprav a zavaznosti |

### Zneuziti a reputace

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **AbuseIPDB** | AbuseIPDB | Hlaseni o zneuziti IP, skore duveryhodnosti, kategorie utoku, data reporteru |
| **SpamHaus** | Spamhaus | DNS blocklist lookup -- SBL, XBL, PBL, DBL pro spam a malware |

### Kryptomeny a blockchain

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Blockchain.com** | Blockchain.com | Vyhledavani Bitcoin transakcí, zustatky adres, data bloku |
| **Etherscan** | Etherscan | Ethereum transakce, prevody tokenu, interakce se smart kontrakty |
| **CoinGecko** | CoinGecko | Ceny kryptomen, trzni kapitalizace, objemy obchodovani, historicka data |
| **CoinMarketCap** | CoinMarketCap | Trzni zebricky, cenova data, listingy burz, metadata projektu |
| **BitcoinAbuse** | BitcoinAbuse.com | Hlaseni zneuziti Bitcoin adres -- ransomware, sextortion, podvody |
| **Chainalysis** | Chainalysis | Blockchain forenzika -- analyza klastru, hodnoceni rizika, atribuce entit |
| **Crystal Blockchain** | Crystal | Analyza toku transakcí, klastrovani adres, compliance screening |
| **WalletExplorer** | WalletExplorer | Klastrovani Bitcoin penezenek, oznacovani znamych entit, sledovani transakcí |

### Inteligence osob a emailu

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Hunter.io** | Hunter | Emailove adresy asociovane s domenou, stav overeni, zdroje |
| **FullContact** | FullContact | Obohaceni osoby -- socialni profily, demografie, historie zamesnani |
| **Pipl** | Pipl | Hluboke vyhledavani osob -- resoluce identity pres verejne zaznamy a socialni media |
| **EmailRep** | EmailRep.io | Reputace emailu -- stari, historie uniku, dorucitelnost, skodliva aktivita |
| **Clearbit** | Clearbit | Firemni a osobni inteligence -- firmografika, technografika, socialni data |
| **ZoomInfo** | ZoomInfo | B2B kontaktni databaze -- pracovni pozice, prima cisla, organizacni struktury firem |
| **LinkedIn Sales Navigator** | LinkedIn | Profesni profily, stranky firem, pocty zamestnancu, pracovni nabidky |
| **Have I Been Pwned** | HIBP | Databaze uniku -- v jakych unikech se email objevil |
| **DeHashed** | DeHashed | Agregator kompromitovanych dat -- emaily, uzivatelska jmena, hesla, hashe |

### Socialni media a webove vyhledavani

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **DuckDuckGo** | DuckDuckGo | Webove vysledky vyhledavani orientovane na soukromi s okamzitymi odpovedi |
| **Google Custom Search** | Google | Filtrovane vysledky vyhledavani s omezenim na web a rozsahem dat |
| **Google Vision** | Google Cloud | Analyza obrazu -- OCR extrakce textu, detekce stitku, detekce obliceju |
| **Bing Visual Search** | Microsoft | Reverzni vyhledavani obrazu s porovnavanim vizualni podobnosti |
| **TinEye** | TinEye | Reverzni vyhledavani obrazu -- kde se obraz objevuje online, detekce modifikaci |
| **Social Searcher** | Social Searcher | Monitoring socialnich medii v realnem case pres vice platforem |
| **PublicWWW** | PublicWWW | Vyhledavani ve zdrojovem kodu -- nalezeni webu pouzivajicich specificke skripty, sledovaci kody |

### Registry kodu a balicku

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **GitHub Code** | GitHub | Vyhledavani repozitaru a kodu -- nalezeni projektu, prispievatelu, historie commitu |
| **GitLab Code** | GitLab | Vyhledavani repozitaru pres verejne GitLab instance |
| **NPM Registry** | npmjs.com | Metadata Node.js balicku, spravci, statistiky stazeni, zavislosti |
| **PyPI** | pypi.org | Informace o Python balicich, historie vydani, URL projektu |

### Skenovani infrastruktury a webu

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Shodan** | Shodan | Data z celosvetoveho skenovani portu -- otevrene porty, bannery, zranitelnosti, screenshoty |
| **Censys** | Censys | Skenovani internetu -- SSL certifikaty, otevrene porty, detekce protokolu |
| **Onyphe** | Onyphe | Francouzska platforma kybernetickych hrozeb -- geolokace, synscan, datascan, vulnscan |
| **BinaryEdge** | BinaryEdge | Skenovani internetu s detekci zranitelnosti a monitoringem uniku dat |
| **Zoomey** | ZoomEye | Cinska platforma pro skenovani internetu -- objevovani zarizeni, data o zranitelnostech |
| **BuiltWith** | BuiltWith | Technologicky profil webu -- CMS, analytika, frameworky, CDN, hosting |
| **SpyOnWeb** | SpyOnWeb | Vztahy mezi weby pres sdilena analytikova ID, IP adresy, nameservery |
| **DomainBigData** | DomainBigData | Reputace domeny, info o registrantovi, souvisejici domeny, IP historie |
| **Whoisology** | Whoisology | Hluboka WHOIS historie s reverznimi vyhledavanimi dle registranta, emailu, nameserveru |
| **SSLMate** | SSLMate/Certspotter | Monitoring SSL certifikatu a sledovani transparency logu |
| **Common Crawl** | Common Crawl | Petabajtovy webovy archiv -- historicky obsah stranek a struktura odkazu |

### Firemni a obchodni inteligence

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Crunchbase** | Crunchbase | Data o startupech a firmach -- kola financovani, investori, akvizice, zakladatele |
| **Open Corporates** | OpenCorporates | Globalní agregator firemnich rejstriku -- 200M+ firem pres jurisdikce |
| **Beneficial Ownership** | Ruzne rejstriky | Data o skutecnem vlastnictvi pro firemni transparentnost |
| **NewsAPI** | NewsAPI | Globalni agregace zprav -- clanky z 80 000+ zdroju se sentimentem |
| **GDELT** | GDELT Project | Globalni databaze udalosti -- geopoliticke udalosti, konflikty, protesty, analyza tonu |

### Dark web a specializovane

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Ahmia** | Ahmia.fi | Vyhledavac skrytych sluzeb Tor -- objevovani a indexovani .onion stranek |
| **Wayback Machine** | Internet Archive | Historicke snimky webu -- jak vypadala jakekoliv URL v jakekoliv dobe |
| **Exif Tool** | ExifTool | Extrakce metadat obrazu -- GPS souradnice, model fotoaparatu, casova razitka, software |

### Pravni a financni (mezinarodni)

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Court Records** | Verejne soudni databaze | Vyhledavani soudnich pripadu pres dostupne jurisdikce |
| **SEC EDGAR** | Americka SEC | Podani cennych papiru -- 10-K, 10-Q, 8-K, insiderske transakce, proxy |

---

## Adaptery instituci EU (13)

Vyhrazena sada adapteru pro dotazovani oficialnich databazi Evropske unie -- nezbytne pro regulatorni compliance, vyzkum politik a preshranicni due diligence.

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Komise** | Evropska komise | Politicke dokumenty, tiskove zpravy, legislativni navrhy |
| **Parlament** | Evropsky parlament | Zaznamy europoslancu, legislativni postupy, plenární hlasovani, zpravy vyboru |
| **Soudni dvur** | Soudni dvur EU | Judikatura, rozsudky, stanoviska generalnich advokatu |
| **Ucetni dvur** | Evropsky ucetni dvur | Auditni zpravy, financni nalezy, specialni zpravy o vydajich EU |
| **ECB** | Evropska centralni banka | Rozhodnuti menove politiky, smenné kurzy, seznamy dohlizenych subjektu |
| **Registr transparentnosti** | Registr transparentnosti EU | Lobbisticka cinnost -- organizace, jednotlivci, deklarovane rozpocty |
| **EUR-Lex** | EUR-Lex | Legislativa EU dle cisla CELEX -- smernice, narizeni, rozhodnuti |
| **TED** | Tenders Electronic Daily | Oznameni o verejnych zakazkach EU -- udeleni zakazek, vyzvy k podani nabidek |
| **Eurostat** | Eurostat | Statisticka data EU -- demografie, obchod, ekonomika, socialni ukazatele |
| **Agentury** | Agentury EU | Data ze specializovanych agentur EU (EMA, ENISA, Europol atd.) |
| **EEAS** | Evropska sluzba pro vnejsi cinnost | Zahranicne-politicke pozice EU, kontext sankci, diplomaticka prohlaseni |
| **EDPS** | Evropsky inspektor ochrany udaju | Rozhodnuti o ochrane udaju, pokyny, stanoviska k legislativě o soukromi |
| **Ombudsman** | Evropsky verejny ochrance prav | Vysetrovani stiznosti, nalezy neradne spravy, doporuceni |

---

## Sankcni adaptery (3)

Trivrstvovy sankcni screening pokryvajici hlavni mezinarodni sankcni rezimy:

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Sankce EU** | Evropska unie | Konsolidovany sankcni seznam EU -- jednotlivci, subjekty, plavidla, omezeni |
| **OFAC SDN** | Americke ministerstvo financi | Seznam zvlaste oznacenych obcanu -- blokovane osoby a subjekty |
| **Sankce OSN** | Organizace spojenych narodu | Sankce Rady bezpecnosti OSN -- zakazy cestovaani, zmrazeni aktiv, zbrojni embarga |

Tyto adaptery podporuji fuzzy matching jmen, zpracovani transliterace a vysledky hodnocene dle duveryhodnosti. Jedno volani `search/2` proti sankcni kategorii spusti vsechny tri paralelne a vrati sloucenou, deduplikovanou sadu vysledku.

---

## Regionalni adaptery (2)

| Adapter | Zdroj | Co vraci |
|---------|-------|----------|
| **Companies House** | UK Companies House | Britske registrace firem, jmenovani reditelu, historie podani, ucetni zaverky |
| **EBR** | Evropsky obchodni rejstrik | Preshranicni vyhledavani evropskych obchodnich subjektu |

---

## Univerzalni adaptery (2)

| Adapter | Ucel |
|---------|------|
| **Email Intelligence** | Agregovana reputace emailu a kontrola uniku pres vice zdroju (HIBP, EmailRep, Hunter) |
| **Email Intelligence (Rate Limited)** | Stejna funkcionalita s konzervativnimi limity pro velkoobjemove davkove zpracovani |

---

## Hodnoceni duveryhodnosti

Kazdy vysledek z kazdeho adapteru prochazi pipeline hodnoceni duveryhodnosti. Skore se prirazuje na zaklade spolehlivosti zdroje:

| Kategorie | Rozsah duveryhodnosti | Priklady |
|-----------|----------------------|----------|
| Oficialni rejstrik | 0,95 -- 1,00 | ARES, Justice.cz, Companies House, SEC EDGAR |
| Komercni databaze | 0,80 -- 0,94 | Shodan, VirusTotal, Crunchbase, SecurityTrails |
| Komunita / Open Source | 0,60 -- 0,79 | AbuseIPDB, PhishTank, AlienVault OTX |
| Web scraping | 0,40 -- 0,59 | Socialni media, agregace zprav |
| Neoverene | 0,00 -- 0,39 | Surove feedy, zdroje z dark webu |

Kdyz vice adapteru vraci data o stejnem subjektu, skore duveryhodnosti se kombinuji pomoci epistemickeho frameworku Nabla a vytvori finalni kompozitni skore.

---

## Pouziti adapteru

### Webove rozhrani

Prochazejte vsechny adaptery na `/hub/osint/tools`. Kazdy adapter ma detailni stranku s dynamickym formularem generovanym z jeho konfigurace `input_fields`. Spustte jakykoli adapter primo z prohlizece a sledujte strukturovane vysledky v realnem case.

### REST API

```bash
# Seznam vsech adapteru
curl http://localhost:4004/api/v1/osint/list_tools

# Filtrovani dle kategorie
curl -X POST http://localhost:4004/api/v1/osint/filter_tools \
  -H "Content-Type: application/json" \
  -d '{"category": "czech"}'

# Spusteni adapteru
curl -X POST http://localhost:4004/api/v1/osint/execute_tool \
  -H "Content-Type: application/json" \
  -d '{"slug": "czech-ares", "input": {"query": "12345678"}}'
```

### Elixir API

```elixir
# Prime volani adapteru
{:ok, results} = PrismaticOsintSources.Adapters.Czech.Ares.search("12345678")

# Pres tool registry (doporuceno)
{:ok, results} = PrismaticOsintCore.ToolRegistry.execute("czech-ares", %{query: "12345678"})

# Multi-source vyhledavani pres kategorii
{:ok, results} = PrismaticOsintCore.search("Navigara s.r.o.", category: :czech)
```

---

## Vytvoreni vlastniho adapteru

Platforma je rozsiritelna. Prectete si [Tvorba OSINT adapteru s Elixirem](/blog/building-osint-adapters-with-elixir/) pro podrobny navod, nebo vygenerujte adapter okamzite:

```bash
mix prismatic.gen.adapter --name muj_vlastni_zdroj --category global
```

---

## Shrnuti

141 adapteru. 6 kategorii. Jedno jednotne rozhrani. At uz vysetrujete ceskou firmu, sledujete toky kryptomen, proverujete subjekt vuci mezinarodnim sankcim, nebo mapujete infrastrukturu utocnika -- vrstva OSINT platformy Prismatic vam doda strukturovanou, duveryhodnostne hodnocenou inteligenci ze zdroju, na kterych zalezi.

| Kategorie | Pocet | Hlavni sila |
|-----------|-------|------------|
| Cesko | 35 | Nejhlubsi dostupne pokryti ceskych statnich rejstriku |
| Globalni | 87 | Plne spektrum: DNS, threat intel, krypto, osoby, infrastruktura |
| Instituce EU | 13 | Primy pristup k oficialnim databazim EU |
| Sankce | 3 | Screening tri rezimu s fuzzy matchingem |
| Regionalni | 2 | UK Companies House + Evropsky obchodni rejstrik |
| Univerzalni | 2 | Agregovana emailova inteligence pres vice zdroju |

Kazdy adapter je open source, samoregistrujici a produkcne otuzeny s rate limitingem, circuit breakery a telemetrii. Prozkoumejte je na `/hub/osint/tools` nebo si prohlednejte [API dokumentaci](/api/swaggerui).

---

*Platforma Prismatic je open source. Prozkoumejte kompletni katalog adapteru, vytvorte si vlastni a prispejte zpet do zpravodajske komunity.*
