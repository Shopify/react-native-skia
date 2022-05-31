import type { CanvasKit } from "canvaskit-wasm";

import type { SkColor, SkPoint, VertexMode } from "../../types";

import { ckEnum, toValue } from "./Host";
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
      positions.map((pos) => [pos.x, pos.y]).flat(),
      textureCoordinates
        ? textureCoordinates.map((pos) => [pos.x, pos.y]).flat()
        : null,
      colors ? colors.map((pos) => toValue(pos)) : undefined,
      indices,
      isVolatile
    )
  );
