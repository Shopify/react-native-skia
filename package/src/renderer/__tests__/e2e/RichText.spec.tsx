import React from "react";

import { Fill, Group, RichText, Span } from "../../components";
import { importSkia, surface } from "../setup";
import { checkImage } from "../../../__tests__/setup";

describe("RichText", () => {
  it("should display richt text", async () => {
    const img = await surface.draw(
      <Group>
        <Fill color="white" />
        <RichText
          x={0}
          y={0}
          width={surface.width}
          fontFamilies={["Roboto"]}
          fontSize={128}
        >
          Hello
          <Span color="blue" fontSize={256}>
            World
          </Span>
        </RichText>
      </Group>
    );
    checkImage(img, "snapshots/drawings/rich-text.png");
  });
});
