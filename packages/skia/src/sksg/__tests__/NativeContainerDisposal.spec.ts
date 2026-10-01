// The native Reanimated container records on the UI runtime, where Hermes
// sees only the JS wrappers of the recorder and the picture, not the native
// memory behind them (the recorder's commands and the recorded SkPicture both
// hold sk_sp copies of every image drawn). These tests pin down that the
// container releases both itself instead of leaving them to a GC.

type MockDisposable = { dispose: jest.Mock };
type MockRecorder = MockDisposable & {
  play: jest.Mock;
  applyUpdates: jest.Mock;
};

const mockRecorders: MockRecorder[] = [];
const mockSharedValues: unknown[] = [];
const mockStopMapper = jest.fn();

jest.mock("../../external/reanimated/ReanimatedProxy", () => ({
  __esModule: true,
  default: {
    runOnUI:
      (fn: (...args: unknown[]) => void) =>
      (...args: unknown[]) =>
        fn(...args),
    startMapper: jest.fn(() => 1),
    stopMapper: (id: number) => mockStopMapper(id),
  },
}));

jest.mock("../../external/reanimated/renderHelpers", () => ({
  HAS_REANIMATED_3: false,
  HAS_REANIMATED_4: true,
  REANIMATED_VERSION_MAJOR: 4,
}));

jest.mock("../Recorder/ReanimatedRecorder", () => ({
  ReanimatedRecorder: class {
    private recorder = {
      play: jest.fn(),
      applyUpdates: jest.fn(),
      dispose: jest.fn(),
    };
    constructor() {
      mockRecorders.push(this.recorder);
    }
    getSharedValues() {
      return mockSharedValues;
    }
    getRecorder() {
      return this.recorder;
    }
  },
}));

jest.mock("../Recorder/Visitor", () => ({ visit: jest.fn() }));
jest.mock("../../skia/NativeSetup", () => ({}));
jest.mock("../../views/api", () => ({}));

const makePicture = (): MockDisposable => ({ dispose: jest.fn() });

const setup = () => {
  const pictures: MockDisposable[] = [];
  const Skia = {
    Picture: {
      MakePicture: jest.fn(() => {
        const picture = makePicture();
        pictures.push(picture);
        return picture;
      }),
    },
  };
  (globalThis as unknown as { SkiaViewApi: unknown }).SkiaViewApi = {
    setJsiProperty: jest.fn(),
  };
  // Required after the globals exist: the module reads SkiaViewApi on load.

  const { createContainer } = require("../Container.native");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const container = createContainer(Skia as any, 42);
  return { container, pictures };
};

describe("NativeReanimatedContainer disposal", () => {
  beforeEach(() => {
    jest.resetModules();
    mockRecorders.length = 0;
    mockSharedValues.length = 0;
    mockStopMapper.mockClear();
  });

  it("disposes the previous recorder when it redraws", () => {
    const { container } = setup();
    container.redraw();
    container.redraw();
    expect(mockRecorders).toHaveLength(2);
    expect(mockRecorders[0].dispose).toHaveBeenCalledTimes(1);
    expect(mockRecorders[1].dispose).not.toHaveBeenCalled();
  });

  it("disposes the recorder and the picture on unmount", () => {
    const { container, pictures } = setup();
    mockSharedValues.push({ value: 0 });
    container.redraw();
    container.unmount();
    expect(mockStopMapper).toHaveBeenCalledWith(1);
    expect(mockRecorders[0].dispose).toHaveBeenCalledTimes(1);
    expect(pictures[0].dispose).toHaveBeenCalledTimes(1);
  });

  it("still draws after being mounted again", () => {
    const { container, pictures } = setup();
    container.redraw();
    container.unmount();
    container.mount();
    container.redraw();
    // A fresh picture replaced the disposed one, and the new recorder plays
    // into it rather than into the disposed picture.
    expect(pictures).toHaveLength(2);
    expect(mockRecorders[1].play).toHaveBeenCalledWith(pictures[1]);
    expect(pictures[1].dispose).not.toHaveBeenCalled();
  });

  it("does not record after unmount", () => {
    const { container } = setup();
    container.unmount();
    container.redraw();
    expect(mockRecorders).toHaveLength(0);
  });
});

export {};
