import {
  Points,
  Canvas,
  Fill,
  useValue,
  useTouchHandler,
  useDerivedValue,
  Vertices,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import type { Matrix4, Transforms3d } from "./Matrix4";
import { matrixVecMul4, processTransform3d } from "./Matrix4";

const vec3 = (x: number, y: number, z: number) => ({ x, y, z });
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

const { width, height } = Dimensions.get("window");
const TAU = Math.PI / 2;
const COLS = 3;
const ROWS = 8;
const size = width / COLS;
const cols = new Array(COLS).fill(0).map((_, i) => i);
const rows = new Array(ROWS).fill(0).map((_, i) => i);
const vertices: Vector3[] = [];
rows.forEach((i) => {
  cols.forEach((j) => {
    vertices.push(vec3(j * size, i * size, Math.random() * size));
  });
});
const center = vec3(width / 2, height / 2, 0);

export const transformOrigin3d = (
  { x, y, z }: Vector3,
  transformations: Transforms3d
): Transforms3d => {
  return [
    { translateX: x },
    { translateY: y },
    { translateZ: z },
    ...transformations,
    { translateX: -x },
    { translateY: -y },
    { translateZ: -z },
  ];
};

export const project = (p: Vector3, transform: Matrix4): Vector3 => {
  "worklet";
  const pr = matrixVecMul4(transform, [p.x, p.y, p.z, 1]);
  return {
    x: pr[0] / pr[3],
    y: pr[1] / pr[3],
    z: pr[2] / pr[3],
  };
};

const base = ["#61dafb", "#fb61da", "#dafb61"];
const colors = vertices.map((_, i) => base[i % base.length]);

export const Demo = () => {
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const rotateX = useValue(0);
  const rotateY = useValue(0);
  const onTouch = useTouchHandler({
    onStart: () => {
      offsetX.current = rotateX.current;
      offsetY.current = rotateY.current;
    },
    onActive: (pt) => {
      rotateX.current = (TAU * pt.y) / width;
      rotateY.current = (TAU * pt.x) / height;
    },
  });
  const points = useDerivedValue(
    () =>
      vertices.map((point) => {
        return project(
          point,
          processTransform3d(
            transformOrigin3d(center, [
              { rotateX: rotateX.current },
              { rotateY: rotateY.current },
            ])
          )
        );
      }),
    [rotateX, rotateY]
  );
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Fill color="white" />
      <Points points={points} color="black" style="stroke" strokeWidth={4} />
      <Vertices vertices={points} colors={colors} />
    </Canvas>
  );
};
