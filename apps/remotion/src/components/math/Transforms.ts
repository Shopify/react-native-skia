import type { Matrix4, Transforms3d } from "@exodus/react-native-skia";

export const persp = (perspective: number) => {
  if (perspective === 0) {
    return [];
  }
  return [{ perspective }];
};

export const pivot = (
  transform: Transforms3d,
  { x, y }: { x: number; y: number }
) => {
  return [
    { translateX: x },
    { translateY: y },
    ...transform,
    { translateX: -x },
    { translateY: -y },
  ];
};

export const lerpMatrix = (t: number, from: Matrix4, to: Matrix4) => {
  const result = new Array(16).fill(0);
  for (let i = 0; i < 16; i++) {
    result[i] = from[i] + t * (to[i] - from[i]);
  }
  return result as unknown as Matrix4;
};
