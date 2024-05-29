import type { SharedValue } from "react-native-reanimated";

import type { SkImage, Video } from "../../skia/types";

const createValue = <T,>(value: T) => ({ value } as unknown as SharedValue<T>);

interface PlaybackOptions {
  playbackSpeed: number;
  looping: boolean;
  paused: boolean;
}

const processVideoState = (
  video: Video,
  currentTimestamp: number,
  options: PlaybackOptions,
  currentTime: SharedValue<number>,
  currentFrame: SharedValue<SkImage | null>,
  lastTimestamp: SharedValue<number>,
  seek: SharedValue<number | null>
) => {
  "worklet";
  if (options.paused) {
    return;
  }
  const delta = currentTimestamp - lastTimestamp.value;

  const frameDuration = 1000 / video.framerate();
  const currentFrameDuration = Math.floor(
    frameDuration / options.playbackSpeed
  );
  if (currentTime.value + delta >= video.duration() && options.looping) {
    seek.value = 0;
  }
  if (seek.value !== null) {
    video.seek(seek.value);
    currentTime.value = seek.value;
    currentFrame.value = video.nextImage();
    lastTimestamp.value = currentTimestamp;
    seek.value = null;
    return;
  }

  if (delta >= currentFrameDuration) {
    currentFrame.value = video.nextImage();
    currentTime.value += delta;
    lastTimestamp.value = currentTimestamp;
  }
};

// Test cases
describe("Video Player", () => {
  let mockVideo: Video;
  let options: PlaybackOptions;
  let currentTimestamp: number;

  const currentTime = createValue(0);
  const currentFrame = createValue<SkImage | null>(null);
  const lastTimestamp = createValue(0);
  const seek = createValue<null | number>(null);

  beforeEach(() => {
    mockVideo = {
      __typename__: "Video",
      dispose: jest.fn(),
      framerate: jest.fn().mockReturnValue(30),
      duration: jest.fn().mockReturnValue(5000),
      seek: jest.fn(),
      nextImage: jest.fn().mockReturnValue({} as SkImage),
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
