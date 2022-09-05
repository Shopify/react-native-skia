import React from "react";

import { NodeType } from "../../dom/types";
import { Circle, Group, Paint } from "../components";
import type { DrawingNode, GroupNode, DrawingNodeProps } from "../../dom/types";

import { width, height, mountCanvas } from "./setup";

describe("Test introductionary examples from our documentation", () => {
  it("Should blend colors using multiplication", () => {
    const r = width * 0.33;
    const { container } = mountCanvas(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    const { root } = container;
    expect(root.getChildren().length).toBe(1);
    const child = root.getChildren()[0]!;
    expect(child).toBeDefined();
    expect(child.type).toBe(NodeType.Group);
    expect((child as GroupNode).getChildren().length).toBe(3);
  });
  it("Accept multiple paint definiton", () => {
    const r = width * 0.33;
    const strokeWidth = 30;
    const { container } = mountCanvas(
      <Circle cx={width / 2} cy={width / 2} r={r} color="red">
        <Paint color="lightblue" />
        <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
        <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
      </Circle>
    );
    const { root } = container;
    expect(root.getChildren().length).toBe(1);
    const child = root.getChildren()[0]!;
    expect(child).toBeDefined();
    expect(child.type).toBe(NodeType.Circle);
    const circle = child as DrawingNode<DrawingNodeProps>;
    expect(circle).toBeDefined();
    expect(circle.type).toBe(NodeType.Circle);
    expect(circle.getPaints().length).toBe(4);
  });
});
