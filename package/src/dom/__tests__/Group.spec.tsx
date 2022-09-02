import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { FillNode } from "../nodes/drawings";

const size = width;
const padding = 48;
const r = 24;

describe("Group", () => {
  it("should clip rect", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect } = importSkia();
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
    clipNode.addChild(
      Sk.Image({ image, fit: "cover", x: 0, y: 0, width: size, height: size })
    );
    root.addChild(clipNode);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-rect.png"));
  });
  it("should clip rounded rect", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, rect, rrect } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipRRect = rrect(
      rect(padding, padding, size - padding * 2, size - padding * 2),
      r,
      r
    );
    const root = Sk.Group({ clip: clipRRect });
    root.addChild(
      Sk.Image({ image, fit: "cover", x: 0, y: 0, width: size, height: size })
    );
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-rrect.png"));
  });
  it("Should use a path as a clip", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipPath = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(clipPath).toBeTruthy();
    clipPath.transform(processTransform2d([{ scale: 3 }]));

    const root = Sk.Group({ clip: clipPath });

    root.addChild(
      Sk.Image({ image, fit: "cover", x: 0, y: 0, width: size, height: size })
    );

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-path.png"));
  });
  it("Should invert a clip", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, processTransform2d } = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const clipPath = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(clipPath).toBeTruthy();
    clipPath.transform(processTransform2d([{ scale: 3 }]));

    const root = Sk.Group({ clip: clipPath, invertClip: true });
    root.addChild(
      Sk.Image({ image, fit: "cover", x: 0, y: 0, width: size, height: size })
    );
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/invert-clip.png"));
  });
});
