+++
title = "ZoomEye"
weight = 39
[extra]
icon = "server"
color = "cyan"
category = "global"
type = "ip"
module = "ZoomEye"
source_type = "IP"
description = "Cyberspace search engine - Chinese internet scanning platform for hosts, services, and web applications"
has_api = true
url = "https://www.zoomeye.org"
rate_limit = "Free: 10,000 results/mo, VIP plans available"
capabilities = ["Host Search", "Web App Search", "Banner Analysis", "Component Detection", "Vulnerability Matching", "Historical Data"]
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1529
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["ZoomEye", "Cyberspace", "Chinese", "osint", "global", "Prismatic Platform", "Good", "Shodan", "Censys"]
tags = ["osint", "global", "zoomeye", "prismatic"]
quality_score = 90
see_also = ["agents", "apps", "capabilities"]
image = "/images/sections/osint.png"
image_alt = "ZoomEye - Prismatic Platform"
+++

## Overview

ZoomEye is a cyberspace search engine developed by Knownsec, a major Chinese cybersecurity firm headquartered in Beijing. Often described as the Chinese counterpart to [Shodan](/osint/shodan/), ZoomEye scans the entire IPv4 address space and indexes exposed services, web applications, and network devices. It uses two distinct scanning engines: Xmap for host-level port and service detection across the IP address space, and Wmap for web application fingerprinting that identifies CMS platforms, frameworks, server software, and application components. This dual-engine approach provides both infrastructure-level and application-level intelligence from a single platform.

For [OSINT](/glossary/osint/) investigators, ZoomEye provides an additional scanning perspective that complements Shodan and [Censys](/osint/censys/). Its particular strengths lie in Asia-Pacific internet infrastructure coverage, web application component detection, and the granularity of its device classification system. For investigations involving Chinese, Southeast Asian, or broader APAC infrastructure, ZoomEye often provides coverage and detail that Western-focused scanning platforms miss.

ZoomEye's web application fingerprinting capability (Wmap) is its key differentiator. While Shodan and Censys focus primarily on service-level identification through banner grabbing, ZoomEye's Wmap engine performs deep web application analysis, identifying the specific CMS, web framework, JavaScript libraries, server software, and other components that make up a web application's technology stack. This application-layer intelligence is valuable for vulnerability assessment, technology profiling, and targeted reconnaissance.

The platform has indexed over 1 billion devices and 5 billion web applications since its launch, maintaining historical snapshots that allow analysts to track infrastructure changes over time. ZoomEye's search syntax supports both Chinese and English queries, with filters for port, service, country, city, operating system, application, and specific banner content.

## Data Sources and Coverage

ZoomEye operates two complementary scanning engines that together provide both infrastructure and application intelligence.

| Engine | Scope | Description | Data Collected |
|--------|-------|-------------|---------------|
| **Xmap** | Host-level | Port scanning and service identification across IPv4 | Open ports, banners, protocols, OS |
| **Wmap** | Application-level | Web application fingerprinting and component detection | CMS, frameworks, server software, libraries |

### Xmap Host Data

| Data Type | Description | Update Frequency |
|-----------|-------------|-----------------|
| **Open Ports** | Detected open ports with protocol identification | Continuous scanning |
| **Service Banners** | Protocol-specific banner data with version information | Per-scan cycle |
| **SSL/TLS Certificates** | Certificate details including issuer, validity, and SANs | Continuous |
| **Operating System** | OS detection from banner fingerprinting | Per-scan detection |
| **Device Type** | Classification (router, camera, SCADA, NAS, printer, etc.) | Per-scan |
| **Geolocation** | Country, city, ISP, and ASN information | Per IP update |
| **Vulnerability Matches** | Known CVEs matched against detected versions | Cross-referenced with NVD |

### Wmap Web Application Data

| Data Type | Description | Coverage |
|-----------|-------------|----------|
| **CMS Detection** | WordPress, Joomla, Drupal, custom CMS | Major and minor CMS platforms |
| **Web Frameworks** | Django, Rails, Laravel, Spring, Express | All major frameworks |
| **Server Software** | Apache, nginx, IIS, Caddy, LiteSpeed | All common servers |
| **JavaScript Libraries** | jQuery, React, Vue.js, Angular | Frontend libraries |
| **WAF Detection** | Web Application Firewall identification | Major WAF vendors |
| **Programming Language** | PHP, Python, Java, .NET, Ruby detection | Server-side languages |
| **E-commerce Platforms** | Shopify, WooCommerce, Magento | Major platforms |

### Geographic Coverage Comparison

| Region | ZoomEye | Shodan | Censys |
|--------|---------|--------|--------|
| **China** | Excellent | Good | Moderate |
| **Southeast Asia** | Excellent | Good | Good |
| **Japan/Korea** | Very Good | Good | Good |
| **North America** | Good | Excellent | Excellent |
| **Europe** | Good | Excellent | Very Good |
| **Latin America** | Good | Good | Good |
| **Africa** | Moderate | Moderate | Moderate |

## API Integration

ZoomEye provides a REST API at `https://api.zoomeye.org/` with JSON responses. Authentication uses a JWT token obtained after login.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/login` | POST | Authenticate and receive JWT token |
| `/host/search` | GET | Search hosts (Xmap data) |
| `/web/search` | GET | Search web applications (Wmap data) |
| `/both/search` | GET | Search both hosts and web applications |
| `/resources-info` | GET | Account resource information |
| `/host/details` | GET | Get detailed host information |
| `/web/details` | GET | Get detailed web application information |

### Rate Limits by Plan

| Plan | Results/Month | Features | Price |
|------|--------------|----------|-------|
| **Free** | 10,000 | Basic search, host and web | $0 (registration required) |
| **VIP** | 30,000 | Advanced filters, bulk export | Subscription |
| **Enterprise** | Custom | API priority, dedicated support | Custom |

## Query Examples

### curl Examples

```bash
# Authenticate and get JWT token
curl -X POST "https://api.zoomeye.org/user/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "your@email.com", "password": "your_password"}'

# Search hosts by service
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/host/search?query=port:22+os:linux+country:CN&page=1"

# Search web applications by CMS
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/web/search?query=app:wordpress+country:CZ&page=1"

# Search for specific device types
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/host/search?query=device:router+brand:huawei&page=1"

# Search for exposed databases
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/host/search?query=app:mongodb+port:27017&page=1"

# Search for SCADA/ICS systems
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/host/search?query=service:modbus+country:DE&page=1"

# Web application search for specific framework
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/web/search?query=framework:django+server:nginx&page=1"

# Combined search (host + web)
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/both/search?query=ip:1.2.3.0/24&page=1"

# Get account resource info
curl -H "Authorization: JWT YOUR_TOKEN" \
  "https://api.zoomeye.org/resources-info"
```

### ZoomEye Search Syntax

```bash
# Host search filters
port:443                          # Specific port
service:http                      # Service type
os:"Windows Server 2019"          # Operating system
country:"CN"                      # Country code
city:"Beijing"                    # City name
asn:4134                          # Autonomous System Number
org:"China Telecom"               # Organization
hostname:"example.com"            # Hostname
ip:"1.2.3.0/24"                  # IP CIDR range
banner:"Apache/2.4"              # Banner content
device:"router"                   # Device type
brand:"Huawei"                    # Device brand

# Web application search filters
app:"WordPress"                   # Web application/CMS
framework:"Django"                # Web framework
server:"nginx"                    # Web server
language:"PHP"                    # Programming language
waf:"Cloudflare"                  # WAF detection
title:"Admin Panel"               # Page title
header:"X-Powered-By: Express"    # HTTP header content

# Combined filters
port:3389 os:"Windows" country:"CZ"           # RDP in Czech Republic
app:"phpMyAdmin" country:"DE"                  # phpMyAdmin in Germany
device:"webcam" brand:"Hikvision" country:"JP" # Hikvision cameras in Japan
```

### Elixir Integration

```elixir
# Search hosts by service and location
{:ok, results} = PrismaticOsint.ZoomEye.host_search(
  "port:443 os:linux country:CZ",
  page: 1
)
# => %{
#   total: 45_230,
#   matches: [
#     %{ip: "1.2.3.4", port: 443, service: "https",
#       os: "Linux", banner: "nginx/1.25.3",
#       country: "CZ", city: "Prague",
#       asn: 47232, organization: "CZ.NIC",
#       vulns: ["CVE-2024-12345"]}
#   ]
# }

# Search web applications by technology
{:ok, web_results} = PrismaticOsint.ZoomEye.web_search(
  "app:wordpress framework:php country:CZ",
  page: 1
)
# => %{
#   total: 12_500,
#   matches: [
#     %{site: "example.cz", ip: "1.2.3.4",
#       server: "nginx", language: "PHP",
#       cms: "WordPress", version: "6.4.2",
#       components: ["jQuery 3.6", "Yoast SEO", "WooCommerce"],
#       title: "Example Czech Shop"}
#   ]
# }

# Search for exposed IoT devices
{:ok, iot} = PrismaticOsint.ZoomEye.host_search(
  "device:webcam brand:Hikvision country:CZ",
  page: 1
)

# Search for SCADA/ICS systems
{:ok, ics} = PrismaticOsint.ZoomEye.host_search(
  "service:modbus country:DE",
  page: 1
)

# Cross-validate with other scanners
{:ok, validated} = PrismaticOsint.Pipeline.cross_scanner_validation("1.2.3.4",
  sources: [:zoomeye, :shodan, :censys, :binaryedge],
  merge_strategy: :union
)
# => %{
#   ip: "1.2.3.4",
#   ports: %{
#     zoomeye: [22, 80, 443, 8080],
#     shodan: [22, 80, 443],
#     censys: [22, 80, 443, 8080, 8443],
#     union: [22, 80, 443, 8080, 8443]
#   },
#   consensus_services: [
#     %{port: 443, product: "nginx", agreement: 3, sources: [:zoomeye, :shodan, :censys]}
#   ]
# }

# Technology profiling pipeline
{:ok, profile} = PrismaticOsint.Pipeline.technology_profile("example.com",
  sources: [:zoomeye, :builtwith, :wappalyzer],
  include_versions: true
)
```

## Data Schema

| Field | Type | Description |
|-------|------|-------------|
| `ip` | string | IP address |
| `portinfo.port` | integer | Port number |
| `portinfo.service` | string | Identified service |
| `portinfo.product` | string | Software product name |
| `portinfo.version` | string | Software version |
| `portinfo.banner` | string | Raw service banner |
| `portinfo.extrainfo` | string | Additional service details |
| `geoinfo.country.code` | string | Country ISO code |
| `geoinfo.city.names.en` | string | City name in English |
| `geoinfo.asn` | integer | Autonomous System Number |
| `geoinfo.organization` | string | IP address organization |
| `geoinfo.isp` | string | Internet Service Provider |
| `os` | string | Detected operating system |
| `device` | string | Device type classification |
| `brand` | string | Device brand/manufacturer |
| `ssl.cert.subject.cn` | string | SSL certificate common name |
| `ssl.cert.issuer.cn` | string | Certificate issuer |
| `ssl.cert.validity.start` | datetime | Certificate validity start |
| `ssl.cert.validity.end` | datetime | Certificate validity end |
| `vulns[].id` | string | CVE identifier |
| `vulns[].severity` | string | Vulnerability severity |
| `webapp[].app` | string | Web application/CMS |
| `webapp[].framework` | string | Web framework |
| `webapp[].server` | string | Web server software |
| `webapp[].language` | string | Programming language |
| `webapp[].title` | string | Web page title |

## Use Cases

### Asia-Pacific Infrastructure Investigation

ZoomEye provides the strongest coverage for Chinese and APAC internet infrastructure among internet scanning platforms. For investigations involving organizations with infrastructure in China, Southeast Asia, Japan, or Korea, ZoomEye is often the primary scanning data source. Its Chinese-language support and regional sensor deployment provide granularity that Western-focused scanners may miss.

### Web Application Technology Profiling

ZoomEye's Wmap engine provides detailed web application fingerprinting that goes beyond basic server identification. For technology profiling, competitive intelligence, and web application security assessment, ZoomEye's component-level detection reveals the complete technology stack including CMS platforms, frameworks, JavaScript libraries, and WAF solutions.

### Cross-Scanner Validation

Using ZoomEye alongside [Shodan](/osint/shodan/) and [Censys](/osint/censys/) provides multi-source validation of internet scanning data. Findings that appear across multiple scanners have higher confidence, while discrepancies may indicate scanning evasion or timing differences. For comprehensive attack surface assessment, cross-scanner validation reduces both false positives and false negatives.

### IoT and Device Discovery

ZoomEye's device classification system identifies specific device types (routers, cameras, SCADA controllers, NAS devices, printers) and brands (Huawei, Hikvision, Siemens, QNAP). This enables targeted searches for specific device populations, supporting IoT security research and exposed device monitoring.

### Industrial Control System Monitoring

ZoomEye scans for industrial protocols including Modbus, BACnet, S7, DNP3, and EtherNet/IP. Combined with geographic filtering, this enables monitoring of exposed industrial control systems across specific regions, supporting critical infrastructure protection research.

### Vulnerability Landscape Analysis

ZoomEye matches detected software versions against the NVD vulnerability database, enabling broad analysis of vulnerability prevalence across the internet. This supports vulnerability research, patch adoption tracking, and risk assessment for specific technology stacks.

## Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **Chinese registration required** | Free account requires Chinese phone number or email | Use VPN or partner account; some features accessible without login |
| **API documentation** | Documentation primarily in Chinese with English translation gaps | Use community resources and Python SDK for integration |
| **Western infrastructure coverage** | Less comprehensive than Shodan/Censys for US/EU infrastructure | Use as supplementary source for non-APAC targets |
| **Rate limits** | Free tier limits may restrict large-scale investigations | VIP plan for production; cache results aggressively |
| **Data freshness** | Scan cycles vary; some data may be weeks old | Cross-validate with real-time scanning tools |
| **Wmap accuracy** | Web application fingerprinting may misidentify some technologies | Validate critical technology identifications manually |

## Legal and Ethical Considerations

**Passive Reconnaissance**: Querying ZoomEye's existing database is passive reconnaissance and does not constitute unauthorized access. ZoomEye has already scanned the targets; analysts are querying a search engine.

**Chinese Data Regulations**: ZoomEye is operated by a Chinese company and stores data on Chinese infrastructure. Be aware of Chinese data sovereignty regulations and the potential for data access requests from Chinese authorities. Do not submit sensitive organizational data to the platform.

**Export Controls**: Some countries restrict the export or use of internet scanning data from Chinese entities. Verify compliance with applicable export control regulations.

**Responsible Use**: As with all internet scanning platforms, use ZoomEye data for authorized security research, defensive security, and legitimate investigation purposes. Do not use discovered exposed services for unauthorized access.

## Integration with Prismatic Platform

Within the [Prismatic Platform](/apps/prismatic/), ZoomEye serves as a supplementary internet scanning source providing geographic diversity and web application intelligence.

- **Cross-Scanner Validation**: ZoomEye results are merged with [Shodan](/osint/shodan/), [Censys](/osint/censys/), and [BinaryEdge](/osint/binaryedge/) data for comprehensive multi-source infrastructure intelligence.
- **Web Application Intelligence**: ZoomEye's Wmap data feeds into technology profiling alongside [BuiltWith](/osint/builtwith/) for comprehensive web application stack identification.
- **APAC Coverage**: For investigations with Asia-Pacific infrastructure components, ZoomEye provides primary scanning data that fills coverage gaps in Western-focused platforms.
- **Perimeter EASM**: ZoomEye data contributes to [Prismatic Perimeter](/apps/prismatic-perimeter/) attack surface intelligence, particularly for organizations with APAC presence.
- **Device Classification**: ZoomEye's device type and brand identification feeds into the platform's IoT asset inventory for monitored networks.

## Best Practices

1. **Use ZoomEye for APAC targets**: When investigating infrastructure in China, Southeast Asia, or the broader APAC region, prioritize ZoomEye over Western-focused scanners.

2. **Leverage Wmap for technology profiling**: ZoomEye's web application fingerprinting is its strongest differentiator. Use Wmap searches for comprehensive technology stack identification.

3. **Cross-validate with Shodan and Censys**: Never rely on a single scanner. Use ZoomEye alongside [Shodan](/osint/shodan/) and [Censys](/osint/censys/) for high-confidence infrastructure intelligence.

4. **Use device-specific searches**: ZoomEye's device classification and brand filtering enables targeted searches for specific device populations that are harder to perform on other platforms.

5. **Monitor ICS exposure**: ZoomEye's industrial protocol scanning provides valuable visibility into exposed SCADA and ICS systems, particularly in APAC regions.

6. **Cache search results**: ZoomEye's monthly result limits make caching important. Store results locally for repeat analysis.

7. **Use the Python SDK**: ZoomEye provides an official Python SDK (`zoomeye-python`) that simplifies API integration and handles authentication automatically.

## Related Providers

- [Shodan](/osint/shodan/) - Primary internet-connected device search engine
- [Censys](/osint/censys/) - Internet-wide scanning with certificate focus
- [BinaryEdge](/osint/binaryedge/) - Internet scanning with data leak detection
- [ONYPHE](/osint/onyphe/) - French cyber defense search engine
- [Netlas](/osint/netlas/) - Internet intelligence with response-level search
- [BuiltWith](/osint/builtwith/) - Technology profiling for websites
- [SecurityTrails](/osint/securitytrails/) - DNS and domain intelligence
- [GreyNoise](/osint/greynoise/) - Scanner and noise identification

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](/developers/) | [Architecture](/architecture/) | [Meet the Creator](/about/author/)