import React from "react";

import { importSkia } from "../../renderer/__tests__/setup";
import { SkiaSGRoot } from "../Reconciler";

describe("SkiaSGRoot", () => {
  it("records the scene on every render, the same element included", async () => {
    const { Skia } = importSkia();
    const root = new SkiaSGRoot(Skia);
    const { container } = root as unknown as {
      container: { redraw: () => void };
    };
    const redraw = jest.spyOn(container, "redraw");
    const element = <skCircle c={{ x: 10, y: 10 }} r={5} color="red" />;
    await root.render(element);
    expect(redraw).toHaveBeenCalledTimes(1);
    // React bails out on the element it already rendered; the commit still
    // runs its effects (the render callback is one) and records the scene,
    // so a shared value changed since the last render is picked up.
    await root.render(element);
    expect(redraw).toHaveBeenCalledTimes(2);
    await root.unmount();
  });
});
