import { type SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import {
  HAS_REANIMATED,
  HAS_REANIMATED_3,
} from "../external/reanimated/renderHelpers";

import type { StaticContext } from "./StaticContext";
import { createStaticContext } from "./StaticContext";
import type { Node } from "./nodes";
import { isSharedValue } from "./nodes";
import { Recorder } from "./recorder/Recorder";
import { record } from "./recorder/Visitor";
import { playback } from "./recorder/Playback";

const drawOnscreen = (
  Skia: Skia,
  nativeId: number,
  staticCtx: StaticContext
) => {
  "worklet";
  const start = performance.now();

  const recorder = Skia.PictureRecorder();
  const canvas = recorder.beginRecording();
  playback(Skia, canvas, staticCtx);
  const picture = recorder.finishRecordingAsPicture();
  const end = performance.now();
  console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

export class Container {
  private _root: Node[] = [];
  private _staticCtx: StaticContext | null = null;
  public unmounted = false;

  private values = new Set<SharedValue<unknown>>();
  private mapperId: number | null = null;

  constructor(public Skia: Skia, private nativeId: number) {}

  get root() {
    return this._root;
  }

  set root(root: Node[]) {
    const isOnscreen = this.nativeId !== -1;
    if (HAS_REANIMATED && !HAS_REANIMATED_3) {
      throw new Error("React Native Skia only supports Reanimated 3 and above");
    }
    if (isOnscreen) {
      if (this.mapperId !== null) {
        Rea.stopMapper(this.mapperId);
      }
      const { nativeId, Skia, _staticCtx } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, _staticCtx!);
      }, Array.from(this.values));
    }
    this._root = root;
    this._staticCtx = createStaticContext(this.Skia);
    const recorder = new Recorder();
    root.forEach((node) => {
      record(recorder, node);
    });
    console.log(recorder.commands);
    this._staticCtx.commands = recorder.commands;
  }

  clear() {
    console.log("clear container");
  }

  redraw() {
    const isOnscreen = this.nativeId !== -1;
    if (HAS_REANIMATED && !HAS_REANIMATED_3) {
      throw new Error("React Native Skia only supports Reanimated 3 and above");
    }
    if (isOnscreen) {
      const { nativeId, Skia, _staticCtx } = this;
      Rea.runOnUI(() => {
        drawOnscreen(Skia, nativeId, _staticCtx!);
      })();
    }
  }

  getNativeId() {
    return this.nativeId;
  }

  unregisterValues(values: object) {
    Object.values(values)
      .filter(isSharedValue)
      .forEach((value) => {
        this.values.delete(value);
      });
  }

  registerValues(values: object) {
    Object.values(values)
      .filter(isSharedValue)
      .forEach((value) => {
        this.values.add(value);
      });
  }

  drawOnCanvas(canvas: SkCanvas) {
    playback(this.Skia, canvas, this._staticCtx!);
  }
}
