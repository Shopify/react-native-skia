import React from "react";

import { processResult } from "../../__tests__/setup";
import { Blur, Circle, Fill, Group, Paint, RoundedRect } from "../components";

import { drawOnNode, width, Skia, height } from "./setup";
it("demo1", () => {
  const r = width * 0.33;
  const surface = drawOnNode(
    <Group blendMode="multiply">
      <Circle cx={r} cy={r} r={r} color="cyan" />
      <Circle cx={width - r} cy={r} r={r} color="magenta" />
      <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
    </Group>
  );
  processResult(surface, "snapshots/drawings/demo1.png");
});
it("demo2", () => {
  const r = width * 0.33;
  const surface = drawOnNode(
    <Group blendMode="multiply">
      <Blur blur={30} />
      <Circle cx={r} cy={r} r={r} color="cyan" />
      <Circle cx={width - r} cy={r} r={r} color="magenta" />
      <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
    </Group>
  );
  processResult(surface, "snapshots/drawings/demo2.png");
});
it("demo3", () => {
  const r = width * 0.33;
  const surface = drawOnNode(
    <Group
      blendMode="multiply"
      transform={[{ rotate: Math.PI }]}
      origin={Skia.Point(width / 2, height / 2)}
    >
      <Circle cx={r} cy={r} r={r} color="cyan" />
      <Circle cx={width - r} cy={r} r={r} color="magenta" />
      <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
    </Group>
  );
  processResult(surface, "snapshots/drawings/demo3.png");
});
it("demo4", () => {
  const r = width / 4;
  const surface = drawOnNode(
    <>
      <Fill color="#e8f4f8" />
      <Group
        color="lightblue"
        origin={Skia.Point(r, r)}
        transform={[{ skewX: Math.PI / 6 }]}
      >
        <RoundedRect x={r} y={r} width={2 * r} height={2 * r} r={10} />
      </Group>
    </>
  );
  processResult(surface, "snapshots/drawings/demo4.png");
});
it("demo5", () => {
  const r = width / 4;
  const surface = drawOnNode(
    <>
      <Fill color="#e8f4f8" />
      <Group color="lightblue" transform={[{ skewX: Math.PI / 6 }]}>
        <RoundedRect x={r} y={r} width={2 * r} height={2 * r} r={10} />
      </Group>
    </>
  );
  processResult(surface, "snapshots/drawings/demo5.png");
});
it("demo6", () => {
  const r = width / 4;
  const strokeWidth = 50;
  const surface = drawOnNode(
    <>
      <Circle cx={r + strokeWidth} cy={r + strokeWidth} r={r} color="red">
        <Paint color="lightblue" />
        <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
        <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
      </Circle>
    </>
  );
  processResult(surface, "snapshots/drawings/demo6.png");
});
