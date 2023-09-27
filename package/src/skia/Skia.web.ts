import { JsiSkApi } from "./web";

export const Skia = JsiSkApi(global.CanvasKit);

export const { Malloc, Free } = global.CanvasKit;
