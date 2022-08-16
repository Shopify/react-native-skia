import React from "react";

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
});
