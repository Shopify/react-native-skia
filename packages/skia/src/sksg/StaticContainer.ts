import type { SharedValue } from "react-native-reanimated";

import type { Skia, SkCanvas, SkSize } from "../skia/types";

import type { Node } from "./Node";
import type { Recording } from "./Recorder/Recorder";
import { Recorder } from "./Recorder/Recorder";
import { visit } from "./Recorder/Visitor";
import { replay } from "./Recorder/Player";
import { createDrawingContext } from "./Recorder/DrawingContext";

import "../views/api";

export abstract class Container {
  private _root: Node[] = [];
  protected recording: Recording | null = null;
  protected unmounted = false;

  constructor(protected Skia: Skia) {}

  get root() {
    return this._root;
  }

  set root(value: Node[]) {
    this._root = value;
  }

  mount() {
    this.unmounted = false;
  }

  unmount() {
    this.unmounted = true;
  }

  drawOnCanvas(canvas: SkCanvas) {
    if (!this.recording) {
      throw new Error("No recording to draw");
    }
    const ctx = createDrawingContext(
      this.Skia,
      this.recording.paintPool,
      canvas
    );
    replay(ctx, this.recording.commands);
  }

  abstract redraw(): void;
}

export class StaticContainer extends Container {
  constructor(
    Skia: Skia,
    private nativeId: number,
    private onSize?: SharedValue<SkSize>
  ) {
    super(Skia);
  }

  redraw() {
    const recorder = new Recorder();
    visit(recorder, this.root);
    this.recording = recorder.getRecording();
    const isOnScreen = this.nativeId !== -1;
    if (isOnScreen) {
      if (this.onSize) {
        const size = SkiaViewApi.size(this.nativeId);
        if (
          size.width !== this.onSize.value.width ||
          size.height !== this.onSize.value.height
        ) {
          this.onSize.value = size;
        }
      }
      const rec = this.Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      this.drawOnCanvas(canvas);
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(this.nativeId, "picture", picture);
    }
  }
}
