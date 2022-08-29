import React from "react";

import {
  drawOnNode,
  PIXEL_RATIO,
  width,
  height,
  importSkia,
} from "../../setup";
import { Circle, Group, Paint } from "../../../components";
import { docPath, processResult } from "../../../../__tests__/setup";

describe("Paint", () => {
  it("should draw the color fill and strokes properly", () => {
    const { vec } = importSkia();
    const strokeWidth = 10 * PIXEL_RATIO;
    const c = vec(width / 2, height / 2);
    const r = (width - strokeWidth) / 2;
    const surface = drawOnNode(
      <>
        <Circle c={c} r={r} color="red">
          <Paint color="lightblue" />
          <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
          <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
        </Circle>
      </>
    );
    processResult(surface, docPath("paint/stroke.png"));
  });
  it("should use paint inheritance properly", () => {
    const r = width / 6;
    const strokeWidth = 10 * PIXEL_RATIO;
    const surface = drawOnNode(
      <Group color="lightblue">
        <Circle cx={r} cy={r} r={r} />
        <Group style="stroke" strokeWidth={strokeWidth}>
          <Circle cx={3 * r} cy={3 * r} r={r} />
        </Group>
      </Group>
    );
    processResult(surface, docPath("paint/inheritance.png"), true);
  });
});
