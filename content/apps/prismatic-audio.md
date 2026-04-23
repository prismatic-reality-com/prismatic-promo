+++
title = "Prismatic Audio"
weight = 76
[extra]
icon = "microphone"
color = "pink"
description = "Audio intelligence - transcription, speaker identification, and acoustic analysis"
category = "Intelligence"
files = "80"
status = "Development"
author = "Tomas Korcak (korczis)"
reading_time = "6 min"
word_count = 1217
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Prismatic", "Audio", "apps", "Intelligence", "Prismatic Platform", "PrismaticAudio", "OSINT"]
tags = ["apps", "intelligence", "prismatic-audio", "prismatic"]
quality_score = 80
see_also = ["technologies", "agents", "glossary"]
image = "/images/sections/apps.png"
image_alt = "Prismatic Audio - Prismatic Platform"
+++

## Overview

Prismatic Audio provides audio intelligence capabilities for the Prismatic Platform, implementing speech-to-text transcription, speaker diarization, language detection, and acoustic analysis for intelligence extraction from audio content. The system processes audio collected from [OSINT](@/glossary/osint.md) sources -- podcasts, interviews, public recordings, and conference proceedings -- to extract named entities, identify speakers, detect language and sentiment, and produce timestamp-aligned transcripts suitable for further analysis by the [Prismatic 3NL](@/apps/prismatic-3nl.md) epistemic processing pipeline.

Audio content represents a significant intelligence source that traditional text-based OSINT systems cannot process. Corporate earnings calls, public speeches, podcast interviews, and recorded proceedings contain information that may not appear in written form. Without audio processing capabilities, this intelligence remains inaccessible to automated analysis. Prismatic Audio bridges this gap by converting audio content into structured, searchable intelligence output with speaker attribution, temporal alignment, and entity extraction.

The architecture separates audio processing into three stages: acoustic analysis (language detection, noise classification, manipulation detection), transcription (multi-language speech-to-text with speaker diarization), and intelligence extraction (entity extraction, topic identification, relationship detection from transcript text). Each stage is implemented as an independent supervised process under an [OTP](@/glossary/otp.md) [supervision tree](@/glossary/supervision-tree.md), enabling fault isolation between computationally intensive processing phases. A processing queue [GenServer](@/glossary/genserver.md) manages batch audio processing jobs, dispatching work to supervised tasks with configurable concurrency limits and timeout protection.

The design goals center on six capabilities: multi-language transcription for Czech and English with technical term recognition, speaker diarization to identify who spoke when with speaker clustering across recordings, acoustic analysis for language detection and audio manipulation detection, intelligence extraction for named entity recognition and topic identification from transcripts, temporal alignment providing word-level timestamps for precise source reference, and pipeline integration structuring transcript output for direct consumption by downstream analysis modules.

## Architecture

The audio processing pipeline follows a three-stage linear architecture where each stage produces structured output consumed by the next. Raw audio enters through the public facade module, which validates format and queues the file for processing.

```
Audio Input (file or URL)
       |
  Acoustic Analyzer
  (language detection, noise classification, manipulation check)
       |
  Transcription Engine
  (speech-to-text with speaker diarization)
       |
  Intelligence Extractor
  (NER, topic detection, relationship extraction)
       |
  Structured Intelligence Output
  (transcript + entities + speakers + timestamps)
```

The process topology uses a one-for-one supervisor strategy. The ProcessingQueue GenServer maintains a priority-ordered job queue, dispatching audio files to supervised tasks running under a Task.Supervisor. This separation ensures that a crash during transcription of one audio file does not affect other queued jobs or the queue management process itself.

```
PrismaticAudio.Application (Supervisor, :one_for_one)
+-- PrismaticAudio.ProcessingQueue (GenServer)
|     Job queue for batch audio processing
+-- Task.Supervisor
      Supervised audio processing tasks
```

Audio files enter through the facade, which queues them for processing. The acoustic analyzer performs preliminary analysis including language identification, quality assessment, and manipulation detection. The transcription engine converts speech to text with timestamps and speaker labels. The intelligence extractor processes the transcript through entity recognition and topic detection. The output is a structured document combining transcript, entities, speakers, and temporal metadata.

## Key Modules

| Module | Responsibility |
|--------|----------------|
| `PrismaticAudio` | Public facade: `transcribe/2`, `identify_speakers/1`, `extract_intelligence/1` |
| `PrismaticAudio.AcousticAnalyzer` | Language detection, noise classification, manipulation detection |
| `PrismaticAudio.Transcriber` | Multi-language speech-to-text with word-level timestamps |
| `PrismaticAudio.Diarizer` | Speaker identification and segmentation using voice embeddings |
| `PrismaticAudio.IntelligenceExtractor` | Entity extraction and topic identification from transcripts |
| `PrismaticAudio.FormatHandler` | Audio format detection, conversion, and normalization |
| `PrismaticAudio.ProcessingQueue` | GenServer managing batch job queue with priority ordering |

Speaker diarization uses voice activity detection to identify speech regions, followed by speaker [embedding](@/glossary/embedding.md) extraction and clustering. Similar embeddings are grouped into speaker identities, and segments are labeled accordingly. Language detection analyzes acoustic features including pitch patterns and phoneme distributions against language models to determine the primary language of the audio content before transcription begins.

The Transcript data structure captures the complete output of a processing run:

```elixir
defmodule PrismaticAudio.Transcript do
  @type t :: %__MODULE__{
    audio_id: String.t(),
    language: atom(),
    duration_seconds: float(),
    segments: [Segment.t()],
    speakers: [Speaker.t()],
    entities: [Entity.t()],
    topics: [String.t()],
    confidence: float()
  }

  @type segment :: %{
    start_time: float(),
    end_time: float(),
    speaker: String.t(),
    text: String.t(),
    confidence: float()
  }
end
```

## Configuration

```elixir
config :prismatic_audio,
  languages: [:cs, :en],
  max_duration_seconds: 7200,
  transcription_model: :whisper,
  diarization_enabled: true,
  manipulation_detection: true,
  output_format: :structured,
  processing_concurrency: 4,
  job_timeout_ms: 900_000
```

Configuration supports specifying available languages for transcription, maximum audio duration for a single processing job, the transcription model backend (defaulting to Whisper for local deployment), and whether speaker diarization and manipulation detection stages are enabled. Processing concurrency controls the maximum number of simultaneous audio transcription tasks, while the job timeout prevents indefinite resource consumption from large or corrupted audio files.

## API Reference

```elixir
# Transcribe audio file with language specification
@spec transcribe(binary(), keyword()) :: {:ok, Transcript.t()} | {:error, term()}
PrismaticAudio.transcribe(audio_binary, language: :cs)

# Speaker identification and segmentation
@spec identify_speakers(binary()) :: {:ok, [Speaker.t()]}
PrismaticAudio.identify_speakers(audio_binary)

# Extract intelligence from completed transcript
@spec extract_intelligence(Transcript.t()) :: {:ok, IntelligenceResult.t()}
PrismaticAudio.extract_intelligence(transcript)

# Analyze audio properties without full transcription
@spec analyze(binary()) :: {:ok, AudioAnalysis.t()}
PrismaticAudio.analyze(audio_binary)
```

All public API functions return tagged tuples following the platform's `{:ok, result} | {:error, reason}` convention. The `transcribe/2` function accepts keyword options for language, model selection, and diarization preferences. The `analyze/1` function performs only acoustic analysis without the computationally expensive transcription stage, useful for rapid language detection or manipulation screening.

## Testing

Transcription tests use short audio samples with known transcripts to verify word-level accuracy. Diarization tests verify speaker segmentation accuracy using multi-speaker test recordings with annotated ground truth. The acoustic analyzer test suite validates language detection against samples in Czech and English with known language labels.

Integration tests exercise the full pipeline from raw audio through entity extraction, verifying that the complete processing chain produces correct structured output against annotated ground truth recordings. Property-based tests use StreamData generators to produce random audio parameters and processing configurations, verifying that the pipeline handles all valid configurations without crashes or resource leaks.

Audio processing requires test fixtures that are stored in the test support directory. Tests that require the Whisper model are tagged and can be excluded in CI environments where the model is not available.

## Integration Points

| Application | Relationship |
|-------------|--------------|
| [Prismatic 3NL](@/apps/prismatic-3nl.md) | Transcript text consumed by epistemic processing pipeline |
| [Prismatic Storage](@/apps/prismatic-storage.md) | Audio file and transcript persistence through storage adapters |
| [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) | Audio source intelligence extraction for OSINT monitoring |
| [Prismatic Telemetry](@/apps/prismatic-telemetry.md) | Processing metrics emission for observability |

Audio processing jobs are dispatched as supervised tasks. Job status is tracked in the ProcessingQueue GenServer. The Whisper model is deployed locally alongside the application -- no cloud transcription services are used, ensuring data sovereignty for sensitive intelligence audio content.

## NABLA Compliance

Prismatic Audio enforces [NABLA](@/glossary/nabla-infinity.md) axiom compliance on all intelligence output produced from audio transcription.

| NABLA Axiom | Audio Enforcement | Implementation |
|-------------|------------------|----------------|
| Signal Plurality | Transcription confidence cross-validated with acoustic features | Multiple signals (language detection, speaker ID, NER) corroborate findings |
| Provenance Mandatory | Every transcript segment carries source audio reference | Audio ID, timestamp range, and model version tracked |
| Time Decay | Transcription timestamps enable temporal analysis | Word-level timing enables precise temporal correlation |
| Unknown Valid | Low-confidence segments marked as uncertain | Confidence thresholds surface ambiguous transcription regions |
| Source Independence | Acoustic analysis independent from text analysis | Three-stage pipeline provides independent signal sources |

All intelligence products derived from audio carry provenance metadata linking conclusions back to specific audio segments, timestamps, and processing model versions.

## Performance

| Operation | Latency | Notes |
|-----------|---------|-------|
| Language detection | 2-5s | First 30 seconds of audio analyzed |
| Transcription (1 hour audio) | 5-15 minutes | Depends on model size and hardware |
| Speaker diarization | 1-3 minutes | Per hour of audio |
| Intelligence extraction | 5-30s | Depends on transcript length |

Audio processing is CPU-intensive and parallelizes across jobs via Task.[Supervisor](@/glossary/supervisor.md). GPU acceleration reduces transcription time by 5-10x when available.

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| Memory | 2 GB | 8 GB (with models loaded) |
| CPU | 4 cores | 8 cores or GPU |

[Telemetry](@/glossary/telemetry.md) events are emitted at `[:prismatic, :audio, :transcribe]`, `[:prismatic, :audio, :diarize]`, and `[:prismatic, :audio, :analyze]`. Key [metrics](@/glossary/metrics.md) include processing time per minute of audio, transcription accuracy estimates, queue depth, and GPU utilization when available.

## Related Resources

- [Prismatic 3NL](@/apps/prismatic-3nl.md) -- Text processing pipeline for transcript analysis
- [Prismatic OSINT Core](@/apps/prismatic-osint-core.md) -- Intelligence source layer providing audio content
- [Whisper](https://github.com/openai/whisper) -- Speech recognition model used for transcription
- [Adapter Pattern Specialist](@/agents/adapter-pattern-specialist.md) -- Designs adapter interfaces for audio format handling and transcription model integration
- [Alert Management Specialist](@/agents/alert-management-specialist.md) -- Configures alerting for audio processing pipeline failures and quality degradation in transcription accuracy
- [Architecture Review Specialist](@/agents/architecture-review-specialist.md) -- Reviews the three-stage audio processing architecture for OTP compliance and supervision tree correctness
- [Intelligence Synthesis](@/capabilities/intelligence-synthesis.md) -- Combines audio transcription output with multi-source intelligence for comprehensive entity analysis
- [Telemetry Integration](@/capabilities/telemetry-integration.md) -- Tracks transcription latency, queue depth, and processing accuracy metrics across the audio pipeline
- [Quality Gates](@/capabilities/quality-gates.md) -- Validates transcription accuracy against annotated ground truth and enforces pipeline reliability standards

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)