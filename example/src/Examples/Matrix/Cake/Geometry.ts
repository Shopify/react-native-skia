import type { Size, SkPoint, Transforms3d } from "@shopify/react-native-skia";
import { mapPoint3d, processTransform3d } from "@shopify/react-native-skia";
import type { extrudePolygon } from "geometry-extrude";

type Object3d = Exclude<ReturnType<typeof extrudePolygon>, "bounds">;
type Vec3 = readonly [number, number, number];

export const normalizeRadians = (angle: number) => {
  "worklet";
  const twoPi = 2 * Math.PI;
  // Ensure the angle is positive
  while (angle < 0) {
    angle += twoPi;
  }
  // Normalize the angle to the range [0, 2PI)
  return angle % twoPi;
};

export const triangleCentroid = (triangle: Vec3[]) => {
  "worklet";
  return [
    triangle[0][0] + triangle[1][0] + triangle[2][0] / 3,
    triangle[0][1] + triangle[1][1] + triangle[2][1] / 3,
    triangle[0][2] + triangle[1][2] + triangle[2][2] / 3,
  ];
};

export const avg = (arr: number[]) => {
  "worklet";
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

export const avgDepth = (vertices: Vec3[]) => {
  "worklet";
  const centroid = triangleCentroid(vertices);

  return centroid[2];
};

export const createCircle = (r: number, steps: number): [number, number][] => {
  const vertices: [number, number][] = [];
  for (let step = 0; step < steps; step++) {
    // Calculate angle for this step
    const theta = (step / steps) * 2 * Math.PI;
    // Calculate x and y of the point
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    // Add point to the vertices array
    vertices.push([x, y]);
  }
  return vertices;
};

interface Triangle {
  vertices: (readonly [number, number, number])[];
  uv: SkPoint[];
  indices: number[];
}

type Face = Triangle[];
export type Faces = Face[];

const vec2 = (x: number, y: number) => ({
  x,
  y,
});

export const createObject = (
  { indices, position, uv, normal }: Object3d,
  transform: Transforms3d,
  textureSize: Size
) => {
  const faces: Record<string, Face> = {};
  const matrix = processTransform3d(transform);
  for (let i = 0; i < indices.length; i += 3) {
    const a = indices[i];
    const b = indices[i + 1];
    const c = indices[i + 2];
    const normalX = normal[a * 3];
    const normalY = normal[a * 3 + 1];
    const normalZ = normal[a * 3 + 2];
    if (
      normalX === undefined ||
      normalY === undefined ||
      normalZ === undefined
    ) {
      throw new Error("Normal is undefined for index " + i);
    }
    const key = `${normalX}, ${normalY}, ${normalZ}`;
    if (!faces[key]) {
      faces[key] = [];
    }
    const transformedA = mapPoint3d(matrix, [
      position[a * 3],
      position[a * 3 + 1],
      position[a * 3 + 2],
    ]);
    const transformedB = mapPoint3d(matrix, [
      position[b * 3],
      position[b * 3 + 1],
      position[b * 3 + 2],
    ]);
    const transformedC = mapPoint3d(matrix, [
      position[c * 3],
      position[c * 3 + 1],
      position[c * 3 + 2],
    ]);
    const tWidth = textureSize.width;
    const tHeight = textureSize.height;
    const uvA = vec2(uv[a * 2] * tWidth, uv[a * 2 + 1] * tHeight);
    const uvB = vec2(uv[b * 2] * tWidth, uv[b * 2 + 1] * tHeight);
    const uvC = vec2(uv[c * 2] * tWidth, uv[c * 2 + 1] * tHeight);
    faces[key].push({
      vertices: [transformedA, transformedB, transformedC],
      uv: [uvA, uvB, uvC],
      indices: [a, b, c],
    });
  }
  return Object.values(faces);
};
