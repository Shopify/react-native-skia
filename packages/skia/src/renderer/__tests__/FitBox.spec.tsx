import fs from "fs";
import nodePath from "path";

import React from "react";

import { processResult } from "../../__tests__/setup";
import { Circle, FitBox, Rect, Image, Group, fitbox } from "../components";

import { drawOnNode, width, height, importSkia } from "./setup";

describe("FitBox", () => {
  it("Should scale the rectangle in half", async () => {
    const { Skia } = importSkia();
    const surface = await drawOnNode(
      <FitBox
        src={Skia.XYWHRect(0, 0, width, height)}
        dst={Skia.XYWHRect(width / 4, height / 4, width / 2, height / 2)}
      >
        <Rect x={0} y={0} width={width} height={height} color="lightblue" />
      </FitBox>
    );
    processResult(surface, "snapshots/drawings/lightblue-rect.png");
  });
  it("Should take the bottom right quarter of the circle and scale to the full canvas", async () => {
    const { Skia } = importSkia();
    const surface = await drawOnNode(
      <FitBox
        src={Skia.XYWHRect(width / 2, height / 2, width / 2, height / 2)}
        dst={Skia.XYWHRect(0, 0, width, height)}
      >
        <Circle
          r={width / 2}
          cx={width / 2}
          cy={height / 2}
          color="lightblue"
        />
      </FitBox>
    );
    processResult(surface, "snapshots/drawings/lightblue-quarter-circle.png");
  });
  it("Should scale the image (1)", async () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          nodePath.resolve(__dirname, "../../skia/__tests__/assets/box.png")
        )
      )
    )!;
    const surface = await drawOnNode(
      <Group
        transform={fitbox(
          "cover",
          rect(0, 0, image.width(), image.height()),
          rect(0, 0, width, height)
        )}
      >
        <Image
          image={image}
          x={0}
          y={0}
          width={image.width()}
          height={image.height()}
        />
      </Group>
    );
    processResult(surface, "snapshots/drawings/scaled-image.png");
  });
  it("Should scale the image (2)", async () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          nodePath.resolve(__dirname, "../../skia/__tests__/assets/box.png")
        )
      )
    )!;
    const screen = rect(256, 128, 256, 512);
    const surface = await drawOnNode(
      <Group>
        <Image
          image={image}
          x={0}
          y={0}
          width={image.width()}
          height={image.height()}
          transform={fitbox(
            "cover",
            rect(0, 0, image.width(), image.height()),
            screen
          )}
        />
        <Rect rect={screen} color="green" opacity={0.5} />
      </Group>
    );
    processResult(surface, "snapshots/drawings/scaled-image2.png");
  });
  it("Should rotate and scale the image", async () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          nodePath.resolve(__dirname, "../../skia/__tests__/assets/box2.png")
        )
      )
    )!;
    const screen = rect(256, 128, 256, 512);
    const imageRect = rect(0, 0, image.width(), image.height());
    const transform = fitbox("contain", imageRect, screen, 270);
    const surface = await drawOnNode(
      <Group>
        <Image
          image={image}
          x={0}
          y={0}
          width={image.width()}
          height={image.height()}
          fit="none"
          transform={transform}
        />
        <Rect rect={screen} color="green" opacity={0.5} />
      </Group>
    );
    processResult(surface, "snapshots/drawings/rotated-scaled-image.png");
  });

  test("transform simple rectangle with fitbox fill", () => {
    const { Skia, processTransform2d } = importSkia();

    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(10, 0);
    path.lineTo(10, 10);
    path.lineTo(0, 10);
    path.close();

    const src = path.computeTightBounds();
    const dst = Skia.XYWHRect(0, 0, 20, 20);
    const transform = fitbox("fill", src, dst);
    const c = path.copy().transform(processTransform2d(transform));
    const newBounds = c.computeTightBounds();
    expect(newBounds.x).toBe(0);
    expect(newBounds.y).toBe(0);
    expect(newBounds.width).toBe(20);
    expect(newBounds.height).toBe(20);
  });

  test("transform simple rectangle with fitbox contain", () => {
    const { Skia, processTransform2d } = importSkia();

    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(10, 0);
    path.lineTo(10, 5);
    path.lineTo(0, 5);
    path.close();

    const src = path.computeTightBounds();

    const dst = Skia.XYWHRect(0, 0, 20, 20);
    const matrix = fitbox("contain", src, dst);

    path.transform(processTransform2d(matrix));
    const newBounds = path.computeTightBounds();
    expect(newBounds.x).toBe(0);
    expect(newBounds.y).toBe(5);
    expect(newBounds.width).toBe(20);
    expect(newBounds.height).toBe(10);
  });

  test("transform line with fitbox scale", () => {
    const { Skia, processTransform2d } = importSkia();
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(5, 5);

    const src = path.computeTightBounds();
    const dst = Skia.XYWHRect(0, 0, 10, 10);
    const matrix = fitbox("fill", src, dst);
    path.transform(processTransform2d(matrix));
    const newBounds = path.computeTightBounds();
    expect(newBounds.x).toBe(0);
    expect(newBounds.y).toBe(0);
    expect(newBounds.width).toBe(10);
    expect(newBounds.height).toBe(10);
  });

  test("transform with offset destination", () => {
    const { Skia, processTransform2d } = importSkia();
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(4, 0);
    path.lineTo(4, 4);
    path.lineTo(0, 4);
    path.close();

    const src = path.computeTightBounds();
    const dst = Skia.XYWHRect(10, 20, 8, 8);
    const matrix = fitbox("fill", src, dst);
    path.transform(processTransform2d(matrix));
    const newBounds = path.computeTightBounds();
    expect(newBounds.x).toBe(10);
    expect(newBounds.y).toBe(20);
    expect(newBounds.width).toBe(8);
    expect(newBounds.height).toBe(8);
  });

  test("transform with cover fit mode", () => {
    const { Skia, processTransform2d } = importSkia();
    const path = Skia.Path.Make();
    path.moveTo(0, 0);
    path.lineTo(10, 0);
    path.lineTo(10, 5);
    path.lineTo(0, 5);
    path.close();

    const src = path.computeTightBounds();
    const dst = Skia.XYWHRect(0, 0, 10, 10);
    const matrix = fitbox("cover", src, dst);
    path.transform(processTransform2d(matrix));
    const newBounds = path.computeTightBounds();
    expect(newBounds.x).toBe(-5);
    expect(newBounds.y).toBe(0);
    expect(newBounds.width).toBe(20);
    expect(newBounds.height).toBe(10);
  });

  describe("rect2rect", () => {
    test("basic scaling from unit square to double size", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 1, 1);
      const dst = Skia.XYWHRect(0, 0, 2, 2);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 0 },
        { translateY: 0 },
        { scaleX: 2 },
        { scaleY: 2 },
      ]);
    });

    test("scaling with translation", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 10, 10);
      const dst = Skia.XYWHRect(5, 5, 20, 20);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 5 },
        { translateY: 5 },
        { scaleX: 2 },
        { scaleY: 2 },
      ]);
    });

    test("scaling with non-zero source origin", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(10, 10, 20, 20);
      const dst = Skia.XYWHRect(0, 0, 40, 40);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: -20 },
        { translateY: -20 },
        { scaleX: 2 },
        { scaleY: 2 },
      ]);
    });

    test("shrinking transformation", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 100, 100);
      const dst = Skia.XYWHRect(0, 0, 50, 50);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 0 },
        { translateY: 0 },
        { scaleX: 0.5 },
        { scaleY: 0.5 },
      ]);
    });

    test("non-uniform scaling", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 10, 20);
      const dst = Skia.XYWHRect(0, 0, 30, 40);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 0 },
        { translateY: 0 },
        { scaleX: 3 },
        { scaleY: 2 },
      ]);
    });

    test("transformation with offset source and destination", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(5, 10, 15, 20);
      const dst = Skia.XYWHRect(50, 100, 30, 40);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 40 },
        { translateY: 80 },
        { scaleX: 2 },
        { scaleY: 2 },
      ]);
    });

    test("identity transformation", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(10, 20, 30, 40);
      const dst = Skia.XYWHRect(10, 20, 30, 40);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 0 },
        { translateY: 0 },
        { scaleX: 1 },
        { scaleY: 1 },
      ]);
    });

    test("fractional scaling", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 3, 4);
      const dst = Skia.XYWHRect(0, 0, 1.5, 2);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 0 },
        { translateY: 0 },
        { scaleX: 0.5 },
        { scaleY: 0.5 },
      ]);
    });

    test("complex transformation with negative coordinates", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(-10, -20, 20, 30);
      const dst = Skia.XYWHRect(10, 5, 40, 60);
      const result = rect2rect(src, dst);

      expect(result).toEqual([
        { translateX: 30 },
        { translateY: 45 },
        { scaleX: 2 },
        { scaleY: 2 },
      ]);
    });

    test("very small dimensions", () => {
      const { Skia, rect2rect } = importSkia();
      const src = Skia.XYWHRect(0, 0, 0.1, 0.1);
      const dst = Skia.XYWHRect(0, 0, 1, 1);
      const result = rect2rect(src, dst);

      expect(result[0]).toEqual({ translateX: 0 });
      expect(result[1]).toEqual({ translateY: 0 });
      expect(result[2].scaleX).toBeCloseTo(10, 5);
      expect(result[3].scaleY).toBeCloseTo(10, 5);
    });
  });

  describe("fitRects", () => {
    test("fill mode - source fills destination completely", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(10, 20, 200, 100);
      const result = fitRects("fill", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      });
      expect(result.dst).toEqual({
        x: 10,
        y: 20,
        width: 200,
        height: 100,
      });
    });

    test("contain mode - source fits inside destination maintaining aspect ratio", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(0, 0, 200, 200);
      const result = fitRects("contain", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 50,
      });
      // Should maintain aspect ratio 2:1, so width=200, height=100, centered
      expect(result.dst.width).toBe(200);
      expect(result.dst.height).toBe(100);
      expect(result.dst.x).toBe(0);
      expect(result.dst.y).toBe(50); // Centered vertically
    });

    test("cover mode - source covers destination completely", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(0, 0, 100, 100);
      const result = fitRects("cover", srcRect, dstRect);

      // Source should be cropped to fit destination aspect ratio
      expect(result.src.width).toBe(50); // Cropped to maintain 1:1 aspect ratio
      expect(result.src.height).toBe(50);
      expect(result.src.x).toBe(25); // Centered horizontally in original rect
      expect(result.src.y).toBe(0);

      expect(result.dst).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    test("fitWidth mode - fits to width, adjusts height", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(0, 0, 200, 200);
      const result = fitRects("fitWidth", srcRect, dstRect);

      // Source is scaled to fit the destination width aspect ratio
      expect(result.src.width).toBe(100);
      expect(result.src.height).toBe(100);
      expect(result.src.x).toBe(0);
      expect(result.src.y).toBe(-25); // Extends beyond original rect to maintain aspect ratio

      // Destination uses the full destination rectangle
      expect(result.dst.width).toBe(200);
      expect(result.dst.height).toBe(200);
      expect(result.dst.x).toBe(0);
      expect(result.dst.y).toBe(0);
    });

    test("fitHeight mode - fits to height, adjusts width", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(0, 0, 200, 200);
      const result = fitRects("fitHeight", srcRect, dstRect);

      // Source is cropped to fit the destination height aspect ratio
      expect(result.src.width).toBe(50);
      expect(result.src.height).toBe(50);
      expect(result.src.x).toBe(25); // Centered horizontally in original rect
      expect(result.src.y).toBe(0);

      // Destination uses the full destination rectangle
      expect(result.dst.width).toBe(200);
      expect(result.dst.height).toBe(200);
      expect(result.dst.x).toBe(0);
      expect(result.dst.y).toBe(0);
    });

    test("none mode - uses minimum dimensions", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 50);
      const dstRect = Skia.XYWHRect(0, 0, 80, 120);
      const result = fitRects("none", srcRect, dstRect);

      // Should use minimum of source and destination dimensions
      expect(result.src.width).toBe(80); // min(100, 80)
      expect(result.src.height).toBe(50); // min(50, 120)
      expect(result.src.x).toBe(10); // Centered in source rect
      expect(result.src.y).toBe(0);

      expect(result.dst.width).toBe(80);
      expect(result.dst.height).toBe(50);
      expect(result.dst.x).toBe(0);
      expect(result.dst.y).toBe(35); // Centered in destination rect
    });

    test("scaleDown mode - scales down if needed", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 200, 100);
      const dstRect = Skia.XYWHRect(0, 0, 100, 80);
      const result = fitRects("scaleDown", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 0,
        width: 200,
        height: 100,
      });

      // Should scale down to fit within destination
      expect(result.dst.width).toBe(100);
      expect(result.dst.height).toBe(50); // Maintains aspect ratio 2:1
      expect(result.dst.x).toBe(0);
      expect(result.dst.y).toBe(15); // Centered vertically
    });

    test("scaleDown mode - no scaling if source is smaller", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 50, 25);
      const dstRect = Skia.XYWHRect(0, 0, 100, 100);
      const result = fitRects("scaleDown", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 0,
        width: 50,
        height: 25,
      });

      // Should not scale up, keep original size
      expect(result.dst.width).toBe(50);
      expect(result.dst.height).toBe(25);
      expect(result.dst.x).toBe(25); // Centered horizontally
      expect(result.dst.y).toBe(37.5); // Centered vertically
    });

    test("with offset source rectangle", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(50, 100, 100, 50);
      const dstRect = Skia.XYWHRect(10, 20, 200, 100);
      const result = fitRects("fill", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 50,
        y: 100,
        width: 100,
        height: 50,
      });
      expect(result.dst).toEqual({
        x: 10,
        y: 20,
        width: 200,
        height: 100,
      });
    });

    test("with very small source rectangle", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 1, 1);
      const dstRect = Skia.XYWHRect(0, 0, 100, 100);
      const result = fitRects("contain", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
      expect(result.dst).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    test("with zero dimensions - should return empty sizes", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 0, 100);
      const dstRect = Skia.XYWHRect(0, 0, 100, 100);
      const result = fitRects("fill", srcRect, dstRect);

      expect(result.src).toEqual({
        x: 0,
        y: 50,
        width: 0,
        height: 0,
      });
      expect(result.dst).toEqual({
        x: 50,
        y: 50,
        width: 0,
        height: 0,
      });
    });

    test("cover mode with wide source rectangle", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 200, 50);
      const dstRect = Skia.XYWHRect(0, 0, 100, 100);
      const result = fitRects("cover", srcRect, dstRect);

      // Source should be cropped to square aspect ratio
      expect(result.src.width).toBe(50); // Cropped width
      expect(result.src.height).toBe(50);
      expect(result.src.x).toBe(75); // Centered horizontally
      expect(result.src.y).toBe(0);

      expect(result.dst).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });

    test("cover mode with tall destination rectangle", () => {
      const { Skia, fitRects } = importSkia();
      const srcRect = Skia.XYWHRect(0, 0, 100, 100);
      const dstRect = Skia.XYWHRect(0, 0, 50, 200);
      const result = fitRects("cover", srcRect, dstRect);

      // Source should be cropped to 1:4 aspect ratio
      expect(result.src.width).toBe(25); // Cropped to match destination aspect ratio
      expect(result.src.height).toBe(100);
      expect(result.src.x).toBe(37.5); // Centered horizontally
      expect(result.src.y).toBe(0);

      expect(result.dst).toEqual({
        x: 0,
        y: 0,
        width: 50,
        height: 200,
      });
    });
  });
});
