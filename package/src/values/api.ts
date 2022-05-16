import { Platform } from "react-native";

import type { ISkiaValueApi } from "./types";
import { ValueApi as ValueApiWeb } from "./web";

let exportedValueApi: ISkiaValueApi;
declare global {
  var SkiaValueApi: ISkiaValueApi;
}

if (Platform.OS === "web") {
  exportedValueApi = ValueApiWeb;
} else {
  const { SkiaValueApi } = global;
  exportedValueApi = SkiaValueApi;
}
export const ValueApi = exportedValueApi;

export const { createValue, createDerivedValue } = ValueApi;
