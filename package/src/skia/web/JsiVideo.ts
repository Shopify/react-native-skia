import type { CanvasKit, Surface } from "canvaskit-wasm";

import type { Video } from "../types";

import { JsiSkImage } from "./JsiSkImage";

export const createVideo = async (
  CanvasKit: CanvasKit,
  url: string
): Promise<Video> => {
  const video = document.createElement("video");
  return new Promise((resolve, reject) => {
    video.src = url;
    video.style.display = "none";
    video.crossOrigin = "anonymous";
    video.volume = 0;
    video.addEventListener("loadedmetadata", () => {
      document.body.appendChild(video);
      resolve(new JsiVideo(CanvasKit, video));
    });
    video.addEventListener("error", () => {
      reject(new Error(`Failed to load video from URL: ${url}`));
    });
  });
};

export class JsiVideo implements Video {
  __typename__ = "Video" as const;

  private surface: Surface | null = null;
  private img: JsiSkImage | null = null;

  constructor(
    private CanvasKit: CanvasKit,
    private videoElement: HTMLVideoElement
  ) {
    document.body.appendChild(this.videoElement);
  }

  duration() {
    return this.videoElement.duration * 1000;
  }

  framerate(): number {
    throw new Error("Video.frame is not available on React Native Web");
  }

  setSurface(surface: Surface) {
    if (!this.surface) {
      this.surface = surface;
      const img = surface.makeImageFromTextureSource(this.videoElement);
      if (img) {
        this.img = new JsiSkImage(this.CanvasKit, img);
      } else {
        this.img = null;
      }
    }
  }

  nextImage() {
    if (this.img && this.surface) {
      this.surface.updateTextureFromSource(this.img.ref, this.videoElement);
      return this.img;
    }
    return new JsiSkImage(
      this.CanvasKit,
      this.CanvasKit.MakeLazyImageFromTextureSource(this.videoElement)
    );
  }

  seek(time: number) {
    if (isNaN(time)) {
      throw new Error(`Invalid time: ${time}`);
    }
    this.videoElement.currentTime = time / 1000;
  }

  rotation() {
    return 0 as const;
  }

  size() {
    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    };
  }

  pause() {
    this.videoElement.pause();
  }

  play() {
    this.videoElement.play();
  }

  setVolume(volume: number) {
    this.videoElement.volume = volume;
  }

  dispose() {
    if (this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }
  }
}
