import React from "react";
import type { Matrix4, SkImage } from "@shopify/react-native-skia";
import {
  Vertices,
  vec,
  mapPoint3d,
  ImageShader,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import { useDerivedValue } from "react-native-reanimated";

import type { Faces } from "./Geometry";
import { avg, avgDepth } from "./Geometry";

//const baseColors = ["#61DAFB", "#fb61da", "#dafb61", "#61fbcf", "#8f60da"];

interface Object3dProps {
  objects: Faces[];
  matrix: SharedValue<Matrix4>;
  index: SharedValue<number>;
  texture: SharedValue<SkImage | null>;
}

export const Object3d = ({
  objects,
  matrix,
  index,
  texture,
}: Object3dProps) => {
  const object = useDerivedValue(() => {
    return objects[index.value];
  }, [index]);
  // 1. Project all points
  const model = useDerivedValue(() => {
    const projectedFaces = object.value.map((face) =>
      face.map((tri) => {
        const projectedVertices = tri.vertices.map((point) =>
          mapPoint3d(matrix.value, point)
        );
        return {
          vertices: projectedVertices,
          uv: tri.uv,
          indices: tri.indices,
        };
      })
    );
    // 2. Sort by depth using the centroid of the triangles
    projectedFaces.sort((a, b) => {
      // Calculate the centroid depth of each face (a)
      const depthA = avg(a.flatMap((t) => avgDepth(t.vertices)));
      const depthB = avg(b.flatMap((t) => avgDepth(t.vertices)));
      return depthA - depthB;
    });

    return projectedFaces.flat();
  });
  const vertices = useDerivedValue(() => {
    return model.value.flatMap((point) =>
      point.vertices.map((p) => vec(p[0], p[1]))
    );
  });
  const textures = useDerivedValue(() => {
    return model.value.flatMap((point) => point.uv);
  });
  // const colors = useDerivedValue(() => {
  //   return model.value.flatMap(({ indices }) => {
  //     return [
  //       baseColors[indices[0] % baseColors.length],
  //       baseColors[indices[1] % baseColors.length],
  //       baseColors[indices[2] % baseColors.length],
  //     ];
  //   });
  // });
  return (
    <>
      <Vertices vertices={vertices} textures={textures}>
        <ImageShader
          image={texture}
          // x={0}
          // y={0}
          // width={400}
          // height={400}
          // fit="none"
        />
      </Vertices>
    </>
  );
};
