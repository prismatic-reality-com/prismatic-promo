+++
title = "The Complete Guide to Prismatic's 141 OSINT Adapters"
date = 2026-04-01
description = "A comprehensive overview of all 141 OSINT intelligence adapters in the Prismatic Platform — covering Czech registries, global threat intelligence, EU institutions, sanctions screening, and more."

[extra]
author = "Tomas Korcak (korczis)"
category = "deep-dive"
tags = ["osint", "adapters", "intelligence", "czech-registries", "threat-intelligence", "sanctions", "eu-institutions", "elixir"]
reading_time = "18 min"
keywords = ["OSINT adapters", "open source intelligence", "Czech business registry", "threat intelligence platform", "sanctions screening", "EU OSINT", "Prismatic Platform OSINT", "intelligence gathering Elixir", "ARES adapter", "VirusTotal integration", "Shodan OSINT"]
image = "/images/blog/osint-adapters-complete-guide.png"
word_count = 3200
date_created = "2026-04-01"
date_modified = "2026-04-01"
quality_score = 85
see_also = ["osint", "adapter-pattern", "self-registration", "confidence-score", "telemetry"]
image_alt = "Complete Guide to Prismatic's 141 OSINT Adapters - Intelligence at Scale"
+++

Open-source intelligence is only as good as the sources feeding it. Prismatic ships with **141 production-grade OSINT adapters** spanning Czech government registries, global threat intelligence feeds, EU institutional databases, international sanctions lists, and more. Every adapter is self-registering, rate-limited, circuit-breaker-protected, and streams results in real time via PubSub.

This post is the definitive catalog. Whether you are running due diligence on a Czech company, tracking a malicious IP across threat feeds, or screening an entity against global sanctions -- there is an adapter for that.

---

## Architecture at a Glance

All 141 adapters live under `prismatic_osint_sources` and implement a unified behaviour contract:

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

Adapters self-register into an ETS-backed `ToolRegistry` at compile time. No manual wiring, no hardcoded lists. Add a new adapter module, compile, and it appears in the toolbox UI, REST API, and CLI simultaneously.

Each adapter gets automatic:
- **Rate limiting** (token bucket per adapter)
- **Circuit breaker** (opens after 5 consecutive failures, half-open retry after 30s)
- **ETS result caching** (configurable TTL)
- **Telemetry instrumentation** (execution time, success/failure counters)
- **PubSub streaming** (real-time result delivery to LiveView UIs)

---

## Czech Adapters (35)

The deepest coverage in the platform. Czech adapters query official government registries, financial regulators, legal databases, and transparency portals -- sources that are critical for due diligence, compliance, and investigative work in the Czech Republic.

### Business & Company Registries

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **ARES** | Ministry of Finance (ARES) | Company details by ICO -- name, address, legal form, NACE codes, date of incorporation |
| **ARES Tesla** | ARES (Tesla-enhanced) | Same data as ARES with improved API performance and retry logic |
| **Commercial Register** | Justice.cz OR registry | Ownership structure, statutory bodies, registered capital, articles of association |
| **Commercial Register Fallback** | Justice.cz (with fallback) | Enhanced version with automatic fallback strategies when primary endpoint is unavailable |
| **OR Registry** | Obchodni Rejstrik | ML-enhanced commercial registry extraction with structured entity parsing |
| **Rejstrik Firem** | rejstrik-firem.kurzy.cz | Alternative business registry access with financial summaries |
| **Podnikatel.cz** | podnikatel.cz | Czech business intelligence portal -- company profiles, industry analysis |
| **CNB** | Czech National Bank | Regulated financial entities, banking licenses, investment firm registrations |
| **RES** | Czech Statistical Office | Business information from the Register of Economic Subjects |

### Legal & Justice

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Justice.cz** | Official court registry | ML-enhanced legal entity extraction -- court filings, corporate changes, insolvency events |
| **Court Cases** | Czech court system | Litigation history, case status, involved parties, rulings |
| **Executors** | Executor chamber | Enforcement proceedings, active executions, debtor status |
| **Infodeska** | InfoDeska.justice.cz | Court electronic bulletin board -- edicts, summons, official notices |
| **ISIR** | Insolvency Register | Insolvency proceedings, bankruptcy filings, creditor claims, reorganization plans |
| **Senate** | Czech Senate | Upper chamber records, senator profiles, legislative votes |
| **Parliament** | Poslanecka Snemovna | MP records, voting history, committee memberships, interpellations |

### Financial & Compliance

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **DPH** | Ministry of Finance | VAT registration status, VAT number validation, registration date |
| **Nespolehlivy Platce** | Ministry of Finance | Unreliable VAT payer list -- flagged entities with restricted VAT deduction |
| **CEDR** | Central Subsidies Registry | Government subsidies received, grant amounts, project descriptions, beneficiaries |
| **RZP** | Trade Licensing Office | Trade licenses, business activities, registered trades |

### Government & Administration

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **ISVS** | Public Administration IS | Government information system records, administrative metadata |
| **Local Government** | Municipal registries | Local officials, council members, municipal budget data |
| **CUZK** | Czech Land Registry | Property ownership, land parcels, cadastral maps, encumbrances |
| **Datove Schranky** | Data Mailbox System | Official data mailbox existence and type (confirms entity is registered with government) |

### Regulatory & Specialized

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **CTU** | Czech Telecommunication Office | Telecom licenses, frequency allocations, operator registrations |
| **ERU** | Energy Regulatory Office | Energy licenses, price decisions, regulated entity listings |
| **SUKL** | Drug Control Institute | Pharmaceutical registrations, drug approvals, clinical trial data |
| **SZIF** | Agricultural Fund | Agricultural subsidies, EU fund distributions, farmer registrations |
| **UOHS** | Antimonopoly Office | Competition decisions, merger approvals, public procurement violations |
| **Registr Smluv** | Contract Registry | Public contracts above CZK 50,000 -- parties, amounts, full text |
| **Verejne Zakazky** | Public Procurement Portal | Active tenders, contract awards, supplier selections, bid amounts |
| **Hlidac Statu** | State Watchdog NGO | Transparency data -- political donations, media ownership, contract analysis |
| **Forbes CZ** | Forbes Czech | Rich list rankings, business profiles, estimated net worth |

### Intelligent Routing

| Adapter | Purpose |
|---------|---------|
| **ML Intelligence** | ML-powered query classification that routes to the optimal Czech registry automatically |
| **Smart Router** | Intelligent multi-source routing -- runs parallel queries across relevant Czech sources and merges results |

---

## Global Adapters (87)

The largest category. Global adapters cover DNS and network intelligence, IP geolocation, malware analysis, cryptocurrency tracing, people search, social media, infrastructure scanning, and business intelligence from international sources.

### DNS & Network Intelligence

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **crt.sh** | Certificate Transparency | SSL/TLS certificates issued for a domain -- subdomains, issuers, expiration dates |
| **DNSDumpster** | HackerTarget | DNS enumeration -- subdomains, MX records, TXT records, host IPs |
| **Robtex** | Robtex | Reverse DNS, shared hosting detection, IP-to-domain mappings |
| **RIPESTAT** | RIPE NCC | IP block allocations, ASN ownership, BGP routing prefixes, abuse contacts |
| **Team Cymru** | Team Cymru | IP/ASN reputation, geolocation, malware hash lookups |
| **ViewDNS** | ViewDNS.info | WHOIS, reverse IP, DNS propagation, port scanning, ping |
| **SecurityTrails** | SecurityTrails | Historical DNS records, domain WHOIS history, associated domains |
| **PassiveTotal** | RiskIQ | Passive DNS resolutions, WHOIS history, SSL certificate associations |
| **BGPView** | BGPView | BGP routing tables, IP prefix allocation, ASN peering relationships |

### IP & Geolocation

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **IPInfo** | ipinfo.io | IP geolocation, ASN, company, VPN/proxy/tor detection |
| **IPData** | ipdata.co | Geolocation with ASN, company, threat intelligence, and carrier data |
| **IP2Location** | IP2Location | Geolocation, ISP, domain, usage type, VPN/proxy detection |
| **IPStack** | ipstack.com | Geolocation with currency, timezone, language, and connection data |
| **IPQualityScore** | IPQualityScore | Fraud scoring -- VPN, proxy, tor, bot detection, abuse probability |
| **MaxMind** | MaxMind GeoIP | Enterprise geolocation database with city-level accuracy |

### Phone Intelligence

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Twilio Lookup** | Twilio | Phone number validation, carrier identification, line type |
| **NumVerify** | numverify.com | International phone validation, carrier, line type, location |
| **Phone Reputation** | Multiple sources | Aggregated phone number reputation scoring and spam detection |

### Malware & Threat Intelligence

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **VirusTotal** | VirusTotal (70+ engines) | File/URL/domain/IP analysis across 70+ antivirus engines with detection ratios |
| **URLhaus** | abuse.ch | Known malicious URLs, malware distribution sites, payload hashes |
| **URLScan** | urlscan.io | Website screenshot, DOM snapshot, resource loading, technology detection |
| **PhishTank** | OpenDNS | Verified phishing URLs with submission metadata and verification status |
| **MalwareBazaar** | abuse.ch | Malware sample repository -- hashes, signatures, YARA rules, family classification |
| **ThreatCrowd** | ThreatCrowd | Domain/IP/email threat associations, malware connections, timeline |
| **ThreatFox** | abuse.ch | IOC sharing -- C2 servers, malware configs, botnet infrastructure |
| **GreyNoise** | GreyNoise | Internet background noise classification -- benign scanners vs. malicious actors |
| **AlienVault OTX** | AlienVault | Open Threat Exchange pulses -- IOCs, threat reports, community intelligence |
| **AlienVault** | AT&T Cybersecurity | Enterprise threat intelligence feeds and correlation |
| **Pulsedive** | Pulsedive | Threat intelligence with risk scoring, IOC enrichment, feed aggregation |
| **IntelligenceX** | Intelligence X | Darknet data, leaked databases, Tor hidden service content |

### Vulnerability & Exploit Databases

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Exploit-DB** | Offensive Security | Public exploits, shellcode, papers -- searchable by CVE, platform, type |
| **NVD** | NIST | National Vulnerability Database -- CVE details, CVSS scores, affected products |
| **Snyk** | Snyk | Open-source vulnerability data with fix recommendations and severity |

### Abuse & Reputation

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **AbuseIPDB** | AbuseIPDB | IP abuse reports, confidence scores, attack categories, reporter data |
| **SpamHaus** | Spamhaus | DNS blocklist lookups -- SBL, XBL, PBL, DBL for spam and malware |

### Cryptocurrency & Blockchain

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Blockchain.com** | Blockchain.com | Bitcoin transaction lookups, address balances, block data |
| **Etherscan** | Etherscan | Ethereum transactions, token transfers, smart contract interactions |
| **CoinGecko** | CoinGecko | Cryptocurrency prices, market cap, trading volume, historical data |
| **CoinMarketCap** | CoinMarketCap | Market rankings, price data, exchange listings, project metadata |
| **BitcoinAbuse** | BitcoinAbuse.com | Bitcoin address abuse reports -- ransomware, sextortion, fraud |
| **Chainalysis** | Chainalysis | Blockchain forensics -- cluster analysis, risk scoring, entity attribution |
| **Crystal Blockchain** | Crystal | Transaction flow analysis, address clustering, compliance screening |
| **WalletExplorer** | WalletExplorer | Bitcoin wallet clustering, known entity labeling, transaction tracing |

### People & Email Intelligence

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Hunter.io** | Hunter | Email addresses associated with a domain, verification status, sources |
| **FullContact** | FullContact | Person enrichment -- social profiles, demographics, employment history |
| **Pipl** | Pipl | Deep people search -- identity resolution across public records and social media |
| **EmailRep** | EmailRep.io | Email reputation -- age, breach history, deliverability, malicious activity |
| **Clearbit** | Clearbit | Company and person intelligence -- firmographics, technographics, social data |
| **ZoomInfo** | ZoomInfo | B2B contact database -- job titles, direct dials, company org charts |
| **LinkedIn Sales Navigator** | LinkedIn | Professional profiles, company pages, employee counts, job postings |
| **Have I Been Pwned** | HIBP | Breach database -- which data breaches an email appeared in |
| **DeHashed** | DeHashed | Compromised credential aggregator -- emails, usernames, passwords, hashes |

### Social Media & Web Search

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **DuckDuckGo** | DuckDuckGo | Privacy-focused web search results with instant answers |
| **Google Custom Search** | Google | Filtered search results with site restriction and date range support |
| **Google Vision** | Google Cloud | Image analysis -- OCR text extraction, label detection, face detection |
| **Bing Visual Search** | Microsoft | Reverse image search with visual similarity matching |
| **TinEye** | TinEye | Reverse image search -- find where an image appears online, modification detection |
| **Social Searcher** | Social Searcher | Real-time social media monitoring across multiple platforms |
| **PublicWWW** | PublicWWW | Source code search -- find websites using specific scripts, tracking codes, or snippets |

### Code & Package Registries

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **GitHub Code** | GitHub | Repository and code search -- find projects, contributors, commit history |
| **GitLab Code** | GitLab | Repository search across public GitLab instances |
| **NPM Registry** | npmjs.com | Node.js package metadata, maintainers, download stats, dependencies |
| **PyPI** | pypi.org | Python package information, release history, project URLs |

### Infrastructure & Web Scanning

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Shodan** | Shodan | Internet-wide port scan data -- open ports, banners, vulnerabilities, screenshots |
| **Censys** | Censys | Internet scanning -- SSL certificates, open ports, protocol detection |
| **Onyphe** | Onyphe | French cyber threat intelligence -- geolocation, synscan, datascan, vulnscan |
| **BinaryEdge** | BinaryEdge | Internet scanning with vulnerability detection and data leak monitoring |
| **Zoomey** | ZoomEye | Chinese internet scanning platform -- device discovery, vulnerability data |
| **BuiltWith** | BuiltWith | Website technology profiling -- CMS, analytics, frameworks, CDN, hosting |
| **SpyOnWeb** | SpyOnWeb | Website relationships via shared analytics IDs, IP addresses, nameservers |
| **DomainBigData** | DomainBigData | Domain reputation, registrant info, related domains, IP history |
| **Whoisology** | Whoisology | Deep WHOIS history with reverse lookups by registrant, email, nameserver |
| **SSLMate** | SSLMate/Certspotter | SSL certificate monitoring and transparency log watching |
| **Common Crawl** | Common Crawl | Petabyte-scale web archive -- historical page content and link structure |

### Company & Business Intelligence

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Crunchbase** | Crunchbase | Startup and company data -- funding rounds, investors, acquisitions, founders |
| **Open Corporates** | OpenCorporates | Global company registry aggregator -- 200M+ companies across jurisdictions |
| **Beneficial Ownership** | Various registries | Ultimate beneficial ownership data for corporate transparency |
| **NewsAPI** | NewsAPI | Global news aggregation -- articles from 80,000+ sources with sentiment |
| **GDELT** | GDELT Project | Global event database -- geopolitical events, conflict, protest, tone analysis |

### Dark Web & Specialized

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Ahmia** | Ahmia.fi | Tor hidden service search engine -- .onion site discovery and indexing |
| **Wayback Machine** | Internet Archive | Historical website snapshots -- see how any URL looked at any point in time |
| **Exif Tool** | ExifTool | Image metadata extraction -- GPS coordinates, camera model, timestamps, software |

### Legal & Financial (International)

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Court Records** | Public court databases | Court case search across available jurisdictions |
| **SEC EDGAR** | US SEC | Securities filings -- 10-K, 10-Q, 8-K, insider transactions, proxy statements |

---

## EU Institutional Adapters (13)

A dedicated set of adapters for querying official European Union databases -- essential for regulatory compliance, policy research, and cross-border due diligence.

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Commission** | European Commission | Policy documents, press releases, legislative proposals |
| **Parliament** | European Parliament | MEP records, legislative procedures, plenary votes, committee reports |
| **ECJ** | Court of Justice of the EU | Case law, rulings, opinions of Advocates General |
| **Court of Auditors** | European Court of Auditors | Audit reports, financial findings, special reports on EU spending |
| **ECB** | European Central Bank | Monetary policy decisions, exchange rates, supervised entity lists |
| **Transparency Register** | EU Transparency Register | Lobbying activity -- organizations, individuals, declared budgets |
| **EUR-Lex** | EUR-Lex | EU legislation by CELEX number -- directives, regulations, decisions |
| **TED** | Tenders Electronic Daily | EU public procurement notices -- contract awards, calls for tender |
| **Eurostat** | Eurostat | EU statistical data -- demographics, trade, economy, social indicators |
| **Agencies** | EU Agencies | Data from specialized EU agencies (EMA, ENISA, Europol, etc.) |
| **EEAS** | External Action Service | EU foreign policy positions, sanctions context, diplomatic statements |
| **EDPS** | Data Protection Supervisor | Data protection decisions, guidelines, opinions on privacy legislation |
| **Ombudsman** | EU Ombudsman | Complaint investigations, maladministration findings, recommendations |

---

## Sanctions Adapters (3)

Three-layer sanctions screening covering the major international sanctions regimes:

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **EU Sanctions** | European Union | EU consolidated sanctions list -- individuals, entities, vessels, restrictions |
| **OFAC SDN** | US Treasury | Specially Designated Nationals list -- blocked persons and entities |
| **UN Sanctions** | United Nations | UN Security Council sanctions -- travel bans, asset freezes, arms embargoes |

These adapters support fuzzy name matching, transliteration handling, and confidence-scored results. A single `search/2` call against the sanctions category runs all three in parallel and returns a merged, deduplicated result set.

---

## Regional Adapters (2)

| Adapter | Source | What It Returns |
|---------|--------|-----------------|
| **Companies House** | UK Companies House | UK company registrations, director appointments, filing history, accounts |
| **EBR** | European Business Register | Cross-border European business entity lookups |

---

## Universal Adapters (2)

| Adapter | Purpose |
|---------|---------|
| **Email Intelligence** | Aggregated email reputation and breach checking across multiple sources (HIBP, EmailRep, Hunter) |
| **Email Intelligence (Rate Limited)** | Same capabilities with conservative rate limits for high-volume batch processing |

---

## Confidence Scoring

Every result from every adapter flows through a confidence scoring pipeline. Scores are assigned based on source reliability:

| Category | Confidence Range | Examples |
|----------|-----------------|----------|
| Official Registry | 0.95 -- 1.00 | ARES, Justice.cz, Companies House, SEC EDGAR |
| Commercial Database | 0.80 -- 0.94 | Shodan, VirusTotal, Crunchbase, SecurityTrails |
| Community / Open Source | 0.60 -- 0.79 | AbuseIPDB, PhishTank, AlienVault OTX |
| Web Scraping | 0.40 -- 0.59 | Social media, news aggregation |
| Unverified | 0.00 -- 0.39 | Raw feeds, dark web sources |

When multiple adapters return data about the same entity, confidence scores are combined using the Nabla epistemic framework to produce a final composite score.

---

## Using the Adapters

### Web UI

Browse all adapters at `/hub/osint/tools`. Each adapter has a detail page with a dynamic form generated from its `input_fields` configuration. Execute any adapter directly from the browser and view structured results in real time.

### REST API

```bash
# List all adapters
curl http://localhost:4004/api/v1/osint/list_tools

# Filter by category
curl -X POST http://localhost:4004/api/v1/osint/filter_tools \
  -H "Content-Type: application/json" \
  -d '{"category": "czech"}'

# Execute an adapter
curl -X POST http://localhost:4004/api/v1/osint/execute_tool \
  -H "Content-Type: application/json" \
  -d '{"slug": "czech-ares", "input": {"query": "12345678"}}'
```

### Elixir API

```elixir
# Direct adapter call
{:ok, results} = PrismaticOsintSources.Adapters.Czech.Ares.search("12345678")

# Via the tool registry (recommended)
{:ok, results} = PrismaticOsintCore.ToolRegistry.execute("czech-ares", %{query: "12345678"})

# Multi-source search across a category
{:ok, results} = PrismaticOsintCore.search("Navigara s.r.o.", category: :czech)
```

---

## Building Your Own

The platform is extensible. See [Building OSINT Adapters with Elixir](@/blog/building-osint-adapters-with-elixir.md) for a step-by-step guide, or scaffold one instantly:

```bash
mix prismatic.gen.adapter --name my_custom_source --category global
```

---

## Summary

141 adapters. 6 categories. One unified interface. Whether you are investigating a Czech company, tracing cryptocurrency flows, screening against international sanctions, or mapping an attacker's infrastructure -- Prismatic's OSINT layer gives you structured, confidence-scored intelligence from the sources that matter.

| Category | Count | Key Strength |
|----------|-------|-------------|
| Czech | 35 | Deepest Czech government registry coverage available |
| Global | 87 | Full-spectrum: DNS, threat intel, crypto, people, infrastructure |
| EU Institutional | 13 | Direct access to official EU databases |
| Sanctions | 3 | Three-regime screening with fuzzy matching |
| Regional | 2 | UK Companies House + European Business Register |
| Universal | 2 | Cross-source email intelligence aggregation |

Every adapter is open source, self-registering, and production-hardened with rate limiting, circuit breakers, and telemetry. Explore them at `/hub/osint/tools` or browse the [API documentation](/api/swagger-ui).

---

*Prismatic Platform is open source. Explore the full adapter catalog, build your own, and contribute back to the intelligence community.*
