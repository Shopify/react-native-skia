import React from "react";

import { checkImage } from "../../../__tests__/setup";
import { Fill, Shadow, Text } from "../../components";
import { surface, fonts } from "../setup";

describe("Box", () => {
  it("should show outer and inner shadows on text", async () => {
    const { width } = surface;
    const title = "Nice Job!";
    const img = await surface.draw(
      <>
        <Fill color="#add8e6" />
        <Text
          color="red"
          font={fonts.RobotoMedium}
          text={title}
          x={width / 2 - fonts.RobotoMedium.getTextWidth(title) / 2}
          y={50}
        >
          <Shadow dx={0} dy={4} blur={1} color="#00FF00" inner />
          <Shadow dx={0} dy={4} blur={0} color="#0000ff" />
        </Text>
      </>
    );
    checkImage(img, "snapshots/shadow/text-shadow.png");
  });
});
