import React from "react";

import { surface, importSkia } from "../setup";
import { Fill, Group, Path, Rect } from "../../components";
import { checkImage, docPath } from "../../../__tests__/setup";
import type { Skia } from "../../../skia/types";
import { PaintStyle } from "../../../skia/types";

const star = (Skia: Skia) => {
  const R = 115.2;
  const C = 128.0;
  const path = Skia.Path.Make();
  path.moveTo(C + R, C);
  for (let i = 1; i < 8; ++i) {
    const a = 2.6927937 * i;
    path.lineTo(C + R * Math.cos(a), C + R * Math.sin(a));
  }
  return path;
};

describe("Paths", () => {
  it("should add a path", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      const path2 = Skia.Path.Make();
      path.moveTo(20, 20);
      path.lineTo(20, 40);
      path.lineTo(40, 20);
      path2.moveTo(60, 60);
      path2.lineTo(80, 60);
      path2.lineTo(80, 40);
      const results: string[] = [];
      for (let j = 0; j < 2; j++) {
        const p = path.copy().addPath(path2, undefined, j === 1);
        results.push(p.toSVGString());
      }
      return results;
    });
    expect(result).toEqual([
      "M20 20L20 40L40 20M60 60L80 60L80 40",
      "M20 20L20 40L40 20L60 60L80 60L80 40",
    ]);
  });
  it("should draw a pattern properly", async () => {
    const { Skia, translate } = importSkia();

    const center = { x: 492 / 2, y: 757 / 2 };
    const scale = 0.325;
    const strokeWidth = 10;

    const c1 = "#204E71";
    const c2 = "#4A759B";

    const whitePaint = Skia.Paint();
    whitePaint.setAntiAlias(true);
    whitePaint.setColor(Skia.Color("white"));

    const strokePaint = Skia.Paint();
    whitePaint.setAntiAlias(true);
    strokePaint.setStyle(PaintStyle.Stroke);
    strokePaint.setStrokeWidth(strokeWidth);

    const borders = Skia.Path.MakeFromSVGString(
      // eslint-disable-next-line max-len
      "M447.955 756.37H44.699C20.5664 756.37 0.820374 736.624 0.820374 712.492V44.8242C0.820374 20.6898 20.5664 0.945557 44.699 0.945557H447.955C472.088 0.945557 491.834 20.6898 491.834 44.8242V712.492C491.834 736.624 472.088 756.37 447.955 756.37Z"
    )!;

    const bg =
      // eslint-disable-next-line max-len
      "M423.554 40.0679H69.3443C51.3334 40.0679 36.6796 54.7199 36.6796 72.7307V685.881C36.6796 703.892 51.3334 718.546 69.3443 718.546H423.554C441.565 718.546 456.219 703.892 456.219 685.881V72.7307C456.219 54.7199 441.565 40.0679 423.554 40.0679Z";
    const Circles = () => {
      const c = 12;
      const delta = 100 / c;
      return (
        <>
          {new Array(c).fill(0).map((_, i) => {
            const r2 = i * delta;
            const path = Skia.Path.Make();
            path.addCircle(0, 0, r2);
            return (
              <Path
                key={i}
                path={path}
                style="stroke"
                strokeWidth={strokeWidth}
                color={i % 2 === 0 ? c1 : c2}
              />
            );
          })}
        </>
      );
    };

    const img = await surface.draw(
      <Group transform={[{ scale }]}>
        <Path path={borders} color="white" />
        <Path path={bg} color={c1} />
        {new Array(4).fill(0).map((_, i) => {
          const delta = i * strokeWidth;
          const rect = {
            x: -delta,
            y: -delta,
            width: center.x * 2 + delta * 2,
            height: center.y * 2 + delta * 2,
          };
          const path = Skia.Path.Make();
          path.addArc(rect, 0, 360).close();
          return (
            <Group key={i} origin={center} transform={[{ scale: 0.6 }]}>
              <Rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                color={i % 2 === 0 ? c1 : c2}
                style="stroke"
                strokeWidth={strokeWidth}
              />
              <Path
                path={path}
                color={i % 2 === 0 ? c1 : c2}
                style="stroke"
                strokeWidth={strokeWidth}
              />
            </Group>
          );
        })}
        <Group transform={translate(center)}>
          <Group transform={[{ translateY: -200 }]}>
            <Circles />
          </Group>
          <Group transform={[{ translateY: 200 }]}>
            <Circles />
          </Group>
          <Group transform={[{ translateX: -100 }]}>
            <Circles />
          </Group>
          <Group transform={[{ translateX: 100 }]}>
            <Circles />
          </Group>
        </Group>
      </Group>
    );
    checkImage(img, "snapshots/paths/pattern.png");
  });
  it("should be possible to call dispose on a path", async () => {
    await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.moveTo(20, 20).lineTo(20, 40).lineTo(40, 20);
      path.dispose();
      return path;
    });
  });
  it("Path with default fillType", async () => {
    const { Skia } = importSkia();
    const path = star(Skia);
    const img = await surface.draw(
      <>
        <Fill color="white" />
        <Path path={path} style="stroke" strokeWidth={4} color="#3EB489" />
        <Path path={path} color="lightblue" />
      </>
    );
    checkImage(img, docPath("paths/default-filltype.png"));
  });
  it("Path with even odd fillType", async () => {
    const { Skia } = importSkia();
    const path = star(Skia);
    const img = await surface.draw(
      <>
        <Fill color="white" />
        <Path path={path} style="stroke" strokeWidth={4} color="#3EB489" />
        <Path path={path} color="lightblue" fillType="evenOdd" />
      </>
    );
    checkImage(img, docPath("paths/evenodd-filltype.png"));
  });
  it("Should interpolate paths", async () => {
    // https://fiddle.skia.org/c/@Path_isInterpolatable
    const { Skia } = importSkia();
    const path = Skia.Path.Make();
    const path2 = Skia.Path.Make();
    path.moveTo(20, 20);
    path.lineTo(40, 40);
    path.lineTo(20, 20);
    path.lineTo(40, 40);
    path.close();
    path2.addRect(Skia.XYWHRect(20, 20, 20, 20));
    expect(path.isInterpolatable(path2)).toBe(true);
    const result = path2.interpolate(path, 0.5)!;
    expect(result).toBeDefined();
    const img = await surface.draw(
      <Path path={result} style="stroke" strokeWidth={3} />
    );
    checkImage(img, "snapshots/paths/interpolation1.png");
  });
  it("Should interpolate paths with a pre-allocated Path", async () => {
    // https://fiddle.skia.org/c/@Path_isInterpolatable
    const { Skia } = importSkia();
    const path = Skia.Path.Make();
    const path2 = Skia.Path.Make();
    path.moveTo(20, 20);
    path.lineTo(40, 40);
    path.lineTo(20, 20);
    path.lineTo(40, 40);
    path.close();
    path2.addRect(Skia.XYWHRect(20, 20, 20, 20));
    expect(path.isInterpolatable(path2)).toBe(true);
    const result = Skia.Path.Make();
    Skia.Path.MakeFromPathInterpolation(path2, path, 0.5, result);
    const img = await surface.draw(
      <Path path={result} style="stroke" strokeWidth={3} />
    );
    checkImage(img, "snapshots/paths/interpolation1.png");
  });
  it("Shouldn't interpolate paths with a pre-allocated Path", async () => {
    // https://fiddle.skia.org/c/@Path_isInterpolatable
    const { Skia } = importSkia();
    const path = Skia.Path.Make();
    const path2 = Skia.Path.Make();
    path.moveTo(20, 20);
    path.lineTo(40, 40);
    path.lineTo(20, 20);
    path.lineTo(40, 40);
    path.lineTo(0, 0);
    path.close();
    path2.addRect(Skia.XYWHRect(20, 20, 20, 20));
    const result = Skia.Path.Make();
    const success = Skia.Path.MakeFromPathInterpolation(
      path2,
      path,
      0.5,
      result
    );
    expect(success).toBe(false);
    const img = await surface.draw(
      <Path path={result} style="stroke" strokeWidth={3} />
    );
    checkImage(img, "snapshots/paths/emptyPath.png");
  });
});
