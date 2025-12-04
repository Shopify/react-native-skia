import React from "react";

import {
  Group,
  Rect,
  Circle,
  Fill,
  LinearGradient,
  BlurMask,
  ColorMatrix,
  Blur,
  Paint,
  DashPathEffect,
} from "../../components";
import { mountCanvas } from "../setup";
import { visit, processPaint } from "../../../sksg/Recorder/Visitor";
import { sortNodeChildren } from "../../../sksg/Node";
import { Recorder } from "../../../sksg/Recorder/Recorder";
import type { Node } from "../../../sksg/Node";

// ============================================================================
// Test Tree Generators
// ============================================================================

const FlatTree = ({ count }: { count: number }): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Rect key={i} x={i % 100} y={Math.floor(i / 100)} width={5} height={5} />
    );
  }
  return <Group>{children}</Group>;
};

const DeepTree = ({
  depth,
  currentDepth = 0,
}: {
  depth: number;
  currentDepth?: number;
}): React.ReactElement => {
  if (currentDepth >= depth) {
    return <Rect x={0} y={0} width={10} height={10} />;
  }
  return (
    <Group>
      <DeepTree depth={depth} currentDepth={currentDepth + 1} />
    </Group>
  );
};

const BalancedTree = ({
  depth,
  breadth,
  currentDepth = 0,
}: {
  depth: number;
  breadth: number;
  currentDepth?: number;
}): React.ReactElement => {
  if (currentDepth >= depth) {
    return (
      <Group>
        <Rect x={0} y={0} width={10} height={10} />
        <Circle cx={5} cy={5} r={5} />
      </Group>
    );
  }

  const children: React.ReactElement[] = [];
  for (let i = 0; i < breadth; i++) {
    children.push(
      <Group key={i}>
        <BalancedTree
          depth={depth}
          breadth={breadth}
          currentDepth={currentDepth + 1}
        />
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

const PaintHeavyTree = ({ count }: { count: number }): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Rect
        key={i}
        x={i % 100}
        y={Math.floor(i / 100)}
        width={5}
        height={5}
        color="red"
        opacity={0.5}
        strokeWidth={2}
        blendMode="multiply"
        style="stroke"
        strokeJoin="round"
        strokeCap="round"
        strokeMiter={4}
        antiAlias={true}
      />
    );
  }
  return <Group>{children}</Group>;
};

const TransformHeavyTree = ({
  count,
}: {
  count: number;
}): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Group
        key={i}
        transform={[
          { translateX: i % 100 },
          { translateY: Math.floor(i / 100) },
          { rotate: i * 0.01 },
          { scale: 1 },
        ]}
        origin={{ x: 50, y: 50 }}
      >
        <Rect x={0} y={0} width={5} height={5} />
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

const DeclarationHeavyTree = ({
  count,
}: {
  count: number;
}): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Rect key={i} x={i % 50} y={Math.floor(i / 50) * 10} width={5} height={5}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 5, y: 5 }}
          colors={["red", "blue"]}
        />
      </Rect>
    );
  }
  return <Group>{children}</Group>;
};

const RealisticUITree = ({
  screens,
  componentsPerScreen,
}: {
  screens: number;
  componentsPerScreen: number;
}): React.ReactElement => {
  const screenElements: React.ReactElement[] = [];
  for (let s = 0; s < screens; s++) {
    const components: React.ReactElement[] = [];
    for (let c = 0; c < componentsPerScreen; c++) {
      components.push(
        <Group
          key={c}
          transform={[{ translateY: c * 20 }]}
          clip={{ x: 0, y: 0, width: 100, height: 20 }}
        >
          <Rect x={0} y={0} width={100} height={20} color="#f0f0f0" />
          <Rect x={5} y={5} width={10} height={10} color="#333" opacity={0.8} />
          <Circle cx={90} cy={10} r={5} color="#007AFF" />
        </Group>
      );
    }
    screenElements.push(
      <Group key={s} transform={[{ translateX: s * 120 }]}>
        <Fill color="white" />
        {components}
      </Group>
    );
  }
  return <Group>{screenElements}</Group>;
};

const MixedFiltersTree = ({ count }: { count: number }): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Group key={i}>
        <Rect x={i % 50} y={Math.floor(i / 50) * 15} width={10} height={10}>
          <BlurMask blur={2} style="normal" />
          <ColorMatrix
            matrix={[
              1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
            ]}
          />
          <Blur blur={1} />
          <DashPathEffect intervals={[2, 2]} />
        </Rect>
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

const PaintDeclarationTree = ({
  count,
}: {
  count: number;
}): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Group key={i}>
        <Rect x={i % 50} y={Math.floor(i / 50) * 10} width={8} height={8}>
          <Paint color="red" style="fill" />
          <Paint color="blue" style="stroke" strokeWidth={1} />
        </Rect>
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

// Heavy tree combining all features
const UltraHeavyTree = ({ count }: { count: number }): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Group
        key={i}
        transform={[
          { translateX: i % 100 },
          { translateY: Math.floor(i / 100) },
          { rotate: i * 0.01 },
        ]}
        origin={{ x: 50, y: 50 }}
        clip={{ x: 0, y: 0, width: 100, height: 100 }}
      >
        <Rect
          x={0}
          y={0}
          width={10}
          height={10}
          color="red"
          opacity={0.8}
          strokeWidth={2}
          blendMode="multiply"
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 10, y: 10 }}
            colors={["red", "blue", "green"]}
          />
          <BlurMask blur={1} style="normal" />
          <Blur blur={0.5} />
        </Rect>
        <Circle cx={5} cy={5} r={3} color="blue" opacity={0.5}>
          <Paint color="yellow" style="stroke" strokeWidth={1} />
        </Circle>
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

// ============================================================================
// Benchmark Utilities
// ============================================================================

interface BenchmarkResult {
  name: string;
  nodeCount: number;
  iterations: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  medianMs: number;
  p95Ms: number;
  stdDev: number;
  opsPerSecond: number;
  totalTimeMs: number;
}

const allResults: BenchmarkResult[] = [];

const runBenchmark = (
  name: string,
  fn: () => void,
  iterations: number,
  nodeCount: number,
  warmupIterations = 50
): BenchmarkResult => {
  // Warmup
  for (let i = 0; i < warmupIterations; i++) {
    fn();
  }

  const times: number[] = [];
  const totalStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  const totalEnd = performance.now();

  times.sort((a, b) => a - b);
  const sum = times.reduce((a, b) => a + b, 0);
  const avg = sum / times.length;
  const variance =
    times.reduce((acc, t) => acc + Math.pow(t - avg, 2), 0) / times.length;

  const result: BenchmarkResult = {
    name,
    nodeCount,
    iterations,
    avgMs: avg,
    minMs: times[0],
    maxMs: times[times.length - 1],
    medianMs: times[Math.floor(times.length / 2)],
    p95Ms: times[Math.floor(times.length * 0.95)],
    stdDev: Math.sqrt(variance),
    opsPerSecond: 1000 / avg,
    totalTimeMs: totalEnd - totalStart,
  };

  allResults.push(result);
  return result;
};

const countNodes = (nodes: Node[]): number => {
  let count = 0;
  for (const node of nodes) {
    count += 1 + countNodes(node.children);
  }
  return count;
};

// ============================================================================
// Performance Tests
// ============================================================================

describe("Visitor Performance", () => {
  afterAll(() => {
    // Print final report
    console.log("\n" + "=".repeat(100));
    console.log("VISITOR PERFORMANCE REPORT");
    console.log("=".repeat(100));

    // Group results by category
    const visitResults = allResults.filter((r) => r.name.startsWith("visit:"));
    const hotspotResults = allResults.filter((r) =>
      r.name.startsWith("hotspot:")
    );
    const scalingResults = allResults.filter((r) =>
      r.name.startsWith("scaling:")
    );

    const printTable = (results: BenchmarkResult[], title: string) => {
      if (results.length === 0) return;

      console.log(`\n${title}`);
      console.log("-".repeat(100));
      console.log(
        `${"Test".padEnd(45)} | ${"Nodes".padStart(8)} | ${"Iters".padStart(6)} | ${"Avg(ms)".padStart(10)} | ${"Med(ms)".padStart(10)} | ${"P95(ms)".padStart(10)} | ${"Ops/s".padStart(8)}`
      );
      console.log("-".repeat(100));

      for (const r of results) {
        const name = r.name.replace(/^(visit:|hotspot:|scaling:)/, "");
        console.log(
          `${name.padEnd(45)} | ${r.nodeCount.toString().padStart(8)} | ${r.iterations.toString().padStart(6)} | ${r.avgMs.toFixed(3).padStart(10)} | ${r.medianMs.toFixed(3).padStart(10)} | ${r.p95Ms.toFixed(3).padStart(10)} | ${r.opsPerSecond.toFixed(0).padStart(8)}`
        );
      }
    };

    printTable(visitResults, "VISIT FUNCTION BENCHMARKS");
    printTable(hotspotResults, "HOTSPOT ANALYSIS");
    printTable(scalingResults, "SCALING ANALYSIS");

    // Summary statistics
    console.log("\n" + "=".repeat(100));
    console.log("SUMMARY");
    console.log("-".repeat(100));

    const totalTime = allResults.reduce((sum, r) => sum + r.totalTimeMs, 0);
    const totalIterations = allResults.reduce((sum, r) => sum + r.iterations, 0);

    console.log(`Total benchmarks: ${allResults.length}`);
    console.log(`Total iterations: ${totalIterations.toLocaleString()}`);
    console.log(`Total time: ${(totalTime / 1000).toFixed(2)}s`);

    // Find slowest operations
    const sortedByAvg = [...allResults].sort((a, b) => b.avgMs - a.avgMs);
    console.log("\nSlowest operations (by avg time):");
    for (let i = 0; i < Math.min(5, sortedByAvg.length); i++) {
      const r = sortedByAvg[i];
      console.log(
        `  ${i + 1}. ${r.name}: ${r.avgMs.toFixed(3)}ms avg (${r.nodeCount} nodes)`
      );
    }

    console.log("\n" + "=".repeat(100));
  });

  describe("visit() - High Pressure Tests", () => {
    it("flat tree - 5000 siblings", async () => {
      const { root, render } = await mountCanvas(<FlatTree count={5000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:flat-5k",
        () => visit(recorder, root.sg.children),
        500,
        nodeCount
      );
    });

    it("flat tree - 10000 siblings", async () => {
      const { root, render } = await mountCanvas(<FlatTree count={10000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:flat-10k",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("deep tree - depth 500", async () => {
      const { root, render } = await mountCanvas(<DeepTree depth={500} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:deep-500",
        () => visit(recorder, root.sg.children),
        1000,
        nodeCount
      );
    });

    it("deep tree - depth 1000", async () => {
      const { root, render } = await mountCanvas(<DeepTree depth={1000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:deep-1000",
        () => visit(recorder, root.sg.children),
        500,
        nodeCount
      );
    });

    it("balanced tree - depth=7, breadth=4 (~21k nodes)", async () => {
      const { root, render } = await mountCanvas(
        <BalancedTree depth={7} breadth={4} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:balanced-7x4",
        () => visit(recorder, root.sg.children),
        100,
        nodeCount
      );
    });

    it("balanced tree - depth=9, breadth=3 (~29k nodes)", async () => {
      const { root, render } = await mountCanvas(
        <BalancedTree depth={9} breadth={3} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:balanced-9x3",
        () => visit(recorder, root.sg.children),
        100,
        nodeCount
      );
    });

    it("realistic UI - 10 screens x 100 components", async () => {
      const { root, render } = await mountCanvas(
        <RealisticUITree screens={10} componentsPerScreen={100} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:realistic-10x100",
        () => visit(recorder, root.sg.children),
        200,
        nodeCount
      );
    });

    it("paint-heavy tree - 3000 nodes", async () => {
      const { root, render } = await mountCanvas(<PaintHeavyTree count={3000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:paint-heavy-3k",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("transform-heavy tree - 3000 nodes", async () => {
      const { root, render } = await mountCanvas(
        <TransformHeavyTree count={3000} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:transform-heavy-3k",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("declaration-heavy tree - 1500 nodes", async () => {
      const { root, render } = await mountCanvas(
        <DeclarationHeavyTree count={1500} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:declaration-heavy-1.5k",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("mixed filters tree - 500 nodes", async () => {
      const { root, render } = await mountCanvas(<MixedFiltersTree count={500} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:mixed-filters-500",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("paint declaration tree - 1000 nodes", async () => {
      const { root, render } = await mountCanvas(
        <PaintDeclarationTree count={1000} />
      );
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:paint-decl-1k",
        () => visit(recorder, root.sg.children),
        300,
        nodeCount
      );
    });

    it("ultra-heavy tree - 1000 nodes (all features)", async () => {
      const { root, render } = await mountCanvas(<UltraHeavyTree count={1000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:ultra-heavy-1k",
        () => visit(recorder, root.sg.children),
        200,
        nodeCount
      );
    });

    it("ultra-heavy tree - 2000 nodes (all features)", async () => {
      const { root, render } = await mountCanvas(<UltraHeavyTree count={2000} />);
      await render();
      const nodeCount = countNodes(root.sg.children);
      const recorder = new Recorder();
      runBenchmark(
        "visit:ultra-heavy-2k",
        () => visit(recorder, root.sg.children),
        100,
        nodeCount
      );
    });
  });

  describe("Hotspot Analysis", () => {
    it("sortNodeChildren - 500 children", async () => {
      const { root, render } = await mountCanvas(<FlatTree count={500} />);
      await render();
      const groupNode = root.sg.children[0];
      runBenchmark(
        "hotspot:sortNodeChildren-500",
        () => sortNodeChildren(groupNode),
        10000,
        500
      );
    });

    it("sortNodeChildren - 1000 children", async () => {
      const { root, render } = await mountCanvas(<FlatTree count={1000} />);
      await render();
      const groupNode = root.sg.children[0];
      runBenchmark(
        "hotspot:sortNodeChildren-1000",
        () => sortNodeChildren(groupNode),
        5000,
        1000
      );
    });

    it("processPaint - empty props", () => {
      runBenchmark("hotspot:processPaint-empty", () => processPaint({}), 100000, 1);
    });

    it("processPaint - full props", () => {
      const fullProps = {
        opacity: 0.5,
        color: "red",
        strokeWidth: 2,
        blendMode: "multiply" as const,
        style: "stroke" as const,
        strokeJoin: "round" as const,
        strokeCap: "round" as const,
        strokeMiter: 4,
        antiAlias: true,
        dither: true,
      };
      runBenchmark(
        "hotspot:processPaint-full",
        () => processPaint(fullProps),
        100000,
        1
      );
    });

    it("paint-heavy vs minimal comparison (3k nodes)", async () => {
      const { root: paintRoot, render: renderPaint } = await mountCanvas(
        <PaintHeavyTree count={3000} />
      );
      await renderPaint();
      const paintNodeCount = countNodes(paintRoot.sg.children);

      const { root: minimalRoot, render: renderMinimal } = await mountCanvas(
        <FlatTree count={3000} />
      );
      await renderMinimal();
      const minimalNodeCount = countNodes(minimalRoot.sg.children);

      const recorder1 = new Recorder();
      runBenchmark(
        "hotspot:paint-heavy-3k",
        () => visit(recorder1, paintRoot.sg.children),
        300,
        paintNodeCount
      );

      const recorder2 = new Recorder();
      runBenchmark(
        "hotspot:minimal-3k",
        () => visit(recorder2, minimalRoot.sg.children),
        300,
        minimalNodeCount
      );
    });

    it("transform-heavy vs minimal comparison (3k nodes)", async () => {
      const { root: transformRoot, render: renderTransform } = await mountCanvas(
        <TransformHeavyTree count={3000} />
      );
      await renderTransform();
      const transformNodeCount = countNodes(transformRoot.sg.children);

      const { root: minimalRoot, render: renderMinimal } = await mountCanvas(
        <FlatTree count={3000} />
      );
      await renderMinimal();
      const minimalNodeCount = countNodes(minimalRoot.sg.children);

      const recorder1 = new Recorder();
      runBenchmark(
        "hotspot:transform-heavy-3k",
        () => visit(recorder1, transformRoot.sg.children),
        300,
        transformNodeCount
      );

      const recorder2 = new Recorder();
      runBenchmark(
        "hotspot:minimal-3k-v2",
        () => visit(recorder2, minimalRoot.sg.children),
        300,
        minimalNodeCount
      );
    });
  });

  describe("Scaling Analysis", () => {
    it("flat tree scaling: 1k, 3k, 5k, 8k nodes", async () => {
      const sizes = [1000, 3000, 5000, 8000];

      for (const size of sizes) {
        const { root, render } = await mountCanvas(<FlatTree count={size} />);
        await render();
        const nodeCount = countNodes(root.sg.children);
        const recorder = new Recorder();
        runBenchmark(
          `scaling:flat-${size}`,
          () => visit(recorder, root.sg.children),
          100,
          nodeCount
        );
      }
    });

    it("deep tree scaling: 100, 300, 500, 800 depth", async () => {
      const depths = [100, 300, 500, 800];

      for (const depth of depths) {
        const { root, render } = await mountCanvas(<DeepTree depth={depth} />);
        await render();
        const nodeCount = countNodes(root.sg.children);
        const recorder = new Recorder();
        runBenchmark(
          `scaling:deep-${depth}`,
          () => visit(recorder, root.sg.children),
          1000,
          nodeCount
        );
      }
    });

    it("balanced tree scaling: increasing complexity", async () => {
      const configs = [
        { depth: 5, breadth: 4 }, // ~1.3k nodes
        { depth: 6, breadth: 4 }, // ~5.4k nodes
        { depth: 7, breadth: 4 }, // ~21k nodes
      ];

      for (const { depth, breadth } of configs) {
        const { root, render } = await mountCanvas(
          <BalancedTree depth={depth} breadth={breadth} />
        );
        await render();
        const nodeCount = countNodes(root.sg.children);
        const recorder = new Recorder();
        runBenchmark(
          `scaling:balanced-d${depth}b${breadth}`,
          () => visit(recorder, root.sg.children),
          50,
          nodeCount
        );
      }
    });
  });
});
