import { Skia } from "../skia";
import type { SkCanvas } from "../skia/types";
import { JsiDrawingContext } from "../dom/types/DrawingContext";
import { isValue } from "../renderer/processors/Animations/Animations";

import { SkiaBaseWebView } from "./SkiaBaseWebView";
import type { SkiaDomViewProps, TouchInfo } from "./types";

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
      if (isValue(this.props.onSize)) {
        this.props.onSize.current = { width, height };
      } else {
        this.props.onSize.value = { width, height };
      }
    }
    if (this.props.root) {
      const ctx = new JsiDrawingContext(Skia, canvas);
      this.props.root.render(ctx);
    }
  }
}
