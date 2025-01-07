import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import type { Node } from "./Node";
import { isSharedValue } from "./utils";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";
import { createRecording, type Recording } from "./Recorder/Recording";

const drawOnscreen = (Skia: Skia, nativeId: number, recording: Recording) => {
  "worklet";
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  // const start = performance.now();

  // TODO: because the pool is not a shared value here, it is copied on every frame
  const ctx = createDrawingContext(Skia, recording.paintPool, canvas);
  //console.log(recording.commands);
  replay(ctx, recording.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

export class Container {
  private _root: Node[] = [];
  private _recording: Recording | null = null;
  public unmounted = false;

  private values = new Set<SharedValue<unknown>>();
  private mapperId: number | null = null;

  constructor(public Skia: Skia, private nativeId: number) {
    console.log({ HAS_REANIMATED_3 });
  }

  get root() {
    return this._root;
  }

  set root(root: Node[]) {
    const isOnscreen = this.nativeId !== -1;
    this._root = root;
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = createRecording(recorder.commands);
    if (isOnscreen && HAS_REANIMATED_3) {
      if (this.mapperId !== null) {
        Rea.stopMapper(this.mapperId);
      }
      const { nativeId, Skia, _recording } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, _recording!);
      }, Array.from(this.values));
    }
  }

  clear() {
    console.log("clear container");
  }

  redraw() {
    const isOnscreen = this.nativeId !== -1;
    if (isOnscreen) {
      const { nativeId, Skia, _recording } = this;
      if (HAS_REANIMATED_3) {
        Rea.runOnUI(() => {
          drawOnscreen(Skia, nativeId, _recording!);
        })();
      } else {
        drawOnscreen(Skia, nativeId, _recording!);
      }
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
    if (!this._recording) {
      throw new Error("No recording to draw");
    }
    const ctx = createDrawingContext(
      this.Skia,
      this._recording.paintPool,
      canvas
    );
    //console.log(this._recording);
    replay(ctx, this._recording.commands);
  }
}
