import { PixelRatio } from "react-native";

import { Skia } from "../skia";
import type { SkCanvas } from "../skia/types";
import { JsiDrawingContext } from "../dom/types/DrawingContext";

import { SkiaBaseWebView } from "./SkiaBaseWebView";
import type { SkiaDomViewProps, TouchInfo } from "./types";

const pd = PixelRatio.get();

export class SkiaDomView extends SkiaBaseWebView<SkiaDomViewProps> {
  private paint = Skia.Paint();

  constructor(props: SkiaDomViewProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas, touches: TouchInfo[]): void {
    if (this.props.onTouch) {
      this.props.onTouch([touches]);
    }
    if (this.props.onSize) {
      const { width, height } = this.getSize();
      this.props.onSize.current = { width, height };
    }
    if (this.props.root) {
      const ctx = new JsiDrawingContext(Skia, canvas);
      canvas.save();
      canvas.scale(pd, pd);
      this.props.root.render(ctx);
      canvas.restore();
    }
  }
}
