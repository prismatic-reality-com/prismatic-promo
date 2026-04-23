#!/usr/bin/env python3
"""
Add clickable capability links to all agent markdown files.

Transforms plain-text capability bullet points into Zola @/ linked versions
pointing to the corresponding capability pages.

Capability pages:
  - /capabilities/cross-domain-flexibility.md
  - /capabilities/intelligence-synthesis.md
  - /capabilities/multi-paradigm-solving.md
  - /capabilities/autonomous-self-healing.md
  - /capabilities/telemetry-integration.md
"""

import os
import re
import sys
from pathlib import Path

AGENTS_DIR = Path('/private/tmp/prismatic-promo/content/agents')

# Track statistics
stats = {
    'files_processed': 0,
    'files_modified': 0,
    'files_skipped_no_capabilities': 0,
    'files_skipped_already_linked': 0,
    'files_skipped_non_standard': 0,
    'bullets_linked': 0,
    'errors': [],
}


def transform_capability_line(line):
    """
    Transform a single capability bullet point line into its linked version.
    Returns (transformed_line, was_changed).
    """

    # Already has a link -- skip
    if '(@/' in line or '](/' in line:
        return line, False

    # === PATTERN 1: Cross-domain operational flexibility ===
    if 'Cross-domain operational flexibility' in line:
        new = line.replace(
            'Cross-domain operational flexibility',
            '[**Cross-domain operational flexibility**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # === PATTERN 2: Platform-wide coordination and intelligence synthesis ===
    if 'Platform-wide coordination and intelligence synthesis' in line:
        new = line.replace(
            'Platform-wide coordination and intelligence synthesis',
            '[**Platform-wide coordination and intelligence synthesis**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # === PATTERN 3: Multi-paradigm problem solving ===
    if 'Multi-paradigm problem solving' in line:
        new = line.replace(
            'Multi-paradigm problem solving',
            '[**Multi-paradigm problem solving**](@/capabilities/multi-paradigm-solving.md)'
        )
        return new, True

    # === PATTERN 4: Autonomous operation within the ... domain (with self-healing) ===
    # Matches: "Autonomous operation within the X domain with self-healing capabilities"
    # Also: "Autonomous operation within the X domain" (without self-healing)
    m = re.match(
        r'^(- )Autonomous operation within the (.+?) domain( with self-healing capabilities)?$',
        line
    )
    if m:
        prefix = m.group(1)
        domain = m.group(2)
        has_self_healing = m.group(3) is not None
        if has_self_healing:
            new = f'{prefix}[**Autonomous operation**](@/capabilities/autonomous-self-healing.md) within the {domain} domain with self-healing capabilities'
        else:
            new = f'{prefix}[**Autonomous operation**](@/capabilities/autonomous-self-healing.md) within the {domain} domain'
        return new, True

    # === PATTERN 5a: Integration with platform-wide telemetry, monitoring, and event tracking ===
    if 'Integration with platform-wide telemetry, monitoring, and event tracking' in line:
        new = line.replace(
            'Integration with platform-wide telemetry, monitoring, and event tracking',
            '[**Integration with platform-wide telemetry**](@/capabilities/telemetry-integration.md), monitoring, and event tracking'
        )
        return new, True

    # === PATTERN 5b: Integration with platform-wide telemetry and monitoring ===
    if 'Integration with platform-wide telemetry and monitoring' in line:
        new = line.replace(
            'Integration with platform-wide telemetry and monitoring',
            '[**Integration with platform-wide telemetry**](@/capabilities/telemetry-integration.md) and monitoring'
        )
        return new, True

    # === PATTERN 6: AIAD-compliant agent specification ===
    if 'AIAD-compliant agent specification' in line:
        new = line.replace(
            'AIAD-compliant agent specification',
            '[**AIAD-compliant agent specification**](@/capabilities/aiad-standard.md)'
        )
        return new, True

    # === PATTERN 7: NM/ND doctrine enforcement ===
    # Covers both:
    #   "NM/ND doctrine enforcement for quality assurance"
    #   "NM/ND (No Mercy, No Doubts) doctrine enforcement for quality assurance"
    if 'NM/ND' in line and 'doctrine enforcement' in line:
        # Match the full phrase including optional parenthetical
        m2 = re.search(r'NM/ND( \(No Mercy, No Doubts\))? doctrine enforcement', line)
        if m2:
            matched_text = m2.group(0)
            new = line.replace(
                matched_text,
                f'[**{matched_text}**](@/capabilities/no-mercy.md)'
            )
            return new, True

    # === Domain-specific patterns that should still get some linking ===

    # Cross-system data synchronization
    if 'Cross-system data synchronization' in line:
        new = line.replace(
            'Cross-system data synchronization',
            '[**Cross-system data synchronization**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Adapter pattern implementation
    if 'Adapter pattern implementation' in line:
        new = line.replace(
            'Adapter pattern implementation',
            '[**Adapter pattern implementation**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Event-driven architecture design
    if 'Event-driven architecture design' in line:
        new = line.replace(
            'Event-driven architecture design',
            '[**Event-driven architecture design**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # System health monitoring
    if 'System health monitoring' in line:
        new = line.replace(
            'System health monitoring',
            '[**System health monitoring**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Resource optimization and capacity planning
    if 'Resource optimization and capacity planning' in line:
        new = line.replace(
            'Resource optimization and capacity planning',
            '[**Resource optimization and capacity planning**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Disaster recovery planning
    if 'Disaster recovery planning' in line:
        new = line.replace(
            'Disaster recovery planning',
            '[**Disaster recovery planning**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # High-priority task execution
    if 'High-priority task execution' in line:
        new = line.replace(
            'High-priority task execution',
            '[**High-priority task execution**](@/capabilities/no-mercy.md)'
        )
        return new, True

    # Cross-agent coordination
    if 'Cross-agent coordination' in line:
        new = line.replace(
            'Cross-agent coordination',
            '[**Cross-agent coordination**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Core platform functionality
    if 'Core platform functionality' in line:
        new = line.replace(
            'Core platform functionality',
            '[**Core platform functionality**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Static analysis enforcement
    if 'Static analysis enforcement' in line:
        new = line.replace(
            'Static analysis enforcement',
            '[**Static analysis enforcement**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Regression prevention
    if 'Regression prevention' in line:
        new = line.replace(
            'Regression prevention',
            '[**Regression prevention**](@/capabilities/regression-tests.md)'
        )
        return new, True

    # Pattern-based quality evolution
    if 'Pattern-based quality evolution' in line:
        new = line.replace(
            'Pattern-based quality evolution',
            '[**Pattern-based quality evolution**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # OSINT data collection
    if 'OSINT data collection' in line:
        new = line.replace(
            'OSINT data collection',
            '[**OSINT data collection**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Multi-source intelligence correlation
    if 'Multi-source intelligence correlation' in line:
        new = line.replace(
            'Multi-source intelligence correlation',
            '[**Multi-source intelligence correlation**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Evidence-grade reporting
    if 'Evidence-grade reporting' in line:
        new = line.replace(
            'Evidence-grade reporting',
            '[**Evidence-grade reporting**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Specialized tooling and methodology
    if 'Specialized tooling and methodology' in line:
        new = line.replace(
            'Specialized tooling and methodology',
            '[**Specialized tooling and methodology**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Domain-specific expertise
    if 'Domain-specific expertise' in line:
        new = line.replace(
            'Domain-specific expertise',
            '[**Domain-specific expertise**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Contextual analysis and decision support
    if 'Contextual analysis and decision support' in line:
        new = line.replace(
            'Contextual analysis and decision support',
            '[**Contextual analysis and decision support**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Safe refactoring
    if 'Safe refactoring' in line:
        new = line.replace(
            'Safe refactoring',
            '[**Safe refactoring**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Production-ready code generation
    if 'Production-ready code generation' in line:
        new = line.replace(
            'Production-ready code generation',
            '[**Production-ready code generation**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Comprehensive test suite generation
    if 'Comprehensive test suite generation' in line:
        new = line.replace(
            'Comprehensive test suite generation',
            '[**Comprehensive test suite generation**](@/capabilities/regression-tests.md)'
        )
        return new, True

    # Self-evolving capability
    if 'Self-evolving capability' in line:
        new = line.replace(
            'Self-evolving capability',
            '[**Self-evolving capability**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Platform-wide strategic oversight
    if 'Platform-wide strategic oversight' in line:
        new = line.replace(
            'Platform-wide strategic oversight',
            '[**Platform-wide strategic oversight**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Autonomous healing and evolution
    if 'Autonomous healing and evolution' in line:
        new = line.replace(
            'Autonomous healing and evolution',
            '[**Autonomous healing and evolution**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Technology stack evaluation
    if 'Technology stack evaluation' in line:
        new = line.replace(
            'Technology stack evaluation',
            '[**Technology stack evaluation**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # System design review
    if 'System design review' in line:
        new = line.replace(
            'System design review',
            '[**System design review**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Survival fitness evaluation
    if 'Survival fitness evaluation' in line:
        new = line.replace(
            'Survival fitness evaluation',
            '[**Survival fitness evaluation**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Strategic intelligence synthesis
    if 'Strategic intelligence synthesis' in line:
        new = line.replace(
            'Strategic intelligence synthesis',
            '[**Strategic intelligence synthesis**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Resource allocation optimization
    if 'Resource allocation optimization' in line:
        new = line.replace(
            'Resource allocation optimization',
            '[**Resource allocation optimization**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Prompt engineering
    if 'Prompt engineering' in line:
        new = line.replace(
            'Prompt engineering',
            '[**Prompt engineering**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Pattern library integration
    if 'Pattern library integration' in line:
        new = line.replace(
            'Pattern library integration',
            '[**Pattern library integration**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Multi-provider LLM routing
    if 'Multi-provider LLM routing' in line:
        new = line.replace(
            'Multi-provider LLM routing',
            '[**Multi-provider LLM routing**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Long-term planning
    if 'Long-term planning' in line:
        new = line.replace(
            'Long-term planning',
            '[**Long-term planning**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Evolutionary pressure coordination
    if 'Evolutionary pressure coordination' in line:
        new = line.replace(
            'Evolutionary pressure coordination',
            '[**Evolutionary pressure coordination**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Context window optimization
    if 'Context window optimization' in line:
        new = line.replace(
            'Context window optimization',
            '[**Context window optimization**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Apex-level operational authority
    if 'Apex-level operational authority' in line:
        new = line.replace(
            'Apex-level operational authority',
            '[**Apex-level operational authority**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Technical debt elimination
    if 'Technical debt elimination' in line:
        new = line.replace(
            'Technical debt elimination',
            '[**Technical debt elimination**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # System deduplication
    if 'System deduplication' in line:
        new = line.replace(
            'System deduplication',
            '[**System deduplication**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Supreme tactical authority
    if 'Supreme tactical authority' in line:
        new = line.replace(
            'Supreme tactical authority',
            '[**Supreme tactical authority**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Specification gap detection
    if 'Specification gap detection' in line:
        new = line.replace(
            'Specification gap detection',
            '[**Specification gap detection**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Safety-critical boundary enforcement
    if 'Safety-critical boundary enforcement' in line:
        new = line.replace(
            'Safety-critical boundary enforcement',
            '[**Safety-critical boundary enforcement**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Risk assessment with quantitative modeling
    if 'Risk assessment with quantitative modeling' in line:
        new = line.replace(
            'Risk assessment with quantitative modeling',
            '[**Risk assessment with quantitative modeling**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Regulatory compliance monitoring
    if 'Regulatory compliance monitoring' in line:
        new = line.replace(
            'Regulatory compliance monitoring',
            '[**Regulatory compliance monitoring**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Mycelial network integration
    if 'Mycelial network integration' in line:
        new = line.replace(
            'Mycelial network integration',
            '[**Mycelial network integration**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Multi-paradigm reasoning
    if 'Multi-paradigm reasoning' in line:
        new = line.replace(
            'Multi-paradigm reasoning',
            '[**Multi-paradigm reasoning**](@/capabilities/multi-paradigm-solving.md)'
        )
        return new, True

    # Genetic algorithm-based pattern optimization
    if 'Genetic algorithm-based pattern optimization' in line:
        new = line.replace(
            'Genetic algorithm-based pattern optimization',
            '[**Genetic algorithm-based pattern optimization**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Fitness evaluation
    if 'Fitness evaluation' in line:
        new = line.replace(
            'Fitness evaluation',
            '[**Fitness evaluation**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Financial forensics
    if 'Financial forensics' in line:
        new = line.replace(
            'Financial forensics',
            '[**Financial forensics**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Cross-module pattern extraction
    if 'Cross-module pattern extraction' in line:
        new = line.replace(
            'Cross-module pattern extraction',
            '[**Cross-module pattern extraction**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Cross-domain mission coordination
    if 'Cross-domain mission coordination' in line:
        new = line.replace(
            'Cross-domain mission coordination',
            '[**Cross-domain mission coordination**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Crisis intervention
    if 'Crisis intervention' in line:
        new = line.replace(
            'Crisis intervention',
            '[**Crisis intervention**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Confidence propagation
    if 'Confidence propagation' in line:
        new = line.replace(
            'Confidence propagation',
            '[**Confidence propagation**](@/capabilities/nabla-axioms.md)'
        )
        return new, True

    # Ambiguity identification
    if 'Ambiguity identification' in line:
        new = line.replace(
            'Ambiguity identification',
            '[**Ambiguity identification**](@/capabilities/nabla-axioms.md)'
        )
        return new, True

    # Vulnerability assessment
    if 'Vulnerability assessment' in line:
        new = line.replace(
            'Vulnerability assessment',
            '[**Vulnerability assessment**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Self-improving capability
    if 'Self-improving capability' in line:
        new = line.replace(
            'Self-improving capability',
            '[**Self-improving capability**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Real-time threat detection
    if 'Real-time threat detection' in line:
        new = line.replace(
            'Real-time threat detection',
            '[**Real-time threat detection**](@/capabilities/real-time-monitoring.md)'
        )
        return new, True

    # Platform-level evolutionary optimization
    if 'Platform-level evolutionary optimization' in line:
        new = line.replace(
            'Platform-level evolutionary optimization',
            '[**Platform-level evolutionary optimization**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Multi-registry data collection
    if 'Multi-registry data collection' in line:
        new = line.replace(
            'Multi-registry data collection',
            '[**Multi-registry data collection**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Multi-framework compliance assessment
    if 'Multi-framework compliance assessment' in line:
        new = line.replace(
            'Multi-framework compliance assessment',
            '[**Multi-framework compliance assessment**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Multi-agent coordination
    if 'Multi-agent coordination' in line:
        new = line.replace(
            'Multi-agent coordination',
            '[**Multi-agent coordination**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Intelligence report synthesis
    if 'Intelligence report synthesis' in line:
        new = line.replace(
            'Intelligence report synthesis',
            '[**Intelligence report synthesis**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Entity resolution
    if 'Entity resolution' in line:
        new = line.replace(
            'Entity resolution',
            '[**Entity resolution**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Employee and supplier screening
    if 'Employee and supplier screening' in line:
        new = line.replace(
            'Employee and supplier screening',
            '[**Employee and supplier screening**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Cross-ecosystem intelligence fusion
    if 'Cross-ecosystem intelligence fusion' in line:
        new = line.replace(
            'Cross-ecosystem intelligence fusion',
            '[**Cross-ecosystem intelligence fusion**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Cross-domain operation sequencing
    if 'Cross-domain operation sequencing' in line:
        new = line.replace(
            'Cross-domain operation sequencing',
            '[**Cross-domain operation sequencing**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Compliance framework validation
    if 'Compliance framework validation' in line:
        new = line.replace(
            'Compliance framework validation',
            '[**Compliance framework validation**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Workflow execution
    if 'Workflow execution' in line:
        new = line.replace(
            'Workflow execution',
            '[**Workflow execution**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Czech public registry integration
    if 'Czech public registry integration' in line:
        new = line.replace(
            'Czech public registry integration',
            '[**Czech public registry integration**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Cross-registry correlation
    if 'Cross-registry correlation' in line:
        new = line.replace(
            'Cross-registry correlation',
            '[**Cross-registry correlation**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Legal entity analysis
    if 'Legal entity analysis' in line:
        new = line.replace(
            'Legal entity analysis',
            '[**Legal entity analysis**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Automated documentation generation
    if 'Automated documentation generation' in line:
        new = line.replace(
            'Automated documentation generation',
            '[**Automated documentation generation**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Cross-reference validation
    if 'Cross-reference validation' in line:
        new = line.replace(
            'Cross-reference validation',
            '[**Cross-reference validation**](@/capabilities/quality-gates.md)'
        )
        return new, True

    # Benchmark execution
    if 'Benchmark execution' in line:
        new = line.replace(
            'Benchmark execution',
            '[**Benchmark execution**](@/capabilities/telemetry-integration.md)'
        )
        return new, True

    # Latency profiling
    if 'Latency profiling' in line:
        new = line.replace(
            'Latency profiling',
            '[**Latency profiling**](@/capabilities/telemetry-integration.md)'
        )
        return new, True

    # Financial intelligence gathering
    if 'Financial intelligence gathering' in line:
        new = line.replace(
            'Financial intelligence gathering',
            '[**Financial intelligence gathering**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Competitive landscape assessment
    if 'Competitive landscape assessment' in line:
        new = line.replace(
            'Competitive landscape assessment',
            '[**Competitive landscape assessment**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Revenue optimization
    if 'Revenue optimization' in line:
        new = line.replace(
            'Revenue optimization',
            '[**Revenue optimization**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Resource utilization analysis
    if 'Resource utilization analysis' in line:
        new = line.replace(
            'Resource utilization analysis',
            '[**Resource utilization analysis**](@/capabilities/telemetry-integration.md)'
        )
        return new, True

    # Real-time tactical assessment
    if 'Real-time tactical assessment' in line:
        new = line.replace(
            'Real-time tactical assessment',
            '[**Real-time tactical assessment**](@/capabilities/real-time-monitoring.md)'
        )
        return new, True

    # Real-time progress monitoring
    if 'Real-time progress monitoring' in line:
        new = line.replace(
            'Real-time progress monitoring',
            '[**Real-time progress monitoring**](@/capabilities/real-time-monitoring.md)'
        )
        return new, True

    # Precision-targeted operations
    if 'Precision-targeted operations' in line:
        new = line.replace(
            'Precision-targeted operations',
            '[**Precision-targeted operations**](@/capabilities/cross-domain-flexibility.md)'
        )
        return new, True

    # Multi-level compression
    if 'Multi-level compression' in line:
        new = line.replace(
            'Multi-level compression',
            '[**Multi-level compression**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Mission-critical task execution
    if 'Mission-critical task execution' in line:
        new = line.replace(
            'Mission-critical task execution',
            '[**Mission-critical task execution**](@/capabilities/no-mercy.md)'
        )
        return new, True

    # Dynamic resource allocation
    if 'Dynamic resource allocation' in line:
        new = line.replace(
            'Dynamic resource allocation',
            '[**Dynamic resource allocation**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Automatic escalation
    if 'Automatic escalation' in line:
        new = line.replace(
            'Automatic escalation',
            '[**Automatic escalation**](@/capabilities/autonomous-self-healing.md)'
        )
        return new, True

    # Spawn and coordinate
    if 'Spawn and coordinate' in line:
        new = line.replace(
            'Spawn and coordinate',
            '[**Spawn and coordinate**](@/capabilities/intelligence-synthesis.md)'
        )
        return new, True

    # Automated audit preparation
    if 'Automated audit preparation' in line:
        new = line.replace(
            'Automated audit preparation',
            '[**Automated audit preparation**](@/capabilities/quality-gates.md)'
        )
        return new, True

    return line, False


def process_file(filepath):
    """Process a single agent markdown file."""
    stats['files_processed'] += 1

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip _index.md
    if filepath.name == '_index.md':
        stats['files_skipped_non_standard'] += 1
        return

    # Check if file has a ## Capabilities section
    if '## Capabilities' not in content and '## Key Capabilities' not in content:
        stats['files_skipped_no_capabilities'] += 1
        return

    lines = content.split('\n')
    new_lines = []
    in_capabilities = False
    any_changed = False
    already_fully_linked = True
    bullets_in_section = 0

    for i, line in enumerate(lines):
        # Detect start of Capabilities section
        if line.strip() == '## Capabilities':
            in_capabilities = True
            new_lines.append(line)
            continue

        # Detect end of Capabilities section (next ## heading or end of bullets)
        if in_capabilities and line.startswith('## ') and line.strip() != '## Capabilities':
            in_capabilities = False

        # Process bullet points in the Capabilities section
        if in_capabilities and line.startswith('- '):
            bullets_in_section += 1
            transformed, changed = transform_capability_line(line)
            if changed:
                any_changed = True
                stats['bullets_linked'] += 1
            if '(@/' not in transformed and '](/' not in transformed:
                already_fully_linked = False
            new_lines.append(transformed)
            continue

        new_lines.append(line)

    if already_fully_linked and bullets_in_section > 0 and not any_changed:
        stats['files_skipped_already_linked'] += 1
        return

    if any_changed:
        new_content = '\n'.join(new_lines)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        stats['files_modified'] += 1


def main():
    if not AGENTS_DIR.exists():
        print(f'ERROR: Directory not found: {AGENTS_DIR}')
        sys.exit(1)

    md_files = sorted(AGENTS_DIR.glob('*.md'))
    print(f'Found {len(md_files)} markdown files in {AGENTS_DIR}')
    print()

    for filepath in md_files:
        try:
            process_file(filepath)
        except Exception as e:
            stats['errors'].append(f'{filepath.name}: {e}')
            print(f'ERROR processing {filepath.name}: {e}')

    print('=== RESULTS ===')
    print(f'Files processed:              {stats["files_processed"]}')
    print(f'Files modified:               {stats["files_modified"]}')
    print(f'Files skipped (no caps):      {stats["files_skipped_no_capabilities"]}')
    print(f'Files skipped (already done):  {stats["files_skipped_already_linked"]}')
    print(f'Files skipped (non-standard):  {stats["files_skipped_non_standard"]}')
    print(f'Total bullets linked:          {stats["bullets_linked"]}')
    print(f'Errors:                        {len(stats["errors"])}')

    if stats['errors']:
        print('\nErrors:')
        for e in stats['errors']:
            print(f'  - {e}')

    # Verify: count remaining unlinked bullets
    print('\n=== VERIFICATION ===')
    remaining = 0
    for filepath in md_files:
        if filepath.name == '_index.md':
            continue
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        lines = content.split('\n')
        in_caps = False
        for line in lines:
            if line.strip() == '## Capabilities':
                in_caps = True
                continue
            if in_caps and line.startswith('## '):
                in_caps = False
            if in_caps and line.startswith('- ') and '(@/' not in line and '](/' not in line:
                remaining += 1
    print(f'Remaining unlinked bullets in ## Capabilities sections: {remaining}')


if __name__ == '__main__':
    main()
