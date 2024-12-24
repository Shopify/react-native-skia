import type { SharedValue } from "react-native-reanimated";

import Rea from "../external/reanimated/ReanimatedProxy";
import type { Skia, SkCanvas } from "../skia/types";

import { DrawingContext } from "./DrawingContext";
import type { Node } from "./Node";
import { draw } from "./Nodes";

export class Container {
  public _root: Node[] = [];
  public unmounted = false;

  private values = new Set<SharedValue<unknown>>();
  private mapperId: number | null = null;

  constructor(public Skia: Skia, private nativeId: number) {}

  get root() {
    return this._root;
  }

  set root(root: Node[]) {
    if (this.mapperId !== null) {
      Rea.stopMapper(this.mapperId);
    } else {
      const { nativeId, Skia } = this;
      Rea.startMapper(() => {
        "worklet";
        const rec = Skia.PictureRecorder();
        const canvas = rec.beginRecording();
        const ctx = new DrawingContext(Skia, canvas);
        root.forEach((node) => {
          draw(ctx, node);
        });
        const picture = rec.finishRecordingAsPicture();
        SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
        SkiaViewApi.requestRedraw(nativeId);
      }, Array.from(this.values));
    }
    this._root = root;
  }

  clear() {
    console.log("clear container");
  }
  redraw() {
    console.log("redraw container");
  }

  getNativeId() {
    return this.nativeId;
  }

  unregisterValues(values: object) {
    Object.values(values)
      .filter(Rea.isSharedValue)
      .forEach((value) => {
        this.values.delete(value);
      });
  }

  registerValues(values: object) {
    Object.values(values)
      .filter(Rea.isSharedValue)
      .forEach((value) => {
        this.values.add(value);
      });
  }

  drawOnCanvas(canvas: SkCanvas) {
    const ctx = new DrawingContext(this.Skia, canvas);
    this.root.forEach((node) => {
      draw(ctx, node);
    });
  }

  draw() {
    // TODO: this can be polyfilled if Reanimated is not installed
    Rea.runOnUI((Skia: Skia, nativeId: number, root: Node[]) => {
      const rec = Skia.PictureRecorder();
      const canvas = rec.beginRecording();
      const ctx = new DrawingContext(Skia, canvas);
      root.forEach((node) => {
        draw(ctx, node);
      });
      const picture = rec.finishRecordingAsPicture();
      SkiaViewApi.setJsiProperty(nativeId, "picture", picture);
    })(this.Skia, this.nativeId, this.root);
  }
}
