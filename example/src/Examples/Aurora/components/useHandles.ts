import type {
  SkiaMutableValue,
  CubicBezierHandle,
  SkRect,
} from "@shopify/react-native-skia";
import {
  isEdge,
  sub,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";

import { inRadius, symmetric } from "./Math";

type TouchSelection = null | {
  index: number;
  point: "c1" | "c2" | "c3" | "c4" | "pos";
};

export const useHandles = (
  mesh: SkiaMutableValue<CubicBezierHandle[]>,
  defaultMesh: CubicBezierHandle[],
  window: SkRect
) => {
  const selection = useValue<TouchSelection>(null);
  return useTouchHandler({
    onActive: (pt) => {
      if (selection.current) {
        const { index, point } = selection.current;
        const { pos, c1, c2 } = mesh.current[index];
        if (point === "pos") {
          const delta = sub(pos, pt);
          mesh.current[index].pos = pt;
          mesh.current[index].c1 = sub(c1, delta);
          mesh.current[index].c2 = sub(c2, delta);
        } else if (point === "c3") {
          mesh.current[index].c1 = symmetric(pt, mesh.current[index].pos);
        } else if (point === "c4") {
          mesh.current[index].c2 = symmetric(pt, mesh.current[index].pos);
        } else {
          mesh.current[index][point] = pt;
        }
      } else {
        defaultMesh.every(({ pos: p }, index) => {
          if (!isEdge(p, window)) {
            const { pos, c1, c2 } = mesh.current[index];
            const c3 = symmetric(c1, pos);
            const c4 = symmetric(c2, pos);
            if (inRadius(pt, pos)) {
              const delta = sub(pos, pt);
              mesh.current[index].pos = pt;
              mesh.current[index].c1 = sub(c1, delta);
              mesh.current[index].c2 = sub(c2, delta);
              selection.current = { index, point: "pos" };
              return false;
            } else if (inRadius(pt, c1)) {
              mesh.current[index].c1 = pt;
              selection.current = { index, point: "c1" };
              return false;
            } else if (inRadius(pt, c2)) {
              mesh.current[index].c2 = pt;
              selection.current = { index, point: "c2" };
              return false;
            } else if (inRadius(pt, c3)) {
              mesh.current[index].c1 = symmetric(pt, mesh.current[index].pos);
              selection.current = { index, point: "c3" };
              return false;
            } else if (inRadius(pt, c4)) {
              mesh.current[index].c2 = symmetric(pt, mesh.current[index].pos);
              selection.current = { index, point: "c4" };
              return false;
            }
          }
          return true;
        });
      }
      mesh.current = mesh.current.slice();
    },
    onEnd: () => {
      selection.current = null;
    },
  });
};
