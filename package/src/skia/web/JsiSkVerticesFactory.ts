import type { CanvasKit } from "canvaskit-wasm";

import type { SkColor, SkPoint, VertexMode } from "../types";

import { ckEnum } from "./Host";
import { JsiSkVertices } from "./JsiSkVertices";

export const MakeVertices = (
  CanvasKit: CanvasKit,
  mode: VertexMode,
  positions: SkPoint[],
  textureCoordinates?: SkPoint[] | null,
  colors?: SkColor[],
  indices?: number[] | null,
  isVolatile?: boolean
) =>
  new JsiSkVertices(
    CanvasKit,
    CanvasKit.MakeVertices(
      ckEnum(mode),
      positions.map(({ x, y }) => [x, y]).flat(),
      (textureCoordinates || []).map(({ x, y }) => [x, y]).flat(),
      colors,
      indices,
      isVolatile
    )
  );
