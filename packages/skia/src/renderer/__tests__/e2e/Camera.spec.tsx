import React from "react";

import { checkImage } from "../../../__tests__/setup";
import type { SkPath, SkRect, Vec3 } from "../../../skia/types";
import { mapPoint3d, processTransform3d, Matrix4 } from "../../../skia/types";
import { Group, Path, Rect } from "../../components";
import { importSkia, surface } from "../setup";

const pickPoint = (p: number[], index = 0, offset = 3) =>
  [
    p[0 + index * offset],
    p[1 + index * offset],
    p[2 + index * offset],
  ] as const;

enum Path3Command {
  Move,
  Line,
  Quad,
  Cubic,
  Close,
}

export class Path3 {
  commands: [Path3Command, ...number[]][] = [];

  constructor() {}

  moveTo(to: Vec3) {
    this.commands.push([Path3Command.Move, ...to]);
    return this;
  }

  lineTo(to: Vec3) {
    this.commands.push([Path3Command.Line, ...to]);
    return this;
  }

  quadTo(control: Vec3, to: Vec3) {
    this.commands.push([Path3Command.Quad, ...control, ...to]);
    return this;
  }

  cubicTo(control1: Vec3, control2: Vec3, to: Vec3) {
    this.commands.push([Path3Command.Cubic, ...control1, ...control2, ...to]);
    return this;
  }

  close() {
    this.commands.push([Path3Command.Close]);
    return this;
  }

  addHRect(rect: SkRect, z: number) {
    const { x, y, width, height } = rect;
    const p0: Vec3 = [x, y, z];
    const p1: Vec3 = [x + width, y, z];
    const p2: Vec3 = [x + width, y + height, z];
    const p3: Vec3 = [x, y + height, z];
    this.moveTo(p0);
    this.lineTo(p1);
    this.lineTo(p2);
    this.lineTo(p3);
    this.close();
    return this;
  }

  project(output: SkPath, tr?: Matrix4) {
    const transform = tr ?? Matrix4();
    this.commands.forEach(([cmd, ...args]) => {
      switch (cmd) {
        case Path3Command.Move: {
          const to = mapPoint3d(transform, pickPoint(args));
          output.moveTo(to[0], to[1]);
          break;
        }
        case Path3Command.Line: {
          const to = mapPoint3d(transform, pickPoint(args));
          output.lineTo(to[0], to[1]);
          break;
        }
        case Path3Command.Quad: {
          const control = mapPoint3d(transform, pickPoint(args));
          const to = mapPoint3d(transform, pickPoint(args, 1));
          output.quadTo(control[0], control[1], to[0], to[1]);
          break;
        }
        case Path3Command.Cubic: {
          const control1 = mapPoint3d(transform, pickPoint(args));
          const control2 = mapPoint3d(transform, pickPoint(args, 1));
          const to = mapPoint3d(transform, pickPoint(args, 2));
          output.cubicTo(
            control1[0],
            control1[1],
            control2[0],
            control2[1],
            to[0],
            to[1]
          );
          break;
        }
        case Path3Command.Close: {
          output.close();
          break;
        }
        default:
          throw new Error(`Unknown command: ${cmd}`);
      }
    });
    return this;
  }
}

describe("Camera", () => {
  it("Should do a perspective transformation", async () => {
    const { Skia } = importSkia();
    const { width, height } = surface;
    const pad = 32;
    const rct = {
      x: pad,
      y: pad,
      width: width - pad * 2,
      height: height - pad * 2,
    };
    const path = Skia.Path.Make();
    const path3 = new Path3();
    path3.addHRect(rct, 0);
    path3.project(
      path,
      processTransform3d([
        { translate: [width / 2, height / 2] },
        { perspective: 300 },
        { rotateX: 1 },
        { translate: [-width / 2, -height / 2] },
      ])
    );
    const image = await surface.draw(
      <Group>
        <Rect rect={rct} color="magenta" />
        <Path path={path} color="cyan" opacity={0.5} />
      </Group>
    );
    checkImage(image, "snapshots/matrix4/perspective.png");
  });
  it("Camera movement", async () => {
    const { Skia } = importSkia();
    const { width, height } = surface;
    const pad = 32;
    const rct = {
      x: pad,
      y: pad,
      width: width - pad * 2,
      height: height - pad * 2,
    };
    const path = Skia.Path.Make();
    const path3 = new Path3();
    path3.addHRect(rct, 0);
    path3.project(path);
    const image = await surface.draw(
      <Group>
        <Rect rect={rct} color="magenta" />
        <Path path={path} color="cyan" opacity={0.5} />
      </Group>
    );
    checkImage(image, "snapshots/matrix4/rect.png");
  });
});
