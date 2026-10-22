// A module: a script shares its top-level names with every other script
// TypeScript checks, and the other container spec declares the same ones.
export {};

// The web Reanimated container records the scene on the JS thread and draws it
// on the UI thread. These tests pin down that it schedules that work through
// worklets' scheduleOnUI, not the deprecated runOnUI, and that a recording is
// disposed on the same queue, after the draw and the mapper stop already
// queued for it.

type MockRecording = { commands: string[] };

// Worklets' UI queue: every job runs in the order it was scheduled.
const mockUIQueue: (() => void)[] = [];
const mockEvents: string[] = [];
const mockCalls = { scheduleOnUI: 0, deprecatedRunOnUI: 0 };
let mockAnimationValues: unknown[] = [];
let mockRecordingCount = 0;
let mockMapperCount = 0;

jest.mock("../../external/reanimated/ReanimatedProxy", () => ({
  __esModule: true,
  default: {
    startMapper: () => {
      mockMapperCount += 1;
      const id = mockMapperCount;
      mockUIQueue.push(() => mockEvents.push(`start mapper ${id}`));
      return id;
    },
    stopMapper: (id: number) => {
      mockUIQueue.push(() => mockEvents.push(`stop mapper ${id}`));
    },
    runOnUI:
      <A extends unknown[]>(worklet: (...args: A) => void) =>
      (...args: A) => {
        mockCalls.deprecatedRunOnUI += 1;
        mockUIQueue.push(() => worklet(...args));
      },
  },
}));

jest.mock("react-native-worklets", () => ({
  scheduleOnUI: <A extends unknown[]>(
    worklet: (...args: A) => void,
    ...args: A
  ) => {
    mockCalls.scheduleOnUI += 1;
    mockUIQueue.push(() => worklet(...args));
  },
}));

jest.mock("../../external/reanimated/renderHelpers", () => ({
  HAS_REANIMATED_3: true,
}));

jest.mock("../Recorder/Recorder", () => ({
  Recorder: class {
    getRecording() {
      mockRecordingCount += 1;
      return {
        commands: [`recording ${mockRecordingCount}`],
        paintPool: [],
        animationValues: new Set(mockAnimationValues),
      };
    }
  },
  disposeRecording: (recording: MockRecording) =>
    mockEvents.push(`dispose ${recording.commands[0]}`),
}));

jest.mock("../Recorder/Player", () => ({
  replay: (_ctx: unknown, commands: string[]) =>
    mockEvents.push(`draw ${commands[0]}`),
}));

jest.mock("../Recorder/DrawingContext", () => ({
  createDrawingContext: () => ({ dispose: () => {} }),
}));

jest.mock("../Recorder/Visitor", () => ({ visit: jest.fn() }));
jest.mock("../../skia/NativeSetup", () => ({}));
jest.mock("../../views/api", () => ({}));

const Skia = {
  PictureRecorder: () => ({
    beginRecording: () => ({}),
    finishRecordingAsPicture: () => ({ dispose: () => {} }),
    dispose: () => {},
  }),
};

const flushUIQueue = () => {
  for (const job of mockUIQueue.splice(0)) {
    job();
  }
};

const setup = () => {
  const handle = {
    setPicture: jest.fn(),
    setRecorder: jest.fn(),
    dispose: jest.fn(),
  };
  const SkiaViewApi = { makeViewHandle: jest.fn(() => handle) };
  (globalThis as unknown as { SkiaViewApi: unknown }).SkiaViewApi = SkiaViewApi;
  // The module reads SkiaViewApi from globalThis when it loads.
  jest.isolateModules(() => {
    const { createContainer } = require("../Container.web");
    setup.createContainer = createContainer;
  });
  const container = setup.createContainer(Skia as never, 7);
  return { SkiaViewApi, handle, container };
};
setup.createContainer = null as unknown as (
  Skia: never,
  nativeId: number
) => {
  redraw: () => void;
  unmount: () => void;
};

beforeEach(() => {
  mockUIQueue.length = 0;
  mockEvents.length = 0;
  mockCalls.scheduleOnUI = 0;
  mockCalls.deprecatedRunOnUI = 0;
  mockAnimationValues = [];
  mockRecordingCount = 0;
  mockMapperCount = 0;
});

describe("ReanimatedContainer on the web", () => {
  it("draws each recording on the UI thread through scheduleOnUI", () => {
    const { SkiaViewApi, handle, container } = setup();
    container.redraw();
    expect(mockEvents).toEqual([]);
    flushUIQueue();
    expect(mockEvents).toEqual(["draw recording 1"]);
    expect(SkiaViewApi.makeViewHandle).toHaveBeenCalledWith(7);
    expect(handle.setPicture).toHaveBeenCalledWith(expect.anything());
    expect(mockCalls).toEqual({ scheduleOnUI: 1, deprecatedRunOnUI: 0 });
  });

  it("disposes a replaced recording after its queued draw and mapper stop", () => {
    mockAnimationValues = [{ value: 0 }];
    const { container } = setup();
    container.redraw();
    container.redraw();
    flushUIQueue();
    expect(mockEvents).toEqual([
      "start mapper 1",
      "draw recording 1",
      "stop mapper 1",
      "start mapper 2",
      "dispose recording 1",
      "draw recording 2",
    ]);
    expect(mockCalls).toEqual({ scheduleOnUI: 2, deprecatedRunOnUI: 0 });
  });

  it("disposes the last recording on unmount after its queued draw and mapper stop", () => {
    mockAnimationValues = [{ value: 0 }];
    const { container } = setup();
    container.redraw();
    container.unmount();
    container.redraw();
    flushUIQueue();
    expect(mockEvents).toEqual([
      "start mapper 1",
      "draw recording 1",
      "stop mapper 1",
      "dispose recording 1",
    ]);
    expect(mockCalls).toEqual({ scheduleOnUI: 2, deprecatedRunOnUI: 0 });
  });
});
