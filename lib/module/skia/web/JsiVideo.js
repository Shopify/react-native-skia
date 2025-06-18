function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import { CanvasKitWebGLBufferImpl } from "./CanvasKitWebGLBufferImpl";
import { JsiSkImageFactory } from "./JsiSkImageFactory";
import { throwNotImplementedOnRNWeb } from "./Host";
export const createVideo = async (CanvasKit, url) => {
  const video = document.createElement("video");
  return new Promise((resolve, reject) => {
    video.src = url;
    video.style.display = "none";
    video.crossOrigin = "anonymous";
    video.volume = 0;
    video.addEventListener("loadedmetadata", () => {
      document.body.appendChild(video);
      resolve(new JsiVideo(new JsiSkImageFactory(CanvasKit), video));
    });
    video.addEventListener("error", () => {
      reject(new Error(`Failed to load video from URL: ${url}`));
    });
  });
};
export class JsiVideo {
  constructor(ImageFactory, videoElement) {
    this.ImageFactory = ImageFactory;
    this.videoElement = videoElement;
    _defineProperty(this, "__typename__", "Video");
    _defineProperty(this, "webglBuffer", null);
    document.body.appendChild(this.videoElement);
  }
  duration() {
    return this.videoElement.duration * 1000;
  }
  framerate() {
    return throwNotImplementedOnRNWeb();
  }
  setSurface(surface) {
    // If we have the surface, we can use the WebGL buffer which is slightly faster
    // This is because WebGL cannot be shared across contextes.
    // This can be removed with WebGPU
    this.webglBuffer = new CanvasKitWebGLBufferImpl(surface, this.videoElement);
  }
  nextImage() {
    return this.ImageFactory.MakeImageFromNativeBuffer(this.webglBuffer ? this.webglBuffer : this.videoElement);
  }
  seek(time) {
    if (isNaN(time)) {
      throw new Error(`Invalid time: ${time}`);
    }
    this.videoElement.currentTime = time / 1000;
  }
  rotation() {
    return 0;
  }
  size() {
    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight
    };
  }
  pause() {
    this.videoElement.pause();
  }
  play() {
    this.videoElement.play();
  }
  setVolume(volume) {
    this.videoElement.volume = volume;
  }
  dispose() {
    if (this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }
  }
}
//# sourceMappingURL=JsiVideo.js.map