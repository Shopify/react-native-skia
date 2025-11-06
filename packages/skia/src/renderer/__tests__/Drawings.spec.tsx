import React, { useEffect, useState } from "react";

import { docPath, processResult } from "../../__tests__/setup";
import { Blur, Circle, DiffRect, Fill, Group, Paint } from "../components";

import {
  drawOnNode,
  width,
  height,
  importSkia,
  PIXEL_RATIO,
  mountCanvas,
  wait,
} from "./setup";

const CheckEmptyCanvas = () => {
  const { Skia } = importSkia();
  const [color, setColor] = useState("green");
  useEffect(() => {
    setTimeout(() => {
      setColor("transparent");
    }, 16);
  }, [Skia]);

  return (
    <Group>
      <Fill color={color} />
    </Group>
  );
};

describe("Test introductionary examples from our documentation", () => {
  it("Should blend colors using multiplication", async () => {
    const r = width * 0.33;
    const surface = await drawOnNode(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    processResult(surface, "snapshots/drawings/blend-mode-multiply.png");
  });

  it("Should use a blur image filter", async () => {
    const r = width * 0.33;
    const surface = await drawOnNode(
      <Group blendMode="multiply">
        <Blur blur={30} />
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    processResult(surface, "snapshots/drawings/blur-node.png");
  });

  it("Should use multiple paint definitions for one drawing command", async () => {
    const r = width / 4;
    const strokeWidth = 50;
    const surface = await drawOnNode(
      <>
        <Circle cx={width / 2} cy={width / 2} r={r} color="red">
          <Paint color="lightblue" />
          <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
          <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
        </Circle>
      </>
    );
    processResult(surface, "snapshots/drawings/multiple-paints.png");
  });

  it("Should draw DRect", async () => {
    const { rrect, rect } = importSkia();
    const padding = 25 * PIXEL_RATIO;
    const outer = rrect(rect(0, 0, width, width), padding, padding);
    const inner = rrect(
      rect(padding * 2, padding * 2, width - padding * 4, width - padding * 4),
      padding * 2,
      padding * 2
    );
    const surface = await drawOnNode(
      <DiffRect inner={inner} outer={outer} color="lightblue" />
    );
    processResult(surface, docPath("shapes/drect.png"));
  });

  it("should clear the canvas even if it's empty", async () => {
    const { surface, draw } = await mountCanvas(<CheckEmptyCanvas />);
    await draw();
    processResult(surface, "snapshots/green.png");
    await wait(1000);
    await draw();
    processResult(surface, "snapshots/transparent.png");
  });

  it("Should create a cyan background with a red circle at the center", async () => {
    const canvasSize = 256; // The actual canvas size (before PIXEL_RATIO)
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = 80;

    const surface = await drawOnNode(
      <>
        <Fill color="cyan" />
        <Circle cx={centerX} cy={centerY} r={radius} color="red" />
      </>
    );
    processResult(surface, "snapshots/drawings/cyan-background-red-circle.png");
  });
});
