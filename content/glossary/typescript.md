+++
title = "TypeScript"
description = "TypeScript is Microsoft's statically typed superset of JavaScript that compiles to plain JavaScript, providing structural typing, type inference, generics, and advanced type-level programming for building reliable, maintainable applications at scale."
weight = 30

[extra]
category = "glossary"
tags = ["typescript", "javascript", "type-system", "static-analysis", "frontend", "sdk", "web-development", "nodejs", "compiler", "developer-tools"]
related_terms = ["sdk", "api", "static-analysis", "testing", "elixir", "quality-gates", "adapter-pattern", "architecture", "ci-cd", "quality-assurance"]
difficulty = "intermediate"
importance = "critical"
date_created = "2026-02-22"
date_modified = "2026-02-22"
version = "2.0.0"
platforms = ["prismatic", "nodejs", "browser", "deno", "bun"]
domain = "programming-languages"
audience = ["developers", "architects", "frontend-engineers", "sdk-developers"]
prerequisite_knowledge = ["javascript-fundamentals", "object-oriented-programming", "basic-type-theory", "web-development"]
learning_outcomes = ["Understand TypeScript's type system and its relationship to JavaScript", "Apply structural typing, generics, and conditional types effectively", "Configure TypeScript projects with strict mode and appropriate compiler settings", "Compare TypeScript's approach to type safety with Elixir's Dialyzer and @spec system"]
quality_score = 95
word_count_target = 2500
cross_references = 10
section_count = 14
has_code_examples = true
has_diagrams = false
review_status = "comprehensive"
author = "Tomas Korcak (korczis)"
reading_time = "10 min"
word_count = 1986
keywords = ["TypeScript", "Microsofts", "JavaScript", "glossary", "Prismatic Platform", "Type"]
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "TypeScript - Prismatic Platform"
+++

## Overview

**TypeScript** is a statically typed programming language developed by Microsoft that extends JavaScript with optional type annotations, interfaces, generics, and advanced type-level programming capabilities. Every valid JavaScript program is also a valid TypeScript program -- TypeScript is a strict syntactic and semantic superset of JavaScript. The TypeScript compiler (`tsc`) performs type checking at compile time and then erases all type information, emitting standard JavaScript that runs in any JavaScript runtime (browsers, Node.js, Deno, Bun).

Since its public release in 2012, TypeScript has become one of the most widely adopted programming languages in the world. The 2025 Stack Overflow Developer Survey ranked it among the top five most loved languages, and it powers the development tooling of major platforms including VS Code, Angular, Deno, and thousands of npm packages. In the [Prismatic Platform](@/glossary/architecture.md), TypeScript serves as the primary language for [SDK](@/glossary/sdk.md) development, Plugin Kit authoring, UI component libraries, MCP tool implementations, and [API](@/glossary/api.md) client generation -- complementing the platform's Elixir backend with a type-safe frontend and integration layer.

## Definition and Relationship to JavaScript

TypeScript's relationship to JavaScript can be understood through three key properties:

1. **Superset**: Every syntactically valid JavaScript file is also syntactically valid TypeScript. This means existing JavaScript codebases can be incrementally migrated to TypeScript by renaming `.js` files to `.ts` and adding type annotations gradually.

2. **Type erasure**: TypeScript's type system exists only at compile time. The compiler removes all type annotations, interfaces, enums (mostly), and type-only imports before producing JavaScript output. At runtime, there is no TypeScript -- only JavaScript. This means TypeScript adds zero runtime overhead.

3. **Structural typing**: Unlike Java or C# which use nominal typing (types are identified by their declared name), TypeScript uses structural typing (types are compatible if their structures match). Two interfaces with the same shape are interchangeable, even if they have different names and were defined in different files.

This design philosophy -- be a superset, erase types, use structural typing -- distinguishes TypeScript from competing approaches like Flow (Facebook), Dart (Google), or ReScript. It maximizes compatibility with the JavaScript ecosystem while providing meaningful compile-time safety.

## Historical Context

TypeScript's development reflects a clear trajectory from JavaScript's dynamic roots toward type safety:

- **2010**: Anders Hejlsberg (creator of Turbo Pascal, Delphi, and C#) begins leading TypeScript development at Microsoft. The project is internally codenamed "Strada."
- **October 2012**: TypeScript 0.8 is publicly released as open source on CodePlex. Initial reception is mixed -- many JavaScript developers view static typing as unnecessary overhead.
- **2014**: TypeScript 1.0 launches. Google's Angular team announces Angular 2 will be written in TypeScript (originally planned for AtScript, Google's own typed JS variant). This gives TypeScript massive legitimacy.
- **2015**: ECMAScript 2015 (ES6) standardizes classes, modules, arrow functions, and destructuring. TypeScript had already provided these features and now aligns its output with the official standard.
- **2016**: TypeScript 2.0 introduces strict null checks, control flow analysis, and discriminated unions. The type system becomes genuinely powerful.
- **2018**: TypeScript 3.0 adds project references, conditional types, and the `unknown` type. TypeScript can now express type relationships that most statically typed languages cannot.
- **2020**: TypeScript 4.0 brings variadic tuple types and labeled tuple elements. Deno 1.0 launches with native TypeScript support (no compilation step needed).
- **2023**: TypeScript 5.0 introduces decorators aligned with the TC39 stage 3 proposal. The `satisfies` operator (4.9) enables precise type narrowing.
- **2024-2025**: TypeScript continues to evolve with improved performance, enhanced inference, and deeper integration into JavaScript runtimes. Bun, Deno, and Node.js (via `--experimental-strip-types`) all add native TypeScript execution.

Anders Hejlsberg's design philosophy throughout this evolution has been consistent: make JavaScript development safer without sacrificing its dynamic nature. TypeScript does not try to be a different language -- it tries to be JavaScript with guardrails.

## Core Concepts

### Structural Typing

TypeScript's type system is structural (also called "duck typing" at the type level). Two types are compatible if their member structures are compatible:

```typescript
interface Point {
  x: number;
  y: number;
}

interface Coordinate {
  x: number;
  y: number;
}

// These are fully interchangeable despite different names
const p: Point = { x: 1, y: 2 };
const c: Coordinate = p; // OK -- same structure
```

This differs fundamentally from nominal typing (Java, C#) where `Point` and `Coordinate` would be incompatible types even with identical fields. Structural typing makes TypeScript highly compatible with JavaScript's duck-typed nature.

### Type Inference

TypeScript infers types from context, reducing the need for explicit annotations:

```typescript
// Type inferred as number
const count = 42;

// Return type inferred as string
function greet(name: string) {
  return `Hello, ${name}`;
}

// Array element types inferred
const items = [1, 2, 3]; // number[]

// Generic type arguments often inferred
const map = new Map([['key', 'value']]); // Map<string, string>
```

The compiler's inference engine is remarkably sophisticated -- it handles conditional types, mapped types, template literal types, and complex generic constraints without requiring explicit type parameters in most cases.

### Union and Intersection Types

Union types (`A | B`) represent values that can be one of several types. Intersection types (`A & B`) combine multiple types into one:

```typescript
// Union: value is either string or number
type StringOrNumber = string | number;

// Discriminated union: tagged union pattern
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: Error };

// Intersection: combines both types
type Timestamped<T> = T & { createdAt: Date; updatedAt: Date };

type User = { name: string; email: string };
type TimestampedUser = Timestamped<User>;
// Has: name, email, createdAt, updatedAt
```

Discriminated unions (tagged unions) are particularly powerful for modeling domain states and are TypeScript's equivalent of algebraic data types found in ML-family languages and Elixir's pattern matching.

### Generics

Generics enable type-safe abstractions over types:

```typescript
// Generic function
function first<T>(items: T[]): T | undefined {
  return items[0];
}

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic class
class Repository<T extends { id: string }> {
  private items: Map<string, T> = new Map();

  save(item: T): void {
    this.items.set(item.id, item);
  }

  findById(id: string): T | undefined {
    return this.items.get(id);
  }
}
```

### Conditional and Mapped Types

TypeScript's type system is Turing-complete, enabling type-level programming:

```typescript
// Conditional type: different result based on type relationship
type IsArray<T> = T extends Array<infer U> ? U : never;

type A = IsArray<string[]>;    // string
type B = IsArray<number>;      // never

// Mapped type: transform all properties
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};

type Optional<T> = {
  [K in keyof T]?: T[K];
};

// Template literal types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type ApiEndpoint = `/api/v1/${string}`;
type Route = `${HttpMethod} ${ApiEndpoint}`;
```

These advanced type features enable TypeScript to express complex invariants that would require runtime checks in most other languages.

## Technical Deep Dive

### TypeScript Configuration

The `tsconfig.json` file controls TypeScript's compilation behavior. Key settings for production use:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

The `strict` flag enables a bundle of checks: `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitAny`, `noImplicitThis`, and `alwaysStrict`. Production TypeScript projects should always enable `strict: true`.

### Build Tools

TypeScript can be compiled and bundled through several tools, each with different trade-offs:

| Tool | Speed | Type Checking | Bundling | Use Case |
|------|-------|---------------|----------|----------|
| **tsc** | Moderate | Full | No | Library development, type checking |
| **esbuild** | Very fast | No | Yes | Development builds, bundling |
| **SWC** | Very fast | No | Limited | Next.js, fast transpilation |
| **Vite** | Fast (esbuild) | Plugin | Yes | Modern web applications |
| **webpack + ts-loader** | Slow | Optional | Yes | Legacy projects, complex configs |
| **Bun** | Very fast | No | Yes | Full-stack Bun projects |

The common pattern for production builds is to use `tsc` for type checking (often in CI) and a fast bundler like esbuild or Vite for actual compilation. This gives both type safety and fast build times.

### Declaration Files

TypeScript declaration files (`.d.ts`) describe the shape of JavaScript libraries without providing implementations. They enable type checking when consuming JavaScript packages:

```typescript
// prismatic-sdk.d.ts
declare module '@prismatic/sdk' {
  export interface PrismaticConfig {
    baseUrl: string;
    apiKey: string;
    timeout?: number;
  }

  export interface SecurityRating {
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    score: number;
    industryPercentile: number;
  }

  export class PrismaticClient {
    constructor(config: PrismaticConfig);
    discover(domain: string): Promise<Asset[]>;
    getSecurityRating(domain: string): Promise<SecurityRating>;
    assessCompliance(domain: string, frameworks: string[]): Promise<ComplianceAssessment>;
  }
}
```

The DefinitelyTyped project (`@types/*` on npm) provides community-maintained declaration files for thousands of JavaScript libraries that do not ship their own types.

## Prismatic Platform Implementation

### SDK Development

The Prismatic Platform's TypeScript [SDK](@/glossary/sdk.md) provides type-safe access to all platform capabilities. The SDK is generated from the platform's OpenAPI specification, ensuring type definitions always match the actual API:

```typescript
import { PrismaticClient } from '@prismatic/sdk';

const client = new PrismaticClient({
  baseUrl: 'https://prismatic-prod.fly.dev',
  apiKey: process.env.PRISMATIC_API_KEY!,
});

// Fully typed -- IDE autocomplete for all parameters and return types
const rating = await client.perimeter.getSecurityRating('example.com');

if (rating.grade === 'A' || rating.grade === 'B') {
  console.log(`Good security posture: ${rating.score}/900`);
} else {
  const compliance = await client.perimeter.assessCompliance('example.com', ['nis2', 'zkb']);
  console.log(`Compliance gaps: ${compliance.gaps.length}`);
}
```

### Plugin Kit

The Plugin Kit enables third-party developers to extend the Prismatic Platform with custom integrations. TypeScript's type system ensures plugin authors implement all required interfaces:

```typescript
import { Plugin, PluginContext, PluginResult } from '@prismatic/plugin-kit';

interface MyPluginConfig {
  endpoint: string;
  credentials: {
    username: string;
    password: string;
  };
}

export class CustomOSINTPlugin implements Plugin<MyPluginConfig> {
  readonly name = 'custom-osint-source';
  readonly version = '1.0.0';

  async initialize(config: MyPluginConfig): Promise<void> {
    // Validate configuration at startup
    await this.testConnection(config.endpoint, config.credentials);
  }

  async execute(context: PluginContext): Promise<PluginResult> {
    const data = await this.fetchData(context.query);
    return {
      records: data.map(this.normalize),
      metadata: { source: this.name, fetchedAt: new Date() },
    };
  }
}
```

### MCP Tool Implementations

Model Context Protocol (MCP) tools for Claude Code are authored in TypeScript, leveraging the type system for tool parameter validation:

```typescript
import { McpServer, Tool, ToolResult } from '@modelcontextprotocol/sdk';

const searchTool: Tool = {
  name: 'prismatic-search',
  description: 'Search the Prismatic Platform knowledge base',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      limit: { type: 'number', description: 'Max results', default: 10 },
    },
    required: ['query'],
  },
  async handler(params: { query: string; limit?: number }): Promise<ToolResult> {
    const results = await prismaticSearch(params.query, params.limit ?? 10);
    return { content: [{ type: 'text', text: JSON.stringify(results) }] };
  },
};
```

### API Client Generation

The Prismatic [API](@/glossary/api.md) gateway exposes an OpenAPI 3.0 specification. TypeScript clients are generated directly from this spec, guaranteeing type correctness:

```typescript
// Auto-generated from OpenAPI spec -- do not edit manually
export interface PerimeterDiscoverRequest {
  domain: string;
  depth?: 'shallow' | 'deep';
  includeSubdomains?: boolean;
}

export interface PerimeterDiscoverResponse {
  assets: Asset[];
  scanDuration: number;
  scanId: string;
}

export async function perimeterDiscover(
  request: PerimeterDiscoverRequest,
): Promise<PerimeterDiscoverResponse> {
  const response = await fetch('/api/v1/perimeter/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new ApiError(response);
  return response.json() as Promise<PerimeterDiscoverResponse>;
}
```

## Comparison with Elixir's Type System

The Prismatic Platform uses both TypeScript (frontend/SDK) and [Elixir](@/glossary/elixir.md) (backend). Their approaches to type safety differ fundamentally:

| Aspect | TypeScript | Elixir |
|--------|-----------|--------|
| **Type system** | Structural, compile-time | Gradual, spec-based |
| **Type checking** | `tsc` (built-in compiler) | Dialyzer (separate tool) |
| **Type annotations** | Inline (`x: string`) | Module-level (`@spec`) |
| **Type inference** | Bidirectional, powerful | Limited (Dialyzer success typing) |
| **Generics** | First-class (`T`, `K extends keyof T`) | Not supported in specs |
| **Null safety** | `strictNullChecks` flag | Pattern matching on nil |
| **Union types** | `string \| number` | Type unions in specs (`String.t() \| integer()`) |
| **Runtime behavior** | Types erased | Types erased (specs are metadata) |
| **Error handling** | try/catch, Result types | `{:ok, value} \| {:error, reason}` pattern matching |
| **IDE support** | Excellent (LSP, autocomplete) | Good (ElixirLS, but less precise) |

Both systems use type erasure -- types exist for developer tooling and compile-time checking but do not affect runtime behavior. The key difference is that TypeScript's type system is far more expressive (conditional types, mapped types, template literals), while Elixir compensates with pattern matching, guards, and the BEAM's "let it crash" philosophy backed by supervision trees.

## Best Practices

1. **Enable strict mode**: Always set `"strict": true` in `tsconfig.json`. Loose TypeScript is barely better than JavaScript -- strict mode catches entire categories of bugs at compile time.

2. **Avoid `any`**: The `any` type disables type checking entirely. Use `unknown` when the type is truly unknown (it forces you to narrow before use), or define a proper type.

3. **Use discriminated unions for state**: Model application states as tagged unions rather than optional fields. This forces exhaustive handling and makes impossible states unrepresentable:

   ```typescript
   // Prefer this
   type RequestState =
     | { status: 'idle' }
     | { status: 'loading' }
     | { status: 'success'; data: Response }
     | { status: 'error'; error: Error };

   // Over this
   type RequestState = {
     loading: boolean;
     data?: Response;
     error?: Error;
   };
   ```

4. **Use branded types for domain identifiers**: Prevent mixing up structurally identical but semantically different values:

   ```typescript
   type UserId = string & { readonly __brand: 'UserId' };
   type OrderId = string & { readonly __brand: 'OrderId' };

   function getUser(id: UserId): User { /* ... */ }
   // getUser(orderId) -- compile error, even though both are strings
   ```

5. **Prefer `readonly` and `as const`**: Immutability prevents accidental mutation and enables narrower type inference.

6. **Write declaration files for shared contracts**: When TypeScript code interfaces with Elixir APIs, maintain `.d.ts` files that define the contract. Generate them from OpenAPI specs when possible.

7. **Use `satisfies` for configuration objects**: The `satisfies` operator checks that a value matches a type while preserving the literal types of the value.

## Anti-Patterns

- **Type assertion abuse**: Using `as` to cast types bypasses the type checker. Every `as` assertion is a potential runtime error. Use type guards and narrowing instead.

- **`any` contagion**: A single `any` in a function signature infects all callers. Once `any` enters a codebase, it spreads like a virus, silently disabling type checking across call chains.

- **Over-engineering types**: TypeScript's type system is Turing-complete, but that does not mean every type should be a conditional mapped template literal recursive generic. Complex types that cannot be understood by the team provide negative value.

- **Ignoring `strictNullChecks`**: Without strict null checks, every type implicitly includes `null` and `undefined`. This is the single largest source of runtime errors in TypeScript codebases.

- **Enums for everything**: TypeScript enums have surprising runtime behavior (they generate JavaScript objects). Prefer `as const` assertions and union types for simple value sets. Use enums only when you need reverse mapping or numeric iteration.

- **Class-heavy architecture**: TypeScript supports classes, but the language shines with interfaces, functions, and composition. Over-using classes leads to Java-in-TypeScript patterns that fight the language's strengths.

- **Skipping declaration maps**: Libraries that ship `.d.ts` files without declaration maps (`declarationMap: true`) make debugging impossible for consumers. Always ship source maps and declaration maps.

## Related Technologies

| Technology | Relationship | Description |
|-----------|-------------|-------------|
| **JavaScript** | Parent language | TypeScript compiles to JavaScript; every JS file is valid TS |
| **Node.js** | Runtime | Primary server-side runtime for TypeScript applications |
| **Deno** | Runtime | TypeScript-native runtime (no compilation step needed) |
| **Bun** | Runtime | Fast JavaScript/TypeScript runtime with built-in bundler |
| **esbuild** | Build tool | Extremely fast TypeScript/JavaScript bundler (written in Go) |
| **SWC** | Build tool | Rust-based TypeScript/JavaScript compiler used by Next.js |
| **Vite** | Build tool | Modern frontend build tool using esbuild for TypeScript |
| **ESLint** | Linter | Static analysis with TypeScript-aware rules via typescript-eslint |
| **Prettier** | Formatter | Opinionated code formatter with TypeScript support |
| **OpenAPI** | Specification | API specs from which TypeScript clients can be generated |

## Testing TypeScript

TypeScript integrates with all major JavaScript testing frameworks. The Prismatic Platform uses Vitest for SDK testing:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { PrismaticClient } from '../src/client';

describe('PrismaticClient', () => {
  it('should discover assets for a valid domain', async () => {
    const client = new PrismaticClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'test-key',
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        assets: [{ type: 'domain', value: 'example.com' }],
        scanDuration: 1200,
        scanId: 'scan-123',
      }),
    });

    global.fetch = mockFetch;

    const result = await client.perimeter.discover('example.com');

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].type).toBe('domain');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/perimeter/discover'),
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('should handle API errors with typed error responses', async () => {
    const client = new PrismaticClient({
      baseUrl: 'https://api.example.com',
      apiKey: 'invalid-key',
    });

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'unauthorized' }),
    });

    await expect(client.perimeter.discover('example.com'))
      .rejects
      .toThrow('unauthorized');
  });
});
```

[Testing](@/glossary/testing.md) TypeScript code benefits from the type system itself -- types serve as a form of documentation and contract that tests can verify.

## Future Directions

TypeScript continues to evolve along several axes:

- **Native TypeScript execution**: Node.js, Deno, and Bun increasingly support TypeScript natively without a separate compilation step. Node.js 22's `--experimental-strip-types` flag is a step toward first-class TypeScript support.
- **Type system expressiveness**: Each TypeScript release adds new type-level features. Recent additions like `satisfies`, `const` type parameters, and decorator metadata continue to expand what can be expressed at the type level.
- **Performance improvements**: The TypeScript team is exploring Rust-based reimplementations of the compiler for dramatically faster type checking on large codebases. Projects like `stc` (Speedy TypeScript Checker) and the official TypeScript Rust port aim for 10x+ speedups.
- **Ecosystem convergence**: As JavaScript runtimes add native TypeScript support, the need for compilation and bundling decreases. The future may see TypeScript as a first-class language in all JavaScript environments.
- **AI-assisted type generation**: LLMs are increasingly capable of generating TypeScript types from runtime data, API responses, and natural language descriptions, accelerating type definition for untyped JavaScript libraries.

## See Also

- [SDK](@/glossary/sdk.md) -- Prismatic Platform SDK built with TypeScript for type-safe API access
- [API](@/glossary/api.md) -- REST API gateway from which TypeScript clients are generated
- [Static Analysis](@/glossary/static-analysis.md) -- compile-time code analysis, a core TypeScript capability
- [Testing](@/glossary/testing.md) -- test frameworks and strategies for TypeScript codebases
- [Elixir](@/glossary/elixir.md) -- backend language complementing TypeScript in the Prismatic stack
- [CI/CD](@/glossary/ci-cd.md) -- build pipelines that include TypeScript compilation and type checking
- [Quality Gates](@/glossary/quality-gates.md) -- TypeScript strict mode as a quality enforcement mechanism
- [Quality Assurance](@/glossary/quality-assurance.md) -- TypeScript's role in overall software quality strategy
- [Adapter Pattern](@/glossary/adapter-pattern.md) -- pattern used in TypeScript SDK for multi-backend support
- [Architecture](@/glossary/architecture.md) -- platform architecture where TypeScript serves the frontend layer

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
