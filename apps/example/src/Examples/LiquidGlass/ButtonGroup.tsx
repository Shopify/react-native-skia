import type { SkSize } from "@shopify/react-native-skia";
import { useSharedValue } from "react-native-reanimated";

export const useButtonGroup = (container: SkSize, r: number) => {
  const width = 7 * r;
  const height = 2 * r;
  const x = (container.width - width) / 2;
  const y = (container.height - height) / 2;
  const c1 = useSharedValue([0, 0]);
  const progress = useSharedValue(0);
  const box = [2.5 * r, 0, 4.5 * r, 2 * r];
  return { progress, c1, box, bounds: { x, y, width, height } };
};
