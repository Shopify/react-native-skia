import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";

export interface Container {
  drawOnCanvas(canvas: SkCanvas): void;
  set root(root: Node[]);
  redraw(): void;
}

class StaticContainer implements Container {
  public root: Node[] = [];
  protected _recording: Recording | null = null;

  constructor(private Skia: Skia, private nativeId: number) {}

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
    const recorder = new Recorder();
    visit(recorder, this.root);
    this._recording = recorder.getRecording();
    const isOnScreen = this.nativeId !== -1;
    if (isOnScreen) {
      const rec = this.Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      this.drawOnCanvas(canvas);
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(this.nativeId, "picture", picture);
    }
  }
}

const drawOnscreen = (Skia: Skia, nativeId: number, recording: Recording) => {
  "worklet";

  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  // const start = performance.now();

  const ctx = createDrawingContext(Skia, recording.paintPool, canvas);
  //console.log(recording.commands);
  replay(ctx, recording.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
};

class ReanimatedContainer implements Container {
  protected recording: Recording | null = null;
  private mapperId: number | null = null;
  public root: Node[] = [];

  constructor(private Skia: Skia, private nativeId: number) {}

  redraw() {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    }
    const recorder = new Recorder();
    visit(recorder, this.root);
    const record = recorder.getRecording();
    const { animationValues } = record;
    this.recording = {
      commands: record.commands,
      paintPool: record.paintPool,
    };
    if (animationValues.size > 0) {
      const { nativeId, Skia, recording } = this;
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, recording!);
      }, Array.from(animationValues));
    }
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
