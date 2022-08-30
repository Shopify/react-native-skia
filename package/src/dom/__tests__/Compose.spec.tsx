import { fitRects } from "../../renderer";
import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { TileMode } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { BlurImageFilterNode, GroupNode, ImageNode } from "../nodes";
import { MatrixColorFilterNode } from "../nodes/paint/ColorFilters";

describe("Compose", () => {
  it("should compose image filters", () => {
    const size = width;
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    const root = new GroupNode();

    const img = new ImageNode({ image, src, dst });
    root.addChild(img);

    const colorMatrix = [
      -0.578, 0.99, 0.588, 0, 0, 0.469, 0.535, -0.003, 0, 0, 0.015, 1.69,
      -0.703, 0, 0, 0, 0, 0, 1, 0,
    ];
    const cf = new MatrixColorFilterNode({ colorMatrix });
    root.addColorFilter(cf);

    const blur = new BlurImageFilterNode({
      sigmaX: 10,
      sigmaY: 10,
      mode: TileMode.Decal,
    });
    root.addImageFilter(blur);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("image-filters/composing.png"), true);
  });
});
