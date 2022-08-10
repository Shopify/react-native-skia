import { Share } from "react-native";
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Rect } from "@shopify/react-native-skia";

import { ExportableCanvas } from "./ExportableCanvas";

describe("ExportableCanvas", () => {
  it("renders an canvas", () => {
    const { getByA11yHint } = render(
      <ExportableCanvas>
        <Rect x={10} y={10} width={10} height={10} color="red" />
      </ExportableCanvas>
    );
    expect(getByA11yHint("canvas")).toBeDefined();
  });
  it("takes a snapshot", () => {
    const share = jest.spyOn(Share, "share");
    const { getByA11yHint } = render(
      <ExportableCanvas>
        <Rect x={10} y={10} width={10} height={10} color="red" />
      </ExportableCanvas>
    );
    fireEvent(getByA11yHint("canvas"), "touch");
    expect(share).toHaveBeenCalled();
  });
});
