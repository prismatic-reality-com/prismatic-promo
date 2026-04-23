+++
title = "Prismatic SDK"
description = "Type-safe SDK for building AI-orchestrated intelligence applications. Multi-language support with comprehensive documentation and examples."
weight = 10
sort_by = "weight"
template = "developers-section.html"

[extra]
author = "Tomáš Korcak (korczis)"
reading_time = "15 min"
word_count = 2800
difficulty = "intermediate"
image = "/images/sdk-architecture.png"
image_alt = "Prismatic SDK Architecture - Multi-language Intelligence Framework"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "technical_reference"
content_version = "1.0.0"
date_created = "2026-02-21"
last_enhanced = "2026-02-21"
quality_score = 80
tech_stack = ["TypeScript", "Elixir", "Python", "Go", "OpenAPI"]
languages_supported = ["typescript", "elixir", "python", "go", "rust"]
sdk_version = "0.8.0"
license = "MIT"
repository = "https://github.com/prismatic-platform/prismatic-sdk"
npm_package = "@prismatic-platform/sdk"
pypi_package = "prismatic-sdk"
hex_package = "prismatic_sdk"
target_audience = ["full_stack_developers", "backend_engineers", "data_scientists"]
learning_objectives = ["SDK installation", "API authentication", "OSINT operations", "error handling"]
see_also = ["plugins", "ui-components", "api"]
date_modified = "2026-02-23"
keywords = ["Prismatic", "SDK", "Type-safe", "AI-orchestrated", "Multi-language", "developers", "Prismatic Platform", "Prismatic SDK", "OSINT", "Setup"]
tags = ["developers", "prismatic-sdk", "prismatic"]
+++

# Prismatic SDK

## Production-Ready Intelligence Framework

The Prismatic SDK provides type-safe, multi-language access to the platform's intelligence capabilities. Built with developer experience in mind, it offers comprehensive OSINT collection, security analysis, and AI-powered insights through a unified API surface.

### Key Features

- **🔒 Type Safety**: Full TypeScript definitions with runtime validation
- **⚡ High Performance**: Sub-100ms response times with built-in caching
- **🛡️ Error Resilience**: Automatic retry, circuit breakers, and graceful degradation
- **📊 Real-time Streaming**: WebSocket support for long-running operations
- **🎯 Multi-source Intelligence**: 120+ OSINT adapters with unified interface

---

## Installation & Setup

### Node.js / TypeScript

```bash
npm install @prismatic-platform/sdk
# or
yarn add @prismatic-platform/sdk
```

### Python

```bash
pip install prismatic-sdk
# or
poetry add prismatic-sdk
```

### Elixir

```elixir
# mix.exs
defp deps do
  [
    {:prismatic_sdk, "~> 0.8.0"}
  ]
end
```

### Go

```bash
go get github.com/prismatic-platform/prismatic-sdk-go
```

---

## Authentication

### API Key Setup

```typescript
import { PrismaticSDK } from '@prismatic-platform/sdk';

const sdk = new PrismaticSDK({
  apiKey: process.env.PRISMATIC_API_KEY,
  endpoint: 'https://api.prismatic-platform.org',
  timeout: 30000, // 30 seconds
  retries: 3
});
```

### Environment Configuration

```bash
# .env file
PRISMATIC_API_KEY=pk_live_1234567890abcdef
PRISMATIC_ENDPOINT=https://api.prismatic-platform.org
PRISMATIC_TIMEOUT=30000
```

---

## Core Operations

### Domain Intelligence

```typescript
// Comprehensive domain analysis
const analysis = await sdk.osint.analyzeDomain('example.com', {
  includeSubdomains: true,
  includeCertificates: true,
  includeHistorical: true,
  maxDepth: 3
});

console.log({
  domain: analysis.domain,
  securityRating: analysis.security_rating,
  riskFactors: analysis.risk_factors,
  subdomainCount: analysis.subdomains.length,
  certificateInfo: analysis.certificates
});
```

### Security Rating

```typescript
// Get security rating with detailed breakdown
const rating = await sdk.perimeter.getSecurityRating('target.com');

console.log({
  grade: rating.grade, // A, B, C, D, or F
  score: rating.score, // 300-900 numeric score
  percentile: rating.industry_percentile,
  factors: rating.contributing_factors.map(f => ({
    category: f.category,
    impact: f.impact,
    description: f.description
  }))
});
```

### Email Intelligence

```typescript
// Email analysis and breach detection
const emailIntel = await sdk.osint.analyzeEmail('user@example.com', {
  checkBreaches: true,
  checkReputations: true,
  includeSocialProfiles: true
});

console.log({
  email: emailIntel.email,
  breaches: emailIntel.breaches.length,
  riskScore: emailIntel.risk_score,
  socialProfiles: emailIntel.social_profiles,
  reputation: emailIntel.reputation_score
});
```

### Threat Intelligence

```typescript
// IOC analysis across multiple threat feeds
const threatAnalysis = await sdk.threat.analyzeIndicator('192.168.1.1', 'ip');

console.log({
  indicator: threatAnalysis.indicator,
  threatScore: threatAnalysis.threat_score,
  categories: threatAnalysis.threat_categories,
  sources: threatAnalysis.sources.map(s => s.name),
  firstSeen: threatAnalysis.first_seen,
  lastSeen: threatAnalysis.last_seen
});
```

---

## Advanced Features

### Streaming Operations

```typescript
// Real-time streaming for long-running analysis
const stream = sdk.osint.streamDomainAnalysis('large-company.com', {
  comprehensive: true,
  realTimeUpdates: true
});

stream.on('progress', (update) => {
  console.log(`Progress: ${update.percentage}%`);
  console.log(`Current operation: ${update.operation}`);
});

stream.on('partial_result', (result) => {
  console.log('Partial result:', result);
});

stream.on('complete', (finalResult) => {
  console.log('Analysis complete:', finalResult);
});

stream.on('error', (error) => {
  console.error('Stream error:', error);
});
```

### Batch Operations

```typescript
// Analyze multiple targets efficiently
const targets = ['domain1.com', 'domain2.com', 'domain3.com'];
const batchResults = await sdk.osint.batchAnalyzeDomains(targets, {
  concurrency: 5,
  timeout: 60000,
  includeFailures: true
});

batchResults.forEach((result, index) => {
  if (result.success) {
    console.log(`${targets[index]}: ${result.data.security_rating.grade}`);
  } else {
    console.log(`${targets[index]}: Error - ${result.error.message}`);
  }
});
```

### Custom Configurations

```typescript
// Advanced SDK configuration
const sdk = new PrismaticSDK({
  apiKey: process.env.PRISMATIC_API_KEY,
  endpoint: 'https://api.prismatic-platform.org',

  // Timeout configuration
  timeout: 45000,
  retries: 5,
  retryDelay: 1000,

  // Rate limiting
  rateLimit: {
    requests: 100,
    window: 60000 // per minute
  },

  // Caching
  cache: {
    enabled: true,
    ttl: 300000, // 5 minutes
    maxSize: 1000
  },

  // Error handling
  errorHandling: {
    throwOnApiError: true,
    includeStackTrace: true,
    logErrors: true
  }
});
```

---

## Language-Specific Examples

### Python

```python
from prismatic_sdk import PrismaticSDK
import asyncio
import os

# Initialize SDK
sdk = PrismaticSDK(
    api_key=os.getenv('PRISMATIC_API_KEY'),
    endpoint='https://api.prismatic-platform.org'
)

async def analyze_domain(domain):
    """Analyze domain with comprehensive intelligence gathering"""
    try:
        # Domain analysis
        analysis = await sdk.osint.analyze_domain(domain, {
            'include_subdomains': True,
            'include_certificates': True,
            'max_depth': 2
        })

        print(f"Domain: {analysis.domain}")
        print(f"Security Rating: {analysis.security_rating.grade}")
        print(f"Risk Score: {analysis.security_rating.score}")

        # Process subdomains
        for subdomain in analysis.subdomains:
            if subdomain.risk_score > 0.7:
                print(f"High-risk subdomain: {subdomain.domain}")

        return analysis

    except Exception as e:
        print(f"Error analyzing {domain}: {e}")
        return None

# Run analysis
result = asyncio.run(analyze_domain('example.com'))
```

### Elixir

```elixir
# Initialize SDK
{:ok, sdk} = PrismaticSdk.start_link(
  api_key: System.get_env("PRISMATIC_API_KEY"),
  endpoint: "https://api.prismatic-platform.org"
)

# Domain analysis with pattern matching
case PrismaticSdk.Osint.analyze_domain(sdk, "example.com") do
  {:ok, %{security_rating: %{grade: grade, score: score}} = analysis} ->
    IO.puts("Domain: #{analysis.domain}")
    IO.puts("Security Grade: #{grade}")
    IO.puts("Security Score: #{score}")

    # Handle different security grades
    case grade do
      "A" -> IO.puts("Excellent security posture")
      "B" -> IO.puts("Good security posture")
      "C" -> IO.puts("Average security posture")
      "D" -> IO.puts("Below average security posture")
      "F" -> IO.puts("Poor security posture - immediate attention required")
    end

  {:error, reason} ->
    IO.puts("Analysis failed: #{reason}")
end
```

### Go

```go
package main

import (
    "context"
    "fmt"
    "os"

    "github.com/prismatic-platform/prismatic-sdk-go"
)

func main() {
    // Initialize SDK
    client := prismatic.NewClient(prismatic.Config{
        APIKey:   os.Getenv("PRISMATIC_API_KEY"),
        Endpoint: "https://api.prismatic-platform.org",
        Timeout:  30 * time.Second,
    })

    // Analyze domain
    ctx := context.Background()
    analysis, err := client.OSINT.AnalyzeDomain(ctx, "example.com", &prismatic.DomainAnalysisOptions{
        IncludeSubdomains:   true,
        IncludeCertificates: true,
        MaxDepth:           2,
    })

    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }

    fmt.Printf("Domain: %s\n", analysis.Domain)
    fmt.Printf("Security Grade: %s\n", analysis.SecurityRating.Grade)
    fmt.Printf("Risk Score: %.2f\n", analysis.SecurityRating.Score)

    // Process high-risk findings
    for _, factor := range analysis.RiskFactors {
        if factor.Severity == "high" {
            fmt.Printf("High-risk factor: %s - %s\n",
                factor.Category, factor.Description)
        }
    }
}
```

---

## Error Handling

### Comprehensive Error Management

```typescript
try {
  const analysis = await sdk.osint.analyzeDomain('example.com');
  console.log('Analysis successful:', analysis);

} catch (error) {
  if (error instanceof PrismaticAPIError) {
    switch (error.code) {
      case 'RATE_LIMIT_EXCEEDED':
        console.log('Rate limit hit, retrying in:', error.retryAfter);
        break;

      case 'INVALID_DOMAIN':
        console.log('Domain validation failed:', error.message);
        break;

      case 'INSUFFICIENT_QUOTA':
        console.log('API quota exceeded:', error.details);
        break;

      case 'SERVICE_UNAVAILABLE':
        console.log('Service temporarily unavailable:', error.message);
        break;

      default:
        console.log('API error:', error.message);
    }
  } else {
    console.log('Unexpected error:', error);
  }
}
```

### Circuit Breaker Pattern

```typescript
// SDK automatically implements circuit breaker
const sdk = new PrismaticSDK({
  apiKey: process.env.PRISMATIC_API_KEY,
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 30000 // 30 seconds
  }
});

// Circuit breaker state monitoring
sdk.on('circuit_breaker_open', () => {
  console.log('Circuit breaker opened - failing fast');
});

sdk.on('circuit_breaker_half_open', () => {
  console.log('Circuit breaker half-open - testing service');
});

sdk.on('circuit_breaker_closed', () => {
  console.log('Circuit breaker closed - service restored');
});
```

---

## Performance Optimization

### Caching Strategies

```typescript
// Configure intelligent caching
const sdk = new PrismaticSDK({
  apiKey: process.env.PRISMATIC_API_KEY,
  cache: {
    enabled: true,

    // Different TTL for different operations
    ttl: {
      domain_analysis: 300000,      // 5 minutes
      security_rating: 600000,     // 10 minutes
      threat_intelligence: 180000, // 3 minutes
      email_analysis: 900000       // 15 minutes
    },

    // Cache size limits
    maxSize: 2000,
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB

    // Cache invalidation
    invalidateOnError: true,
    refreshAhead: true
  }
});
```

### Connection Pooling

```typescript
// Optimize for high-throughput operations
const sdk = new PrismaticSDK({
  apiKey: process.env.PRISMATIC_API_KEY,

  // Connection pool configuration
  pool: {
    maxConnections: 10,
    idleTimeout: 30000,
    connectionTimeout: 5000,
    keepAlive: true
  },

  // Request optimization
  compression: true,
  http2: true,

  // Batch optimization
  batching: {
    enabled: true,
    maxBatchSize: 20,
    batchTimeout: 100
  }
});
```

---

## Testing & Development

### Mock SDK for Testing

```typescript
import { MockPrismaticSDK } from '@prismatic-platform/sdk/testing';

// In your tests
describe('Intelligence Service', () => {
  let mockSDK: MockPrismaticSDK;

  beforeEach(() => {
    mockSDK = new MockPrismaticSDK();
  });

  it('should handle domain analysis', async () => {
    // Mock successful response
    mockSDK.osint.analyzeDomain.mockResolvedValue({
      domain: 'example.com',
      security_rating: { grade: 'A', score: 850 },
      risk_factors: []
    });

    const service = new IntelligenceService(mockSDK);
    const result = await service.analyzeDomain('example.com');

    expect(result.securityGrade).toBe('A');
    expect(mockSDK.osint.analyzeDomain).toHaveBeenCalledWith('example.com', undefined);
  });

  it('should handle API errors gracefully', async () => {
    // Mock error response
    mockSDK.osint.analyzeDomain.mockRejectedValue(
      new PrismaticAPIError('RATE_LIMIT_EXCEEDED', 'Too many requests')
    );

    const service = new IntelligenceService(mockSDK);

    await expect(service.analyzeDomain('example.com'))
      .rejects.toThrow('RATE_LIMIT_EXCEEDED');
  });
});
```

### Development Tools

```bash
# SDK development CLI
npx prismatic-sdk init my-project
npx prismatic-sdk validate --config prismatic.config.js
npx prismatic-sdk test --coverage
npx prismatic-sdk benchmark --operations=domain_analysis

# Generate type definitions
npx prismatic-sdk codegen --language=typescript --output=./types/

# API explorer
npx prismatic-sdk explore --endpoint=osint.analyzeDomain
```

---

## Migration Guide

### From Version 0.7.x to 0.8.x

```typescript
// Old API (0.7.x)
const result = await sdk.analyzeDomain('example.com');

// New API (0.8.x) - more structured
const result = await sdk.osint.analyzeDomain('example.com', {
  includeSubdomains: true
});

// Breaking changes handled with migration helper
import { migrate } from '@prismatic-platform/sdk/migrate';

const legacyResult = {
  domain: 'example.com',
  score: 850,
  grade: 'A'
};

const modernResult = migrate.domainAnalysis(legacyResult);
// Automatically converts to new structure
```

### Configuration Migration

```typescript
// Auto-migration of config
import { migrateConfig } from '@prismatic-platform/sdk/migrate';

const oldConfig = {
  apiKey: 'xxx',
  baseUrl: 'https://api.old-endpoint.com',
  retryCount: 3
};

const newConfig = migrateConfig(oldConfig);
// {
//   apiKey: 'xxx',
//   endpoint: 'https://api.prismatic-platform.org',
//   retries: 3,
//   timeout: 30000
// }
```

---

## Support & Resources

### Documentation Links

- **API Reference**: [docs.prismatic-platform.org/sdk](https://docs.prismatic-platform.org/sdk)
- **Examples Repository**: [github.com/prismatic-platform/sdk-examples](https://github.com/prismatic-platform/sdk-examples)
- **Changelog**: [github.com/prismatic-platform/prismatic-sdk/releases](https://github.com/prismatic-platform/prismatic-sdk/releases)

### Community Support

- **GitHub Issues**: Bug reports and feature requests
- **Discord Channel**: `#sdk-support` for real-time help
- **Stack Overflow**: Tag questions with `prismatic-sdk`

### Enterprise Support

- **Priority Support**: 4-hour response SLA for enterprise customers
- **Custom Integrations**: Professional services for complex implementations
- **Training Programs**: On-site training and certification

---

**Ready to start building?**

[**Quick Start Guide →**](https://docs.prismatic-platform.org/sdk/quickstart)
[**API Reference →**](https://docs.prismatic-platform.org/sdk/api)
[**Example Projects →**](https://github.com/prismatic-platform/sdk-examples)