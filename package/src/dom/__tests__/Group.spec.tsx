import {
  importSkia,
  width,
  height,
  loadImage,
} from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { ImageNode, FillNode, GroupNode } from "../nodes";

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
    const root = new GroupNode({ paint: { color: Skia.Color("lightblue") } });
    root.addChild(new FillNode());

    const clipNode = new GroupNode({ clipRect });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    clipNode.addChild(new ImageNode({ image, src, dst }));
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

    const root = new GroupNode({ clipRRect });
    const { src, dst } = fitRects(
      "cover",
      rect(0, 0, image.width(), image.height()),
      rect(0, 0, size, size)
    );
    root.addChild(new ImageNode({ image, src, dst }));

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("group/clip-rrect.png"));
  });
  /*

  it("Should use a rounded rectangle as a clip", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { rect, rrect } = importSkia();
    expect(image).toBeTruthy();
    const rct = rrect(
      rect(padding, padding, size - padding * 2, size - padding * 2),
      r,
      r
    );
    const surface = drawOnNode(
      <Group clip={rct}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    );
    processResult(surface, docPath("group/clip-rrect.png"));
  });
  it("Should use a path as a clip", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { processTransform2d, Skia } = importSkia();
    expect(image).toBeTruthy();
    const star = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(star).toBeTruthy();
    star.transform(processTransform2d([{ scale: 3 }]));
    const surface = drawOnNode(
      <Group clip={star}>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    );
    processResult(surface, docPath("group/clip-path.png"));
  });
  it("Should invert a clip", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { processTransform2d, Skia } = importSkia();
    expect(image).toBeTruthy();
    const star = Skia.Path.MakeFromSVGString(
      "M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
    )!;
    expect(star).toBeTruthy();
    star.transform(processTransform2d([{ scale: 3 }]));
    const surface = drawOnNode(
      <Group clip={star} invertClip>
        <Image
          image={image}
          x={0}
          y={0}
          width={size}
          height={size}
          fit="cover"
        />
      </Group>
    );
    processResult(surface, docPath("group/invert-clip.png"));
  });
  */
});
