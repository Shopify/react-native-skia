import { Skia } from "../Skia";
import { processTransform } from "../types";
export const processTransform2d = transforms => {
  "worklet";

  return processTransform(Skia.Matrix(), transforms);
};
//# sourceMappingURL=Matrix.js.map