import React from "react";
import type { AnimationValue, Vector } from "@shopify/react-native-skia";
import {
  sub,
  add,
  rect,
  dist,
  useTouchHandler,
  useValue,
  Canvas,
  ImageShader,
  Patch,
  vec,
  Paint,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { Cubic } from "./Cubic";

const inRadius = (a: Vector, b: Vector, r = 40) => dist(a, b) < r;
const getPointAtLength = (length: number, from: Vector, to: Vector) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const x = from.x + length * Math.cos(angle);
  const y = from.y + length * Math.sin(angle);
  return vec(x, y);
};

const rectToTexture = (
  vertices: Vector[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) => [vertices[tl], vertices[tr], vertices[br], vertices[bl]] as const;

const rectToPatch =
  (
    vertices: AnimationValue<Vector[]>,
    indices: readonly number[],
    P4H: AnimationValue<Vector>,
    P4V: AnimationValue<Vector>
  ) =>
  () => {
    const tl = vertices.value[indices[0]];
    const tr = vertices.value[indices[1]];
    const br = vertices.value[indices[2]];
    const bl = vertices.value[indices[3]];
    return [
      {
        pos: tl,
        c1: indices[0] === 4 ? P4V.value : add(tl, vec(0, C)),
        c2: indices[0] === 4 ? P4H.value : add(tl, vec(C, 0)),
      },
      {
        pos: tr,
        c1: indices[1] === 4 ? P4H.value : add(tr, vec(-C, 0)),
        c2: indices[1] === 4 ? P4V.value : add(tr, vec(0, C)),
      },
      {
        pos: br,
        c1: indices[2] === 4 ? P4V.value : add(br, vec(0, -C)),
        c2: indices[2] === 4 ? P4H.value : add(br, vec(-C, 0)),
      },
      {
        pos: bl,
        c1: indices[3] === 4 ? P4H.value : add(bl, vec(C, 0)),
        c2: indices[3] === 4 ? P4V.value : add(bl, vec(0, -C)),
      },
    ] as const;
  };

const { width, height } = Dimensions.get("window");
const dx = width / 2;
const dy = height / 2;
const C = dx / 4;

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
  const P4H = useValue(add(P4, vec(-C, 0)));
  const P4V = useValue(add(P4, vec(0, -C)));
  const P4H1 = useValue(add(P4, vec(C, 0)));
  const P4V1 = useValue(add(P4, vec(0, C)));

  const r1 = [0, 1, 4, 3] as const;
  const r2 = [1, 2, 5, 4] as const;
  const r3 = [3, 4, 7, 6] as const;
  const r4 = [4, 5, 8, 7] as const;

  const onTouch = useTouchHandler({
    onActive: (pt) => {
      if (inRadius(pt, vertices.value[4])) {
        const delta = sub(vertices.value[4], pt);
        vertices.value[4] = pt;
        P4H.value = sub(P4H.value, delta);
        P4V.value = sub(P4V.value, delta);
        P4H1.value = sub(P4H1.value, delta);
        P4V1.value = sub(P4V1.value, delta);
      } else if (inRadius(pt, P4H.value)) {
        P4H.value = pt;
        const d = dist(pt, vertices.value[4]);
        P4H1.value = getPointAtLength(2 * d, pt, vertices.value[4]);
      } else if (inRadius(pt, P4H1.value)) {
        P4H1.value = pt;
        const d = dist(pt, vertices.value[4]);
        P4H.value = getPointAtLength(2 * d, pt, vertices.value[4]);
      }
    },
  });
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Paint>
        {/* <ImageShader
          source={require("../../../assets/debug.png")}
          //fit="cover"
          tx="repeat"
          ty="repeat"
          // rect={rect(0, 0, width, dy * 2)}
        /> */}
        <ImageShader
          source={require("../../../assets/oslo.jpg")}
          fit="cover"
          rect={rect(0, 0, width, dy * 2)}
        />
      </Paint>
      <Patch
        patch={rectToPatch(vertices, r1, P4H, P4V)}
        texture={rectToTexture(defaultVertices, r1)}
      />
      <Patch
        patch={rectToPatch(vertices, r2, P4H, P4V)}
        texture={rectToTexture(defaultVertices, r2)}
      />
      <Patch
        patch={rectToPatch(vertices, r3, P4H, P4V)}
        texture={rectToTexture(defaultVertices, r3)}
      />
      <Patch
        patch={rectToPatch(vertices, r4, P4H, P4V)}
        texture={rectToTexture(defaultVertices, r4)}
      />
      <Cubic
        vertices={vertices}
        index={4}
        c1={P4V}
        c2={P4H}
        c3={P4V1}
        c4={P4H1}
      />
    </Canvas>
  );
};
