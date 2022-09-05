import React from "react";

import { NodeType } from "../../dom/types";
import { Circle, Group } from "../components";
import type { GroupNode } from "../../dom/types/Node";

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
});
