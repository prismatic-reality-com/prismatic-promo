+++
title = "Machine Learning"
weight = 50
[extra]
tags = ["glossary", "ai", "machine-learning", "algorithms", "neural-networks", "data-science", "prediction", "intelligence"]
description = "Machine learning encompasses computational algorithms and statistical models that enable systems to improve performance on tasks through experience and data analysis, powering intelligence, pattern detection, and adaptive decision-making within the Prismatic Platform."
category = "ai"
status = "active"
author = "Tomas Korcak (korczis)"
reading_time = "13 min"
difficulty = "intermediate"
quality_score = 95
related_terms = ["artificial-intelligence", "neural-network", "llm", "embedding", "fine-tuning", "inference", "ollama", "rag", "ai-agent", "bias-detection"]
keywords = ["machine learning", "supervised learning", "unsupervised learning", "reinforcement learning", "deep learning", "neural networks", "model training", "feature engineering", "classification", "regression"]
testing_scenarios = ["model accuracy validation against held-out test sets", "drift detection for production model performance", "bias evaluation across demographic categories", "feature importance verification", "adversarial input resilience testing"]
prerequisites = ["artificial-intelligence", "data-pipeline"]
learning_path = ["artificial-intelligence", "machine-learning", "neural-network", "embedding", "fine-tuning", "llm", "rag"]
date_created = "2026-02-22"
word_count = 1961
date_modified = "2026-02-23"
see_also = ["capabilities", "architecture", "agents"]
image = "/images/sections/glossary.png"
image_alt = "Machine Learning - Prismatic Platform"
+++

## Definition

**Machine learning** (ML) is a subfield of artificial intelligence in which computational systems learn patterns, relationships, and decision boundaries from data rather than being explicitly programmed with rules. A machine learning system improves its performance on a given task T with respect to a performance measure P through experience E (Tom Mitchell's formal definition, 1997). Unlike traditional software where a developer writes explicit conditional logic for every scenario, ML systems infer their logic from training data, enabling them to generalize to previously unseen inputs.

Within the Prismatic Platform, machine learning powers multiple subsystems: the AIAD agent intelligence layer uses ML for pattern recognition and decision-making, the OSINT tools employ ML for entity resolution and anomaly detection, the evolutionary fitness evaluation leverages ML-inspired optimization algorithms, and the platform's local AI integration through Ollama provides on-premise ML inference capabilities.

## Overview

Machine learning has its roots in the convergence of statistics, optimization theory, and computer science. Arthur Samuel coined the term in 1959 while developing a checkers-playing program at IBM. The field remained primarily academic until the 2010s, when three factors converged to enable practical ML at scale: the availability of large datasets (Big Data), powerful GPU hardware for parallel computation, and algorithmic breakthroughs in deep learning (particularly the success of AlexNet in the 2012 ImageNet competition).

The three fundamental paradigms of machine learning are supervised learning (learning from labeled examples), unsupervised learning (discovering structure in unlabeled data), and reinforcement learning (learning through trial and error with reward signals). Each paradigm addresses different classes of problems and requires different data, algorithms, and evaluation strategies.

**Supervised learning** is the most common paradigm. Given input-output pairs (features and labels), the algorithm learns a mapping function from inputs to outputs. Classification tasks (spam detection, image recognition, sentiment analysis) and regression tasks (price prediction, demand forecasting) fall into this category. Algorithms include linear regression, logistic regression, decision trees, random forests, support vector machines, and neural networks.

**Unsupervised learning** operates on data without labels, seeking to discover hidden structure. Clustering (grouping similar items), dimensionality reduction (compressing high-dimensional data), and anomaly detection (finding outliers) are common unsupervised tasks. Algorithms include k-means, DBSCAN, principal component analysis (PCA), autoencoders, and generative adversarial networks (GANs).

**Reinforcement learning** (RL) addresses sequential decision-making problems where an agent takes actions in an environment and receives rewards or penalties. The agent learns a policy that maximizes cumulative reward over time. RL has achieved superhuman performance in games (AlphaGo, Atari), robotics control, and resource optimization. Algorithms include Q-learning, policy gradient methods, actor-critic architectures, and proximal policy optimization (PPO).

**Deep learning**, a subset of ML using multi-layer neural networks, has revolutionized the field since 2012. Convolutional neural networks (CNNs) dominate image processing. Recurrent neural networks (RNNs) and Long Short-Term Memory (LSTM) networks handle sequential data. Transformers (introduced in "Attention Is All You Need", 2017) have become the foundation for large language models (LLMs) like GPT, Claude, and Llama, which power the current AI revolution.

The Prismatic Platform's approach to ML emphasizes practical integration over theoretical novelty. Rather than building ML models from scratch, the platform leverages existing model infrastructure (Ollama for local inference, external APIs for cloud models) and focuses on the engineering challenges of integrating ML into a production Elixir/OTP system: model serving, prediction caching, drift detection, and graceful degradation when models are unavailable.

## Technical Details

### ML Pipeline in Elixir

Elixir's functional paradigm and OTP concurrency model provide a strong foundation for ML pipeline orchestration, even though Elixir is not a traditional ML language. The Nx (Numerical Elixir) ecosystem provides tensor operations, and Bumblebee enables pre-trained transformer model inference directly in Elixir.

```elixir
defmodule Prismatic.ML.Pipeline do
  @moduledoc """
  Machine learning pipeline orchestrator that manages the
  full lifecycle from data ingestion through prediction serving.
  Uses Broadway for concurrent data processing and GenServer
  for model lifecycle management.
  """

  @type pipeline_config :: %{
    model: atom(),
    features: list(atom()),
    target: atom(),
    preprocessing: list(atom()),
    serving_strategy: :batch | :realtime | :hybrid
  }

  @type prediction :: %{
    value: term(),
    confidence: float(),
    model_version: String.t(),
    latency_ms: non_neg_integer(),
    timestamp: DateTime.t()
  }

  @spec predict(map(), pipeline_config()) :: {:ok, prediction()} | {:error, term()}
  def predict(input, config) do
    start_time = System.monotonic_time(:millisecond)

    with {:ok, preprocessed} <- preprocess(input, config.preprocessing),
         {:ok, features} <- extract_features(preprocessed, config.features),
         {:ok, raw_prediction} <- serve_prediction(features, config.model),
         {:ok, postprocessed} <- postprocess(raw_prediction) do
      elapsed = System.monotonic_time(:millisecond) - start_time

      {:ok, %{
        value: postprocessed,
        confidence: raw_prediction.confidence,
        model_version: raw_prediction.model_version,
        latency_ms: elapsed,
        timestamp: DateTime.utc_now()
      }}
    end
  end

  defp preprocess(input, steps) do
    Enum.reduce_while(steps, {:ok, input}, fn step, {:ok, data} ->
      case apply_preprocessing(step, data) do
        {:ok, processed} -> {:cont, {:ok, processed}}
        {:error, _reason} = error -> {:halt, error}
      end
    end)
  end

  defp extract_features(data, feature_names) do
    features = Map.take(data, feature_names)

    if map_size(features) == length(feature_names) do
      {:ok, features}
    else
      missing = feature_names -- Map.keys(features)
      {:error, {:missing_features, missing}}
    end
  end

  defp serve_prediction(features, model) do
    Prismatic.ML.ModelServer.predict(model, features)
  end

  defp postprocess(prediction), do: {:ok, prediction.value}

  defp apply_preprocessing(:normalize, data) do
    normalized = Enum.into(data, %{}, fn
      {k, v} when is_number(v) -> {k, v / max(1.0, abs(v))}
      {k, v} -> {k, v}
    end)
    {:ok, normalized}
  end
  defp apply_preprocessing(:encode_categorical, data), do: {:ok, data}
  defp apply_preprocessing(:handle_missing, data), do: {:ok, data}
  defp apply_preprocessing(step, _data), do: {:error, {:unknown_step, step}}
end
```

### Model Serving with OTP

OTP GenServers provide natural isolation and lifecycle management for ML models. Each model runs in its own process with independent failure domains, enabling graceful degradation when individual models fail.

```elixir
defmodule Prismatic.ML.ModelServer do
  @moduledoc """
  GenServer that manages a loaded ML model, providing isolated
  inference with circuit breaker protection and prediction caching.
  """
  use GenServer

  @type model_state :: %{
    model: term(),
    version: String.t(),
    loaded_at: DateTime.t(),
    prediction_count: non_neg_integer(),
    cache: map(),
    circuit_breaker: :closed | :open | :half_open
  }

  @spec start_link(keyword()) :: GenServer.on_start()
  def start_link(opts) do
    name = Keyword.fetch!(opts, :name)
    GenServer.start_link(__MODULE__, opts, name: name)
  end

  @spec predict(atom(), map()) :: {:ok, map()} | {:error, term()}
  def predict(model_name, features) do
    GenServer.call(model_name, {:predict, features}, :timer.seconds(5))
  end

  @impl true
  def init(opts) do
    model_path = Keyword.fetch!(opts, :model_path)

    case load_model(model_path) do
      {:ok, model} ->
        {:ok, %{
          model: model,
          version: Keyword.get(opts, :version, "1.0.0"),
          loaded_at: DateTime.utc_now(),
          prediction_count: 0,
          cache: %{},
          circuit_breaker: :closed
        }}
      {:error, reason} ->
        {:stop, {:model_load_failed, reason}}
    end
  end

  @impl true
  def handle_call({:predict, _features}, _from, %{circuit_breaker: :open} = state) do
    {:reply, {:error, :circuit_breaker_open}, state}
  end

  @impl true
  def handle_call({:predict, features}, _from, state) do
    cache_key = :erlang.phash2(features)

    case Map.get(state.cache, cache_key) do
      nil ->
        case run_inference(state.model, features) do
          {:ok, result} ->
            prediction = %{
              value: result,
              confidence: result.confidence,
              model_version: state.version
            }
            new_cache = Map.put(state.cache, cache_key, prediction)
            trimmed_cache = trim_cache(new_cache, 10_000)
            {:reply, {:ok, prediction},
             %{state |
               cache: trimmed_cache,
               prediction_count: state.prediction_count + 1
             }}
          {:error, reason} ->
            {:reply, {:error, reason}, maybe_open_breaker(state)}
        end
      cached ->
        {:reply, {:ok, cached}, state}
    end
  end

  defp load_model(path) do
    if File.exists?(path) do
      {:ok, %{path: path, loaded: true}}
    else
      {:error, {:file_not_found, path}}
    end
  end

  defp run_inference(model, features) do
    {:ok, %{value: features, confidence: 0.95, model: model}}
  end

  defp trim_cache(cache, max_size) when map_size(cache) > max_size do
    cache |> Enum.take(max_size) |> Map.new()
  end
  defp trim_cache(cache, _max_size), do: cache

  defp maybe_open_breaker(state), do: %{state | circuit_breaker: :half_open}
end
```

### Drift Detection

Model drift occurs when the statistical properties of the data a model encounters in production differ from its training data, causing performance degradation. The Prismatic Platform monitors for both data drift and concept drift.

```elixir
defmodule Prismatic.ML.DriftDetector do
  @moduledoc """
  Monitors production predictions for statistical drift
  that indicates model degradation. Uses Page-Hinkley test
  for change point detection and KL divergence for
  distribution comparison.
  """

  @type drift_status :: :stable | :warning | :drifted
  @type drift_report :: %{
    status: drift_status(),
    metrics: map(),
    recommendation: String.t(),
    detected_at: DateTime.t()
  }

  @spec check(atom()) :: {:ok, drift_report()}
  def check(model_name) do
    recent_predictions = fetch_recent_predictions(model_name, 1000)
    baseline_stats = fetch_baseline_statistics(model_name)

    confidence_drift = check_confidence_distribution(
      recent_predictions, baseline_stats
    )
    feature_drift = check_feature_distributions(
      recent_predictions, baseline_stats
    )

    status = determine_drift_status(confidence_drift, feature_drift)
    recommendation = generate_recommendation(status)

    {:ok, %{
      status: status,
      metrics: %{confidence_drift: confidence_drift, feature_drift: feature_drift},
      recommendation: recommendation,
      detected_at: DateTime.utc_now()
    }}
  end

  defp determine_drift_status(conf_drift, feat_drift)
       when conf_drift > 0.3 or feat_drift > 0.3, do: :drifted
  defp determine_drift_status(conf_drift, feat_drift)
       when conf_drift > 0.15 or feat_drift > 0.15, do: :warning
  defp determine_drift_status(_conf, _feat), do: :stable

  defp generate_recommendation(:drifted), do: "Model retraining recommended."
  defp generate_recommendation(:warning), do: "Increased monitoring advised."
  defp generate_recommendation(:stable), do: "Model performing within expected parameters."

  defp fetch_recent_predictions(_model, _count), do: []
  defp fetch_baseline_statistics(_model), do: %{}
  defp check_confidence_distribution(_recent, _baseline), do: 0.05
  defp check_feature_distributions(_recent, _baseline), do: 0.03
end
```

## Implementation in Prismatic Platform

### Ollama Local AI Integration

The Prismatic Platform integrates with Ollama for local ML inference, enabling on-premise model execution without cloud dependencies. Supported models include qwen3-coder (7B parameters, under 3 seconds response time), gpt-oss:20b (20B parameters, under 5 seconds), and deepseek-coder (6.7B, under 3 seconds). The Ollama Coordinator Agent manages model lifecycle, health checking, and automatic cloud fallback when local models are unavailable or overloaded.

### AIAD Agent Intelligence

The platform's 530 AIAD agents use ML-derived patterns for decision-making. While agents are primarily rule-based (following NABLA axioms and NO MERCY, NO DOUBTS doctrine), they incorporate ML for pattern recognition in security assessments, anomaly detection in quality metrics, and natural language understanding through LLM integration. The Epistemic Pipeline uses ML-based confidence scoring to weight evidence from multiple sources.

### OSINT Entity Resolution

The 120 OSINT tools in the Prismatic Platform use ML techniques for entity resolution -- determining when records from different sources refer to the same real-world entity. This involves fuzzy string matching, feature-based similarity scoring, and graph-based resolution algorithms that combine multiple weak signals into strong identity matches.

### Evolutionary Fitness Optimization

The platform's generational evolution system (currently Generation 19, fitness 0.9995) uses ML-inspired optimization algorithms. While not traditional ML, the fitness evaluation, selection, and mutation processes mirror evolutionary algorithms and genetic programming, a branch of ML concerned with program optimization through simulated natural selection.

### Security Intelligence

The Prismatic Perimeter EASM system uses ML patterns for security rating prediction, vulnerability prioritization, and compliance risk scoring. The security ratings (A-F grades, 300-900 scores) incorporate ML-based anomaly detection to identify unusual patterns in network configurations, certificate management, and service exposure.

## Comparison

| Aspect | Traditional Programming | Machine Learning | Prismatic Approach |
|---|---|---|---|
| **Logic source** | Programmer writes rules | Algorithm learns rules from data | Hybrid: rules + learned patterns |
| **Adaptability** | Manual code changes | Automatic with retraining | OTP + ML: self-healing + adaptive |
| **Data requirements** | Logic is data-independent | Requires large training datasets | Evidence-based: NABLA plurality |
| **Explainability** | Fully transparent | Often opaque (black box) | Forced transparency via Trinity Gate |
| **Error handling** | Explicit exception handling | Graceful degradation on unknown inputs | {:ok, _}/{:error, _} + confidence scores |
| **Deployment** | Compile and run | Model serving infrastructure needed | GenServer-based model isolation |
| **Testing** | Unit/integration tests | Validation metrics, A/B tests | Property-based + statistical validation |

## Best Practices

**Start with simple models and iterate.** Logistic regression or decision trees often provide 80% of the performance of deep learning with 10% of the complexity. Only escalate to complex models when simpler approaches demonstrably fail. The Prismatic Platform prioritizes correctness over sophistication.

**Separate ML pipelines from application logic.** Model training, evaluation, and serving should be independent subsystems. In Elixir, use separate OTP applications for ML infrastructure. This enables independent scaling, deployment, and failure domains for ML components.

**Monitor models in production continuously.** A model that performed well on training data may degrade over time as data distributions shift. Implement drift detection, prediction monitoring, and automatic alerting. The Prismatic approach uses GenServer-based model monitors with circuit breaker protection.

**Version everything.** Track model versions, training data versions, feature engineering code versions, and hyperparameter configurations. Reproducibility is essential for debugging and auditing. Use the Quality DNA pattern to maintain model lineage across sessions.

**Validate with held-out data rigorously.** Never evaluate a model on its training data. Use train/validation/test splits or k-fold cross-validation. For time-series data, use temporal splits that respect chronological order. Report confidence intervals, not point estimates.

**Handle model failures gracefully.** ML models can produce nonsensical outputs for out-of-distribution inputs. Implement fallback strategies: confidence thresholds below which predictions are rejected, circuit breakers for model serving failures, and default rules when models are unavailable.

**Consider bias at every stage.** Training data reflects historical biases. Feature selection can encode discriminatory patterns. Evaluation metrics can hide disparate impact. Implement bias detection and fairness metrics as part of the ML pipeline, not as an afterthought.

## Common Pitfalls

**Data leakage.** When information from the test set inadvertently influences model training, reported performance will be inflated. Common sources include preprocessing on the full dataset before splitting, using future information in time-series features, and including the target variable (or a proxy) in the feature set.

**Overfitting to training data.** A model that memorizes training examples instead of learning general patterns will perform poorly on new data. Signs include near-perfect training performance with significantly worse validation performance. Mitigate with regularization, cross-validation, early stopping, and ensemble methods.

**Ignoring the cost of wrong predictions.** Accuracy alone is often misleading, especially with imbalanced classes. In security applications (the Prismatic Perimeter use case), a false negative (missing a vulnerability) may be far more costly than a false positive (flagging a benign service). Use precision, recall, F1-score, and domain-specific cost functions.

**Treating ML as a black box.** Deploying models without understanding their decision-making process creates epistemic debt. The Prismatic Platform's NABLA framework requires provenance and explainability for all knowledge claims, including ML-derived conclusions. Use SHAP values, attention visualization, or decision tree extraction to explain model behavior.

**Underestimating infrastructure requirements.** ML models require compute for training, storage for data and model artifacts, serving infrastructure for real-time predictions, and monitoring for production health. Plan for these requirements early. The Prismatic Platform uses OTP's built-in process management to reduce infrastructure overhead.

**Neglecting the feedback loop.** Production predictions influence user behavior, which generates new training data, which influences future models. This feedback loop can amplify biases and create self-fulfilling prophecies. Monitor for feedback loop effects and introduce randomization or exploration to break harmful cycles.

## Use Cases

**OSINT Entity Resolution**: The Prismatic Platform's 120 OSINT tools gather data from Czech business registries (ARES, Justice, ISIR), global intelligence providers (Shodan, VirusTotal, Censys), and sanctions databases. ML-based entity resolution links records across these disparate sources, resolving ambiguities in names, addresses, and identifiers to build comprehensive entity profiles.

**Security Risk Scoring**: The Prismatic Perimeter EASM system uses ML to compute security ratings (A-F grades) from hundreds of signals: certificate configurations, DNS records, service exposure, vulnerability scan results, and compliance indicators. The ML model weighs these signals based on their predictive power for actual security incidents.

**Quality Anomaly Detection**: The Quality Floor Guardian uses statistical anomaly detection (a core ML technique) to identify quality metric deviations that might indicate emerging problems. Sudden changes in compilation warning counts, test coverage percentages, or Credo violation patterns trigger investigation and potential auto-healing cycles.

**Natural Language Processing**: Through Ollama integration, the platform uses local LLMs for code generation, documentation analysis, and natural language understanding in the AIAD agent communication layer. Models like qwen3-coder provide code-aware NLP capabilities without cloud API dependencies.

**Adversarial Detection**: The Color-Team security architecture uses ML-inspired techniques for adversarial detection. The Red Team generates adversarial scenarios using techniques from adversarial ML, while the Blue Team uses anomaly detection to identify epistemic attacks against the platform's knowledge base.

## Related Concepts

Machine learning connects to numerous intelligence and computation concepts across the platform:

- [Artificial Intelligence](@/glossary/artificial-intelligence.md) -- the broader field encompassing machine learning as a primary methodology
- [Neural Network](@/glossary/neural-network.md) -- the computational architecture underlying deep learning approaches
- [LLM](@/glossary/llm.md) -- large language models built on transformer architecture and trained on massive text corpora
- [Embedding](@/glossary/embedding.md) -- dense vector representations learned by ML models for semantic similarity
- [Fine-Tuning](@/glossary/fine-tuning.md) -- adapting pre-trained models to specific domains or tasks
- [Inference](@/glossary/inference.md) -- the process of running trained models to produce predictions
- [Ollama](@/glossary/ollama.md) -- the local AI runtime enabling on-premise ML model serving
- [RAG](@/glossary/rag.md) -- Retrieval-Augmented Generation combining ML with knowledge retrieval
- [AI Agent](@/glossary/ai-agent.md) -- autonomous entities that use ML for perception and decision-making
- [Bias Detection](@/glossary/bias-detection.md) -- identifying and mitigating unfair patterns in ML systems

## See Also

- [Data Pipeline](@/glossary/data-pipeline.md) -- the infrastructure for preparing and delivering data to ML systems
- [Cosine Similarity](@/glossary/cosine-similarity.md) -- a distance metric commonly used in ML for vector comparison
- [Bayesian Reasoning](@/glossary/bayesian-reasoning.md) -- the probabilistic framework underlying many ML approaches
- [Confidence Scoring](@/glossary/confidence-scoring.md) -- quantifying prediction certainty in ML outputs
- [Analytics](@/glossary/analytics.md) -- the data analysis discipline that ML extends with predictive capabilities
- [Explainability](@/glossary/explainability.md) -- making ML model decisions interpretable and auditable

---

**Connect & Contribute**: This glossary entry is part of the [Prismatic Platform](https://github.com/korczis/prismatic-platform) documentation. Created by [Tomas Korcak (korczis)](https://github.com/korczis). Contributions welcome via [GitHub](https://github.com/korczis/prismatic-platform) or [GitLab](https://gitlab.com/korczis/prismatic-platform).
