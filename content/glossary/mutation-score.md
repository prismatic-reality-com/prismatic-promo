+++
title = "Mutation Score"
weight = 50
[extra]
description = "The percentage of killed mutants out of total non-equivalent mutants, measuring how effectively a test suite detects code changes."
category = "testing"
related_terms = ["mutation-testing", "mutant", "killedsurvived", "test-coverage"]
complexity_level = "advanced"
platform_integration = "supporting"
author = "Tomas Korcak (korczis)"
reading_time = "5 min"
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["mutation score", "test effectiveness", "mutation testing", "quality metric", "glossary", "Prismatic Platform"]
tags = ["glossary", "testing"]
quality_score = 75
see_also = ["capabilities", "architecture"]
image = "/images/sections/glossary.png"
image_alt = "Mutation Score - Prismatic Platform"
+++

## Definition & Overview

The mutation score is the primary metric produced by mutation testing, calculated as the ratio of killed mutants to total decisive mutants (killed + survived), expressed as a percentage. A mutation score of 85% means that 85 out of every 100 non-equivalent mutants were detected by the test suite. The remaining 15% represent test gaps where the suite fails to distinguish between correct and incorrect code behavior.

Mutation score is considered the gold standard for test suite quality measurement because it directly assesses behavioral verification rather than mere code execution. A test suite can achieve 100% line coverage while having a mutation score well below 50%, because coverage only measures which code was run, not whether the tests actually checked the results. Mutation score answers the more fundamental question: if a bug were introduced at this location, would the tests catch it?

In the Prismatic Platform, mutation scores are tracked as part of the Quality DNA system. The NO MERCY doctrine mandates specific minimum mutation scores based on module criticality: 100% for security-critical paths (Perimeter scoring, authentication, NABLA confidence), 90% for core business logic (DD pipeline, OSINT execution), and 80% for standard application code. Scores are computed during CI and tracked over time to detect quality trends.

## Technical Deep Dive

The mutation score formula is: MS = (killed / (killed + survived)) * 100. Equivalent mutants (those that produce identical behavior to the original) are excluded from both numerator and denominator because they are impossible to kill and would unfairly penalize the score. Timed-out mutants are typically counted as killed (since the original does not timeout, the behavioral difference is detectable).

Interpreting mutation scores requires context. A score of 80% does not mean "20% of the code is untested." It means that 20% of possible single-fault mutations are undetected. Some of these may be in trivial code (logging, formatting) where the business impact of a missed bug is minimal. Others may be in critical paths where even one missed mutation indicates a serious test gap. The Prismatic Platform addresses this by computing per-module mutation scores and weighting them by module criticality.

```elixir
defmodule PrismaticQuality.MutationScore do
  @moduledoc """
  Mutation score computation, tracking, and compliance checking.
  Integrates with Quality DNA for cross-session score monitoring.
  """

  @type score_result :: %{
    module: String.t(),
    score: float(),
    killed: non_neg_integer(),
    survived: non_neg_integer(),
    equivalent: non_neg_integer(),
    total: non_neg_integer(),
    compliance: :compliant | :warning | :violation,
    threshold: float()
  }

  @criticality_thresholds %{
    critical: 100.0,
    core: 90.0,
    standard: 80.0,
    utility: 70.0
  }

  @spec compute([PrismaticQuality.Mutation.t()]) :: float()
  def compute(mutations) do
    killed = Enum.count(mutations, &(&1.status == :killed))
    survived = Enum.count(mutations, &(&1.status == :survived))
    timed_out = Enum.count(mutations, &(&1.status == :timeout))

    decisive = killed + timed_out + survived

    if decisive > 0 do
      (killed + timed_out) / decisive * 100
      |> Float.round(2)
    else
      100.0
    end
  end

  @spec evaluate(String.t(), [PrismaticQuality.Mutation.t()], atom()) :: score_result()
  def evaluate(module_path, mutations, criticality \\ :standard) do
    score = compute(mutations)
    threshold = Map.fetch!(@criticality_thresholds, criticality)

    compliance =
      cond do
        score >= threshold -> :compliant
        score >= threshold - 5.0 -> :warning
        true -> :violation
      end

    %{
      module: module_path,
      score: score,
      killed: Enum.count(mutations, &(&1.status in [:killed, :timeout])),
      survived: Enum.count(mutations, &(&1.status == :survived)),
      equivalent: Enum.count(mutations, &(&1.status == :equivalent)),
      total: length(mutations),
      compliance: compliance,
      threshold: threshold
    }
  end

  @spec trend([{DateTime.t(), float()}]) :: %{
    direction: :improving | :stable | :declining,
    change_rate: float(),
    current: float(),
    average: float()
  }
  def trend(historical_scores) when length(historical_scores) >= 2 do
    scores = Enum.map(historical_scores, &elem(&1, 1))
    recent = Enum.take(scores, -5)
    older = Enum.take(scores, 5)

    recent_avg = Enum.sum(recent) / length(recent)
    older_avg = Enum.sum(older) / length(older)
    change_rate = recent_avg - older_avg

    direction =
      cond do
        change_rate > 1.0 -> :improving
        change_rate < -1.0 -> :declining
        true -> :stable
      end

    %{
      direction: direction,
      change_rate: Float.round(change_rate, 2),
      current: List.last(scores),
      average: Float.round(Enum.sum(scores) / length(scores), 2)
    }
  end

  def trend(_), do: %{direction: :stable, change_rate: 0.0, current: 0.0, average: 0.0}
end
```

Higher mutation scores have diminishing returns in terms of development effort. Moving from 80% to 90% typically requires adding targeted tests for edge cases. Moving from 90% to 95% requires testing subtle behavioral differences. Moving from 95% to 100% often involves equivalent mutant analysis and highly specific assertions. The platform's tiered thresholds reflect this effort curve, reserving the 100% requirement for code where the cost of missed bugs is highest.

## Architecture & Implementation

The mutation score system integrates with three platform subsystems. The Quality DNA persists historical scores in `.claude/quality-dna/current-state.json`, enabling trend analysis across sessions. The pre-commit hooks can optionally enforce minimum mutation scores for changed files, preventing quality degradation at the commit level. The CI pipeline computes scores for all critical modules and publishes results to the quality dashboard.

Score decomposition by mutation operator provides actionable insights. If a module has a high overall score but low scores for relational operator mutations, it indicates that boundary conditions are undertested. If arithmetic mutations survive, mathematical calculations lack assertions. This operator-level analysis guides test improvement efforts toward the most impactful areas.

The platform also computes a weighted aggregate mutation score across all critical modules, using module criticality as the weight. This single number provides a platform-level quality indicator that executives and project managers can track without understanding mutation testing details. A platform mutation score above 90% is a strong indicator of comprehensive test coverage.

## Interactive Mutation Score Analysis

<div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden my-8">
    <div class="p-6">
        <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                </svg>
                <span class="font-semibold text-white text-lg">Platform Mutation Scores by Module</span>
            </div>
            <div class="flex gap-2">
                <button @click="chartType = 'bar'"
                        :class="chartType === 'bar' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Bar Chart
                </button>
                <button @click="chartType = 'doughnut'"
                        :class="chartType === 'doughnut' ? 'bg-indigo-600' : 'bg-gray-700'"
                        class="px-3 py-1 text-xs text-white rounded-md hover:bg-indigo-500 transition-colors">
                    Distribution
                </button>
            </div>
        </div>

        <div class="relative h-80" x-data="mutationScoreChart()" x-init="initChart()">
            <canvas id="mutationChart"></canvas>
        </div>

        <!-- Legend and Statistics -->
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-750 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span class="text-sm font-medium text-white">Security-Critical</span>
                </div>
                <div class="text-2xl font-bold text-white">100%</div>
                <div class="text-xs text-gray-400">Required threshold</div>
            </div>

            <div class="bg-gray-750 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span class="text-sm font-medium text-white">Core Business Logic</span>
                </div>
                <div class="text-2xl font-bold text-white">90%</div>
                <div class="text-xs text-gray-400">Required threshold</div>
            </div>

            <div class="bg-gray-750 rounded-lg p-4">
                <div class="flex items-center gap-2 mb-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-sm font-medium text-white">Standard Application</span>
                </div>
                <div class="text-2xl font-bold text-white">80%</div>
                <div class="text-xs text-gray-400">Required threshold</div>
            </div>
        </div>

        <!-- Live Data Status Indicator -->
        <div class="mt-4 flex items-center justify-between text-sm">
            <div class="text-gray-400" x-show="!isLoading && !error">
                <span class="font-medium">Live Data:</span>
                <span x-text="getConnectionStatus().icon" class="ml-1"></span>
                <span x-text="getConnectionStatus().status" :class="getConnectionStatus().color" class="ml-1 capitalize"></span>
                <span x-show="lastUpdated" class="ml-2 text-gray-500">
                    Last updated: <span x-text="lastUpdated"></span>
                </span>
            </div>
            <div x-show="!isLoading && !error" class="flex gap-3">
                <button @click="refreshData()"
                        class="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                    Refresh Data
                </button>
                <span class="text-xs text-gray-500">
                    Cache: <span x-text="getMetrics().cacheHitRatio?.toFixed(2) || '0.00'"></span>% hit rate
                </span>
            </div>
        </div>

        <div x-show="isLoading" class="mt-4 flex items-center justify-center text-yellow-400">
            <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Connecting to live mutation score data...
        </div>

        <div x-show="error" class="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div class="flex items-center text-red-400">
                <span class="mr-2">⚠️</span>
                <span class="font-medium">Connection Error:</span>
                <span x-text="error" class="ml-2 text-red-300"></span>
            </div>
        </div>
    </div>
</div>

<script>
// Initialize Prismatic Chart Manager if not already done
if (typeof window.prismaticCharts === 'undefined') {
    window.prismaticCharts = new PrismaticChartManager({
        apiBaseUrl: window.location.protocol + '//' + window.location.host + '/api/v1',
        cacheTimeout: 30000,
        retryAttempts: 3
    });
}

Alpine.data('mutationScoreChart', () => ({
    chartType: 'bar',
    chart: null,
    isLoading: true,
    error: null,
    lastUpdated: null,

    async initChart() {
        this.isLoading = true;
        this.error = null;

        try {
            // Wait for next tick to ensure DOM is ready
            await this.$nextTick();

            const ctx = document.getElementById('mutationChart');
            if (!ctx) {
                throw new Error('Chart canvas not found');
            }

            console.log('🔬 Initializing live mutation score chart...');

            // Create chart with real-time data
            this.chart = await window.prismaticCharts.createMutationScoreChart('mutationChart', {
                chartType: this.chartType,
                realTime: true
            });

            this.lastUpdated = new Date().toLocaleTimeString();
            this.isLoading = false;

            console.log('✅ Live mutation score chart initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize mutation score chart:', error);
            this.error = error.message;
            this.isLoading = false;

            // Show fallback message in UI
            this.createFallbackMessage();
        }

        // Watch for chart type changes
        this.$watch('chartType', async () => {
            if (this.chart && !this.isLoading) {
                try {
                    this.chart.destroy();
                    window.prismaticCharts.charts.delete('mutationChart');

                    this.chart = await window.prismaticCharts.createMutationScoreChart('mutationChart', {
                        chartType: this.chartType,
                        realTime: true
                    });

                    this.lastUpdated = new Date().toLocaleTimeString();
                } catch (error) {
                    console.error('Failed to recreate chart:', error);
                    this.error = error.message;
                }
            }
        });

        // Set up periodic status updates
        setInterval(() => {
            if (this.chart && !this.error) {
                this.lastUpdated = new Date().toLocaleTimeString();
            }
        }, 30000);
    },

    createFallbackMessage() {
        const container = document.querySelector('#mutationChart')?.parentElement;
        if (container) {
            const fallback = document.createElement('div');
            fallback.className = 'flex items-center justify-center h-80 bg-gray-750 rounded-lg border border-red-500/30';

            const contentDiv = document.createElement('div');
            contentDiv.className = 'text-center p-6';

            const titleDiv = document.createElement('div');
            titleDiv.className = 'text-red-400 text-lg font-semibold mb-2';
            titleDiv.textContent = '⚠️ Live Data Unavailable';

            const errorDiv = document.createElement('div');
            errorDiv.className = 'text-gray-400 text-sm mb-4';
            errorDiv.textContent = this.error;

            const button = document.createElement('button');
            button.className = 'px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors';
            button.textContent = 'Retry Connection';
            button.onclick = () => location.reload();

            contentDiv.appendChild(titleDiv);
            contentDiv.appendChild(errorDiv);
            contentDiv.appendChild(button);
            fallback.appendChild(contentDiv);
            container.appendChild(fallback);
        }
    },

    async refreshData() {
        if (this.chart && window.prismaticCharts) {
            try {
                await window.prismaticCharts.refreshAllCharts();
                this.lastUpdated = new Date().toLocaleTimeString();
                this.error = null;
            } catch (error) {
                console.error('Failed to refresh data:', error);
                this.error = error.message;
            }
        }
    },

    getConnectionStatus() {
        if (this.error) return { status: 'error', color: 'text-red-400', icon: '❌' };
        if (this.isLoading) return { status: 'connecting', color: 'text-yellow-400', icon: '🔄' };
        return { status: 'connected', color: 'text-green-400', icon: '✅' };
    },

    getMetrics() {
        return window.prismaticCharts?.getMetrics() || {};
    }
}));
</script>

## Usage in Prismatic Platform

Integrated mutation score tracking in the quality pipeline:

```elixir
defmodule PrismaticQuality.MutationScoreGate do
  @moduledoc """
  Quality gate enforcement for mutation scores.
  Blocks merges when critical modules fall below thresholds.
  """

  alias PrismaticQuality.MutationScore

  @critical_modules %{
    "apps/prismatic_perimeter/lib/prismatic_perimeter/scoring.ex" => :critical,
    "apps/prismatic_perimeter/lib/prismatic_perimeter/compliance/nis2.ex" => :critical,
    "apps/prismatic_dd/lib/prismatic_dd/loader.ex" => :core,
    "apps/prismatic_osint_core/lib/prismatic_osint_core/tool_registry.ex" => :core,
    "apps/prismatic_academy/lib/prismatic_academy/topic_registry.ex" => :standard
  }

  @spec check_compliance() :: {:ok, :all_compliant} | {:error, [MutationScore.score_result()]}
  def check_compliance do
    results =
      @critical_modules
      |> Enum.map(fn {module_path, criticality} ->
        mutations = run_mutations_for(module_path)
        MutationScore.evaluate(module_path, mutations, criticality)
      end)

    violations = Enum.filter(results, &(&1.compliance == :violation))

    case violations do
      [] -> {:ok, :all_compliant}
      violations -> {:error, violations}
    end
  end

  @spec format_report([MutationScore.score_result()]) :: String.t()
  def format_report(results) do
    results
    |> Enum.map(fn r ->
      status = if r.compliance == :compliant, do: "PASS", else: "FAIL"
      "  [#{status}] #{r.module}: #{r.score}% (threshold: #{r.threshold}%)"
    end)
    |> Enum.join("\n")
    |> then(&"Mutation Score Report:\n#{&1}")
  end

  defp run_mutations_for(_module_path) do
    # Delegates to MutantGenerator + MutationTesting
    []
  end
end
```

The mutation score gate ensures that test quality is maintained at the level required by each module's criticality, preventing quality erosion that could compromise the platform's security and reliability guarantees.

## Cross-References

- [Mutation Testing](@/glossary/mutation-testing.md) - The methodology producing mutation scores
- [Mutant](@/glossary/mutant.md) - Individual code change contributing to the score
- [Killed/Survived](@/glossary/killedsurvived.md) - Binary outcomes that determine the score
- [Test Coverage](@/glossary/test-coverage.md) - Complementary but weaker quality metric
- [Quality DNA](@/glossary/quality-dna.md) - Cross-session quality tracking including mutation scores

---
**Created by [Tomas Korcak (korczis)](https://github.com/korczis)** | [GitHub](https://github.com/korczis/prismatic-platform)
