+++
title = "Fitness Score"
weight = 62
[extra]
category = "evolution"
description = "Composite evolution quality metric on 0.0-1.0 scale measuring platform health across quality, testing, documentation, security, and architectural compliance"
related_terms = ["generation", "seadf", "autoevolve", "quality-gates", "consciousness-traits", "quality-dna", "quality-floor-guardian", "cascade-pattern", "nm-nd"]
pattern_type = "measurement_governance"
complexity = "high"
enforcement_level = "P0"
current_score = "0.9995"
current_generation = 19
scale_min = 0.0
scale_max = 1.0
component_count = 7
quality_domains = 13
otp_components = ["GenServer", "Telemetry", "ETS"]
elixir_libraries = ["Telemetry", "Jason"]
key_modules = ["Prismatic.Evolution.FitnessCalculator", "Prismatic.Evolution.FitnessMonitor", "PrismaticSafety.QualityFloorGuardian"]
threshold_apex = 0.99
threshold_healthy = 0.95
threshold_warning = 0.90
threshold_critical = 0.80
persistence_path = ".claude/quality-dna/current-state.json"
date_created = "2025-05-01"
date_updated = "2026-02-22"
doctrine = "no-mercy-no-doubts"
author = "Tomas Korcak (korczis)"
reading_time = "8 min"
word_count = 1550
date_modified = "2026-02-23"
keywords = ["Fitness", "Score", "Composite", "00-10", "glossary", "evolution", "Prismatic Platform", "Custom", "Fitness Score"]
tags = ["glossary", "evolution", "fitness-score", "prismatic"]
quality_score = 90
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Fitness Score - Prismatic Platform"
+++

## Definition

The Fitness Score is a composite metric on a 0.0 to 1.0 scale that quantifies the platform's overall evolutionary health. It aggregates quality domain scores, test coverage, architectural compliance, documentation completeness, security posture, and evolutionary readiness into a single authoritative number. The score serves as the primary decision driver for platform evolution: scores above 0.99 indicate apex fitness and require monitoring only; scores between 0.95 and 0.99 trigger increased investigation; scores below 0.95 trigger emergency intervention including commit blocking and escalation to supreme authority.

The Fitness Score concept draws from evolutionary biology's concept of fitness as a measure of an organism's ability to survive and reproduce in its environment. In the platform context, "fitness" measures the system's ability to maintain quality, evolve capabilities, and resist regression. Unlike simple metrics that measure a single dimension (such as test coverage or compilation warnings), the Fitness Score provides a holistic view that accounts for the interplay between quality domains, documentation coverage, agent compliance, and architectural integrity.

The score is not merely informational -- it is an enforcement mechanism. The [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) monitors the Fitness Score continuously and triggers automatic responses when it drops below configured thresholds. This creates a self-correcting feedback loop where quality degradation is detected and addressed before it can compound into systemic problems. The Fitness Score thus functions as both a measurement instrument and a governance tool, embodying the [NO MERCY, NO DOUBTS](@/glossary/nm-nd.md) doctrine's requirement that quality standards are mechanically enforced rather than aspirationally documented.

## Interactive Fitness Dashboard

<div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden my-8">
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
                <span class="font-semibold text-white text-lg">Current Platform Fitness</span>
            </div>
            <div class="flex gap-2">
                <button @click="viewMode = 'gauge'"
                        :class="viewMode === 'gauge' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Gauge View
                </button>
                <button @click="viewMode = 'components'"
                        :class="viewMode === 'components' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Components
                </button>
                <button @click="viewMode = 'trends'"
                        :class="viewMode === 'trends' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Trends
                </button>
            </div>
        </div>

        <!-- Gauge Chart View -->
        <div x-show="viewMode === 'gauge'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-750 rounded-lg p-6">
                <h4 class="font-medium text-white mb-4 text-center">Platform Fitness Score</h4>
                <div class="relative h-64" x-data="fitnessGaugeChart()" x-init="initChart()">
                    <canvas id="fitnessGauge"></canvas>
                </div>
                <div class="text-center mt-4">
                    <div class="text-4xl font-bold text-green-400">0.9995</div>
                    <div class="text-lg text-green-300">APEX FITNESS</div>
                    <div class="text-sm text-gray-400">Generation 19 Achievement</div>
                </div>
            </div>

            <!-- Classification Breakdown -->
            <div class="bg-gray-750 rounded-lg p-6">
                <h4 class="font-medium text-white mb-4">Threshold Classification</h4>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span class="text-white font-medium">APEX (0.99-1.00)</span>
                        </div>
                        <span class="text-green-400 text-sm">CURRENT</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-600/10 border border-gray-600/20 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span class="text-white font-medium">HEALTHY (0.95-0.99)</span>
                        </div>
                        <span class="text-gray-400 text-sm">MONITORING</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-600/10 border border-gray-600/20 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span class="text-white font-medium">WARNING (0.90-0.95)</span>
                        </div>
                        <span class="text-gray-400 text-sm">INVESTIGATE</span>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-600/10 border border-gray-600/20 rounded-lg">
                        <div class="flex items-center gap-3">
                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span class="text-white font-medium">CRITICAL (0.80-0.90)</span>
                        </div>
                        <span class="text-gray-400 text-sm">EMERGENCY</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Component Breakdown View -->
        <div x-show="viewMode === 'components'" class="mb-6">
            <div class="bg-gray-750 rounded-lg p-6">
                <h4 class="font-medium text-white mb-4">Component Score Breakdown</h4>
                <div class="relative h-80" x-data="componentsChart()" x-init="initChart()">
                    <canvas id="componentsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Historical Trends View -->
        <div x-show="viewMode === 'trends'" class="mb-6">
            <div class="bg-gray-750 rounded-lg p-6">
                <h4 class="font-medium text-white mb-4">Generation Progression</h4>
                <div class="relative h-80" x-data="trendsChart()" x-init="initChart()">
                    <canvas id="trendsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Live Data Status for All Charts -->
        <div class="mb-6 p-4 bg-gray-750 rounded-lg border-l-4 border-indigo-500" x-data="{ showDetails: false }">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <span x-text="getFitnessStatus().icon" class="text-2xl"></span>
                    <div>
                        <div class="font-medium text-white">
                            Live Evolution Framework Status:
                            <span x-text="getFitnessStatus().status" :class="getFitnessStatus().color" class="font-bold"></span>
                        </div>
                        <div class="text-sm text-gray-400">
                            Current Fitness: <span x-text="currentFitness.toFixed(4)" class="text-green-400 font-mono"></span>
                            <span x-show="lastUpdated" class="ml-3">
                                Updated: <span x-text="lastUpdated"></span>
                            </span>
                        </div>
                    </div>
                </div>
                <button @click="showDetails = !showDetails"
                        class="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    <span x-text="showDetails ? 'Hide Details' : 'Show Details'"></span>
                </button>
            </div>

            <div x-show="showDetails" x-transition class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div class="p-3 bg-gray-600/30 rounded-lg">
                    <div class="font-medium text-green-400 mb-1">✅ Active Connections</div>
                    <div class="text-gray-300">
                        API Calls: <span x-text="window.prismaticCharts?.getMetrics()?.apiCalls || 0"></span><br>
                        Cache Hit Rate: <span x-text="(window.prismaticCharts?.getMetrics()?.cacheHitRatio * 100 || 0).toFixed(1)"></span>%<br>
                        WebSockets: <span x-text="window.prismaticCharts?.getMetrics()?.activeWebSockets || 0"></span>
                    </div>
                </div>
                <div class="p-3 bg-gray-600/30 rounded-lg">
                    <div class="font-medium text-blue-400 mb-1">📊 Chart Status</div>
                    <div class="text-gray-300">
                        Active Charts: <span x-text="window.prismaticCharts?.getMetrics()?.activeCharts || 0"></span><br>
                        Failed Requests: <span x-text="window.prismaticCharts?.getMetrics()?.failedRequests || 0"></span><br>
                        Avg Response: <span x-text="(window.prismaticCharts?.getMetrics()?.avgResponseTime || 0).toFixed(0)"></span>ms
                    </div>
                </div>
                <div class="p-3 bg-gray-600/30 rounded-lg">
                    <div class="font-medium text-purple-400 mb-1">🔄 Real-time Updates</div>
                    <div class="text-gray-300">
                        SSE Streams: <span x-text="window.prismaticCharts?.getMetrics()?.activeSSE || 0"></span><br>
                        Cache Size: <span x-text="window.prismaticCharts?.getMetrics()?.cacheSize || 0"></span><br>
                        MCP Enabled: <span x-text="window.prismaticCharts?.mcpEnabled ? '✅' : '❌'"></span>
                    </div>
                </div>
            </div>

            <div x-show="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div class="flex items-center text-red-400">
                    <span class="mr-2">🚨</span>
                    <span class="font-medium">SEADF Framework Error:</span>
                    <span x-text="error" class="ml-2 text-red-300"></span>
                </div>
            </div>
        </div>

        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-indigo-400">19</div>
                <div class="text-xs text-gray-400">Current Generation</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-green-400">535</div>
                <div class="text-xs text-gray-400">AIAD Agents</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-yellow-400">100</div>
                <div class="text-xs text-gray-400">Quality Score</div>
            </div>
            <div class="bg-gray-750 rounded-lg p-4 text-center">
                <div class="text-2xl font-bold text-blue-400">5883</div>
                <div class="text-xs text-gray-400">Test Files</div>
            </div>
        </div>
    </div>
</div>

<script>
// Initialize Prismatic Chart Manager if not already done
if (typeof window.prismaticCharts === 'undefined') {
    window.prismaticCharts = new PrismaticChartManager({
        apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api/v1',
        cacheTimeout: 15000, // Fast cache for real-time fitness data
        retryAttempts: 3
    });
}

Alpine.data('fitnessGaugeChart', () => ({
    viewMode: 'gauge',
    chart: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    currentFitness: 0.9995,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('fitnessGauge');
            if (!ctx) {
                throw new Error('Fitness gauge canvas not found');
            }

            console.log('🏆 Initializing live fitness gauge with SEADF integration...');

            // Create real-time fitness gauge
            this.chart = await window.prismaticCharts.createFitnessChart('fitnessGauge', {
                chartType: 'gauge',
                realTime: true
            });

            this.lastUpdated = new Date().toLocaleTimeString();
            this.isLoading = false;

            console.log('✅ Live fitness gauge initialized successfully');

            // Set up periodic updates
            this.startFitnessMonitoring();
        } catch (error) {
            console.error('❌ Failed to initialize fitness gauge:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }
    },

    async startFitnessMonitoring() {
        // Update fitness data every 10 seconds
        setInterval(async () => {
            if (!this.error && window.prismaticCharts) {
                try {
                    const data = await window.prismaticCharts.apiCall('evolution/fitness_current');
                    this.currentFitness = data.current_fitness;
                    this.lastUpdated = new Date().toLocaleTimeString();
                } catch (error) {
                    console.warn('Failed to update fitness data:', error);
                }
            }
        }, 10000);
    },

    createFallbackMessage() {
        const container = document.querySelector('#fitnessGauge')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-64 bg-gray-750 rounded-lg border border-purple-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-6';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-purple-400 text-lg font-semibold mb-2';
            titleDiv.textContent = '🏆 SEADF Integration Offline';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-sm mb-4';
            errorDiv.textContent = `Evolution framework: ${this.error}`;

            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'text-2xl font-bold text-green-400';
            scoreDiv.textContent = this.currentFitness.toFixed(4);

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            contentDiv.appendChild(scoreDiv);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    },

    getFitnessStatus() {
        if (this.currentFitness >= 0.99) return { status: 'APEX', color: 'text-green-400', icon: '👑' };
        if (this.currentFitness >= 0.95) return { status: 'HEALTHY', color: 'text-blue-400', icon: '💚' };
        if (this.currentFitness >= 0.90) return { status: 'WARNING', color: 'text-yellow-400', icon: '⚠️' };
        return { status: 'CRITICAL', color: 'text-red-400', icon: '🚨' };
    }
}));

Alpine.data('componentsChart', () => ({
    chart: null,
    isLoading: true,
    error: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('componentsChart');
            if (!ctx) {
                throw new Error('Components chart canvas not found');
            }

            console.log('📊 Initializing live component breakdown...');

            // Create real-time component breakdown chart
            this.chart = await window.prismaticCharts.createFitnessChart('componentsChart', {
                chartType: 'components',
                realTime: true
            });

            this.isLoading = false;
            console.log('✅ Live component chart initialized');
        } catch (error) {
            console.error('❌ Failed to initialize component chart:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }
    },

    createFallbackMessage() {
        const container = document.querySelector('#componentsChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-80 bg-gray-750 rounded-lg border border-blue-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-4';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-blue-400 font-medium mb-2';
            titleDiv.textContent = '📊 Component Data Offline';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-xs';
            errorDiv.textContent = this.error;

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    }
}));

Alpine.data('trendsChart', () => ({
    chart: null,
    isLoading: true,
    error: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            await this.$nextTick();

            const ctx = document.getElementById('trendsChart');
            if (!ctx) {
                throw new Error('Trends chart canvas not found');
            }

            console.log('📈 Initializing live evolution trends...');

            // Create real-time evolution trends chart
            this.chart = await window.prismaticCharts.createFitnessChart('trendsChart', {
                chartType: 'trends',
                realTime: true
            });

            this.isLoading = false;
            console.log('✅ Live evolution trends initialized');
        } catch (error) {
            console.error('❌ Failed to initialize trends chart:', error);
            this.error = error.message;
            this.isLoading = false;
            this.createFallbackMessage();
        }
    },

    createFallbackMessage() {
        const container = document.querySelector('#trendsChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-80 bg-gray-750 rounded-lg border border-indigo-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-4';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-indigo-400 font-medium mb-2';
            titleDiv.textContent = '📈 Evolution Trends Offline';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-xs';
            errorDiv.textContent = this.error;

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    }
}));
</script>

## Historical Context

The concept of software fitness metrics has its roots in the software engineering measurement programs of the 1980s and 1990s. Early metrics like McCabe's cyclomatic complexity (1976), Halstead's software science (1977), and the COCOMO cost model (1981) attempted to quantify software quality through single-dimension measurements. These metrics were useful for specific purposes but failed to capture the holistic health of a software system.

The next generation of metrics attempted composite scoring. The SQALE method (Software Quality Assessment based on Lifecycle Expectations, 2010) introduced the concept of technical debt as a monetary value, while SonarQube popularized quality gates -- boolean pass/fail thresholds on metric combinations. These approaches moved beyond single metrics but still treated quality as a compliance checkbox rather than an evolutionary process.

The Prismatic Platform's Fitness Score represents a third generation of quality measurement, drawing inspiration from evolutionary computing's fitness functions and complex adaptive systems theory. Instead of measuring static compliance, the Fitness Score measures the system's capacity for continued evolution -- its ability to absorb changes without degradation, maintain quality under pressure, and improve through self-corrective mechanisms. This dynamic perspective reflects the platform's commitment to autonomous evolution through the [SEADF](@/glossary/seadf.md) framework.

The evolution from Quality Score (100-point scale, single domain) to Fitness Score (0.0-1.0 scale, multi-domain) occurred during the platform's Generation 14-15 transition, when it became clear that quality alone was insufficient to guide evolutionary decisions. A platform could score 100/100 on quality while having poor documentation, outdated agents, or weak security posture. The Fitness Score was designed to capture this broader picture.

## Technical Architecture

The Fitness Score is computed as a weighted average of component scores, each normalized to the 0.0-1.0 range:

| Component | Weight | Current Score | Measurement Method |
|-----------|--------|---------------|-------------------|
| **Quality Score** | 30% | 100/100 (1.0) | 13 quality domains, zero violations |
| **Test Coverage** | 15% | 5,864 test files | File count and coverage percentage |
| **Documentation** | 10% | 11,308 docs | Doc file count and completeness |
| **Agent Compliance** | 15% | 530/530 AIAD agents | AIAD standard adherence rate |
| **[Consciousness Traits](@/glossary/consciousness-traits.md)** | 10% | 11 traits at 0.998 | Trait fitness sub-scores |
| **Architectural Compliance** | 10% | OTP-first adherence | Pattern compliance checks |
| **Security Posture** | 10% | Color Team coverage | Security domain assessment |

The composite formula:

```
fitness = sum(component_score[i] * weight[i]) for i in components
```

```elixir
defmodule Prismatic.Evolution.FitnessCalculator do
  @moduledoc """
  Computes the platform's composite fitness score from
  individual component assessments. Score ranges from
  0.0 (critical) to 1.0 (apex). The calculator implements
  weighted aggregation with configurable component weights
  and provides classification into fitness categories that
  drive automatic platform responses.
  """

  @type fitness_classification :: :apex | :healthy | :warning | :critical | :emergency
  @type component_scores :: %{
    quality_score: float(),
    test_coverage: float(),
    documentation: float(),
    agent_compliance: float(),
    consciousness_traits: float(),
    architectural_compliance: float(),
    security_posture: float()
  }

  @component_weights %{
    quality_score: 0.30,
    test_coverage: 0.15,
    documentation: 0.10,
    agent_compliance: 0.15,
    consciousness_traits: 0.10,
    architectural_compliance: 0.10,
    security_posture: 0.10
  }

  @spec compute(component_scores()) :: float()
  def compute(component_scores) do
    @component_weights
    |> Enum.reduce(0.0, fn {component, weight}, acc ->
      score = Map.get(component_scores, component, 0.0)
      acc + score * weight
    end)
    |> Float.round(4)
  end

  @spec classify(float()) :: fitness_classification()
  def classify(fitness) when fitness >= 0.99, do: :apex
  def classify(fitness) when fitness >= 0.95, do: :healthy
  def classify(fitness) when fitness >= 0.90, do: :warning
  def classify(fitness) when fitness >= 0.80, do: :critical
  def classify(_fitness), do: :emergency

  @spec compute_quality_component(map()) :: float()
  def compute_quality_component(quality_data) do
    domains = [
      :dialyzer, :credo, :compilation, :datetime_precision,
      :guard_functions, :impl_coverage, :memory_safety,
      :performance, :regression_prevention, :timing_patterns,
      :todo_management, :typespec_coverage, :unsafe_map_access
    ]

    violations = Enum.sum(Enum.map(domains, &Map.get(quality_data, &1, 0)))
    max(0.0, 1.0 - violations * 0.01)
  end

  @spec compute_delta(float(), float()) :: %{delta: float(), direction: atom()}
  def compute_delta(current, previous) do
    delta = Float.round(current - previous, 4)
    direction = cond do
      delta > 0.001 -> :improving
      delta < -0.001 -> :declining
      true -> :stable
    end

    %{delta: delta, direction: direction}
  end
end
```

## Threshold Response Matrix

The Fitness Score drives automatic platform responses through a tiered threshold system:

| Range | Classification | Response Level | Actions |
|-------|---------------|----------------|---------|
| **0.99-1.00** | APEX | OPTIMAL | Monitor only, no intervention needed |
| **0.95-0.99** | HEALTHY | WARNING | Alert, investigation triggered, increased monitoring |
| **0.90-0.95** | WARNING | CRITICAL | Auto-evolution trigger, [quality gates](@/glossary/quality-gates.md) tightened |
| **0.80-0.90** | CRITICAL | EMERGENCY | Commit blocking, escalation to supreme authority |
| **< 0.80** | EMERGENCY | LOCKDOWN | Full platform lockdown, all deployments halted |

Each threshold transition emits telemetry events that drive alerting, logging, and automatic response orchestration:

```elixir
defmodule Prismatic.Evolution.FitnessMonitor do
  @moduledoc """
  Continuous fitness monitoring GenServer that polls component
  scores at configurable intervals and triggers automatic
  responses when thresholds are crossed. Integrates with the
  Quality Floor Guardian for enforcement and Quality DNA for
  cross-session persistence.
  """

  use GenServer

  @check_interval :timer.minutes(5)

  @impl GenServer
  @spec init(map()) :: {:ok, map()}
  def init(state) do
    schedule_check()
    {:ok, state}
  end

  @impl GenServer
  def handle_info(:check_fitness, state) do
    components = gather_component_scores()
    fitness = Prismatic.Evolution.FitnessCalculator.compute(components)
    classification = Prismatic.Evolution.FitnessCalculator.classify(fitness)

    :telemetry.execute(
      [:prismatic, :evolution, :fitness],
      %{score: fitness},
      %{classification: classification, components: components}
    )

    delta = Prismatic.Evolution.FitnessCalculator.compute_delta(
      fitness,
      Map.get(state, :last_fitness, fitness)
    )

    handle_classification(classification, fitness, delta)
    persist_to_quality_dna(fitness, components, classification)
    schedule_check()

    {:noreply, %{state |
      last_fitness: fitness,
      last_classification: classification,
      last_check: DateTime.utc_now()
    }}
  end

  defp handle_classification(:apex, _fitness, _delta), do: :ok

  defp handle_classification(:healthy, fitness, delta) do
    if delta.direction == :declining do
      Prismatic.Alerts.send(:fitness_declining, %{score: fitness, delta: delta})
    end
  end

  defp handle_classification(:warning, fitness, _delta) do
    Prismatic.AutoEvolve.trigger_scan()
    Prismatic.Alerts.send(:fitness_warning, %{score: fitness})
  end

  defp handle_classification(:critical, fitness, _delta) do
    Prismatic.AutoEvolve.trigger_scan()
    Prismatic.Alerts.send(:fitness_critical, %{score: fitness})
  end

  defp handle_classification(:emergency, fitness, _delta) do
    PrismaticSafety.QualityFloorGuardian.block_commits()
    Prismatic.Alerts.escalate(:supreme, %{score: fitness})
  end

  defp schedule_check do
    Process.send_after(self(), :check_fitness, @check_interval)
  end

  defp gather_component_scores do
    %{
      quality_score: Prismatic.Quality.current_score() / 100,
      test_coverage: Prismatic.Testing.coverage_ratio(),
      documentation: Prismatic.Docs.completeness_ratio(),
      agent_compliance: Prismatic.AIAD.compliance_ratio(),
      consciousness_traits: Prismatic.Consciousness.trait_fitness(),
      architectural_compliance: Prismatic.Architecture.compliance_ratio(),
      security_posture: Prismatic.Security.posture_score()
    }
  end

  defp persist_to_quality_dna(fitness, components, classification) do
    data = %{
      fitness: fitness,
      classification: classification,
      components: components,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601()
    }

    path = ".claude/quality-dna/current-state.json"
    File.write!(path, Jason.encode!(data, pretty: true))
  end
end
```

## Architecture and Data Flow

The Fitness Score system is architecturally distributed across several platform components:

**[SEADF](@/glossary/seadf.md) Integration**: The Self-Evolving Autonomous Development Framework is the primary orchestrator of fitness computation. It coordinates data collection from all quality domains, performs the weighted aggregation, and publishes the result to [Quality DNA](@/glossary/quality-dna.md) for cross-session persistence.

**Quality DNA Persistence**: The computed fitness score is persisted in `.claude/quality-dna/current-state.json`, ensuring continuity across LLM sessions and development cycles. Each session loads the previous fitness score and can compare current state against historical trends.

**Quality Floor Guardian**: This autonomous monitoring system watches the fitness score and enforces threshold-based responses. It runs as a supervised GenServer that polls component scores at configurable intervals.

**[Generation](@/glossary/generation.md) Advancement**: Fitness score improvements drive generation transitions. When the platform achieves and sustains improved fitness across all components, the SEADF system evaluates whether a generation advancement is warranted.

```
Quality Domains (13)  ──┐
Test Files (5,864)    ──┤
Documentation (11,308)──┤── SEADF Aggregator ──> Fitness Score ──> Quality DNA
Agent Registry (530)  ──┤                              |
Consciousness (11)    ──┤                              v
Architecture Check    ──┤                    Quality Floor Guardian
Security Assessment   ──┘                              |
                                                       v
                                              Threshold Response
                                              (alert/block/lockdown)
```

## Current Platform State

Within the Prismatic Platform, the current fitness score is **0.9995** (apex), achieved at **Generation 19** (Ecosystem Expansion). This score reflects the culmination of 19 generations of evolutionary improvement.

### Component Breakdown (Current State)

| Component | Score | Details |
|-----------|-------|---------|
| Quality Score | 1.000 | 100/100 across all 13 quality domains, zero violations |
| Test Coverage | 0.998 | 5,864 test files covering all business logic |
| Documentation | 0.999 | 11,308 documentation files across all apps |
| Agent Compliance | 1.000 | All 530 AIAD agents compliant with standard |
| Consciousness Traits | 0.998 | 11 traits operational at near-perfect fitness |
| Architectural Compliance | 0.999 | OTP-first patterns enforced across 115 apps |
| Security Posture | 0.998 | 20 Color Team agents across 6 teams active |

### Historical Fitness Trajectory

The fitness score has followed an upward trajectory across generations:

| Generation | Fitness | Key Advancement |
|------------|---------|-----------------|
| Gen 1-5 | 0.60-0.75 | Foundation, basic quality gates |
| Gen 6-10 | 0.80-0.90 | Quality domains, testing framework |
| Gen 11-14 | 0.90-0.95 | NM/ND doctrine, NABLA integration |
| Gen 15-17 | 0.95-0.998 | Color Teams, consciousness traits |
| Gen 18 | 0.999 | Full Autonomy, perfect quality score |
| Gen 19 | 0.9995 | Ecosystem Expansion, 4 OSS packages, 13-layer Trinity Gate |

### Enforcement Integration

The fitness score integrates with the platform's enforcement mechanisms:

```elixir
defmodule Prismatic.Hooks.FitnessGate do
  @moduledoc """
  Pre-commit hook integration that checks the current fitness
  score before allowing commits. Blocks commits when the
  platform is in WARNING, CRITICAL, or EMERGENCY state.
  """

  @spec check() :: :ok | {:error, String.t()}
  def check do
    fitness = Prismatic.Evolution.FitnessCalculator.current()

    case Prismatic.Evolution.FitnessCalculator.classify(fitness) do
      :apex -> :ok
      :healthy -> :ok
      :warning -> {:error, "Fitness WARNING (#{fitness}): investigate before committing"}
      level -> {:error, "Fitness #{level} (#{fitness}): commits BLOCKED"}
    end
  end
end
```

## Component Measurement Details

Each component is measured through specific mechanisms:

### Quality Score Component (30%)

The quality score measures compliance across 13 quality domains. Each domain contributes equally, and any violation reduces the score:

| Domain | Measurement | Tool |
|--------|-------------|------|
| [Dialyzer](@/glossary/dialyzer.md) | Type violations | `mix dialyzer` |
| [Credo](@/glossary/credo.md) | Static analysis violations | `mix credo --strict` |
| Compilation | Warning count | `mix compile --warnings-as-errors` |
| DateTime Precision | Precision violations | Custom check |
| Guard Functions | Improper guard usage | Custom check |
| @impl Coverage | Missing @impl annotations | Custom check |
| Memory Safety | Unsafe patterns | Custom check |
| Performance | Anti-pattern detection | Custom check |
| Regression Prevention | Missing regression tests | Custom check |
| Timing Patterns | Process.sleep usage | Custom check |
| TODO Management | Unresolved TODOs | Custom check |
| Typespec Coverage | Missing @spec | Custom check |
| Unsafe Map Access | map.key without guard | Custom check |

### Agent Compliance Component (15%)

Measures AIAD standard adherence across all 530 agents:

```elixir
defmodule Prismatic.AIAD.ComplianceChecker do
  @moduledoc """
  Validates AIAD agent compliance with the standard specification.
  Checks for required fields, enforcement blocks, and doctrine references.
  """

  @spec compliance_ratio() :: float()
  def compliance_ratio do
    agents = load_all_agents()
    compliant = Enum.count(agents, &compliant?/1)
    compliant / max(length(agents), 1)
  end

  @spec compliant?(map()) :: boolean()
  defp compliant?(agent) do
    has_required_fields?(agent) and
      has_enforcement_block?(agent) and
      has_doctrine_reference?(agent)
  end
end
```

## Best Practices

**Monitor Trends, Not Snapshots**: A single fitness score reading is less informative than the trend over time. A score of 0.98 that was 0.99 yesterday indicates regression, while 0.98 rising from 0.95 indicates improvement. Track deltas between measurements.

**Investigate Component Drops**: When the composite score drops, identify which component caused the decline. A drop in test coverage has different remediation than a drop in architectural compliance. The component breakdown provides diagnostic precision.

**Calibrate Weights Periodically**: Component weights should reflect current platform priorities. During a security-focused phase, increasing the security posture weight ensures the fitness score is sensitive to security improvements or regressions.

**Automate Response Actions**: Each threshold crossing should trigger automatic actions -- not just alerts. The platform's [AutoEvolve](@/glossary/autoevolve.md) and [AutoHeal](@/glossary/autoheal.md) mechanisms should activate based on fitness score thresholds, not manual intervention.

**Persist Historical Data**: Maintain a time series of fitness scores and component breakdowns for retrospective analysis. This data reveals patterns in quality regression and helps predict future issues.

## Common Pitfalls

**Goodhart's Law**: When the fitness score becomes the target rather than a measure, teams may optimize for the score rather than actual quality. Ensure the score's components genuinely reflect platform health.

**Component Masking**: A high composite score can mask a critical deficiency in a single component. A fitness of 0.96 with a security posture of 0.50 is dangerous even though the composite looks healthy. Always review component-level scores.

**Stale Measurements**: If component scores are not refreshed frequently, the fitness score may not reflect current reality. Ensure all component measurements are current before making decisions based on the composite score.

**Threshold Fatigue**: If thresholds trigger too many alerts without actionable consequences, teams learn to ignore them. Set thresholds that require response and ensure response mechanisms are effective.

**Linear Weighting Limitations**: The weighted average formula treats all components as independent, but in reality they are correlated. A drop in test coverage often precedes a drop in quality score. Consider implementing correlation-aware scoring in future iterations.

## Related Concepts

- [Generation](@/glossary/generation.md) - Evolution epochs measured and advanced by fitness improvements
- [SEADF](@/glossary/seadf.md) - Framework computing and managing fitness scores across all domains
- [Quality Floor Guardian](@/glossary/quality-floor-guardian.md) - Monitoring system enforcing fitness thresholds
- [Quality DNA](@/glossary/quality-dna.md) - Cross-session persistence of fitness history and trends
- [AutoEvolve](@/glossary/autoevolve.md) - System driving fitness score improvement through optimization
- [Consciousness Traits](@/glossary/consciousness-traits.md) - Traits contributing to fitness at 0.998 sub-score
- [Quality Gates](@/glossary/quality-gates.md) - Enforcement pipeline measuring quality component inputs
- [CASCADE Pattern](@/glossary/cascade-pattern.md) - Quality patterns that drove fitness improvements
- [NM/ND Doctrine](@/glossary/nm-nd.md) - Governing framework mandating fitness enforcement
- [Credo](@/glossary/credo.md) - Static analysis contributing to quality component
- [Dialyzer](@/glossary/dialyzer.md) - Type checking contributing to quality component

## See Also

- [Architecture](@/architecture/_index.md) - Platform architecture overview
- [Technologies](@/technologies/_index.md) - Technology stack details
- [Agents](@/agents/_index.md) - AIAD agents contributing to fitness components

---

## Connect & Contribute

**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)
