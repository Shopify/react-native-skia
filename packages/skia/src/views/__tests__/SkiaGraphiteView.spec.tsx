/**
 * @jest-environment jsdom
 */
import { setFlagsFromString } from "v8";
import { runInNewContext } from "vm";

import React, { act } from "react";
import type { Ref } from "react";
import { createRoot } from "react-dom/client";

import { SkiaGraphiteView } from "../SkiaGraphiteView";
import type { SkiaGraphiteViewRef } from "../SkiaGraphiteView";

// A full collection without --expose-gc, the way jest-leak-detector gets one.
setFlagsFromString("--expose-gc");
const collectGarbage: () => void = runInNewContext("gc");

// A WeakRef keeps its target until the job that made or read it ends.
const endJob = () => new Promise((resolve) => setTimeout(resolve, 0));

// The host instance of the native view, which getContext() measures.
let mockHost: object = {};

jest.mock("../../Platform", () => ({ Platform: { OS: "android" } }));
jest.mock("../../specs/SkiaViewNativeComponent", () => ({
  __esModule: true,
  default: ({ ref }: { ref: Ref<object> }) => {
    require("react").useImperativeHandle(ref, () => mockHost);
    return null;
  },
}));
jest.mock("../api", () => ({
  SkiaViewApi: { makeGraphiteContext: jest.fn() },
}));

const { SkiaViewApi } = jest.requireMock<{
  SkiaViewApi: { makeGraphiteContext: jest.Mock };
}>("../api");

const mountView = () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  const ref = React.createRef<SkiaGraphiteViewRef>();
  act(() => {
    root.render(<SkiaGraphiteView ref={ref} />);
  });
  const view = ref.current;
  if (view === null) {
    throw new Error("SkiaGraphiteView did not attach its ref");
  }
  return {
    view,
    unmount: async () => {
      await act(async () => root.unmount());
      container.remove();
    },
  };
};

beforeAll(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});

beforeEach(() => {
  SkiaViewApi.makeGraphiteContext.mockReset();
});

// A host laid out at 200 × 100 points and drawn at half that size: measured
// relative to itself, React Native reports its layout box.
const createScaledHost = () => {
  const host = {
    measureLayout: (
      relativeTo: object,
      onSuccess: (
        left: number,
        top: number,
        width: number,
        height: number
      ) => void,
      onFail: () => void
    ) => (relativeTo === host ? onSuccess(0, 0, 200, 100) : onFail()),
    getBoundingClientRect: () => ({ width: 100, height: 50 }),
  };
  return host;
};

describe("SkiaGraphiteView on native", () => {
  it("sizes the context from the view's layout, not its transformed box", async () => {
    mockHost = createScaledHost();
    const { view, unmount } = mountView();
    view.getContext();
    expect(SkiaViewApi.makeGraphiteContext).toHaveBeenCalledWith(
      view.getNativeId(),
      200,
      100,
      false,
      false
    );
    await unmount();
  });

  // A frame submitted before the native view exists waits in the context's
  // target, which nothing else holds until that view binds to it.
  it("keeps the context it hands out while it is mounted", async () => {
    mockHost = createScaledHost();
    const handedOut: WeakRef<object>[] = [];
    SkiaViewApi.makeGraphiteContext.mockImplementation(() => {
      const context = {};
      handedOut.push(new WeakRef(context));
      return context;
    });
    const unheld = new WeakRef({});
    const { view, unmount } = mountView();
    view.getContext();
    // The mock keeps what it returned.
    SkiaViewApi.makeGraphiteContext.mockClear();
    await endJob();
    collectGarbage();
    expect(unheld.deref()).toBeUndefined();
    expect(handedOut).toHaveLength(1);
    expect(handedOut[0].deref()).toBeDefined();
    await unmount();
  });
});
