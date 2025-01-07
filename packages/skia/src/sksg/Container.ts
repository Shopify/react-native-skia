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

export interface Container {
  drawOnCanvas(canvas: SkCanvas): void;
  get root(): Node[];
  set root(root: Node[]);
  redraw(): void;
  registerAnimationValues(values: object): void;
  unregisterAnimationValues(values: object): void;
}

abstract class BaseContainer implements Container {
  protected _root: Node[] = [];
  protected _recording: Recording | null = null;

  constructor(public Skia: Skia, protected nativeId: number) {}

  get root() {
    return this._root;
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

  abstract redraw(): void;
  abstract registerAnimationValues(values: object): void;
  abstract unregisterAnimationValues(values: object): void;
}

class StaticContainer extends BaseContainer {
  set root(root: Node[]) {
    this._root = root;
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = createRecording(recorder.commands);
    this.redraw();
  }

  redraw() {
    const isOnscreen = this.nativeId !== -1;
    if (isOnscreen) {
      drawOnscreen(this.Skia, this.nativeId, this._recording!);
    }
  }

  getNativeId() {
    return this.nativeId;
  }

  unregisterAnimationValues(_values: object) {
    // Nothing to do here
  }

  registerAnimationValues(_values: object) {
    // Nothing to do here
  }
}

class ReanimatedContainer extends BaseContainer {
  private values = new Set<SharedValue<unknown>>();
  private mapperId: number | null = null;

  constructor(Skia: Skia, nativeId: number) {
    super(Skia, nativeId);
  }

  set root(root: Node[]) {
    const isOnscreen = this.nativeId !== -1;
    if (isOnscreen) {
      if (this.mapperId !== null) {
        Rea.stopMapper(this.mapperId);
      }
      const { nativeId, Skia, _recording } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, _recording!);
      }, Array.from(this.values));
    }
    this._root = root;
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = createRecording(recorder.commands);
  }

  redraw() {
    const isOnscreen = this.nativeId !== -1;
    if (isOnscreen) {
      const { nativeId, Skia, _recording } = this;
      Rea.runOnUI(() => {
        drawOnscreen(Skia, nativeId, _recording!);
      })();
    }
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
}

export const createContainer = (Skia: Skia, nativeId: number) => {
  return HAS_REANIMATED_3
    ? new ReanimatedContainer(Skia, nativeId)
    : new StaticContainer(Skia, nativeId);
};
