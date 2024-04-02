import React from "react";

import { Circle, Group } from "../components";
import { processResult } from "../../__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";

import { drawOnNode } from "./setup";

describe("Surface", () => {
  it("A raster surface shouldn't leak (1)", () => {
    const { Skia } = setupSkia();
    // When leaking, the WASM memory limit will be reached quite quickly
    // causing the test to fail
    for (let i = 0; i < 500; i++) {
      const surface = Skia.Surface.Make(1920, 1080)!;
      const canvas = surface.getCanvas();
      canvas.clear(Skia.Color("cyan"));
      surface.flush();
      const image = surface.makeImageSnapshot();
      image.dispose();
      surface.dispose();
    }
  });
  it("A raster surface shouldn't leak (2)", () => {
    for (let i = 0; i < 1000; i++) {
      //const t = performance.now();
      const r = 128;
      const surface = drawOnNode(
        <>
          <Group blendMode="multiply">
            <Circle cx={r} cy={r} r={r} color="cyan" />
            <Circle cx={r} cy={r} r={r} color="magenta" />
            <Circle cx={r} cy={r} r={r} color="yellow" />
          </Group>
        </>
      );
      surface.flush();
      //console.log(`Iteration ${i} took ${Math.floor(performance.now() - t)}ms`);
      processResult(surface, "snapshots/leak.png");
      surface.dispose();
    }
  });
});
