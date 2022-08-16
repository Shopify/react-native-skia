import React, { useEffect, useState } from "react";

import { Fill } from "../../../renderer/components";
import {
  importSkia,
  mountCanvas,
  wait,
} from "../../../renderer/__tests__/setup";
import { processResult } from "../../../__tests__/setup";
import type { SkiaValue } from "../../types";
import { RNSkComputedValue } from "../RNSkComputedValue";
import { RNSkValue } from "../RNSkValue";

const sideEffects = {
  id: 0,
};

interface TestComputedDepsProps {
  id1: SkiaValue<number>;
  id2: SkiaValue<number>;
}

const TestComputedDeps = ({ id1, id2 }: TestComputedDepsProps) => {
  const { useComputedValue } = importSkia();
  const [dep, setDep] = useState(id1);
  const color = useComputedValue(() => {
    sideEffects.id++;
    return dep.current % 2 ? "green" : "red";
  }, [dep]);
  useEffect(() => {
    setTimeout(() => {
      setDep(id2);
    }, 100);
  }, [id2]);
  return <Fill color={color} />;
};

interface TestComputedProps {
  id: SkiaValue<number>;
}

const TestComputed = ({ id }: TestComputedProps) => {
  const { useComputedValue } = importSkia();
  const color = useComputedValue(() => {
    return id.current % 2 ? "green" : "red";
  }, [id]);
  return <Fill color={color} />;
};

describe("RNSkComputedValue", () => {
  it("should update when dependency changes", () => {
    const dependency = new RNSkValue(10);
    const computed = new RNSkComputedValue(
      () => 10 * dependency.current,
      [dependency]
    );
    expect(computed.current).toBe(100);
    dependency.current = 20;
    expect(computed.current).toBe(200);
  });

  it("useComputedValue() should update as expected", async () => {
    const id = global.SkiaValueApi.createValue(0);
    const { surface, draw } = mountCanvas(<TestComputed id={id} />);
    draw();
    processResult(surface, "snapshots/animations/red.png");
    id.current = 1;
    await wait(50);
    draw();
    processResult(surface, "snapshots/animations/green.png");
  });

  it("useComputedValue() should respect its dependencies", async () => {
    const id1 = global.SkiaValueApi.createValue(0);
    const id2 = global.SkiaValueApi.createValue(1);
    const { surface, draw } = mountCanvas(
      <TestComputedDeps id1={id1} id2={id2} />
    );
    draw();
    processResult(surface, "snapshots/animations/red.png");
    await wait(250);
    draw();
    processResult(surface, "snapshots/animations/green.png");
  });

  it("useComputedValue() should unsubscribe when the dependencies have changed", async () => {
    sideEffects.id = 0;
    const id1 = global.SkiaValueApi.createValue(0);
    const id2 = global.SkiaValueApi.createValue(1);
    const { surface, draw } = mountCanvas(
      <TestComputedDeps id1={id1} id2={id2} />
    );
    draw();
    processResult(surface, "snapshots/animations/red.png");
    await wait(250);
    draw();
    processResult(surface, "snapshots/animations/green.png");
    expect(sideEffects.id).toBe(2);
  });
});
