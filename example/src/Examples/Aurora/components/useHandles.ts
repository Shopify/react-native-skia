import type {
  AnimationValue,
  CubicBezierHandle,
} from "@shopify/react-native-skia";
import { sub, useTouchHandler, useValue } from "@shopify/react-native-skia";

import { inRadius, symmetric } from "./Math";

type TouchSelection = null | {
  index: number;
  point: "c1" | "c2" | "c3" | "c4" | "pos";
};

export const useHandles = (
  mesh: AnimationValue<CubicBezierHandle[]>,
  defaultMesh: CubicBezierHandle[],
  width: number,
  height: number
) => {
  const selection = useValue<TouchSelection>(null);
  return useTouchHandler({
    onActive: (pt) => {
      if (selection.value) {
        const { index, point } = selection.value;
        const { pos, c1, c2 } = mesh.value[index];
        if (point === "pos") {
          const delta = sub(pos, pt);
          mesh.value[index].pos = pt;
          mesh.value[index].c1 = sub(c1, delta);
          mesh.value[index].c2 = sub(c2, delta);
        } else if (point === "c3") {
          mesh.value[index].c1 = symmetric(pt, mesh.value[index].pos);
        } else if (point === "c4") {
          mesh.value[index].c2 = symmetric(pt, mesh.value[index].pos);
        } else {
          mesh.value[index][point] = pt;
        }
      } else {
        defaultMesh.every(({ pos: p }, index) => {
          const edge =
            p.x === 0 || p.y === 0 || p.x === width || p.y === height;
          if (!edge) {
            const { pos, c1, c2 } = mesh.value[index];
            const c3 = symmetric(c1, pos);
            const c4 = symmetric(c2, pos);
            if (inRadius(pt, pos)) {
              const delta = sub(pos, pt);
              mesh.value[index].pos = pt;
              mesh.value[index].c1 = sub(c1, delta);
              mesh.value[index].c2 = sub(c2, delta);
              selection.value = { index, point: "pos" };
              return false;
            } else if (inRadius(pt, c1)) {
              mesh.value[index].c1 = pt;
              selection.value = { index, point: "c1" };
              return false;
            } else if (inRadius(pt, c2)) {
              mesh.value[index].c2 = pt;
              selection.value = { index, point: "c2" };
              return false;
            } else if (inRadius(pt, c3)) {
              mesh.value[index].c1 = symmetric(pt, mesh.value[index].pos);
              selection.value = { index, point: "c3" };
              return false;
            } else if (inRadius(pt, c4)) {
              mesh.value[index].c2 = symmetric(pt, mesh.value[index].pos);
              selection.value = { index, point: "c4" };
              return false;
            }
          }
          return true;
        });
      }
    },
    onEnd: () => {
      selection.value = null;
    },
  });
};
