+++
title = "Fine-Tuning"
weight = 33
[extra]
category = "technology"
description = "Specializing a pre-trained AI model on domain-specific data"
related_terms = ["ollama", "vector-database", "data-pipeline", "quality-gates", "telemetry", "knowledge-graph"]
author = "Tomas Korcak (korczis)"
reading_time = "9 min"
word_count = 1804
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Fine-Tuning", "Specializing", "glossary", "technology", "Prismatic Platform", "LoRA", "Fine", "Quality"]
tags = ["glossary", "technology", "fine-tuning", "prismatic"]
quality_score = 87
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Fine-Tuning - Prismatic Platform"
+++

## Definition & Overview

Fine-tuning is the process of further training a pre-trained AI model on a domain-specific dataset to specialize its capabilities for particular tasks. Rather than training a model from scratch -- which requires enormous compute budgets, massive datasets, and weeks of GPU time -- fine-tuning starts from a foundation model that already possesses broad knowledge of language, code, or visual patterns, and adjusts its parameters using a comparatively small, targeted dataset. The result is a specialized model that excels at domain-specific tasks while retaining the general capabilities learned during pre-training.

The fine-tuning paradigm represents one of the most significant advances in practical AI deployment. Foundation models like LLaMA, Mistral, Qwen, and DeepSeek are trained on trillions of tokens at costs measured in millions of dollars. Fine-tuning allows organizations to customize these models for their specific use cases at a fraction of the cost -- often on a single GPU in hours rather than clusters of GPUs over weeks. This democratization of model specialization has made it feasible for teams of any size to build domain-expert AI systems.

Fine-tuning techniques span a spectrum from full-parameter fine-tuning (adjusting all model weights) to parameter-efficient methods that modify only a small fraction of the model. The choice of technique depends on available compute, dataset size, and the degree of specialization required. Modern parameter-efficient methods achieve results comparable to full fine-tuning while requiring orders of magnitude less memory and compute.

## Technical Deep Dive

Fine-tuning operates at the intersection of transfer learning and gradient-based optimization. The key insight is that a pre-trained model's weights encode general knowledge in lower layers (syntax, basic semantics, common patterns) and increasingly specialized knowledge in upper layers. Fine-tuning adjusts these weights to shift the model's probability distributions toward domain-specific outputs.

### Fine-Tuning Techniques

| Technique | Parameters Modified | Memory Required | Quality | Training Time | Best For |
|-----------|-------------------|-----------------|---------|---------------|----------|
| **Full Fine-Tuning** | All (7B-70B+) | 4x model size | Highest | Hours to days | Large datasets, max performance |
| **LoRA** | 0.1-1% of total | ~1.2x model size | Near-full | Minutes to hours | Most use cases, good efficiency |
| **QLoRA** | 0.1-1% (quantized base) | ~0.5x model size | Good | Minutes to hours | Resource-constrained environments |
| **AdaLoRA** | Adaptive rank allocation | ~0.8x model size | High | Hours | Complex tasks requiring variable adaptation |
| **Prefix Tuning** | Prepended virtual tokens | Minimal | Moderate | Minutes | Quick prototyping |
| **P-Tuning v2** | Layer-specific prompts | ~0.3x model size | Moderate-High | 30-60 min | Understanding tasks |
| **Adapter Layers** | Small inserted modules | ~1.1x model size | Good | Hours | Multi-task scenarios |
| **IA3** | Learned element-wise rescaling | <0.1% | Moderate | Minutes | Memory-critical applications |

**LoRA (Low-Rank Adaptation)** is the most widely used parameter-efficient technique. Instead of modifying the full weight matrices, LoRA decomposes the weight update into two smaller matrices of rank `r`, where `r` is typically 8-64. For a weight matrix W of dimensions `d x k`, LoRA learns matrices A (d x r) and B (r x k) such that the effective weight becomes `W + AB`. This reduces trainable parameters from `d*k` to `r*(d+k)`, often a 100-1000x reduction.

The mathematical foundation of LoRA rests on the assumption that weight updates during fine-tuning lie in a low-rank subspace. Research shows this assumption holds remarkably well across model architectures and domains. The rank `r` controls the expressiveness-efficiency tradeoff: higher ranks capture more complex adaptations but require more parameters and memory.

**QLoRA** extends LoRA by quantizing the base model to 4-bit precision (NF4 format) while keeping the LoRA adapters in higher precision. This allows fine-tuning a 7B parameter model on a single consumer GPU with 8GB VRAM, making fine-tuning accessible on standard development hardware. The quantization uses Normal Float 4 (NF4), which is information-theoretically optimal for normally distributed weights.

**AdaLoRA** improves upon LoRA by dynamically adjusting the rank allocation during training. Rather than using a fixed rank `r` across all layers, AdaLoRA learns which layers benefit from higher-rank adaptations and allocates parameters accordingly. This typically achieves better performance than LoRA with the same parameter budget.

### Advanced Parameter-Efficient Methods

```elixir
defmodule Prismatic.FineTuning.AdaptationConfig do
  @moduledoc """
  Configuration templates for different parameter-efficient fine-tuning methods.
  Each method optimized for specific use cases and resource constraints.
  """

  defstruct [
    :method,
    :rank,
    :alpha,
    :dropout,
    :target_modules,
    :bias_handling,
    :task_type
  ]

  # LoRA configuration for code generation
  def lora_code_generation do
    %__MODULE__{
      method: :lora,
      rank: 16,              # Higher rank for complex code patterns
      alpha: 32,             # 2x rank scaling
      dropout: 0.1,          # Prevent overfitting on code patterns
      target_modules: ["q_proj", "k_proj", "v_proj", "o_proj"],
      bias_handling: :none,
      task_type: :causal_lm
    }
  end

  # QLoRA configuration for resource-constrained environments
  def qlora_efficient do
    %__MODULE__{
      method: :qlora,
      rank: 8,               # Lower rank due to quantization
      alpha: 16,
      dropout: 0.05,
      target_modules: ["q_proj", "v_proj"],  # Fewer modules for efficiency
      bias_handling: :none,
      task_type: :causal_lm
    }
  end

  # AdaLoRA configuration for complex domain adaptation
  def adalora_advanced do
    %__MODULE__{
      method: :adalora,
      rank: 32,              # Starting rank (will be adjusted)
      alpha: 64,
      dropout: 0.1,
      target_modules: ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj"],
      bias_handling: :lora_only,
      task_type: :causal_lm
    }
  end
end
```

### Training Dynamics and Optimization

Fine-tuning optimization differs significantly from pre-training due to the different loss landscapes and gradient magnitudes. The pre-trained model already sits in a good local minimum; fine-tuning seeks to move to a nearby minimum that performs better on the target domain while preserving general capabilities.

**Learning Rate Scheduling**: Fine-tuning typically uses learning rates 10-100x smaller than pre-training. A common pattern is to use cosine annealing with warmup:

```elixir
defmodule Prismatic.FineTuning.Scheduler do
  def cosine_with_warmup(step, total_steps, max_lr, warmup_steps, min_lr \\ 0.0) do
    cond do
      step < warmup_steps ->
        # Linear warmup
        max_lr * step / warmup_steps

      step >= total_steps ->
        min_lr

      true ->
        # Cosine annealing
        progress = (step - warmup_steps) / (total_steps - warmup_steps)
        min_lr + (max_lr - min_lr) * 0.5 * (1 + :math.cos(:math.pi() * progress))
    end
  end
end
```

**Gradient Accumulation**: When GPU memory limits batch size, gradient accumulation simulates larger batches by accumulating gradients over multiple forward passes before updating weights. Effective batch size becomes `batch_size * accumulation_steps`.

**Mixed Precision Training**: Using FP16 for forward pass and FP32 for gradients reduces memory usage by ~40% while maintaining numerical stability. Modern GPUs (V100, A100, RTX 30xx+) have dedicated Tensor Cores that accelerate FP16 operations.

### Training Data Preparation

Training data quality is the single most important factor in fine-tuning success. The data must be formatted as input-output pairs that represent the desired model behavior:

```elixir
defmodule Prismatic.FineTuning.DataPreparer do
  @moduledoc """
  Prepares platform data for fine-tuning datasets.
  Converts quality gate results, code reviews, and
  documentation into structured training pairs.
  """

  @spec prepare_code_generation_dataset(list(map())) :: list(map())
  def prepare_code_generation_dataset(source_files) do
    source_files
    |> Enum.map(&extract_training_pair/1)
    |> Enum.filter(&valid_pair?/1)
    |> Enum.map(&format_for_training/1)
  end

  defp extract_training_pair(file_data) do
    %{
      instruction: "Generate an Elixir #{file_data.type} module for #{file_data.purpose}",
      input: file_data.context,
      output: file_data.source_code,
      metadata: %{
        quality_score: file_data.quality_score,
        has_typespecs: file_data.has_typespecs,
        has_docs: file_data.has_docs,
        test_coverage: file_data.coverage
      }
    }
  end

  defp valid_pair?(pair) do
    pair.metadata.quality_score >= 90 and
      pair.metadata.has_typespecs and
      pair.metadata.has_docs and
      pair.metadata.test_coverage >= 80
  end

  defp format_for_training(pair) do
    %{
      "messages" => [
        %{"role" => "system", "content" => "You are an expert Elixir developer."},
        %{"role" => "user", "content" => "#{pair.instruction}\n\nContext: #{pair.input}"},
        %{"role" => "assistant", "content" => pair.output}
      ]
    }
  end
end
```

### Hyperparameter Selection

| Hyperparameter | Typical Range | Impact |
|---------------|---------------|--------|
| **Learning Rate** | 1e-5 to 5e-4 | Too high causes catastrophic forgetting; too low causes no learning |
| **Epochs** | 1-5 | More epochs risk overfitting on small datasets |
| **Batch Size** | 4-32 | Larger batches improve stability but require more memory |
| **LoRA Rank (r)** | 8-64 | Higher rank captures more complex adaptations |
| **LoRA Alpha** | 16-128 | Scaling factor controlling adaptation magnitude |
| **Warmup Steps** | 5-10% of total | Prevents early gradient instability |

## Architecture & Implementation

The fine-tuning pipeline follows a structured workflow from data collection through model deployment:

```
Data Collection --> Data Cleaning --> Format Conversion --> Training
      |                  |                  |                |
  Quality Gates    Deduplication    Chat/Instruction     LoRA/QLoRA
  Filter (90+)    Length Filters    Format (JSONL)       Configuration
      |                  |                  |                |
      v                  v                  v                v
  High-Quality     Clean Dataset     Training-Ready     Fine-Tuned
  Source Files     (balanced)        JSONL File         Model Weights
                                                            |
                                                            v
                                                    Evaluation & Metrics
                                                            |
                                                            v
                                                    Ollama Model Deployment
```

**Evaluation Strategy**: Fine-tuned models must be evaluated on held-out test sets that were not part of training. Key metrics include:

```elixir
defmodule Prismatic.FineTuning.Evaluator do
  @moduledoc """
  Evaluates fine-tuned model quality against baseline
  foundation model performance.
  """

  @spec evaluate(model :: atom(), test_set :: list(map())) :: map()
  def evaluate(model, test_set) do
    results =
      test_set
      |> Enum.map(fn example ->
        prediction = Prismatic.Ollama.generate(model, example.input)
        score = compute_similarity(prediction, example.expected_output)
        %{input: example.input, prediction: prediction, score: score}
      end)

    %{
      mean_score: Enum.sum(Enum.map(results, & &1.score)) / length(results),
      pass_rate: Enum.count(results, &(&1.score >= 0.8)) / length(results),
      worst_examples: results |> Enum.sort_by(& &1.score) |> Enum.take(5),
      best_examples: results |> Enum.sort_by(& &1.score, :desc) |> Enum.take(5)
    }
  end

  defp compute_similarity(prediction, expected) do
    # BLEU score, code similarity, or domain-specific metric
    String.jaro_distance(prediction, expected)
  end
end
```

## Usage in Prismatic Platform

The Prismatic Platform evaluates and applies fine-tuning for domain-specific model specialization via the Ollama local AI infrastructure. Several specialization domains benefit directly from fine-tuning:

**Elixir Code Generation**: Models fine-tuned on the platform's 6,652 `.ex` source files learn OTP patterns, supervision tree structures, GenServer idioms, and the platform's specific coding conventions. The training data is filtered by quality score (90+), ensuring the model learns from production-quality code only.

**OSINT Analysis**: Intelligence report generation models are fine-tuned on entity extraction patterns, threat classification formats, and the structured output formats expected by the intelligence fusion pipeline.

**Quality Assessment**: Models trained on quality gate results and code review feedback can predict quality issues before compilation, providing early-warning quality signals during development.

**Training Data Generation**: The platform's quality pipeline generates structured training data from multiple sources:

| Data Source | Volume | Quality Filter | Use Case |
|-------------|--------|----------------|----------|
| Source files (`.ex`) | 6,652 files | Quality score 90+ | Code generation |
| Test files (`.exs`) | 5,864 files | Passing tests only | Test generation |
| Quality gate results | Continuous | All results | Quality prediction |
| Agent definitions | 434 agents | AIAD-compliant only | Agent design |
| Documentation | 11,308 docs | Structured only | Doc generation |

The telemetry system tracks fine-tuned model performance metrics against baseline foundation model accuracy, enabling data-driven decisions about when fine-tuning provides meaningful improvement.

## Code Examples

### Ollama Modelfile for Fine-Tuned Model

```dockerfile
# Modelfile for Prismatic-specialized Qwen3-Coder
FROM qwen3-coder:7b

# Apply LoRA adapter
ADAPTER ./prismatic-elixir-lora.gguf

# System prompt for Prismatic platform context
SYSTEM """
You are an expert Elixir/OTP developer specialized in the Prismatic Platform.
You follow NO MERCY, NO DOUBTS doctrine: complete implementations only,
production-ready code with typespecs, documentation, and comprehensive tests.
You use OTP patterns (GenServer, Supervisor, Application) correctly.
You never use Manager/Handler/Utils naming. You follow {:ok, _}/{:error, _} patterns.
"""

# Inference parameters
PARAMETER temperature 0.3
PARAMETER top_p 0.9
PARAMETER num_predict 4096
```

### Fine-Tuning Data Pipeline

```elixir
defmodule Prismatic.FineTuning.Pipeline do
  @moduledoc """
  End-to-end fine-tuning data pipeline.
  Collects, cleans, formats, and exports training data.
  """

  alias Prismatic.FineTuning.DataPreparer

  @spec run(keyword()) :: {:ok, String.t()} | {:error, term()}
  def run(opts \\ []) do
    output_path = Keyword.get(opts, :output, "training_data.jsonl")
    min_quality = Keyword.get(opts, :min_quality, 90)

    with {:ok, sources} <- collect_source_files(),
         {:ok, filtered} <- filter_by_quality(sources, min_quality),
         {:ok, balanced} <- balance_dataset(filtered),
         {:ok, formatted} <- format_training_pairs(balanced),
         {:ok, path} <- write_jsonl(formatted, output_path) do
      {:ok, path}
    end
  end

  defp collect_source_files do
    files =
      Path.wildcard("apps/*/lib/**/*.ex")
      |> Enum.map(&analyze_file/1)
      |> Enum.reject(&is_nil/1)

    {:ok, files}
  end

  defp filter_by_quality(files, min_quality) do
    filtered = Enum.filter(files, &(&1.quality_score >= min_quality))
    {:ok, filtered}
  end

  defp balance_dataset(files) do
    # Ensure balanced representation across module types
    grouped = Enum.group_by(files, & &1.type)

    balanced =
      grouped
      |> Enum.flat_map(fn {_type, group} ->
        Enum.take_random(group, min(length(group), 500))
      end)

    {:ok, balanced}
  end

  defp format_training_pairs(files) do
    pairs = DataPreparer.prepare_code_generation_dataset(files)
    {:ok, pairs}
  end

  defp write_jsonl(data, path) do
    content =
      data
      |> Enum.map(&Jason.encode!/1)
      |> Enum.join("\n")

    File.write(path, content)
    {:ok, path}
  end

  defp analyze_file(path) do
    # File analysis implementation
    %{path: path, source_code: File.read!(path), type: :module, quality_score: 95,
      has_typespecs: true, has_docs: true, coverage: 90, purpose: "GenServer", context: ""}
  end
end
```

## Best Practices

**Curate Training Data Ruthlessly**: Quality over quantity. A dataset of 1,000 high-quality examples consistently outperforms 10,000 noisy examples. Filter by quality score, remove duplicates, and ensure diverse representation of the target task.

**Evaluate Against Baselines**: Always measure fine-tuned model performance against the base model on the same test set. Fine-tuning should show measurable improvement; if it does not, the training data or hyperparameters need adjustment.

**Version Control Everything**: Track datasets, hyperparameters, model checkpoints, and evaluation results. Use experiment tracking tools to maintain reproducibility across fine-tuning runs.

**Monitor for Catastrophic Forgetting**: Evaluate the fine-tuned model on general benchmarks in addition to domain-specific ones. Excessive fine-tuning can cause the model to lose general capabilities. Use a validation set from the general domain to detect this.

**Start with LoRA/QLoRA**: Unless there is a compelling reason for full fine-tuning, start with parameter-efficient methods. They require less compute, are faster to iterate, and produce models that are easier to version (LoRA adapters are small files).

**Use Structured Prompts**: Format training data with consistent prompt templates that match the inference-time prompt format exactly. Mismatches between training and inference prompts degrade performance.

## Common Pitfalls

**Catastrophic Forgetting**: Over-tuning on a narrow dataset causes the model to lose general capabilities. Symptoms include excellent performance on the training domain but degraded performance on general tasks. Mitigate with lower learning rates, fewer epochs, and mixed training data. Monitor general benchmarks (HellaSwag, MMLU) alongside domain-specific metrics.

**Data Leakage**: Including test set examples in training data produces artificially inflated evaluation metrics. Always perform a clean train/test split before training begins, and verify no overlap exists. Use content hashing to detect near-duplicates across splits.

**Overfitting on Small Datasets**: With fewer than 100 training examples, the model may memorize rather than generalize. Use data augmentation, regularization (dropout in LoRA), and early stopping based on validation loss. Consider few-shot in-context learning before fine-tuning for very small datasets.

**Ignoring Data Quality**: Training on low-quality examples (buggy code, incorrect documentation, inconsistent formatting) teaches the model to reproduce those defects. The platform's quality gate filter at 90+ score is essential. Manual review of training examples prevents systemic biases.

**Wrong Task Formulation**: Fine-tuning a model for code generation when the actual need is code review produces a model optimized for the wrong objective. Carefully define the input-output relationship before preparing training data. Consider whether the task requires generation, classification, or ranking.

**Neglecting Evaluation**: Deploying a fine-tuned model without rigorous evaluation on held-out data risks deploying a model that performs worse than the baseline. Always evaluate before deployment using domain-relevant metrics and human evaluation.

**Hyperparameter Transfer**: Assuming hyperparameters that work for one domain (e.g., natural language) will work for another (e.g., code) often leads to suboptimal results. Code generation typically needs lower learning rates and higher ranks due to the precise syntactic requirements.

**Insufficient Training Data Diversity**: Training only on specific code patterns (e.g., only GenServer modules) creates models that cannot generalize to other patterns. Ensure balanced representation across the target domain's full complexity.

**Ignoring Base Model Capabilities**: Fine-tuning a model on a task it already performs well (e.g., basic Python on GPT-4) may provide minimal improvement while introducing instability. Evaluate base model performance first to determine if fine-tuning is necessary.

**Memory Miscalculation**: Underestimating GPU memory requirements leads to out-of-memory errors during training. Account for:
- Model parameters (base + adapter)
- Optimizer states (2x parameters for Adam)
- Activations (depends on batch size and sequence length)
- Gradient storage
- Framework overhead (~20-30%)

**Prompt Format Mismatch**: Training with one prompt format but inferencing with another degrades performance. Ensure training and inference prompts match exactly, including special tokens and system messages.

### Advanced Debugging Techniques

```elixir
defmodule Prismatic.FineTuning.Debugger do
  @moduledoc """
  Debugging utilities for fine-tuning issues.
  Helps identify common problems before they cause training failures.
  """

  def diagnose_training_data(dataset_path) do
    data = load_jsonl(dataset_path)

    %{
      total_examples: length(data),
      avg_input_length: calculate_avg_length(data, "input"),
      avg_output_length: calculate_avg_length(data, "output"),
      format_issues: check_format_consistency(data),
      duplicate_rate: calculate_duplicate_rate(data),
      quality_distribution: analyze_quality_distribution(data)
    }
  end

  def monitor_training_progress(loss_history, validation_metrics) do
    %{
      convergence_status: analyze_convergence(loss_history),
      overfitting_detected: detect_overfitting(loss_history, validation_metrics),
      learning_rate_suggestions: suggest_lr_adjustments(loss_history),
      early_stopping_recommendation: should_stop_early?(validation_metrics)
    }
  end

  defp detect_overfitting(train_loss, val_metrics) do
    if length(train_loss) < 10 do
      false
    else
      recent_train = Enum.take(train_loss, -5) |> Enum.sum() / 5
      recent_val = Enum.take(val_metrics, -5) |> Enum.map(& &1.loss) |> Enum.sum() / 5

      val_increasing = val_metrics |> Enum.take(-5) |> trending_upward?()
      train_decreasing = train_loss |> Enum.take(-5) |> trending_downward?()

      val_increasing and train_decreasing and (recent_val > recent_train * 1.5)
    end
  end

  defp analyze_convergence(loss_history) do
    if length(loss_history) < 10 do
      :insufficient_data
    else
      recent_variance = loss_history |> Enum.take(-10) |> variance()

      cond do
        recent_variance < 0.001 -> :converged
        recent_variance > 0.1 -> :unstable
        trending_downward?(Enum.take(loss_history, -10)) -> :improving
        true -> :plateaued
      end
    end
  end
end
```

## Related Concepts

- [Ollama](@/glossary/ollama.md) - Local AI runtime hosting fine-tuned model variants via Modelfile adapters
- [Inference](@/glossary/inference.md) - Running fine-tuned models to generate predictions and outputs
- [Vector Database](@/glossary/vector-database.md) - Storage for embeddings generated by fine-tuned models
- [Data Pipeline](@/glossary/data-pipeline.md) - Processing infrastructure preparing fine-tuning datasets
- [Quality Gates](@/glossary/quality-gates.md) - Validation systems filtering training data by quality score
- [Telemetry](@/glossary/telemetry.md) - Metrics tracking fine-tuned model performance against baselines
- [Knowledge Graph](@/glossary/knowledge-graph.md) - Structured knowledge complementing fine-tuned model capabilities

## See Also

- [prismatic_ollama](../../../apps/prismatic_ollama/README.md) -- Local model hosting for fine-tuned variants via Modelfile
- [prismatic_agents](../../../apps/prismatic_agents/README.md) -- Agent runtime consuming fine-tuned model outputs
- [prismatic_safety](../../../apps/prismatic_safety/README.md) -- Quality gates filtering training data by score
- [prismatic_quality_intelligence](../../../apps/prismatic_quality_intelligence/README.md) -- Quality intelligence for training data curation
- [Architecture](@/architecture/_index.md) -- Platform architecture overview
- [Agents](@/agents/_index.md) -- AIAD agents using fine-tuned models

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)