/**
 * @jest-environment jsdom
 */
import React, { act } from "react";
import type { ComponentProps } from "react";
import { createRoot } from "react-dom/client";

import type { SkPicture } from "../../skia/types";
import { SkiaPictureView } from "../SkiaPictureView";

jest.mock("../../Platform", () => ({ Platform: { OS: "android" } }));
jest.mock("../../specs/SkiaViewNativeComponent", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("../api", () => {
  let nextNativeId = 1000;
  return {
    SkiaViewApi: {
      allocateNativeId: () => nextNativeId++,
      setJsiProperty: jest.fn(),
      requestRedraw: jest.fn(),
      makeImageSnapshot: jest.fn(),
    },
  };
});

const { SkiaViewApi } = jest.requireMock<{
  SkiaViewApi: { setJsiProperty: jest.Mock; requestRedraw: jest.Mock };
}>("../api");

type Props = ComponentProps<typeof SkiaPictureView>;

// Stand-ins: the view hands its picture to the native view as it is.
const makePicture = (name: string) => ({ name }) as unknown as SkPicture;

// Every view a test mounts is unmounted after it, whether its expectations
// passed or not, so that no frame loop outlives the test.
const unmountAfterTest: (() => void)[] = [];

const mountView = (props: Props) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const render = (next: Props) => {
    act(() => {
      root.render(<SkiaPictureView {...next} />);
    });
  };
  render(props);
  let mounted = true;
  const unmount = () => {
    if (mounted) {
      mounted = false;
      act(() => root.unmount());
      container.remove();
    }
  };
  unmountAfterTest.push(unmount);
  return { render, unmount };
};

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

beforeEach(() => {
  SkiaViewApi.setJsiProperty.mockReset();
  SkiaViewApi.requestRedraw.mockReset();
});

afterEach(() => {
  unmountAfterTest.splice(0).forEach((unmount) => unmount());
  jest.useRealTimers();
});

// A redraw records the picture again for the window, and a static view reads
// that frame back into a new bitmap: a render is no reason for one.
describe("SkiaPictureView", () => {
  it("hands a new picture to the native view, which draws it", () => {
    const first = makePicture("first");
    const second = makePicture("second");
    const { render } = mountView({ picture: first, static: true });
    SkiaViewApi.requestRedraw.mockReset();
    render({ picture: second, static: true });
    expect(SkiaViewApi.setJsiProperty).toHaveBeenLastCalledWith(
      expect.any(Number),
      "picture",
      second
    );
    expect(SkiaViewApi.requestRedraw).not.toHaveBeenCalled();
  });

  it("draws nothing again for a render with the same picture", () => {
    const picture = makePicture("same");
    const { render } = mountView({ picture, static: true });
    SkiaViewApi.setJsiProperty.mockReset();
    SkiaViewApi.requestRedraw.mockReset();
    render({ picture, static: true });
    render({ picture, static: true });
    expect(SkiaViewApi.setJsiProperty).not.toHaveBeenCalled();
    expect(SkiaViewApi.requestRedraw).not.toHaveBeenCalled();
  });

  it("redraws for nothing when its mode changes but not whether it runs every frame", () => {
    const picture = makePicture("same");
    const { render } = mountView({ picture, static: true });
    SkiaViewApi.requestRedraw.mockReset();
    render({ picture, static: true, mode: "default" });
    expect(SkiaViewApi.requestRedraw).not.toHaveBeenCalled();
  });

  it("redraws once a frame in continuous mode however often it renders", () => {
    jest.useFakeTimers();
    const picture = makePicture("animated");
    const { render } = mountView({ picture, mode: "continuous" });
    render({ picture, mode: "continuous" });
    render({ picture, mode: "continuous" });
    SkiaViewApi.requestRedraw.mockReset();
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(SkiaViewApi.requestRedraw).toHaveBeenCalledTimes(1);
  });

  it("keeps one frame loop when continuous mode ends and starts again before the next frame", () => {
    jest.useFakeTimers();
    const picture = makePicture("animated");
    const { render, unmount } = mountView({ picture, mode: "continuous" });
    render({ picture, mode: "default" });
    render({ picture, mode: "continuous" });
    SkiaViewApi.requestRedraw.mockReset();
    act(() => {
      jest.advanceTimersByTime(16);
    });
    expect(SkiaViewApi.requestRedraw).toHaveBeenCalledTimes(1);
    unmount();
    SkiaViewApi.requestRedraw.mockReset();
    act(() => {
      jest.advanceTimersByTime(64);
    });
    expect(SkiaViewApi.requestRedraw).not.toHaveBeenCalled();
  });
});
