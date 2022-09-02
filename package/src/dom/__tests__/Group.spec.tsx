import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { FillNode, ImageNode } from "../nodes/drawings";

const size = width;
const padding = 48;
const r = 24;

describe("Group", () => {
  it("should clip rect", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect, fitRects } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipRect = rect(
      padding,
      padding,
      size - padding * 2,
      size - padding * 2
    );

    // Root
    const root = Sk.Group({
      color: Skia.Color("lightblue"),
    });
    root.addChild(new FillNode(Skia));

    const clipNode = Sk.Group({ clip: clipRect });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    clipNode.addChild(new ImageNode(Skia, { image, src, dst }));
    root.addChild(clipNode);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-rect.png"));
  });
  it("should clip rounded rect", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect, fitRects, rrect } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipRRect = rrect(
      rect(padding, padding, size - padding * 2, size - padding * 2),
      r,
      r
    );

    const root = Sk.Group({ clip: clipRRect });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    root.addChild(new ImageNode(Skia, { image, src, dst }));

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-rrect.png"));
  });
  it("Should use a path as a clip", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect, fitRects, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipPath = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(clipPath).toBeTruthy();
    clipPath.transform(processTransform2d([{ scale: 3 }]));

    const root = Sk.Group({ clip: clipPath });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    root.addChild(new ImageNode(Skia, { image, src, dst }));

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-path.png"));
  });
  it("Should invert a clip", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect, fitRects, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipPath = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(clipPath).toBeTruthy();
    clipPath.transform(processTransform2d([{ scale: 3 }]));

    const root = Sk.Group({ clip: clipPath, invertClip: true });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    root.addChild(new ImageNode(Skia, { image, src, dst }));

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/invert-clip.png"));
  });
});
