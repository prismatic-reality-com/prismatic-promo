+++
title = "Three.js"
weight = 24
[extra]
category = "frontend"
description = "JavaScript library for creating and displaying 3D graphics in the browser using WebGL"
url = "https://threejs.org"
version = "0.160+"
icon = "threejs"
color = "gray"
status = "active"
reading_time = "9 min"
author = "Tomas Korcak (korczis)"
word_count = 946
date_created = "2026-02-23"
date_modified = "2026-02-23"
keywords = ["Threejs", "JavaScript", "WebGL", "technologies", "frontend", "Prismatic Platform", "Three", "Hooks", "OrbitControls", "InstancedMesh"]
tags = ["technologies", "frontend", "threejs", "prismatic"]
quality_score = 80
see_also = ["apps", "glossary", "architecture"]
image = "/images/sections/technologies.png"
image_alt = "Three.js - Prismatic Platform"
+++

## Overview

Three.js is the 3D graphics library used in the Prismatic Platform for creating immersive visualizations of complex data relationships. It leverages WebGL to render hardware-accelerated 3D scenes directly in the browser, enabling the platform to display network topologies, agent interaction graphs, and attack surface maps in an intuitive three-dimensional space that reveals structural patterns invisible in traditional 2D charts.

The Prismatic Platform uses Three.js for its hero animations on the promotional site, 3D network topology views in the Perimeter EASM dashboard, and interactive agent constellation visualizations where each of the platform's 404 agents is represented as a node in a force-directed 3D graph. These 3D representations help users understand complex relationships between agents, data sources, and security entities that would be difficult to convey in traditional 2D charts or tables. A security analyst can rotate the attack surface graph to discover clusters of related assets, zoom into specific threat vectors, and click on individual nodes for detailed intelligence.

Three.js's scene graph architecture and extensive geometry, material, and lighting systems provide the flexibility needed to create both decorative visual elements (the animated particle background on the landing page) and functional data exploration interfaces (the rotatable, zoomable intelligence graph). The library integrates with [Phoenix LiveView](@/technologies/phoenix-liveview.md) through JavaScript hooks that manage the scene lifecycle and receive data updates from the server without full page reloads.

## Key Features

- **WebGL Rendering**: Hardware-accelerated 3D graphics in the browser with automatic fallback detection for unsupported devices
- **Scene Graph**: Hierarchical object management with cameras, lights, nested groups, and automatic matrix transformations
- **Geometries**: Built-in shapes (sphere, box, torus, plane) and custom `BufferGeometry` for efficient vertex-level data visualization
- **Materials**: PBR (physically based rendering) materials, custom GLSL shaders, and post-processing effects for polished visuals
- **Animation**: Keyframe animation system with mixer/clip architecture for smooth transitions and time-based interpolation
- **Controls**: `OrbitControls` for interactive camera rotation, zoom, and pan with damping for natural movement feel
- **Instanced Rendering**: `InstancedMesh` for rendering thousands of identical objects (agent nodes) with per-instance color and position without per-object draw calls
- **Raycasting**: GPU-accelerated object picking enabling users to click on 3D objects for detail views and context menus

## Platform Integration

Three.js powers the platform's 3D visualizations. Agent constellation views use force-directed layout to position nodes and render connecting edges with domain-based coloring.

```javascript
// Agent constellation visualization with force-directed layout
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0f);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Domain color mapping matching Tailwind color palette
const domainColors = {
    security: 0x3b82f6,      // blue-500
    intelligence: 0x8b5cf6,   // violet-500
    infrastructure: 0x22c55e, // green-500
    analysis: 0xeab308,       // yellow-500
    defense: 0xef4444         // red-500
};

// Create agent nodes using instanced mesh for performance
const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const instancedMesh = new THREE.InstancedMesh(
    nodeGeometry,
    new THREE.MeshPhongMaterial({ shininess: 80 }),
    agents.length
);

const matrix = new THREE.Matrix4();
const color = new THREE.Color();

agents.forEach((agent, i) => {
    matrix.setPosition(agent.x, agent.y, agent.z);
    instancedMesh.setMatrixAt(i, matrix);
    color.setHex(domainColors[agent.domain] || 0x6b7280);
    instancedMesh.setColorAt(i, color);
});
scene.add(instancedMesh);

// Render connection edges between related agents
const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x374151, transparent: true, opacity: 0.3
});
connections.forEach(([from, to]) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(from.x, from.y, from.z),
        new THREE.Vector3(to.x, to.y, to.z)
    ]);
    scene.add(new THREE.Line(geometry, edgeMaterial));
});
```

The promotional site uses a particle animation on the landing page that responds to mouse movement, creating an atmospheric background effect:

```javascript
// Particle background animation for the promotional site
function createParticleField(count) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;
        positions[i + 1] = (Math.random() - 0.5) * 100;
        positions[i + 2] = (Math.random() - 0.5) * 50;
        velocities[i] = (Math.random() - 0.5) * 0.02;
        velocities[i + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
        size: 0.15, color: 0x14b8a6, transparent: true, opacity: 0.6
    });

    return { mesh: new THREE.Points(geometry, material), velocities };
}
```

## Architecture

Three.js integrates with the platform's LiveView architecture through a hook-based lifecycle that ensures proper resource management.

| Component | Role | Platform Usage |
|-----------|------|----------------|
| **Scene** | Root container for all 3D objects | One scene per visualization widget |
| **Camera** | Viewport into the 3D world | PerspectiveCamera for interactive views |
| **Renderer** | WebGL context manager | One renderer per canvas element |
| **Controls** | User interaction handling | OrbitControls for rotation/zoom |
| **InstancedMesh** | Efficient multi-object rendering | Agent nodes (404+ instances) |
| **BufferGeometry** | Vertex data for custom shapes | Connection edges between agents |
| **Raycaster** | Object selection by mouse position | Click-to-select agent details |
| **Animation Loop** | requestAnimationFrame render cycle | 60fps continuous rendering |

For [Phoenix LiveView](@/technologies/phoenix-liveview.md) integration, Three.js scenes are managed through hooks that handle initialization, data updates, and cleanup:

```javascript
Hooks.AgentConstellation = {
    mounted() {
        this.initScene();
        this.handleEvent("agents_updated", ({agents}) => {
            this.updateNodes(agents);
        });
        this.handleEvent("connection_added", ({from, to}) => {
            this.addEdge(from, to);
        });
    },
    updated() {
        // Handle DOM changes that might affect canvas size
        this.resizeRenderer();
    },
    destroyed() {
        // Dispose all GPU resources to prevent WebGL memory leaks
        this.renderer.dispose();
        this.scene.traverse((obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        cancelAnimationFrame(this.animationId);
    }
};
```

## Performance Characteristics

Three.js rendering performance depends on the complexity of the scene and the capabilities of the client's GPU.

| Metric | Value | Context |
|--------|-------|---------|
| Target framerate | 60 FPS | Interactive visualizations |
| Agent nodes (instanced) | 404+ at 60 FPS | InstancedMesh with 16-segment spheres |
| Connection edges | 1,000+ at 60 FPS | LineBasicMaterial with transparency |
| Draw calls (constellation) | 2-5 | Instanced rendering minimizes draw calls |
| GPU memory | ~50MB | Full constellation with particle background |
| JS bundle size | ~600KB | Three.js + OrbitControls (minified) |
| Scene initialization | <500ms | Including geometry creation and material setup |
| Raycaster per frame | <1ms | Object picking on hover/click |

## Configuration

```html
<!-- Three.js loaded via CDN with OrbitControls -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js">
</script>
```

Canvas configuration for LiveView integration:

```html
<!-- LiveView template with Three.js canvas -->
<div id="constellation-container" phx-hook="AgentConstellation"
     class="w-full h-[600px] rounded-xl overflow-hidden bg-gray-950">
    <canvas id="constellation-canvas"></canvas>
</div>
```

Renderer initialization with optimal settings:

```javascript
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('constellation-canvas'),
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

## Best Practices

- **Use `InstancedMesh` for many similar objects** -- rendering 404 agent nodes individually would be far too slow; instanced rendering batches them into a single draw call
- **Dispose resources in `destroyed` hooks** -- Three.js geometries, materials, and textures must be explicitly disposed to prevent WebGL memory leaks
- **Enable damping on OrbitControls** -- damped controls feel more natural and prevent disorienting sudden camera jumps during user interaction
- **Detect WebGL support** -- fall back to a 2D [Chart.js](@/technologies/chartjs.md) visualization on devices without WebGL or with insufficient GPU capabilities
- **Keep polygon counts low** -- use `SphereGeometry(0.3, 16, 16)` not `(0.3, 64, 64)` for data nodes that do not need high geometric detail
- **Cap pixel ratio at 2x** -- `Math.min(window.devicePixelRatio, 2)` prevents excessive rendering on 3x+ displays, maintaining performance
- **Traverse and dispose on cleanup** -- walk the scene graph to dispose every geometry, material, and texture when the component unmounts

## Comparison with Alternatives

| Feature | Three.js | D3.js | Plotly | Babylon.js | deck.gl |
|---------|----------|-------|--------|------------|---------|
| Rendering | WebGL 3D | SVG/Canvas 2D | Canvas/WebGL | WebGL 3D | WebGL 2D/3D |
| Use case | 3D visualization, animation | Data visualization, charts | Scientific plots | Games, 3D apps | Geospatial/large datasets |
| Learning curve | Medium | High | Low | High | Medium |
| Performance (1000+ objects) | Excellent (instancing) | Poor (SVG DOM) | Good | Excellent | Excellent |
| Bundle size | ~600KB | ~250KB | ~3.5MB | ~1.2MB | ~400KB |
| LiveView integration | JS Hooks | JS Hooks | JS Hooks | JS Hooks | JS Hooks |
| Platform usage | 3D constellation, particles | Not used | Not used | Not used | Not used |

Three.js was chosen for the platform's 3D visualizations because it provides the best balance of rendering performance, API simplicity, and ecosystem maturity for WebGL-based interactive scenes.

## Related Technologies

- [Chart.js](@/technologies/chartjs.md) - 2D chart visualizations and fallback for non-WebGL devices
- [Alpine.js](@/technologies/alpinejs.md) - UI interaction handling alongside 3D scenes for menus and overlays
- [KuzuDB](@/technologies/kuzudb.md) - Graph data source for entity relationship visualization
- [Phoenix LiveView](@/technologies/phoenix-liveview.md) - Server-side data delivery via hooks for real-time 3D updates
- [TailwindCSS](@/technologies/tailwindcss.md) - Styling for the canvas container and overlay elements

## Related Apps

- [prismatic_web](@/apps/prismatic-web.md) - 3D visualizations on LiveView dashboards including the agent constellation
- [prismatic_perimeter](@/apps/prismatic-perimeter.md) - Attack surface topology visualization with 3D network graphs
- [prismatic_agents](@/apps/prismatic-agents.md) - Agent data source for the constellation visualization

---

## Connect & Contribute

**Created by [Tomáš Korcak (korczis)](https://github.com/korczis)** | Open Source under [GHL](https://github.com/korczis/prismatic-platform/blob/main/LICENSE)

- [GitHub](https://github.com/korczis/prismatic-platform) | [GitLab](https://gitlab.com/korczis/prismatic-platform) | [LinkedIn](https://linkedin.com/in/korczis) | [Contact](mailto:korczis@gmail.com)
- [Developer Portal](@/developers/_index.md) | [Architecture](@/architecture/_index.md) | [Meet the Creator](@/about/author.md)