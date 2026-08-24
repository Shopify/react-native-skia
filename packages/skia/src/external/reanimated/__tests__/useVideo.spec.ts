import type { FrameInfo, SharedValue } from "react-native-reanimated";

import type { Platform as PlatformType } from "../../../Platform";
import type { SkImage, Video } from "../../../skia/types";
import type { useVideo as UseVideo } from "../useVideo";

let frameCallback: ((frameInfo: FrameInfo) => void) | undefined;
const useVideoLoadingMock = jest.fn();

jest.doMock("react", () => ({
  useEffect: jest.fn(),
  useMemo: <T>(factory: () => T) => factory(),
}));

jest.doMock("../ReanimatedProxy", () => ({
  __esModule: true,
  default: {
    isSharedValue: () => false,
    runOnUI: jest.fn((fn) => fn),
    useAnimatedReaction: jest.fn(),
    useFrameCallback: (callback: (frameInfo: FrameInfo) => void) => {
      frameCallback = callback;
    },
    useSharedValue: <T>(value: T) => ({ value }) as SharedValue<T>,
  },
}));

jest.doMock("../useVideoLoading", () => ({
  useVideoLoading: useVideoLoadingMock,
}));

jest.doMock("../../../Platform", () => ({
  Platform: { OS: "android" },
}));

const { useVideo } = require("../useVideo") as { useVideo: typeof UseVideo };
const { Platform } = require("../../../Platform") as {
  Platform: typeof PlatformType;
};

// A decoder-backed frame: makeNonTextureImage() is the readback, and the
// texture itself becomes invalid as soon as the decoder recycles the slot.
const texture = (copy: SkImage | null) =>
  ({
    dispose: jest.fn(),
    makeNonTextureImage: jest.fn(() => copy),
  }) as unknown as SkImage;

const videoOf = (...frames: Array<SkImage | null>) => {
  const nextImage = jest.fn();
  frames.forEach((frame) => nextImage.mockReturnValueOnce(frame));
  return {
    currentTime: jest.fn(() => 0),
    duration: jest.fn(() => 1000),
    framerate: jest.fn(() => 30),
    nextImage,
    rotation: jest.fn(() => 0),
    size: jest.fn(() => ({ width: 1920, height: 1080 })),
  } as unknown as Video;
};

const advance = () => {
  expect(frameCallback).toBeDefined();
  frameCallback!({} as FrameInfo);
};

describe("useVideo", () => {
  beforeEach(() => {
    Platform.OS = "android";
    frameCallback = undefined;
    useVideoLoadingMock.mockReset();
  });

  it("publishes a copy of the Android frame and releases the texture", () => {
    const copy = texture(null);
    const tex = texture(copy);
    useVideoLoadingMock.mockReturnValue(videoOf(tex));

    const { currentFrame } = useVideo("video.mp4");
    advance();

    expect(tex.makeNonTextureImage).toHaveBeenCalledTimes(1);
    expect(tex.dispose).toHaveBeenCalledTimes(1);
    expect(currentFrame.value).toBe(copy);
  });

  it("keeps the last good frame when the Android readback fails", () => {
    const good = texture(null);
    const first = texture(good);
    // makeNonTextureImage() returns null when the readback fails.
    const second = texture(null);
    useVideoLoadingMock.mockReturnValue(videoOf(first, second));

    const { currentFrame } = useVideo("video.mp4");
    advance();
    expect(currentFrame.value).toBe(good);

    advance();
    // The canvas must not go blank, and the texture is still released.
    expect(currentFrame.value).toBe(good);
    expect(second.dispose).toHaveBeenCalledTimes(1);
  });

  it("never publishes a disposed texture on Android", () => {
    const copy = texture(null);
    const tex = texture(copy);
    useVideoLoadingMock.mockReturnValue(videoOf(tex));

    const { currentFrame } = useVideo("video.mp4");
    advance();

    expect(currentFrame.value).not.toBe(tex);
  });

  it("uses the frame as-is on iOS", () => {
    Platform.OS = "ios";
    const image = texture(null);
    useVideoLoadingMock.mockReturnValue(videoOf(image));

    const { currentFrame } = useVideo("video.mp4");
    advance();

    expect(image.makeNonTextureImage).not.toHaveBeenCalled();
    expect(image.dispose).not.toHaveBeenCalled();
    expect(currentFrame.value).toBe(image);
  });
});
