import React from "react";

import { NodeType } from "../../dom/types";
import { Circle, Group, Paint } from "../components";

import { width, height, mountCanvas } from "./setup";

describe("Test introductionary examples from our documentation", () => {
  it("Should blend colors using multiplication", () => {
    const r = width * 0.33;
    const { root } = mountCanvas(
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={width - r} cy={r} r={r} color="magenta" />
        <Circle cx={width / 2} cy={height - r} r={r} color="yellow" />
      </Group>
    );
    expect(root.dom.children().length).toBe(1);
    const child = root.dom.children()[0]!;
    expect(child).toBeDefined();
    expect(child.type).toBe(NodeType.Group);
    expect(child.children().length).toBe(3);
  });
  it("Accept multiple paint definiton", () => {
    const r = width * 0.33;
    const strokeWidth = 30;
    const { root } = mountCanvas(
      <Circle cx={width / 2} cy={width / 2} r={r} color="red">
        <Paint color="lightblue" />
        <Paint color="#adbce6" style="stroke" strokeWidth={strokeWidth} />
        <Paint color="#ade6d8" style="stroke" strokeWidth={strokeWidth / 2} />
      </Circle>
    );
    expect(root.dom.children().length).toBe(1);
    const child = root.dom.children()[0]!;
    expect(child).toBeDefined();
    expect(child.type).toBe(NodeType.Circle);
    const circle = child;
    expect(circle).toBeDefined();
    expect(circle.type).toBe(NodeType.Circle);
    expect(circle.children().length).toBe(3);
    expect(circle.children()[0].type).toBe(NodeType.Paint);
    expect(circle.children()[1].type).toBe(NodeType.Paint);
    expect(circle.children()[2].type).toBe(NodeType.Paint);
  });
});
