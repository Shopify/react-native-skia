import fs from "fs";
import path from "path";

import React from "react";

import { processResult } from "../../__tests__/setup";
import { Circle, FitBox, Rect, Image, Group, fitbox } from "../components";

import { drawOnNode, width, height, importSkia } from "./setup";

describe("FitBox", () => {
  it("Should scale the rectangle in half", () => {
    const { Skia } = importSkia();
    const surface = drawOnNode(
      <FitBox
        src={Skia.XYWHRect(0, 0, width, height)}
        dst={Skia.XYWHRect(width / 4, height / 4, width / 2, height / 2)}
      >
        <Rect x={0} y={0} width={width} height={height} color="lightblue" />
      </FitBox>
    );
    processResult(surface, "snapshots/drawings/lightblue-rect.png");
  });
  it("Should take the bottom right quarter of the circle and scale to the full canvas", () => {
    const { Skia } = importSkia();
    const surface = drawOnNode(
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
  it("Should scale the image (1)", () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          path.resolve(__dirname, "../../skia/__tests__/assets/box.png")
        )
      )
    )!;
    const surface = drawOnNode(
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
  it("Should scale the image (2)", () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          path.resolve(__dirname, "../../skia/__tests__/assets/box.png")
        )
      )
    )!;
    const screen = rect(256, 128, 256, 512);
    const surface = drawOnNode(
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
  it("Should rotate and scale the image", () => {
    const { Skia, rect } = importSkia();
    const image = Skia.Image.MakeImageFromEncoded(
      Skia.Data.fromBytes(
        fs.readFileSync(
          path.resolve(__dirname, "../../skia/__tests__/assets/box2.png")
        )
      )
    )!;
    // rotate can be PI/2, -PI/2, or PI
    const rotate = -Math.PI / 2;
    const screen = rect(256, 128, 256, 512);
    const imageRect =
      rotate === Math.PI / 2 || rotate === -Math.PI / 2
        ? rect(0, 0, image.height(), image.width())
        : rect(0, 0, image.width(), image.height());
    const transform = fitbox("contain", imageRect, screen);

    let translationToTopLeft: { translate: [number, number] } = {
      translate: [0, 0],
    };
    if (rotate === -Math.PI / 2) {
      translationToTopLeft = { translate: [0, image.width()] };
    } else if (rotate === Math.PI / 2) {
      translationToTopLeft = { translate: [image.height(), 0] };
    } else if (rotate === Math.PI) {
      translationToTopLeft = { translate: [image.width(), image.height()] };
    }
    console.log(translationToTopLeft);
    const surface = drawOnNode(
      <Group>
        <Image
          image={image}
          x={0}
          y={0}
          width={image.width()}
          height={image.height()}
          transform={[
            // Scale the rotated image
            ...transform,
            // Translate to top left corner
            translationToTopLeft,
            // Rotation Transform
            { rotate },
          ]}
        />
        <Rect rect={screen} color="green" opacity={0.5} />
      </Group>
    );
    processResult(surface, "snapshots/drawings/rotated-scaled-image.png");
  });
});
