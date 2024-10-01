import { Skia } from "../skia";
import type { SkCanvas } from "../skia/types";
import { JsiDrawingContext } from "../dom/types/DrawingContext";

import { SkiaBaseWebView } from "./SkiaBaseWebView";
import type { SkiaDomViewProps } from "./types";

export class SkiaDomView extends SkiaBaseWebView<SkiaDomViewProps> {
  constructor(props: SkiaDomViewProps) {
    super(props);
  }

  protected renderInCanvas(canvas: SkCanvas): void {
    if (this.props.onSize) {
      const { width, height } = this.getSize();
      this.props.onSize.value = { width, height };
    }
    if (this.props.root) {
      const ctx = new JsiDrawingContext(Skia, canvas);
      this.props.root.render(ctx);
    }
  }
}
