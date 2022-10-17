import React from "react";

import { processResult } from "../../__tests__/setup";
import { Fill, Group, RoundedRect } from "../components";

import { drawOnNode, width, importSkia } from "./setup";

describe("Opacity", () => {
  it("Should multiply the opacity to 0", () => {
    const { rect, rrect } = importSkia();
    const r = width * 0.5;
    const surface = drawOnNode(
      <Group>
        <Fill color="lightblue" />
        <Group opacity={0}>
          <RoundedRect
            rect={rrect(rect(0, 0, r, r), r, r)}
            color="rgba(0, 0, 0, 0.2)"
          />
          <RoundedRect
            rect={rrect(rect(0, 0, r / 2, r / 2), r, r)}
            color="white"
          />
        </Group>
      </Group>
    );
    processResult(surface, "snapshots/drawings/opacity-multiplication.png");
  });
  it("Should multiply the opacity to 0.25", () => {
    const { rect, rrect } = importSkia();
    const r = width * 0.5;
    const surface = drawOnNode(
      <Group opacity={0.5}>
        <Fill color="lightblue" />
        <Group opacity={0.5}>
          <RoundedRect
            rect={rrect(rect(0, 0, r, r), r, r)}
            color="rgba(0, 0, 0, 0.2)"
          />
          <RoundedRect
            rect={rrect(rect(0, 0, r / 2, r / 2), r, r)}
            color="white"
          />
        </Group>
      </Group>
    );
    processResult(
      surface,
      "snapshots/drawings/opacity-multiplication2.png",
      true
    );
  });
});
