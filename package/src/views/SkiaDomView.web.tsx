import { PixelRatio } from "react-native";

import { Skia } from "../skia";
import type { SkCanvas } from "../skia/types";

import { SkiaBaseWebView } from "./SkiaBaseWebView";
import type { SkiaDomViewProps, TouchInfo } from "./types";

const pd = PixelRatio.get();

export class SkiaDomView extends SkiaBaseWebView<SkiaDomViewProps> {
  constructor(props: SkiaDomViewProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas, touches: TouchInfo[]): void {
    if (this.props.onTouch) {
      this.props.onTouch([touches]);
    }
    if (this.props.onSize) {
      const { width, height } = this.getSize();
      this.props.onSize.current = { x: width, y: height };
    }
    if (this.props.root) {
      const paint = Skia.Paint();
      const ctx = {
        canvas,
        paint,
        opacity: 1,
      };
      canvas.save();
      canvas.scale(pd, pd);
      this.props.root.render(ctx);
      canvas.restore();
    }
  }
}
