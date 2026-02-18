import React from "react";

import { Group, Rect, Circle, Fill } from "../../components";
import { surface, mountCanvas } from "../setup";
import { visit } from "../../../sksg/Recorder/Visitor";
import { Recorder } from "../../../sksg/Recorder/Recorder";

// Helper to create a deeply nested tree structure
const DeepTree = ({
  depth,
  breadth,
  currentDepth = 0,
}: {
  depth: number;
  breadth: number;
  currentDepth?: number;
}): React.ReactElement => {
  if (currentDepth >= depth) {
    // Leaf nodes - simple shapes
    return (
      <Group>
        <Rect x={currentDepth} y={currentDepth} width={10} height={10} />
        <Circle cx={currentDepth + 5} cy={currentDepth + 5} r={5} />
      </Group>
    );
  }

  // Create multiple children at each level
  const children: React.ReactElement[] = [];
  for (let i = 0; i < breadth; i++) {
    children.push(
      <Group
        key={i}
        transform={[{ translateX: i * 10 }, { translateY: currentDepth * 10 }]}
      >
        <DeepTree depth={depth} breadth={breadth} currentDepth={currentDepth + 1} />
      </Group>
    );
  }

  return (
    <Group opacity={0.9}>
      {children}
    </Group>
  );
};

// Helper to create a wide tree with many siblings
const WideTree = ({ count }: { count: number }): React.ReactElement => {
  const children: React.ReactElement[] = [];
  for (let i = 0; i < count; i++) {
    children.push(
      <Group key={i} transform={[{ translateX: i % 100, translateY: Math.floor(i / 100) }]}>
        <Rect x={0} y={0} width={5} height={5} color="red" />
        <Circle cx={2.5} cy={2.5} r={2} color="blue" />
      </Group>
    );
  }
  return <Group>{children}</Group>;
};

// Helper to create a complex tree with mixed content
const ComplexTree = ({
  groups,
  shapesPerGroup,
}: {
  groups: number;
  shapesPerGroup: number;
}): React.ReactElement => {
  const groupElements: React.ReactElement[] = [];
  for (let g = 0; g < groups; g++) {
    const shapes: React.ReactElement[] = [];
    for (let s = 0; s < shapesPerGroup; s++) {
      const x = (g * shapesPerGroup + s) % 256;
      const y = Math.floor((g * shapesPerGroup + s) / 256);
      shapes.push(
        <Group key={s} opacity={0.8}>
          <Rect x={x} y={y} width={4} height={4} color="green" />
        </Group>
      );
    }
    groupElements.push(
      <Group
        key={g}
        transform={[{ rotate: g * 0.01 }]}
        origin={{ x: 128, y: 128 }}
      >
        {shapes}
      </Group>
    );
  }
  return (
    <Group>
      <Fill color="white" />
      {groupElements}
    </Group>
  );
};

// Benchmark results collector
interface BenchmarkResult {
  name: string;
  nodes: string;
  iterations: number;
  avg: number;
  min: number;
  max: number;
}

const results: BenchmarkResult[] = [];

const runBenchmark = (
  name: string,
  nodes: string,
  iterations: number,
  fn: () => void
): BenchmarkResult => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return { name, nodes, iterations, avg, min, max };
};

const printResultsTable = () => {
  // eslint-disable-next-line no-console
  console.log("\n┌─────────────────────────────────────────────────────────────────────────────────────┐");
  // eslint-disable-next-line no-console
  console.log("│                           Visit Performance Benchmark                              │");
  // eslint-disable-next-line no-console
  console.log("├──────────────────────────────┬──────────┬──────┬───────────┬───────────┬───────────┤");
  // eslint-disable-next-line no-console
  console.log("│ Test Name                    │ Nodes    │ Runs │ Avg (ms)  │ Min (ms)  │ Max (ms)  │");
  // eslint-disable-next-line no-console
  console.log("├──────────────────────────────┼──────────┼──────┼───────────┼───────────┼───────────┤");

  for (const r of results) {
    const name = r.name.padEnd(28);
    const nodes = r.nodes.padStart(8);
    const runs = r.iterations.toString().padStart(4);
    const avg = r.avg.toFixed(3).padStart(9);
    const min = r.min.toFixed(3).padStart(9);
    const max = r.max.toFixed(3).padStart(9);
    // eslint-disable-next-line no-console
    console.log(`│ ${name} │ ${nodes} │ ${runs} │ ${avg} │ ${min} │ ${max} │`);
  }

  // eslint-disable-next-line no-console
  console.log("└──────────────────────────────┴──────────┴──────┴───────────┴───────────┴───────────┘\n");
};

describe("Visit Performance", () => {
  afterAll(() => {
    printResultsTable();
  });

  it("should handle a deeply nested tree (depth=7, breadth=3)", async () => {
    const { root, render } = await mountCanvas(
      <DeepTree depth={7} breadth={3} />
    );
    await render();

    const recorder = new Recorder();
    const result = runBenchmark(
      "Deep Tree (d=7, b=3)",
      "~2000",
      50,
      () => visit(recorder, root.sg.children)
    );
    results.push(result);

    expect(result.avg).toBeDefined();
  });

  it("should handle a wide tree (1500 siblings)", async () => {
    const { root, render } = await mountCanvas(<WideTree count={1500} />);
    await render();

    const recorder = new Recorder();
    const result = runBenchmark(
      "Wide Tree (1500 siblings)",
      "~4500",
      50,
      () => visit(recorder, root.sg.children)
    );
    results.push(result);

    expect(result.avg).toBeDefined();
  });

  it("should handle a complex tree (60 groups x 25 shapes)", async () => {
    const { root, render } = await mountCanvas(
      <ComplexTree groups={60} shapesPerGroup={25} />
    );
    await render();

    const recorder = new Recorder();
    const result = runBenchmark(
      "Complex Tree (60x25)",
      "~3000",
      50,
      () => visit(recorder, root.sg.children)
    );
    results.push(result);

    expect(result.avg).toBeDefined();
  });

  it("should handle large flat tree (3000 nodes)", async () => {
    const { root, render } = await mountCanvas(<WideTree count={3000} />);
    await render();

    const recorder = new Recorder();
    const result = runBenchmark(
      "Large Flat Tree",
      "~9000",
      30,
      () => visit(recorder, root.sg.children)
    );
    results.push(result);

    expect(result.avg).toBeDefined();
  });

  it("benchmark: deeply nested with transforms (depth=11, breadth=2)", async () => {
    const { root, render } = await mountCanvas(
      <DeepTree depth={11} breadth={2} />
    );
    await render();

    const recorder = new Recorder();
    const result = runBenchmark(
      "Deep Transforms (d=11, b=2)",
      "~2000",
      30,
      () => visit(recorder, root.sg.children)
    );
    results.push(result);

    expect(result.avg).toBeDefined();
  });

  it("should render correctly with a deep tree", async () => {
    const img = await surface.draw(<DeepTree depth={5} breadth={3} />);
    expect(img).toBeTruthy();
    expect(img.width()).toBeGreaterThan(0);
    expect(img.height()).toBeGreaterThan(0);
  });
});
