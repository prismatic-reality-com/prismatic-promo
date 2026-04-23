#!/usr/bin/env python3
"""
Agent Cross-Linking Enhancement Script
Creates comprehensive cross-links between related agents, commands, and platform components.
"""

import os
import re
import json
from pathlib import Path
from collections import defaultdict

def parse_agent_metadata(content):
    """Parse TOML frontmatter from agent markdown file."""
    metadata = {}
    in_frontmatter = False

    for line in content.split('\n'):
        if line.strip() == '+++':
            if not in_frontmatter:
                in_frontmatter = True
            else:
                break
            continue

        if in_frontmatter and '=' in line:
            key, value = line.split('=', 1)
            key = key.strip()
            value = value.strip().strip('"')
            metadata[key] = value

    return metadata

def get_agent_info():
    """Collect information about all agents."""
    agents_dir = Path('/private/tmp/prismatic-promo/content/agents')
    agents_info = {}

    for agent_file in agents_dir.glob('*.md'):
        if agent_file.name.startswith('_') or agent_file.name in ['strategic.md', 'osint.md', 'security.md', 'quality.md', 'development.md', 'ma-intelligence.md', 'integration.md']:
            continue

        with open(agent_file, 'r', encoding='utf-8') as f:
            content = f.read()

        metadata = parse_agent_metadata(content)

        if 'title' in metadata:
            agent_name = metadata['title']
            agents_info[agent_name] = {
                'file': agent_file,
                'domain': metadata.get('domain', 'general'),
                'level': metadata.get('level', 'L3'),
                'description': metadata.get('description', ''),
                'content': content
            }

    return agents_info

def find_related_agents(target_agent, agents_info):
    """Find related agents based on domain, level, and keywords."""
    related = {
        'same_domain': [],
        'same_level': [],
        'keyword_related': []
    }

    target_domain = agents_info[target_agent]['domain']
    target_level = agents_info[target_agent]['level']
    target_desc = agents_info[target_agent]['description'].lower()

    for agent_name, info in agents_info.items():
        if agent_name == target_agent:
            continue

        # Same domain agents
        if info['domain'] == target_domain:
            related['same_domain'].append(agent_name)

        # Same level agents
        if info['level'] == target_level:
            related['same_level'].append(agent_name)

        # Keyword related (basic heuristic)
        agent_desc = info['description'].lower()
        if any(keyword in agent_desc for keyword in ['coordinator', 'specialist', 'intelligence', 'osint'] if keyword in target_desc):
            related['keyword_related'].append(agent_name)

    return related

def generate_related_agents_section(agent_name, agents_info):
    """Generate Related Agents markdown section."""
    related = find_related_agents(agent_name, agents_info)

    section = "\n## Related Agents\n\n"

    # Same domain agents (top 5)
    if related['same_domain']:
        section += f"**{agents_info[agent_name]['domain'].title()} Domain Agents:**\n"
        for agent in related['same_domain'][:5]:
            level = agents_info[agent]['level']
            desc = agents_info[agent]['description'][:80] + "..." if len(agents_info[agent]['description']) > 80 else agents_info[agent]['description']
            section += f"- [**{agent}**](@/agents/{agent}.md) ({level}) - {desc}\n"
        section += "\n"

    # Same level agents (top 3)
    if related['same_level']:
        level_name = {
            'L1': 'Supreme Authority',
            'L2': 'Tactical Operations',
            'L3': 'Strategic Command',
            'L4': 'Domain Specialist',
            'L5': 'Operational'
        }.get(agents_info[agent_name]['level'], 'Unknown')

        section += f"**{level_name} ({agents_info[agent_name]['level']}) Agents:**\n"
        for agent in related['same_level'][:3]:
            if agent not in related['same_domain'][:5]:  # Avoid duplicates
                desc = agents_info[agent]['description'][:60] + "..." if len(agents_info[agent]['description']) > 60 else agents_info[agent]['description']
                section += f"- [**{agent}**](@/agents/{agent}.md) - {desc}\n"
        section += "\n"

    return section

def generate_platform_navigation():
    """Generate platform-wide navigation section."""
    return """
## Platform Navigation

### Core Systems
- [**Agent Registry**](@/_index.md) - Browse all 420+ autonomous agents
- [**Command Registry**](/commands/) - 210+ slash commands and operations
- [**OSINT Sources**](/osint/) - 121+ intelligence gathering tools
- [**Architecture**](/architecture/) - Platform design and patterns

### Related Sections
- [**Color Teams**](/teams/) - 6 adversarial-defensive security teams
- [**Technologies**](/technologies/) - Platform technology stack
- [**Applications**](/apps/) - 90+ platform applications
- [**Glossary**](/glossary/) - Technical terminology and concepts

"""

def enhance_agent_file(agent_name, agents_info):
    """Enhance a single agent file with better cross-linking."""
    agent_info = agents_info[agent_name]
    content = agent_info['content']

    # Check if already has comprehensive related agents section
    if "## Related Agents" in content and len(re.findall(r'\[.*?\]\(@/agents/.*?\.md\)', content)) >= 3:
        return False  # Already well-linked

    # Split content into parts
    parts = content.split('## Related Agents')
    main_content = parts[0].rstrip()

    # Generate new sections
    related_section = generate_related_agents_section(agent_name, agents_info)
    navigation_section = generate_platform_navigation()

    # Reconstruct content
    new_content = main_content + related_section + navigation_section

    # Write back to file
    with open(agent_info['file'], 'w', encoding='utf-8') as f:
        f.write(new_content)

    return True

def main():
    """Main enhancement process."""
    print("🔗 Agent Cross-Linking Enhancement System")
    print("=" * 50)

    # Get all agent information
    print("📊 Analyzing agent ecosystem...")
    agents_info = get_agent_info()
    print(f"✅ Found {len(agents_info)} agents")

    # Domain distribution
    domain_counts = defaultdict(int)
    level_counts = defaultdict(int)

    for agent, info in agents_info.items():
        domain_counts[info['domain']] += 1
        level_counts[info['level']] += 1

    print(f"\n📈 Domain Distribution:")
    for domain, count in sorted(domain_counts.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {domain}: {count} agents")

    print(f"\n🏆 Authority Level Distribution:")
    for level in ['L1', 'L2', 'L3', 'L4', 'L5']:
        print(f"  {level}: {level_counts.get(level, 0)} agents")

    # Enhance agent files
    print(f"\n🔧 Enhancing agent cross-links...")
    enhanced_count = 0

    for agent_name in sorted(agents_info.keys())[:20]:  # Start with first 20
        if enhance_agent_file(agent_name, agents_info):
            enhanced_count += 1
            print(f"  ✅ Enhanced {agent_name}")
        else:
            print(f"  ⏭️  Skipped {agent_name} (already well-linked)")

    print(f"\n🎉 Enhanced {enhanced_count} agent profiles")
    print("🔗 Cross-linking system ready for batch processing")

if __name__ == '__main__':
    main()