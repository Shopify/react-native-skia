import type { SkCanvas } from "../skia/types";

import type { DrawingInfo, SkiaDrawViewProps, TouchInfo } from "./types";
import { SkiaBaseWebView } from "./SkiaBaseWebView";

export class SkiaView extends SkiaBaseWebView<SkiaDrawViewProps> {
  constructor(props: SkiaDrawViewProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas, touches: TouchInfo[]): void {
    if (this.props.onDraw) {
      const info: DrawingInfo = {
        height: this.height,
        width: this.width,
        timestamp: Date.now(),
        touches: touches.map((t) => [t]),
      };
      this.props.onDraw(canvas, info);
    }
  }
}
