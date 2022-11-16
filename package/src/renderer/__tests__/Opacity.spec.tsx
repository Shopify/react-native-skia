import React from "react";

import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { Fill, Group, RoundedRect, ColorShader, Image } from "../components";
import { ImageShader } from "../components/image/ImageShader";

import { drawOnNode, width, importSkia, loadImage, height } from "./setup";

describe("Opacity", () => {
  it("Should multiply the opacity to 0", () => {
    const { rect, rrect } = importSkia();
    const r = width * 0.5;
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-multiplication.png");
  });
  it("Should build a reference result for the opacity", () => {
    const { surface, canvas, Skia } = setupSkia(width, height);
    const { rect, rrect } = importSkia();
    const p1 = Skia.Paint();
    const r = width * 0.5;

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

    processResult(surface, "snapshots/drawings/opacity-multiplication2.png");
  });
  it("Should multiply the opacity to 0.25", () => {
    const { rect, rrect } = importSkia();
    const r = width * 0.5;
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-multiplication2.png");
  });
  it("Should multiply the opacity to 0.25 using a Shader", () => {
    const { rect, rrect } = importSkia();
    const r = width * 0.5;
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-multiplication2.png");
  });
  it("Should apply opacity to an image (1)", () => {
    const {} = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-image.png");
  });
  it("Should apply opacity to an image (2)", () => {
    const {} = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-image.png");
  });
  it("Should apply opacity to an image shader (1)", () => {
    const {} = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-image.png");
  });
  it("Should apply opacity to an image shader (2)", () => {
    const {} = importSkia();
    const image = loadImage("skia/__tests__/assets/oslo.jpg");
    const surface = drawOnNode(
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
    processResult(surface, "snapshots/drawings/opacity-image.png");
  });
});
