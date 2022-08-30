import {
  importSkia,
  width,
  height,
  PIXEL_RATIO,
} from "../../renderer/__tests__/setup";
import { PaintStyle } from "../../skia/types";
import { setupSkia } from "../../skia/__tests__/setup";
import { docPath, processResult } from "../../__tests__/setup";
import { CircleNode, GroupNode, PaintNode } from "../nodes";

describe("Paint", () => {
  it("should assign a paint directly", () => {
    const size = width;
    const { surface, canvas } = setupSkia(width, height);
    const { Skia, vec } = importSkia();
    const r = size / 2;

    const root = new GroupNode();

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("lightblue"));
    const circle = new CircleNode({ c: vec(r, r), r, paint });
    root.addChild(circle);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("paint/assignement.png"));
  });
  it("should draw the color fill and strokes properly", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { vec, Skia } = importSkia();
    const strokeWidth = 10 * PIXEL_RATIO;
    const c = vec(width / 2, height / 2);
    const r = (width - strokeWidth) / 2;
    const color = Skia.Color("red");

    const root = new GroupNode({ paint: { color } });

    const circle = new CircleNode({ c, r });
    circle.addPaint(new PaintNode({ color: Skia.Color("lightblue") }));
    circle.addPaint(
      new PaintNode({
        color: Skia.Color("#adbce6"),
        style: PaintStyle.Stroke,
        strokeWidth,
      })
    );
    circle.addPaint(
      new PaintNode({
        color: Skia.Color("#ade6d8"),
        style: PaintStyle.Stroke,
        strokeWidth: strokeWidth / 2,
      })
    );
    root.addChild(circle);
    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("paint/stroke.png"));
  });

  it("should use the opacity property properly", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { vec, Skia } = importSkia();
    const strokeWidth = 30 * PIXEL_RATIO;
    const r = width / 2 - strokeWidth / 2;
    const c = vec(width / 2, height / 2);
    const root = new GroupNode({ paint: { opacity: 0.5 } });

    const c1 = new GroupNode({ paint: { color: Skia.Color("red") } });
    c1.addChild(new CircleNode({ c, r }));
    root.addChild(c1);

    const c2 = new GroupNode({
      paint: {
        color: Skia.Color("lightblue"),
        style: PaintStyle.Stroke,
        strokeWidth,
      },
    });
    c2.addChild(new CircleNode({ c, r }));
    root.addChild(c2);

    const c3 = new GroupNode({
      paint: {
        color: Skia.Color("mint"),
        style: PaintStyle.Stroke,
        strokeWidth: strokeWidth / 2,
      },
    });
    c3.addChild(new CircleNode({ c, r }));
    root.addChild(c3);

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, docPath("paint/opacity.png"));
  });
  /*

const TestRasterization = () => {
  const { usePaintRef, vec } = importSkia();
  const paint = usePaintRef();
  const c = vec(width / 2, height / 2);
  const radius = c.x * 0.95;
  return (
    <>
      <Paint ref={paint}>
        <ColorMatrix
          matrix={[
            1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 18, -7,
          ]}
        >
          <Blur blur={20 * PIXEL_RATIO} />
        </ColorMatrix>
      </Paint>
      <Group layer={paint}>
        <Circle cx={0} cy={c.y} r={radius} color="lightblue" />
        <Circle cx={width} cy={c.y} r={radius} color="lightblue" />
      </Group>
    </>
  );
};

  it("Should use saveLayer() properly", () => {
    const surface = drawOnNode(<TestRasterization />);
    processResult(surface, docPath("group/rasterize.png"));
  });
  */
});
