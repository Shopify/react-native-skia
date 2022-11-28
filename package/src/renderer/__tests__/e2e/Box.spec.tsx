import React from "react";

import { docPath, checkImage } from "../../../__tests__/setup";
import { Box, BoxShadow, Fill } from "../../components";
import { importSkia, PIXEL_RATIO, surface } from "../setup";

describe("Box", () => {
  it("should draw a box with inner and outer shadow", async () => {
    const { rect, rrect } = importSkia();
    const { width } = surface;
    const size = width / 2;
    const d = 10 * PIXEL_RATIO;
    const img = await surface.draw(
      <>
        <Fill color="#add8e6" />
        <Box
          box={rrect(rect(size / 2, size / 2, size, size), 24, 24)}
          color="#add8e6"
        >
          <BoxShadow dx={d} dy={d} blur={d} color="#93b8c4" inner />
          <BoxShadow dx={-d} dy={-d} blur={d} color="#c7f8ff" inner />
          <BoxShadow dx={d} dy={d} blur={d} color="#93b8c4" />
          <BoxShadow dx={-d} dy={-d} blur={d} color="#c7f8ff" />
        </Box>
      </>
    );
    checkImage(img, docPath("Box/box-shadow.png"));
  });
  it("should draw a box with red stroke", async () => {
    const { width } = surface;
    const size = width / 2;
    const img = await surface.draw(
      <>
        <Box
          box={{ width: size, height: size, x: 1 / 3, y: 1 / 3 }}
          color="red"
          style="stroke"
          strokeWidth={2 / 3}
        />
      </>
    );
    checkImage(img, docPath("Box/box-stroke.png"));
  });
});
