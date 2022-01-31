import React from "react";
import type { AnimationValue, Vector } from "@shopify/react-native-skia";
import {
  dist,
  useTouchHandler,
  useValue,
  Canvas,
  ImageShader,
  Patch,
  rect,
  vec,
  Paint,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { Cubic } from "./Cubic";

const inRadius = (a: Vector, b: Vector, r = 40) => dist(a, b) < r;

const rectToTexture = (
  vertices: Vector[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) => [vertices[tl], vertices[tr], vertices[br], vertices[bl]] as const;

const rectToPatch =
  (vertices: AnimationValue<Vector[]>, indices: readonly number[]) => () => {
    const tl = vertices.value[indices[0]];
    const tr = vertices.value[indices[1]];
    const br = vertices.value[indices[2]];
    const bl = vertices.value[indices[3]];
    return [tl, tl, tr, tr, tr, br, br, br, bl, bl, bl, tl];
  };

const { width, height } = Dimensions.get("window");
const dx = width / 2;
const dy = height / 2;

export const PatchMeshGradient = () => {
  const P0 = vec(0, 0);
  const P1 = vec(dx, 0);
  const P2 = vec(dx * 2, 0);

  const P3 = vec(0, dy);
  const P4 = vec(dx, dy);
  const P5 = vec(dx * 2, dy);

  const P6 = vec(0, 2 * dy);
  const P7 = vec(dx, 2 * dy);
  const P8 = vec(dx * 2, 2 * dy);

  const defaultVertices = [P0, P1, P2, P3, P4, P5, P6, P7, P8];
  const vertices = useValue(defaultVertices);

  const r1 = [0, 1, 4, 3] as const;
  const r2 = [1, 2, 5, 4] as const;
  const r3 = [3, 4, 7, 6] as const;
  const r4 = [4, 5, 8, 7] as const;

  const onTouch = useTouchHandler({
    onActive: (pt) => {
      if (inRadius(pt, vertices.value[4])) {
        vertices.value[4] = pt;
      }
    },
  });
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Paint>
        <ImageShader
          source={require("../../../assets/oslo.jpg")}
          fit="cover"
          rect={rect(0, 0, width, height)}
        />
      </Paint>
      <Patch
        patch={rectToPatch(vertices, r1)}
        texture={rectToTexture(defaultVertices, r1)}
      />
      <Patch
        patch={rectToPatch(vertices, r2)}
        texture={rectToTexture(defaultVertices, r2)}
      />
      <Patch
        patch={rectToPatch(vertices, r3)}
        texture={rectToTexture(defaultVertices, r3)}
      />
      <Patch
        patch={rectToPatch(vertices, r4)}
        texture={rectToTexture(defaultVertices, r4)}
      />
      <Cubic vertices={vertices} index={4} />
    </Canvas>
  );
};
