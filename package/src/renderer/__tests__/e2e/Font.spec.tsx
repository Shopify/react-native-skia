import React from "react";

import { Text } from "../../components";
import { surface } from "../setup";

describe("Fonts", () => {
  it("should fail with js error when using null value for font", async () => {
    try {
      await surface.draw(
        <>
          <Text text="Hello friends" font={null!} y={20} x={0} />
        </>
      );
      expect(false).toBeTruthy();
    } catch (e) {
      expect(true).toBeTruthy();
    }
  });
});
