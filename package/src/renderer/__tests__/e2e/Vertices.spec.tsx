import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Vertices } from "../../components";
import { surface, importSkia } from "../setup";

describe("Vertices", () => {
  it("should draw a single triangle", async () => {
    const { vec } = importSkia();
    const vertices = [vec(64, 0), vec(128, 256), vec(0, 256)];
    const colors = ["#61dafb", "#fb61da", "#dafb61"];
    const img = await surface.draw(
      <>
        <Vertices vertices={vertices} colors={colors} />
      </>
    );
    checkImage(img, "snapshots/vertices/vertices.png");
  });
});
