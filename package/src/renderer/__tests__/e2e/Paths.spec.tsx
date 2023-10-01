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
  it("should accept [0, 1] as trim value", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.moveTo(20, 20);
      path.lineTo(20, 40);
      path.lineTo(40, 20);
      path.trim(0, 1, false);
      return path.toSVGString();
    });
    expect(result).toEqual("M20 20L20 40L40 20");
  });
  it("should accept [0.0001, 1.00001] as trim value", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.moveTo(20, 20);
      path.lineTo(20, 40);
      path.lineTo(40, 20);
      path.trim(0.0001, 1.00001, false);
      return path.toSVGString();
    });
    expect(result).toEqual("M20 20.0048L20 40L40 20");
  });
  it("should accept [0, 1.2] as trim value", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.moveTo(20, 20);
      path.lineTo(20, 40);
      path.lineTo(40, 20);
      path.trim(0, 1.2, false);
      return path.toSVGString();
    });
    expect(result).toEqual("M20 20L20 40L40 20");
  });
  it("interpolation values can overshoot", async () => {
    const result = await surface.eval((Skia) => {
      const path2 = Skia.Path.Make();
      path2.moveTo(0, 0);
      path2.lineTo(20, 20);
      path2.lineTo(20, 40);
      const path = Skia.Path.Make();
      path.moveTo(20, 20);
      path.lineTo(20, 40);
      path.lineTo(40, 20);
      path.trim(0, 1, false);
      return [
        path.interpolate(path2, -1)!.toSVGString(),
        path.interpolate(path2, 0)!.toSVGString(),
        path.interpolate(path2, 0.0001)!.toSVGString(),
        path.interpolate(path2, 1)!.toSVGString(),
        path.interpolate(path2, 1.0001)!.toSVGString(),
        path.interpolate(path2, 1.2)!.toSVGString(),
        path.interpolate(path2, 2)!.toSVGString(),
      ];
    });
    expect(result).toEqual([
      "M-20 -20L20 0L0 60",
      "M0 0L20 20L20 40",
      "M0.002 0.002L20 20.002L20.002 39.998",
      "M20 20L20 40L40 20",
      "M20.002 20.002L20 40.002L40.002 19.998",
      "M24 24L20 44L44 16",
      "M40 40L20 60L60 0",
    ]);
  });
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
  it("typename should be correct", async () => {
    const typename = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      return path.__typename__;
    });
    return expect(typename).toBe("Path");
  });
  it("generate svg properly", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make().lineTo(0, 0);
      const cmds = path.toSVGString();
      return cmds;
    });
    expect(result).toEqual("M0 0L0 0");
  });
  it("generate commands properly", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.lineTo(30, 30);
      const cmds = path.toCmds();
      return cmds;
    });
    expect(result).toEqual([
      [0, 0, 0],
      [1, 30, 30],
    ]);
  });
  it("closePath shouldn't crash", async () => {
    const result = await surface.eval((Skia) => {
      const path = Skia.Path.Make();
      path.moveTo(0, 0).lineTo(1, 0).lineTo(1, 1);
      path.close();
      const cmds = path.toCmds();
      return cmds;
    });
    expect(result).toEqual([[0, 0, 0], [1, 1, 0], [1, 1, 1], [5]]);
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
});
