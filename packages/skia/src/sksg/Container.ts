import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";
import { HAS_REANIMATED_3 } from "../external/reanimated/renderHelpers";

import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";

const drawOnscreen = (Skia: Skia, nativeId: number, recording: Recording) => {
  "worklet";

  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording();
  //const start = performance.now();

  const ctx = createDrawingContext(Skia, recording.paintPool, canvas);
  replay(ctx, recording.commands);
  const picture = rec.finishRecordingAsPicture();
  //const end = performance.now();
  //console.log("Recording time: ", end - start);
  SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
  rec.dispose();
  picture.dispose();
};

export abstract class Container {
  public root: Node[] = [];
  protected recording: Recording | null = null;

  constructor(protected Skia: Skia, protected nativeId: number) {}

  drawOnCanvas(canvas: SkCanvas) {
    if (!this.recording) {
      throw new Error("No recording to draw");
    }
    const ctx = createDrawingContext(
      this.Skia,
      this.recording.paintPool,
      canvas
    );
    //console.log(this.recording.commands);
    replay(ctx, this.recording.commands);
  }

  abstract redraw(): void;
}

class StaticContainer extends Container {
  constructor(Skia: Skia, nativeId: number) {
    super(Skia, nativeId);
  }

  redraw() {
    const recorder = new Recorder();
    visit(recorder, this.root);
    this.recording = recorder.getRecording();
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

class ReanimatedContainer extends Container {
  private mapperId: number | null = null;

  constructor(Skia: Skia, nativeId: number) {
    super(Skia, nativeId);
  }

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
    const { nativeId, Skia, recording } = this;
    if (animationValues.size > 0) {
      this.mapperId = Rea.startMapper(() => {
        "worklet";
        drawOnscreen(Skia, nativeId, recording!);
      }, Array.from(animationValues));
    }
    Rea.runOnUI(() => {
      "worklet";
      drawOnscreen(Skia, nativeId, recording!);
    })();
  }
}

export const createContainer = (Skia: Skia, nativeId: number) => {
  return HAS_REANIMATED_3 && nativeId !== -1
    ? new ReanimatedContainer(Skia, nativeId)
    : new StaticContainer(Skia, nativeId);
};
