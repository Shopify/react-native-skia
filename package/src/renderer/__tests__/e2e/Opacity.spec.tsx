import React from "react";

import {
  height as wHeight,
  importSkia,
  loadImage,
  surface,
  width as wWidth,
} from "../setup";
import {
  itFailsE2e,
  processResult,
  checkImage,
} from "../../../__tests__/setup";
import {
  ColorShader,
  Fill,
  Group,
  Image,
  ImageShader,
  RoundedRect,
} from "../../components";
import { setupSkia } from "../../../skia/__tests__/setup";

describe("Opacity", () => {
  it("Should multiply the opacity to 0", async () => {
    const { rect, rrect } = importSkia();
    const { width } = surface;
    const r = width * 0.5;
    const image = await surface.draw(
      <Group>
        <Fill color="lightblue" />
        <Group opacity={0}>
          <RoundedRect
            rect={rrect(rect(0, 0, r, r), r, r)}
            color="rgba(0, 0, 0, 0.2)"
          />
          <RoundedRect
            rect={rrect(rect(0, 0, r / 2, r / 2), r, r)}
            color="white"
          />
        </Group>
      </Group>
    );
    checkImage(image, "snapshots/drawings/opacity-multiplication.png");
  });
  it("Should build a reference result for the opacity", () => {
    const { surface: ckSurface, canvas, Skia } = setupSkia(wWidth, wHeight);
    const { rect, rrect } = importSkia();
    const p1 = Skia.Paint();
    const r = wWidth * 0.5;

    p1.setColor(Skia.Color("lightblue"));
    p1.setAlphaf(0.5);
    canvas.drawPaint(p1);

    const p2 = Skia.Paint();
    p2.setColor(Skia.Color("rgba(0, 0, 0, 1)"));
    p2.setAlphaf(0.2 * 0.5 * 0.5);
    canvas.drawRRect(rrect(rect(0, 0, r, r), r, r), p2);

    const p3 = Skia.Paint();
    p3.setColor(Skia.Color("white"));
    p3.setAlphaf(0.5 * 0.5);
    canvas.drawRRect(rrect(rect(0, 0, r / 2, r / 2), r, r), p3);

    processResult(ckSurface, "snapshots/drawings/opacity-multiplication2.png");
  });
  it("Should multiply the opacity to 0.25", async () => {
    const { rect, rrect } = importSkia();
    const { width } = surface;
    const r = width * 0.5;
    const image = await surface.draw(
      <Group opacity={0.5}>
        <Fill color="lightblue" />
        <Group opacity={0.5}>
          <RoundedRect
            rect={rrect(rect(0, 0, r, r), r, r)}
            color="rgba(0, 0, 0, 0.2)"
          />
          <RoundedRect
            rect={rrect(rect(0, 0, r / 2, r / 2), r, r)}
            color="white"
          />
        </Group>
      </Group>
    );
    checkImage(image, "snapshots/drawings/opacity-multiplication2.png");
  });
  itFailsE2e("Should multiply the opacity to 0.25 using a Shader", async () => {
    const { rect, rrect } = importSkia();
    const { width } = surface;
    const r = width * 0.5;
    const image = await surface.draw(
      <Group opacity={0.5}>
        <Fill color="lightblue" />
        <Group opacity={0.5}>
          <RoundedRect rect={rrect(rect(0, 0, r, r), r, r)} opacity={0.2}>
            <ColorShader color="black" />
          </RoundedRect>
          <RoundedRect
            rect={rrect(rect(0, 0, r / 2, r / 2), r, r)}
            color="white"
          />
        </Group>
      </Group>
    );
    checkImage(image, "snapshots/drawings/opacity-multiplication2.png");
  });
  itFailsE2e("Should apply opacity to an image (1)", async () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { width, height } = surface;
    const img = await surface.draw(
      <Group>
        <Fill color="lightblue" />
        <Group opacity={0.5}>
          <Image
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Group>
      </Group>
    );
    checkImage(img, "snapshots/drawings/opacity-image.png");
  });
  itFailsE2e("Should apply opacity to an image (2)", async () => {
    const {} = importSkia();
    const { width, height } = surface;
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const img = await surface.draw(
      <Group>
        <Fill color="lightblue" />
        <Image
          opacity={0.5}
          image={image}
          x={0}
          y={0}
          width={width}
          height={height}
          fit="cover"
        />
      </Group>
    );
    checkImage(img, "snapshots/drawings/opacity-image.png");
  });
  itFailsE2e("Should apply opacity to an image shader (1)", async () => {
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { width, height } = surface;
    const img = await surface.draw(
      <Group>
        <Fill color="lightblue" />
        <Fill opacity={0.5}>
          <ImageShader
            image={image}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
        </Fill>
      </Group>
    );
    checkImage(img, "snapshots/drawings/opacity-image.png");
  });
  itFailsE2e("Should apply opacity to an image shader (2)", async () => {
    const {} = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const { width, height } = surface;
    const img = await surface.draw(
      <Group>
        <Fill color="lightblue" />
        <Group opacity={0.5}>
          <Fill>
            <ImageShader
              image={image}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="cover"
            />
          </Fill>
        </Group>
      </Group>
    );
    checkImage(img, "snapshots/drawings/opacity-image.png");
  });
});
