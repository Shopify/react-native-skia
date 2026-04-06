export interface SphereMesh {
  vertices: Float32Array;
  indices: Uint16Array;
}

// Simple vec3 utilities
function vec3Copy(src: number[], dst: number[]) {
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
  return dst;
}

function vec3Normalize(v: number[]) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len > 0) {
    v[0] /= len;
    v[1] /= len;
    v[2] /= len;
  }
  return v;
}

// Borrowed and simplified from https://github.com/mrdoob/three.js/blob/master/src/geometries/SphereGeometry.js
export function createSphereMesh(
  radius: number,
  widthSegments = 32,
  heightSegments = 16,
  randomness = 0
): SphereMesh {
  const vertices = [];
  const indices = [];

  widthSegments = Math.max(3, Math.floor(widthSegments));
  heightSegments = Math.max(2, Math.floor(heightSegments));

  const firstVertex = [0, 0, 0];
  const vertex = [0, 0, 0];
  const normal = [0, 0, 0];

  let index = 0;
  const grid: number[][] = [];

  // generate vertices, normals and uvs
  for (let iy = 0; iy <= heightSegments; iy++) {
    const verticesRow = [];
    const v = iy / heightSegments;

    // special case for the poles
    let uOffset = 0;
    if (iy === 0) {
      uOffset = 0.5 / widthSegments;
    } else if (iy === heightSegments) {
      uOffset = -0.5 / widthSegments;
    }

    for (let ix = 0; ix <= widthSegments; ix++) {
      const u = ix / widthSegments;

      // Poles should just use the same position all the way around.
      if (ix === widthSegments) {
        vec3Copy(firstVertex, vertex);
      } else if (ix === 0 || (iy !== 0 && iy !== heightSegments)) {
        const rr = radius + (Math.random() - 0.5) * 2 * randomness * radius;

        // vertex
        vertex[0] = -rr * Math.cos(u * Math.PI * 2) * Math.sin(v * Math.PI);
        vertex[1] = rr * Math.cos(v * Math.PI);
        vertex[2] = rr * Math.sin(u * Math.PI * 2) * Math.sin(v * Math.PI);

        if (ix === 0) {
          vec3Copy(vertex, firstVertex);
        }
      }

      vertices.push(...vertex);

      // normal
      vec3Copy(vertex, normal);
      vec3Normalize(normal);
      vertices.push(...normal);

      // uv
      vertices.push(u + uOffset, 1 - v);
      verticesRow.push(index++);
    }

    grid.push(verticesRow);
  }

  // indices
  for (let iy = 0; iy < heightSegments; iy++) {
    for (let ix = 0; ix < widthSegments; ix++) {
      const a = grid[iy][ix + 1];
      const b = grid[iy][ix];
      const c = grid[iy + 1][ix];
      const d = grid[iy + 1][ix + 1];

      if (iy !== 0) {
        indices.push(a, b, d);
      }
      if (iy !== heightSegments - 1) {
        indices.push(b, c, d);
      }
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  };
}
