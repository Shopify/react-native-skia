import { type SharedValue } from "react-native-reanimated";

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

const drawOnscreen = (
  Skia: Skia,
  nativeId: number,
  recording: SharedValue<Recording | null>
) => {
  "worklet";
  if (!recording.value) {
    return;
  }
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  // const start = performance.now();

  // TODO: because the pool is not a shared value here, it is copied on every frame
  const ctx = createDrawingContext(Skia, recording.value.paintPool, canvas);
  //console.log(recording.commands);
  replay(ctx, recording.value.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

export interface Container {
  drawOnCanvas(canvas: SkCanvas): void;
  get root(): Node[];
  set root(root: Node[]);
  redraw(): void;
  registerAnimationValues(values: object): void;
  unregisterAnimationValues(values: object): void;
}

class StaticContainer implements Container {
  protected _root: Node[] = [];
  protected _recording: Recording | null = null;

  constructor(private Skia: Skia, private nativeId: number) {}

  get root() {
    return this._root;
  }

  set root(root: Node[]) {
    this._root = root;
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = createRecording(recorder.commands);
    this.redraw();
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

  redraw() {
    const rec = this.Skia.PictureRecorder();
    const canvas = rec.beginRecording();
    this.drawOnCanvas(canvas);
    const picture = rec.finishRecordingAsPicture();
    SkiaViewApi.setJsiProperty(this.nativeId, "picture", picture);
  }

  unregisterAnimationValues(_values: object) {
    // Nothing to do here
  }

  registerAnimationValues(_values: object) {
    // Nothing to do here
  }
}

class ReanimatedContainer implements Container {
  private _root: Node[] = [];
  protected _recording: SharedValue<Recording | null>;

  private values = new Set<SharedValue<unknown>>();
  private mapperId: number | null = null;

  constructor(private Skia: Skia, private nativeId: number) {
    this._recording = Rea.makeMutable<Recording | null>(null);
  }

  get root() {
    return this._root;
  }

  set root(root: Node[]) {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    const { nativeId, Skia, _recording } = this;
    this.mapperId = Rea.startMapper(() => {
      "worklet";
      drawOnscreen(Skia, nativeId, _recording!);
    }, Array.from(this.values));
    this._root = root;
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording.value = createRecording(recorder.commands);
  }

  redraw() {
    const { nativeId, Skia, _recording } = this;
    Rea.runOnUI(() => {
      drawOnscreen(Skia, nativeId, _recording!);
    })();
  }

  unregisterAnimationValues(values: object) {
    Object.values(values)
      .filter(isSharedValue)
      .forEach((value) => {
        this.values.delete(value);
      });
  }

  registerAnimationValues(values: object) {
    Object.values(values)
      .filter(isSharedValue)
      .forEach((value) => {
        this.values.add(value);
      });
  }

  drawOnCanvas(_canvas: SkCanvas) {
    // do nothing
  }
}

export const createContainer = (Skia: Skia, nativeId: number) => {
  return HAS_REANIMATED_3 && nativeId !== -1
    ? new ReanimatedContainer(Skia, nativeId)
    : new StaticContainer(Skia, nativeId);
};
