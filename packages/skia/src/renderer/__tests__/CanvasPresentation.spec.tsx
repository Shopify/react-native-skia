import React from "react";
import TestRenderer, { act } from "react-test-renderer";

jest.mock("../../external", () => ({
  HAS_REANIMATED_3: false,
}));

jest.mock("../../external/reanimated/ReanimatedProxy", () => ({
  __esModule: true,
  default: {},
}));

const render = jest.fn();
const unmount = jest.fn();
jest.mock("../../sksg/Reconciler", () => ({
  SkiaSGRoot: jest.fn().mockImplementation(() => ({
    render,
    unmount,
  })),
}));

jest.mock("../../skia", () => ({
  Skia: {},
}));

jest.mock("../../Platform", () => ({
  Platform: { OS: "ios" },
}));

jest.mock("../../specs/SkiaPictureViewNativeComponent", () => ({
  __esModule: true,
  default: () => null,
}));

describe("Canvas frame presentation callback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      global as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  it("registers, updates, and clears the callback", () => {
    const setJsiProperty = jest.fn();
    global.SkiaViewApi = {
      setJsiProperty,
      requestRedraw: jest.fn(),
      makeImageSnapshot: jest.fn(),
      makeImageSnapshotAsync: jest.fn(),
      size: jest.fn(),
    };
    const { Canvas } = require("../Canvas");
    const first = jest.fn();
    const second = jest.fn();
    let canvas!: TestRenderer.ReactTestRenderer;

    act(() => {
      canvas = TestRenderer.create(<Canvas onFramePresented={first} />);
    });

    const nativeId = setJsiProperty.mock.calls[0][0] as number;
    expect(setJsiProperty).toHaveBeenCalledWith(
      nativeId,
      "onFramePresented",
      first
    );

    act(() => {
      canvas.update(<Canvas onFramePresented={second} />);
    });
    expect(setJsiProperty).toHaveBeenLastCalledWith(
      nativeId,
      "onFramePresented",
      second
    );

    act(() => {
      canvas.unmount();
    });
    expect(setJsiProperty).toHaveBeenLastCalledWith(
      nativeId,
      "onFramePresented",
      null
    );
  });
});
