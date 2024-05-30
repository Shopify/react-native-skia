import type { SharedValue } from "react-native-reanimated";

import type { SkImage, Video } from "../../skia/types";
import {
  processVideoState,
  type MaterializedPlaybackOptions,
} from "../../external/reanimated/video";

const createValue = <T,>(value: T) => ({ value } as unknown as SharedValue<T>);

jest.mock("../../Platform", () => ({
  Platform: {
    OS: "ios",
  },
}));

// Test cases
describe("Video Player", () => {
  let mockVideo: Video;
  let options: MaterializedPlaybackOptions;
  let currentTimestamp: number;

  const currentTime = createValue(0);
  const currentFrame = createValue<SkImage | null>(null);
  const lastTimestamp = createValue(0);
  const seek = createValue<null | number>(null);
  const framerate = 30;
  const duration = 5000;
  beforeEach(() => {
    mockVideo = {
      __typename__: "Video",
      dispose: jest.fn(),
      framerate: jest.fn().mockReturnValue(framerate),
      duration: jest.fn().mockReturnValue(duration),
      seek: jest.fn(),
      nextImage: jest.fn().mockReturnValue({} as SkImage),
      getRotationInDegrees: jest.fn().mockReturnValue(0),
    };
    options = {
      playbackSpeed: 1,
      looping: false,
      paused: false,
    };
    currentTimestamp = 0;
    currentTime.value = 0;
    currentFrame.value = null;
    lastTimestamp.value = 0;
  });

  test("should not update state when paused", () => {
    options.paused = true;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(currentTime.value).toBe(0);
    expect(currentFrame.value).toBeNull();
    expect(lastTimestamp.value).toBe(0);
  });

  test("should update state with next frame if not paused and delta exceeds frame duration", () => {
    currentTimestamp = 100;
    lastTimestamp.value = 0;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(currentFrame.value).not.toBeNull();
    expect(currentTime.value).toBe(100);
    expect(lastTimestamp.value).toBe(100);
  });

  test("should handle looping when current time exceeds video duration", () => {
    currentTimestamp = 5100;
    lastTimestamp.value = 0;
    currentTime.value = 5000;
    options.looping = true;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(seek.value).toBe(null);
    expect(currentTime.value).toBe(0);
  });

  test("should seek to specified time", () => {
    seek.value = 2000;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(mockVideo.seek).toHaveBeenCalledWith(2000);
    expect(currentTime.value).toBe(2000);
    expect(currentFrame.value).not.toBeNull();
    expect(lastTimestamp.value).toBe(currentTimestamp);
    expect(seek.value).toBeNull();
  });

  test("should not update frame if delta does not exceed frame duration", () => {
    currentTimestamp = 10;
    lastTimestamp.value = 0;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(currentFrame.value).toBeNull();
    expect(currentTime.value).toBe(0);
    expect(lastTimestamp.value).toBe(0);
  });

  test("should update frame based on playback speed", () => {
    options.playbackSpeed = 2; // double speed
    currentTimestamp = 100;
    lastTimestamp.value = 0;
    processVideoState(
      mockVideo,
      duration,
      framerate,
      currentTimestamp,
      options,
      currentTime,
      currentFrame,
      lastTimestamp,
      seek
    );
    expect(currentFrame.value).not.toBeNull();
    expect(currentTime.value).toBe(100);
    expect(lastTimestamp.value).toBe(100);
  });
});
