import { createSphereMesh } from "./sphere";
import { vec3Cross, vec3Subtract, vec3Normalize } from "./matrix";

function createSphereTypedArrays(
  radius: number,
  widthSegments = 32,
  heightSegments = 16,
  randomness = 0
) {
  const { vertices: verticesWithUVs, indices } = createSphereMesh(
    radius,
    widthSegments,
    heightSegments,
    randomness
  );
  const numVertices = verticesWithUVs.length / 8;
  const vertices = new Float32Array(numVertices * 6);
  for (let i = 0; i < numVertices; ++i) {
    const srcNdx = i * 8;
    const dstNdx = i * 6;
    vertices.set(verticesWithUVs.subarray(srcNdx, srcNdx + 6), dstNdx);
  }
  return {
    vertices,
    indices: new Uint32Array(indices),
  };
}

function flattenNormals({
  vertices,
  indices,
}: {
  vertices: Float32Array;
  indices: Uint32Array;
}) {
  const newVertices = new Float32Array(indices.length * 6);
  const newIndices = new Uint32Array(indices.length);
  for (let i = 0; i < indices.length; i += 3) {
    const positions: number[][] = [];
    for (let j = 0; j < 3; ++j) {
      const ndx = indices[i + j];
      const srcNdx = ndx * 6;
      const dstNdx = (i + j) * 6;
      // copy position
      const pos = Array.from(vertices.subarray(srcNdx, srcNdx + 3));
      newVertices.set(pos, dstNdx);
      positions.push(pos);
      newIndices[i + j] = i + j;
    }

    const normal = vec3Normalize(
      vec3Cross(
        vec3Normalize(vec3Subtract(positions[1], positions[0])),
        vec3Normalize(vec3Subtract(positions[2], positions[1]))
      )
    );

    for (let j = 0; j < 3; ++j) {
      const dstNdx = (i + j) * 6;
      newVertices.set(normal, dstNdx + 3);
    }
  }

  return {
    vertices: newVertices,
    indices: newIndices,
  };
}

export const modelData = {
  sphere: createSphereTypedArrays(20),
  jewel: flattenNormals(createSphereTypedArrays(20, 5, 3)),
  rock: flattenNormals(createSphereTypedArrays(20, 32, 16, 0.1)),
};
