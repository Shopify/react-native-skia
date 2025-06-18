import type { CanvasKit } from "canvaskit-wasm";
import type { SkColor, SkPoint, VertexMode } from "../types";
import { JsiSkVertices } from "./JsiSkVertices";
export declare const MakeVertices: (CanvasKit: CanvasKit, mode: VertexMode, positions: SkPoint[], textureCoordinates?: SkPoint[] | null, colors?: SkColor[], indices?: number[] | null, isVolatile?: boolean) => JsiSkVertices;
