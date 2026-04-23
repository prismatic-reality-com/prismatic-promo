+++
title = "Livebook"
description = "Interactive computational notebooks for Elixir that combine code execution, rich text, and visualizations in a collaborative web-based environment"
weight = 10

[extra]
category = "platform-tools"
tags = ["interactive-computing", "notebooks", "elixir", "visualization", "collaboration"]
related_terms = ["Kino Library", "Interactive Computing", "Jupyter Notebook", "Phoenix LiveView", "Real-time Dashboard"]
see_also = ["elixir", "phoenix-liveview", "ets", "genserver", "otp"]
external_links = [
    { text = "Official Livebook Documentation", url = "https://livebook.dev/" },
    { text = "Kino Library", url = "https://hexdocs.pm/kino/" },
    { text = "Livebook on GitHub", url = "https://github.com/livebook-dev/livebook" }
]
examples = [
    "System health monitoring with real-time charts",
    "Interactive SQL query execution and visualization",
    "API testing with parameter controls",
    "Performance profiling with flame graphs",
    "OSINT investigation workflows"
]
+++

# Livebook

**Livebook** is a web-based notebook platform for [Elixir](@/glossary/elixir.md) that combines **executable code, rich text documentation, and interactive visualizations** in a single collaborative environment. Built specifically for the BEAM ecosystem, Livebook enables real-time data analysis, system monitoring, prototyping, and collaborative development through an intuitive browser-based interface.

## Core Capabilities

### Interactive Code Execution

Livebook provides **live code cells** that execute Elixir code in real-time, with results displayed immediately below each cell. This enables:

- **Iterative development** - Modify and re-execute code cells independently
- **Live documentation** - Combine explanatory text with executable examples
- **Real-time feedback** - See results immediately without compilation delays
- **State persistence** - Maintain variables and connections across cells

### Rich Visualizations

Through the Kino Library, Livebook supports:

- **Interactive charts** - VegaLite, Chart.js, and custom visualizations
- **Data tables** - Sortable, filterable data exploration
- **Forms and controls** - Buttons, inputs, sliders for user interaction
- **Real-time streaming** - Live data updates in charts and tables

### Collaborative Features

- **Shared sessions** - Multiple users can collaborate on the same notebook
- **Real-time updates** - See changes from other users instantly
- **Export capabilities** - Share notebooks as Markdown, HTML, or PDF
- **Version control** - Git integration for notebook versioning

## Prismatic Platform Integration

### Native Platform Access

The Prismatic platform provides **deep Livebook integration** with direct access to:

- **All 115 umbrella applications** - Direct function calls and data access
- **Storage adapters** - ETS, PostgreSQL, Meilisearch, KuzuDB queries
- **OSINT tools** - Interactive execution of 127+ intelligence tools
- **Agent runtime** - Monitor and control 530+ platform agents
- **Telemetry system** - Real-time metrics and performance data

### Quick Start Commands

```bash
# Start Livebook connected to local Prismatic
just livebook

# Connect to remote Prismatic instance
just livebook-remote

# Create system health monitoring notebook
just livebook-health

# Create OSINT investigation workflow
just livebook-osint
```

### Template System

Pre-built notebook templates accelerate common workflows:

| Template | Purpose | Difficulty |
|----------|---------|------------|
| `system_health` | Real-time system monitoring | Beginner |
| `database_analysis` | Interactive SQL queries | Intermediate |
| `api_testing` | REST API testing suite | Beginner |
| `performance_profiling` | Performance analysis | Advanced |
| `osint_investigation` | Intelligence gathering | Intermediate |
| `storage_benchmarking` | Storage adapter benchmarks | Expert |

## Use Cases in Prismatic

### 1. System Health Monitoring

Create **live dashboards** showing platform health metrics:

```elixir
# Real-time system metrics
health_chart = Kino.VegaLite.new(chart_spec)

Task.start(fn ->
  Stream.interval(1000)
  |> Stream.each(fn _ ->
    metrics = Prismatic.Telemetry.current_metrics()
    Kino.VegaLite.push(health_chart, metrics)
  end)
  |> Stream.run()
end)
```

### 2. Database Analysis

Execute **interactive SQL queries** with immediate visualization:

```elixir
# Interactive database exploration
{:ok, conn} = connect_to_database()
query = """
SELECT adapter_type, COUNT(*) as operations,
       AVG(response_time_ms) as avg_response
FROM storage_operations
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY adapter_type
"""

results = Postgrex.query!(conn, query, [])
Kino.DataTable.new(results.rows)
```

### 3. API Testing & Development

Test REST APIs with **interactive parameter controls**:

```elixir
# API testing interface
api_form = Kino.Control.form([
  url: Kino.Input.text("API URL"),
  method: Kino.Input.select("Method", [GET: "GET", POST: "POST"])
], submit: "Test")

# Handle form submission with real-time results
```

### 4. Performance Profiling

Analyze system performance with **live flame graphs**:

```elixir
# Profile function execution
{time, result} = :timer.tc(MyModule, :expensive_function, [args])
profile_data = analyze_performance_data(time, result)
create_flame_graph(profile_data)
```

## Technical Architecture

### Integration with Phoenix

Livebook runs as a **separate Phoenix application** that connects to the Prismatic platform via:

- **Distributed Erlang** - Direct node-to-node communication
- **Shared ETS tables** - Access to platform state and caches
- **PubSub integration** - Real-time event streaming
- **Shared supervision trees** - Coordinated process management

### Security Model

- **Node-level authentication** - Secure distributed Erlang connections
- **Notebook-level permissions** - Control access to sensitive operations
- **Execution sandboxing** - Isolate notebook execution environments
- **Audit logging** - Track all notebook operations and data access

### Performance Characteristics

- **Startup time** - Typically 2-3 seconds for platform connection
- **Real-time updates** - Sub-100ms latency for chart updates
- **Memory efficiency** - Bounded data retention prevents memory leaks
- **Concurrent users** - Supports 25+ simultaneous users per instance

## Advantages Over Jupyter

### Elixir-Native

- **BEAM integration** - Direct access to OTP processes and supervision
- **Fault tolerance** - Leverage Elixir's "let it crash" philosophy
- **Concurrency** - Built-in support for concurrent operations
- **Hot code reloading** - Update code without stopping processes

### Real-time Capabilities

- **Live connections** - Maintain persistent connections to data sources
- **Streaming data** - Handle continuous data streams efficiently
- **Interactive widgets** - Rich user interactions beyond static cells
- **Collaborative editing** - Multiple users on same notebook simultaneously

### Production Integration

- **Direct platform access** - No API layers or data export/import
- **Unified monitoring** - Same telemetry and logging as production systems
- **Consistent environment** - Same Elixir version and dependencies
- **Seamless deployment** - Notebooks can be promoted to production modules

## Best Practices

### Notebook Organization

- **Clear structure** - Use markdown headers to organize content
- **Modular cells** - Keep code cells focused and reusable
- **Documentation** - Explain complex logic and assumptions
- **Error handling** - Use pattern matching for robust error handling

### Performance Optimization

- **Throttled updates** - Limit chart update frequency to prevent UI lag
- **Memory management** - Clear large datasets when no longer needed
- **Efficient queries** - Optimize database queries and data processing
- **Background tasks** - Use Task.start for long-running operations

### Security Considerations

- **Sensitive data** - Never commit notebooks with credentials or secrets
- **Access control** - Limit notebook sharing based on data sensitivity
- **Code review** - Review shared notebooks before execution
- **Environment separation** - Use different instances for dev/prod analysis

## Comparison with Traditional Tools

| Feature | Livebook | Jupyter | Grafana | Traditional Scripts |
|---------|----------|---------|---------|-------------------|
| **Real-time data** | ✅ Native | ⚠️ Limited | ✅ Excellent | ❌ Manual |
| **Elixir support** | ✅ Native | ⚠️ Via kernels | ❌ No | ✅ Native |
| **Collaboration** | ✅ Built-in | ⚠️ Extensions | ❌ View-only | ❌ File-based |
| **Platform integration** | ✅ Direct | ❌ API-only | ❌ API-only | ✅ Direct |
| **Interactive widgets** | ✅ Rich | ✅ Good | ❌ Limited | ❌ None |
| **Deployment** | ✅ Seamless | ⚠️ Complex | ❌ Separate | ✅ Direct |

## Getting Started

### Installation & Setup

```bash
# Install Livebook (if not already available)
mix escript.install hex livebook

# Start with Prismatic integration
just livebook

# Create your first notebook from template
just livebook-template system_health --name "My Dashboard"
```

### First Steps

1. **Connect to platform** - Ensure Prismatic services are running
2. **Choose a template** - Start with system_health for orientation
3. **Explore data** - Execute cells to understand available data
4. **Customize visualizations** - Modify charts and queries for your needs
5. **Share results** - Export or share notebook with team members

### Learning Resources

- [Prismatic Livebook Guide](../../docs/livebook/README.md)
- [Interactive Components Guide](../../docs/livebook/interactive-components.md)
- [Template Development Guide](../../docs/livebook/template-development.md)
- [Official Livebook Documentation](https://livebook.dev/)

## Related Concepts

- **Kino Library** - Interactive widget library for Livebook
- **Interactive Computing** - Computing paradigm emphasizing real-time interaction
- **Jupyter Notebook** - Popular notebook platform for Python/R
- **[Phoenix LiveView](@/glossary/phoenix-liveview.md)** - Real-time web applications with Elixir
- **[Dashboard](@/glossary/dashboard.md)** - Live monitoring and visualization interfaces

---

*Livebook transforms the traditional development workflow by bringing **executable documentation, real-time analysis, and collaborative exploration** directly into the browser, making complex system analysis accessible and interactive.*