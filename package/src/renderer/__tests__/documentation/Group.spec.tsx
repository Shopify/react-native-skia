import React from "react";

import { docPath, processResult } from "../../../__tests__/setup";
import { Image, Group, Fill } from "../../components";
import { drawOnNode, width, loadImage, importSkia } from "../setup";

const size = width;
const padding = 48;
const r = 24;

describe("Group", () => {
  it("Should use a rectangle as a clip", () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { rect } = importSkia();
    expect(image).toBeTruthy();
    const rct = rect(padding, padding, size - padding * 2, size - padding * 2);
    const surface = drawOnNode(
      <>
        <Fill color="lightblue" />
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
      </>
    );
    processResult(surface, docPath("group/clip-rect.png"));
  });
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
});
