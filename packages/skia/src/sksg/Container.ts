import { type SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import {
  HAS_REANIMATED,
  HAS_REANIMATED_3,
} from "../external/reanimated/renderHelpers";

import type { StaticContext } from "./StaticContext";
import { createStaticContext } from "./StaticContext";
import { createDrawingContext } from "./DrawingContext";
import type { Node } from "./nodes";
import { draw, isSharedValue } from "./nodes";
import type { Command } from "./Recorder/Core";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { DrawingContext } from "./Recorder/DrawingContext";
import { replay } from "./Recorder/Player";

const drawOnscreen = (
  Skia: Skia,
  nativeId: number,
  root: Node[],
  staticCtx: StaticContext
) => {
  "worklet";
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  const start = performance.now();
  const ctx = createDrawingContext(Skia, canvas, staticCtx);
  root.forEach((node) => {
    draw(ctx, node);
  });
  const picture = rec.finishRecordingAsPicture();
  const end = performance.now();
  console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

export class Container {
  private _root: Node[] = [];
  private _staticCtx: StaticContext | null = null;
  private _recording: Command[] | null = null;
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
        drawOnscreen(Skia, nativeId, root, _staticCtx!);
      }, Array.from(this.values));
    }
    this._root = root;
    this._staticCtx = createStaticContext(this.Skia);
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = recorder.commands;
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
      const { nativeId, Skia, root, _staticCtx } = this;
      Rea.runOnUI(() => {
        drawOnscreen(Skia, nativeId, root, _staticCtx!);
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
    const ctx = new DrawingContext(this.Skia, canvas);
    replay(ctx, this._recording!);
  }
}
