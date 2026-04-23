+++
title = "UI Components Library"
description = "Production-ready React, Vue, and Web Components for building intelligence dashboards. Pre-built components for security ratings, OSINT data visualization, and risk assessment."
weight = 30
sort_by = "weight"
template = "developers-section.html"

[extra]
author = "Tomáš Korcak (korczis)"
reading_time = "18 min"
word_count = 3000
difficulty = "intermediate"
image = "/images/ui-components-showcase.png"
image_alt = "Prismatic UI Components - Intelligence Dashboard Building Blocks"
og_type = "article"
twitter_card = "summary_large_image"
academic_tier = "technical_reference"
content_version = "1.0.0"
date_created = "2026-02-21"
last_enhanced = "2026-02-21"
quality_score = 80
tech_stack = ["React", "Vue.js", "Svelte", "Web Components", "TypeScript", "TailwindCSS"]
frameworks_supported = ["react", "vue", "svelte", "angular", "vanilla"]
component_categories = ["security_ratings", "osint_grids", "risk_charts", "network_graphs"]
library_version = "0.6.0"
license = "MIT"
repository = "https://github.com/prismatic-platform/prismatic-ui-components"
npm_packages = ["@prismatic-platform/ui-components-react", "@prismatic-platform/ui-components-vue", "@prismatic-platform/ui-components-web"]
storybook_url = "https://components.prismatic-platform.org"
target_audience = ["frontend_developers", "ui_designers", "full_stack_developers"]
learning_objectives = ["component integration", "theme customization", "data binding", "event handling"]
see_also = ["sdk", "plugins", "api"]
date_modified = "2026-02-23"
keywords = ["Components", "Library", "Production-ready", "React", "Pre-built", "OSINT", "developers", "Prismatic Platform", "Web Components", "Integration"]
tags = ["developers", "ui-components-library", "prismatic"]
+++

# Prismatic UI Components Library

## Pre-Built Intelligence Dashboard Components

The Prismatic UI Components Library provides production-ready, framework-agnostic components for building sophisticated intelligence dashboards. With support for React, Vue.js, Svelte, and Web Components, you can rapidly prototype and deploy professional-grade interfaces for security analysis, OSINT visualization, and risk assessment.

### Why Use Prismatic UI Components?

- **🚀 Rapid Development**: Go from concept to production dashboard in hours, not weeks
- **🎨 Professional Design**: Battle-tested UX patterns from security industry leaders
- **⚡ High Performance**: Optimized for large datasets with virtualization and lazy loading
- **🌐 Framework Agnostic**: Use with any JavaScript framework or vanilla HTML
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts
- **♿ Accessibility**: WCAG 2.1 AA compliance with screen reader support

---

## Component Categories

### Security Rating Components

**SecurityRatingCard**, **RiskMeter**, **ComplianceScorecard**

Display security assessments with visual grade indicators, drill-down capabilities, and contextual information.

### OSINT Data Components

**IntelligenceGrid**, **ThreatFeedList**, **DomainAnalysisPanel**

Present intelligence data in sortable, filterable tables and panels with export functionality.

### Risk Visualization Components

**RiskHeatmap**, **ThreatTimeline**, **VulnerabilityChart**

Interactive charts and graphs for risk analysis, trend visualization, and comparative assessments.

### Network Analysis Components

**EntityGraph**, **RelationshipMap**, **AttackPathVisualizer**

D3.js-powered network visualizations for entity relationships and attack surface mapping.

---

## 🎯 Interactive Component Demonstrations

Experience our components in action! These fully functional demos showcase real capabilities with working interactions, data visualization, and responsive design.

<div class="component-demo-grid">
  <div id="security-rating-demo" class="fade-in"></div>
  <div id="intelligence-grid-demo" class="fade-in"></div>
  <div id="risk-heatmap-demo" class="fade-in"></div>
  <div id="network-graph-demo" class="fade-in"></div>
</div>

### 🛠️ Framework Integration Showcase

Switch between React, Vue.js, and Web Components implementations to see how each framework integrates with Prismatic components:

<div id="component-showcase" class="mt-8"></div>

---

## Quick Start

### React Installation

```bash
npm install @prismatic-platform/ui-components-react
# Peer dependencies
npm install react react-dom @types/react
```

### Vue.js Installation

```bash
npm install @prismatic-platform/ui-components-vue
# Peer dependencies
npm install vue @vue/composition-api
```

### Web Components

```bash
npm install @prismatic-platform/ui-components-web
```

```html
<!-- CDN for quick prototyping -->
<script type="module" src="https://cdn.prismatic-platform.org/ui-components/0.6.0/web-components.js"></script>
```

---

## React Components

### Security Rating Display

```jsx
import { SecurityRatingCard, RiskFactorList } from '@prismatic-platform/ui-components-react';

function SecurityDashboard({ domain }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        const data = await prismaticSDK.perimeter.getSecurityRating(domain);
        setAnalysis(data);
      } catch (error) {
        console.error('Failed to load security rating:', error);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [domain]);

  return (
    <div className="security-dashboard">
      <SecurityRatingCard
        rating={analysis?.security_rating}
        loading={loading}
        showDetails={true}
        onDrillDown={(factor) => {
          console.log('Investigate factor:', factor);
          // Navigate to detailed view
        }}
        theme="dark"
        size="large"
      />

      <RiskFactorList
        factors={analysis?.risk_factors}
        groupBy="severity"
        sortBy="impact"
        interactive={true}
        onFactorClick={(factor) => {
          // Show detailed factor analysis
        }}
      />
    </div>
  );
}
```

### OSINT Intelligence Grid

```jsx
import { IntelligenceGrid, ExportButton } from '@prismatic-platform/ui-components-react';

function OSINTDashboard() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});

  const columns = [
    {
      key: 'indicator',
      title: 'Indicator',
      sortable: true,
      filterable: true,
      render: (value, row) => (
        <span className={`indicator indicator-${row.type}`}>
          {value}
        </span>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: ['domain', 'ip', 'hash', 'email']
    },
    {
      key: 'threat_score',
      title: 'Threat Score',
      sortable: true,
      render: (score) => (
        <ThreatScoreBadge score={score} />
      )
    },
    {
      key: 'first_seen',
      title: 'First Seen',
      sortable: true,
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      key: 'confidence',
      title: 'Confidence',
      sortable: true,
      render: (confidence) => (
        <ConfidenceBar value={confidence} />
      )
    }
  ];

  return (
    <div className="osint-dashboard">
      <div className="dashboard-header">
        <h2>Intelligence Feed</h2>
        <ExportButton
          data={data}
          filename="intelligence-feed"
          formats={['csv', 'json', 'xlsx']}
        />
      </div>

      <IntelligenceGrid
        data={data}
        columns={columns}
        loading={loading}
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} indicators`
        }}
        filters={filters}
        onFiltersChange={setFilters}
        onRowClick={(row) => {
          // Navigate to detailed indicator view
        }}
        virtualScrolling={true}
        stickyHeader={true}
      />
    </div>
  );
}
```

### Risk Visualization Charts

```jsx
import {
  RiskHeatmap,
  ThreatTimeline,
  VulnerabilityDistribution
} from '@prismatic-platform/ui-components-react';

function RiskAnalyticsDashboard({ organizationId }) {
  return (
    <div className="risk-analytics">
      {/* Risk heatmap by asset category */}
      <RiskHeatmap
        data={riskData}
        xAxis="asset_category"
        yAxis="risk_category"
        colorBy="severity"
        interactive={true}
        onCellClick={(cell) => {
          // Drill down into specific risk area
        }}
        tooltip={(cell) => (
          <div>
            <strong>{cell.asset_category}</strong>
            <br />
            Risk: {cell.risk_category}
            <br />
            Severity: {cell.severity}
          </div>
        )}
      />

      {/* Threat activity timeline */}
      <ThreatTimeline
        data={threatEvents}
        timeRange="30d"
        groupBy="threat_type"
        showEvents={true}
        onEventClick={(event) => {
          // Show event details
        }}
        brush={true}
        zoom={true}
      />

      {/* Vulnerability distribution */}
      <VulnerabilityDistribution
        data={vulnerabilities}
        groupBy="severity"
        chartType="donut"
        showLabels={true}
        interactive={true}
        onSegmentClick={(segment) => {
          // Filter vulnerabilities by severity
        }}
      />
    </div>
  );
}
```

---

## Vue.js Components

### Composition API Integration

```vue
<!-- SecurityAnalysis.vue -->
<template>
  <div class="security-analysis">
    <PrismaticSecurityRating
      :rating="securityRating"
      :loading="loading"
      :show-details="true"
      @drill-down="handleDrillDown"
    />

    <PrismaticThreatFeed
      :threats="threats"
      :auto-refresh="true"
      :refresh-interval="30000"
      @threat-click="handleThreatClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import {
  PrismaticSecurityRating,
  PrismaticThreatFeed
} from '@prismatic-platform/ui-components-vue';

interface Props {
  domain: string;
}

const props = defineProps<Props>();

const loading = ref(true);
const securityRating = ref(null);
const threats = ref([]);

const loadSecurityData = async () => {
  try {
    loading.value = true;
    const [ratingData, threatData] = await Promise.all([
      prismaticSDK.perimeter.getSecurityRating(props.domain),
      prismaticSDK.threat.getRecentThreats(props.domain)
    ]);

    securityRating.value = ratingData;
    threats.value = threatData;
  } catch (error) {
    console.error('Failed to load security data:', error);
  } finally {
    loading.value = false;
  }
};

const handleDrillDown = (factor: RiskFactor) => {
  // Navigate to detailed factor analysis
  router.push({
    name: 'risk-factor-detail',
    params: { factorId: factor.id }
  });
};

const handleThreatClick = (threat: ThreatIndicator) => {
  // Show threat details modal
  showThreatModal.value = threat;
};

onMounted(() => {
  loadSecurityData();
});
</script>
```

### Options API Integration

```vue
<template>
  <div class="osint-workbench">
    <PrismaticSearchBar
      v-model="searchQuery"
      :suggestions="searchSuggestions"
      :loading="searching"
      @search="handleSearch"
      placeholder="Search domains, IPs, or indicators..."
    />

    <PrismaticResultsPanel
      :results="searchResults"
      :pagination="pagination"
      @page-change="handlePageChange"
      @export="handleExport"
    />
  </div>
</template>

<script>
import {
  PrismaticSearchBar,
  PrismaticResultsPanel
} from '@prismatic-platform/ui-components-vue';

export default {
  name: 'OSINTWorkbench',
  components: {
    PrismaticSearchBar,
    PrismaticResultsPanel
  },
  data() {
    return {
      searchQuery: '',
      searching: false,
      searchResults: [],
      searchSuggestions: [],
      pagination: {
        current: 1,
        pageSize: 25,
        total: 0
      }
    };
  },
  methods: {
    async handleSearch(query) {
      try {
        this.searching = true;
        const results = await this.$prismatic.osint.search(query);

        this.searchResults = results.data;
        this.pagination.total = results.total;
        this.pagination.current = 1;
      } catch (error) {
        this.$toast.error('Search failed: ' + error.message);
      } finally {
        this.searching = false;
      }
    },

    handlePageChange(page) {
      this.pagination.current = page;
      this.loadPage(page);
    },

    async handleExport(format) {
      const exported = await this.$prismatic.export.results(
        this.searchResults,
        format
      );

      // Trigger download
      this.downloadFile(exported.data, exported.filename);
    }
  }
};
</script>
```

---

## Web Components

### Framework-Agnostic Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Intelligence Dashboard</title>
  <script type="module" src="https://cdn.prismatic-platform.org/ui-components/0.6.0/web-components.js"></script>
  <link rel="stylesheet" href="https://cdn.prismatic-platform.org/ui-components/0.6.0/themes/dark.css">
</head>
<body>
  <!-- Security rating component -->
  <prismatic-security-rating
    domain="example.com"
    show-details="true"
    theme="dark"
    size="large">
  </prismatic-security-rating>

  <!-- OSINT intelligence grid -->
  <prismatic-intelligence-grid
    api-endpoint="/api/intelligence"
    auto-refresh="30000"
    page-size="50"
    export-enabled="true">
  </prismatic-intelligence-grid>

  <!-- Network graph visualization -->
  <prismatic-network-graph
    data-source="/api/network-graph"
    layout="force-directed"
    interactive="true"
    zoom-enabled="true">
  </prismatic-network-graph>

  <script>
    // Event listeners for component interactions
    document.querySelector('prismatic-security-rating')
      .addEventListener('drill-down', (event) => {
        console.log('Risk factor selected:', event.detail);
      });

    document.querySelector('prismatic-intelligence-grid')
      .addEventListener('row-click', (event) => {
        console.log('Indicator selected:', event.detail);
      });

    document.querySelector('prismatic-network-graph')
      .addEventListener('node-click', (event) => {
        console.log('Node selected:', event.detail);
      });
  </script>
</body>
</html>
```

### Vanilla JavaScript Integration

```javascript
// Initialize components programmatically
import {
  SecurityRatingCard,
  IntelligenceGrid,
  RiskHeatmap
} from '@prismatic-platform/ui-components-web';

// Security rating card
const ratingCard = new SecurityRatingCard({
  container: '#security-rating',
  domain: 'example.com',
  theme: 'dark',
  onDrillDown: (factor) => {
    console.log('Risk factor:', factor);
  }
});

// Intelligence data grid
const intelligenceGrid = new IntelligenceGrid({
  container: '#intelligence-grid',
  apiEndpoint: '/api/intelligence',
  columns: [
    { key: 'indicator', title: 'Indicator', sortable: true },
    { key: 'type', title: 'Type', filterable: true },
    { key: 'threat_score', title: 'Score', sortable: true }
  ],
  pagination: { pageSize: 50 },
  onRowClick: (row) => {
    window.location.href = `/indicator/${row.id}`;
  }
});

// Risk heatmap
const riskHeatmap = new RiskHeatmap({
  container: '#risk-heatmap',
  data: riskData,
  dimensions: { width: 800, height: 600 },
  colorScheme: 'red-gradient',
  onCellClick: (cell) => {
    showRiskDetails(cell);
  }
});

// Load and render components
Promise.all([
  ratingCard.render(),
  intelligenceGrid.render(),
  riskHeatmap.render()
]).then(() => {
  console.log('Dashboard loaded successfully');
});
```

---

## Theming & Customization

### Theme Configuration

```css
/* Custom theme variables */
:root {
  /* Brand colors */
  --prismatic-primary: #3b82f6;
  --prismatic-secondary: #10b981;
  --prismatic-danger: #ef4444;
  --prismatic-warning: #f59e0b;
  --prismatic-success: #22c55e;

  /* Background colors */
  --prismatic-bg-primary: #0f172a;
  --prismatic-bg-secondary: #1e293b;
  --prismatic-bg-card: #334155;

  /* Text colors */
  --prismatic-text-primary: #f8fafc;
  --prismatic-text-secondary: #cbd5e1;
  --prismatic-text-muted: #64748b;

  /* Border colors */
  --prismatic-border-light: #334155;
  --prismatic-border-medium: #475569;

  /* Component-specific variables */
  --prismatic-security-rating-a: #22c55e;
  --prismatic-security-rating-b: #84cc16;
  --prismatic-security-rating-c: #f59e0b;
  --prismatic-security-rating-d: #f97316;
  --prismatic-security-rating-f: #ef4444;
}
```

### Component Customization

```typescript
// React theme provider
import { PrismaticThemeProvider } from '@prismatic-platform/ui-components-react';

const customTheme = {
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  },
  fonts: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'monospace']
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem'
  }
};

function App() {
  return (
    <PrismaticThemeProvider theme={customTheme}>
      <SecurityDashboard />
      <OSINTWorkbench />
      <RiskAnalytics />
    </PrismaticThemeProvider>
  );
}
```

### CSS-in-JS Styling

```jsx
import styled from 'styled-components';
import { SecurityRatingCard } from '@prismatic-platform/ui-components-react';

const StyledSecurityRating = styled(SecurityRatingCard)`
  .security-grade {
    font-size: 2.5rem;
    font-weight: 800;
    text-shadow: 0 0 10px currentColor;
  }

  .risk-factor {
    padding: 0.75rem;
    border-radius: 0.5rem;
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &.severity-high {
      border-left: 4px solid #ef4444;
      background: linear-gradient(90deg, #fef2f2, transparent);
    }
  }

  .confidence-bar {
    background: linear-gradient(
      90deg,
      #10b981 0%,
      #f59e0b 70%,
      #ef4444 100%
    );
    height: 4px;
    border-radius: 2px;
  }
`;
```

---

## Advanced Features

### Data Virtualization

```jsx
import { VirtualizedGrid } from '@prismatic-platform/ui-components-react';

function LargeDatasetGrid() {
  // Handle millions of rows efficiently
  const rowRenderer = ({ index, style, data }) => (
    <div style={style} className="grid-row">
      <span>{data[index].indicator}</span>
      <span>{data[index].type}</span>
      <span>{data[index].threat_score}</span>
    </div>
  );

  return (
    <VirtualizedGrid
      data={massiveDataset} // 1M+ rows
      height={600}
      rowHeight={40}
      rowRenderer={rowRenderer}
      overscanRowCount={10}
      onScroll={({ scrollTop }) => {
        // Handle scroll events
      }}
    />
  );
}
```

### Real-time Updates

```jsx
import { useWebSocket } from '@prismatic-platform/ui-components-react/hooks';

function RealtimeThreatFeed() {
  const { data, connectionState, error } = useWebSocket(
    'wss://api.prismatic-platform.org/threats/stream',
    {
      onMessage: (threat) => {
        // Handle new threat data
        console.log('New threat:', threat);
      },
      reconnectOnError: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10
    }
  );

  return (
    <div className="threat-feed">
      <div className="connection-status">
        <ConnectionIndicator state={connectionState} />
      </div>

      <ThreatList
        threats={data}
        realTime={true}
        maxItems={100}
        autoScroll={true}
      />
    </div>
  );
}
```

### Interactive Network Graphs

```jsx
import { NetworkGraph } from '@prismatic-platform/ui-components-react';

function EntityRelationshipMap({ entityId }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <NetworkGraph
      data={graphData}
      width={1200}
      height={800}

      // Layout configuration
      layout={{
        type: 'force-directed',
        strength: -300,
        distance: 150,
        iterations: 300
      }}

      // Node styling
      nodeStyle={{
        radius: (d) => Math.sqrt(d.connections) * 2 + 5,
        color: (d) => d.risk_level === 'high' ? '#ef4444' : '#3b82f6',
        stroke: '#1e293b',
        strokeWidth: 2
      }}

      // Link styling
      linkStyle={{
        stroke: '#475569',
        strokeWidth: (d) => d.weight * 2,
        strokeOpacity: 0.6
      }}

      // Interactions
      onNodeClick={(node) => {
        setSelectedNode(node);
        // Load node details
      }}

      onNodeHover={(node) => {
        // Show tooltip
      }}

      // Features
      zoom={true}
      pan={true}
      cluster={true}
      search={true}
      export={['png', 'svg', 'json']}
    />
  );
}
```

---

## Performance Optimization

### Code Splitting

```jsx
import { lazy, Suspense } from 'react';
import { ComponentLoader } from '@prismatic-platform/ui-components-react';

// Lazy load heavy components
const NetworkGraph = lazy(() => import('./NetworkGraph'));
const RiskHeatmap = lazy(() => import('./RiskHeatmap'));

function Dashboard() {
  return (
    <div className="dashboard">
      <SecurityRatingCard />
      <IntelligenceGrid />

      <Suspense fallback={<ComponentLoader />}>
        <NetworkGraph />
        <RiskHeatmap />
      </Suspense>
    </div>
  );
}
```

### Memory Management

```jsx
import { useComponentCleanup } from '@prismatic-platform/ui-components-react/hooks';

function MemoryEfficientComponent({ data }) {
  // Automatic cleanup of event listeners and intervals
  useComponentCleanup();

  // Efficient data processing
  const processedData = useMemo(() => {
    return data.slice(0, 1000); // Limit data size
  }, [data]);

  // Debounced updates
  const debouncedUpdate = useDebounce(handleUpdate, 300);

  return (
    <IntelligenceGrid
      data={processedData}
      virtualScrolling={true}
      onDataChange={debouncedUpdate}
    />
  );
}
```

---

## Testing Components

### Unit Testing

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityRatingCard } from '@prismatic-platform/ui-components-react';

describe('SecurityRatingCard', () => {
  const mockRating = {
    grade: 'A',
    score: 850,
    factors: [
      { category: 'SSL', severity: 'low', description: 'Valid SSL certificate' }
    ]
  };

  it('displays security rating correctly', () => {
    render(<SecurityRatingCard rating={mockRating} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('850')).toBeInTheDocument();
  });

  it('handles drill-down interactions', () => {
    const onDrillDown = jest.fn();
    render(
      <SecurityRatingCard
        rating={mockRating}
        onDrillDown={onDrillDown}
        showDetails={true}
      />
    );

    fireEvent.click(screen.getByText('SSL'));
    expect(onDrillDown).toHaveBeenCalledWith(mockRating.factors[0]);
  });

  it('shows loading state', () => {
    render(<SecurityRatingCard loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Visual Regression Testing

```jsx
import { chromatic } from '@prismatic-platform/ui-components-react/testing';

// Storybook stories for visual testing
export default {
  title: 'Components/SecurityRatingCard',
  component: SecurityRatingCard,
  parameters: {
    chromatic: { viewports: [320, 1200] }
  }
};

export const GradeA = () => (
  <SecurityRatingCard
    rating={{ grade: 'A', score: 900, factors: [] }}
  />
);

export const GradeF = () => (
  <SecurityRatingCard
    rating={{ grade: 'F', score: 300, factors: riskFactors }}
    showDetails={true}
  />
);

export const LoadingState = () => (
  <SecurityRatingCard loading={true} />
);
```

---

## Component Documentation

### Interactive Storybook

Visit [**components.prismatic-platform.org**](https://components.prismatic-platform.org) for interactive component documentation with:

- Live component playground
- Props documentation and controls
- Code examples for all frameworks
- Accessibility testing tools
- Performance profiling
- Visual regression testing

### TypeScript Definitions

```typescript
// Component prop types
interface SecurityRatingCardProps {
  rating?: SecurityRating;
  loading?: boolean;
  showDetails?: boolean;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  onDrillDown?: (factor: RiskFactor) => void;
  onExport?: (format: ExportFormat) => void;
}

interface SecurityRating {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  score: number; // 300-900
  factors: RiskFactor[];
  confidence: number; // 0-1
  last_updated: string;
}

interface RiskFactor {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-100
  description: string;
  recommendation?: string;
}
```

---

## Migration Guide

### Upgrading from 0.5.x to 0.6.x

```jsx
// Old API (0.5.x)
<SecurityCard
  data={securityData}
  onClick={handleClick}
/>

// New API (0.6.x)
<SecurityRatingCard
  rating={securityData.rating}
  onDrillDown={handleClick}
  showDetails={true}
/>

// Migration helper
import { migrateSecurityCard } from '@prismatic-platform/ui-components-react/migrate';

const migratedProps = migrateSecurityCard({
  data: oldData,
  onClick: oldHandler
});
```

---

**Ready to build beautiful intelligence dashboards?**

[**Component Gallery →**](https://components.prismatic-platform.org)
[**React Quick Start →**](https://docs.prismatic-platform.org/ui-components/react)
[**Vue.js Integration →**](https://docs.prismatic-platform.org/ui-components/vue)