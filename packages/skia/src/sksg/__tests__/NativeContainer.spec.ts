// The native container records the scene into the native recorder. On
// screen it hands the recording to the view (which owns it) and drives
// animations through the view id only. These tests pin down that no recorder
// or picture is captured by a worklet, that the wrapper is disposed once the
// view owns the recording, that unmount leaves the view's last frame in place,
// and that offscreen rendering plays the recording into a picture.

type MockPicture = { dispose: jest.Mock };
type MockRecorder = {
  id: number;
  getId: () => number;
  getSharedValues: () => unknown[];
  makePicture: () => MockPicture;
  dispose: jest.Mock;
};

const mockRecorders: MockRecorder[] = [];
const mockPictures: MockPicture[] = [];
let mockSharedValues: unknown[] = [];
let mockHasReanimated4 = true;
const mockStartMapper = jest.fn((..._args: unknown[]) => 42);
const mockStopMapper = jest.fn();

jest.mock("../../external/reanimated/ReanimatedProxy", () => ({
  __esModule: true,
  default: {
    startMapper: (mapper: unknown, deps: unknown) =>
      mockStartMapper(mapper, deps),
    stopMapper: (id: number) => mockStopMapper(id),
  },
}));

jest.mock("../../external/reanimated/renderHelpers", () => ({
  get HAS_REANIMATED_4() {
    return mockHasReanimated4;
  },
  REANIMATED_VERSION_MAJOR: 4,
}));

jest.mock("../Recorder/Visitor", () => ({ visit: jest.fn() }));
jest.mock("../../skia/NativeSetup", () => ({}));
jest.mock("../../views/api", () => ({}));

const mockSkia = {
  Recorder: (): MockRecorder => {
    const recorder: MockRecorder = {
      id: mockRecorders.length,
      getId() {
        return this.id;
      },
      getSharedValues: () => mockSharedValues,
      makePicture: () => {
        const picture = { dispose: jest.fn() };
        mockPictures.push(picture);
        return picture;
      },
      dispose: jest.fn(),
    };
    mockRecorders.push(recorder);
    return recorder;
  },
};

type TestContainer = {
  redraw: () => void;
  unmount: () => void;
  drawOnCanvas: (canvas: unknown) => void;
};

const setup = (nativeId = 7) => {
  const SkiaViewApi = {
    setJsiProperty: jest.fn(),
    applyUpdates: jest.fn(),
  };
  (globalThis as unknown as { SkiaViewApi: unknown }).SkiaViewApi = SkiaViewApi;
  let container: TestContainer | null = null;
  // The module reads SkiaViewApi from globalThis when it loads.
  jest.isolateModules(() => {
    const { createContainer } = require("../Container.native");
    container = createContainer(mockSkia, nativeId);
  });
  return { SkiaViewApi, container: container! as TestContainer };
};

beforeEach(() => {
  mockRecorders.length = 0;
  mockPictures.length = 0;
  mockSharedValues = [];
  mockHasReanimated4 = true;
  mockStartMapper.mockClear();
  mockStopMapper.mockClear();
});

describe("NativeContainer", () => {
  it("hands the recorder to the view and starts no mapper for a static scene", () => {
    const { SkiaViewApi, container } = setup();
    container.redraw();
    expect(SkiaViewApi.setJsiProperty).toHaveBeenCalledWith(
      7,
      "recorder",
      mockRecorders[0]
    );
    expect(mockStartMapper).not.toHaveBeenCalled();
  });

  it("disposes the wrapper once the view owns the recording", () => {
    const { SkiaViewApi, container } = setup();
    container.redraw();
    const { dispose } = mockRecorders[0];
    expect(dispose).toHaveBeenCalledTimes(1);
    // The view must hold the recording before the wrapper lets go of it.
    expect(dispose.mock.invocationCallOrder[0]).toBeGreaterThan(
      SkiaViewApi.setJsiProperty.mock.invocationCallOrder[0]
    );
  });

  it("drives animations through the view id and the shared values only", () => {
    const sv = { value: 0 };
    mockSharedValues = [sv];
    const { SkiaViewApi, container } = setup();
    container.redraw();
    expect(mockStartMapper).toHaveBeenCalledTimes(1);
    const [mapper, deps] = mockStartMapper.mock.calls[0] as unknown as [
      () => void,
      unknown[],
    ];
    expect(deps).toEqual([sv]);
    mapper();
    // The updates are tagged with the recording id so that a mapper that
    // outlives its recording cannot write into the one that replaced it.
    expect(SkiaViewApi.applyUpdates).toHaveBeenCalledWith(
      7,
      mockRecorders[0].id,
      [sv]
    );
    // No recorder or picture reaches the worklet: the only view call it
    // makes is applyUpdates.
    expect(SkiaViewApi.setJsiProperty).toHaveBeenCalledTimes(1);
  });

  it("stops the previous mapper and replaces the recorder on redraw", () => {
    mockSharedValues = [{ value: 0 }];
    const { SkiaViewApi, container } = setup();
    container.redraw();
    container.redraw();
    expect(mockStopMapper).toHaveBeenCalledWith(42);
    expect(SkiaViewApi.setJsiProperty).toHaveBeenLastCalledWith(
      7,
      "recorder",
      mockRecorders[1]
    );
  });

  it("stops the mapper and keeps the last frame on the view on unmount", () => {
    mockSharedValues = [{ value: 0 }];
    const { SkiaViewApi, container } = setup();
    container.redraw();
    container.unmount();
    expect(mockStopMapper).toHaveBeenCalledWith(42);
    // The native view can outlive the React tree (exit animations, screen
    // transitions) and keeps drawing its last frame until it is torn down,
    // which is when it releases the recording: unmount must not clear it.
    expect(SkiaViewApi.setJsiProperty).toHaveBeenCalledTimes(1);
    // The unmount commit triggers a last redraw: it must not resurrect a
    // recording for the view.
    container.redraw();
    expect(mockRecorders).toHaveLength(1);
    expect(mockStartMapper).toHaveBeenCalledTimes(1);
  });

  it("reports shared values it cannot animate without Reanimated 4", () => {
    mockSharedValues = [{ value: 0 }];
    mockHasReanimated4 = false;
    const { SkiaViewApi, container } = setup();
    // The recording still reaches the view, with the current values.
    expect(() => container.redraw()).toThrow(/Reanimated 4/);
    expect(SkiaViewApi.setJsiProperty).toHaveBeenCalledTimes(1);
    expect(mockStartMapper).not.toHaveBeenCalled();
  });

  it("plays the recording into a picture offscreen", () => {
    const { SkiaViewApi, container } = setup(-1);
    container.redraw();
    expect(SkiaViewApi.setJsiProperty).not.toHaveBeenCalled();
    expect(mockRecorders[0].dispose).toHaveBeenCalledTimes(1);
    const canvas = { drawPicture: jest.fn() };
    container.drawOnCanvas(canvas);
    expect(canvas.drawPicture).toHaveBeenCalledWith(mockPictures[0]);
    // A new commit replaces the picture; unmount releases the last one.
    container.redraw();
    expect(mockPictures[0].dispose).toHaveBeenCalledTimes(1);
    container.unmount();
    expect(mockPictures[1].dispose).toHaveBeenCalledTimes(1);
    expect(() => container.drawOnCanvas(canvas)).toThrow();
  });
});
