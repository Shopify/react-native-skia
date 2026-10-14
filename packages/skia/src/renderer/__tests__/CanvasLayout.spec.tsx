/**
 * @jest-environment jsdom
 */
import React, { act } from "react";
import type { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import type { LayoutChangeEvent, ViewProps } from "react-native";

import type {
  Canvas as CanvasComponent,
  useCanvasSize as useCanvasSizeHook,
} from "../Canvas";
import type { SkSize } from "../../skia/types";

// The native view: records the props the canvas hands it.
const mockNativeView = { props: {} as ViewProps };

const MockNativeView = (props: ViewProps) => {
  mockNativeView.props = props;
  return null;
};

jest.doMock("../../specs/SkiaViewNativeComponent", () => ({
  __esModule: true,
  default: MockNativeView,
}));

jest.doMock("../../skia", () => ({ Skia: {} }));

jest.doMock("../../sksg/Reconciler", () => ({
  SkiaSGRoot: class {
    render() {}
    unmount() {}
  },
}));

interface CanvasModule {
  Canvas: typeof CanvasComponent;
  useCanvasSize: typeof useCanvasSizeHook;
}

const loadCanvas = (): CanvasModule => {
  let loaded: CanvasModule | null = null;
  jest.isolateModules(() => {
    jest.doMock("react", () => React);
    loaded = require("../Canvas") as CanvasModule;
  });
  if (loaded === null) {
    throw new Error("the canvas module did not load");
  }
  return loaded;
};

const mount = (element: ReactElement) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return () => {
    act(() => root.unmount());
    container.remove();
  };
};

const layoutEvent = {
  nativeEvent: { layout: { x: 0, y: 12, width: 48, height: 89 } },
} as LayoutChangeEvent;

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

describe("Canvas onLayout", () => {
  const { Canvas, useCanvasSize } = loadCanvas();

  it("hands onLayout to the view and logs no error", () => {
    const errors = jest.spyOn(console, "error").mockImplementation(() => {});
    const onLayout = jest.fn();
    const unmount = mount(<Canvas onLayout={onLayout} />);

    mockNativeView.props.onLayout?.(layoutEvent);

    expect(onLayout).toHaveBeenCalledWith(layoutEvent);
    expect(errors).not.toHaveBeenCalled();
    unmount();
    errors.mockRestore();
  });

  it("useCanvasSize follows the layout and ignores a repeated one", () => {
    const sizes: SkSize[] = [];
    const Demo = () => {
      const { size, onLayout } = useCanvasSize();
      sizes.push(size);
      return <Canvas onLayout={onLayout} />;
    };
    const unmount = mount(<Demo />);
    expect(sizes[sizes.length - 1]).toEqual({ width: 0, height: 0 });

    act(() => {
      mockNativeView.props.onLayout?.(layoutEvent);
    });
    const size = sizes[sizes.length - 1];
    expect(size).toEqual({ width: 48, height: 89 });

    // The same layout again keeps the same size object, so nothing keyed on
    // it (effects, memos) runs again.
    act(() => {
      mockNativeView.props.onLayout?.(layoutEvent);
    });
    expect(sizes[sizes.length - 1]).toBe(size);
    unmount();
  });
});
