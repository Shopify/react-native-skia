import { type SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";

const drawOnscreen = (
  Skia: Skia,
  nativeId: number,
  //
  // TODO: because the pool is not a shared value here, it is copied on every frame
  // Also animation value set doesn't seen to be shared here
  recording: SharedValue<Recording | null>
) => {
  "worklet";
  if (!recording.value) {
    return;
  }
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  // const start = performance.now();

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
  set root(root: Node[]);
  redraw(): void;
}

class StaticContainer implements Container {
  protected _recording: Recording | null = null;

  constructor(private Skia: Skia, private nativeId: number) {}

  set root(root: Node[]) {
    const recorder = new Recorder();
    visit(recorder, root);
    this._recording = recorder.getRecording();
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
}

class ReanimatedContainer implements Container {
  private recording: SharedValue<Recording | null>;

  private mapperId: number | null = null;

  constructor(private Skia: Skia, private nativeId: number) {
    this.recording = Rea.makeMutable<Recording | null>(null);
  }

  set root(root: Node[]) {
    const recorder = new Recorder();
    visit(recorder, root);
    const record = recorder.getRecording();
    const { animationValues } = record;
    this.recording.value = {
      commands: record.commands,
      paintPool: record.paintPool,
    };

    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }

    if (animationValues.size > 0) {
      const { nativeId, Skia, recording } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, recording!);
      }, Array.from(animationValues));
    }
  }

  redraw() {
    const { nativeId, Skia, recording } = this;
    Rea.runOnUI(() => {
      drawOnscreen(Skia, nativeId, recording);
    })();
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
