import React from "react";
import type { AnimationValue, Vector } from "@shopify/react-native-skia";
import {
  sub,
  add,
  useTouchHandler,
  useValue,
  Canvas,
  ImageShader,
  Patch,
  vec,
  Paint,
  processColor,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

import { Cubic } from "./Cubic";
import { inRadius, bilinearInterpolate, symmetric } from "./Math";

const { width, height } = Dimensions.get("window");
const size = vec(width, height);

const rectToTexture = (
  vertices: Vector[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) => [vertices[tl], vertices[tr], vertices[br], vertices[bl]] as const;

const rectToColors = (
  colors: number[],
  vertices: Vector[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) =>
  [
    bilinearInterpolate(colors, size, vertices[tl]),
    bilinearInterpolate(colors, size, vertices[tr]),
    bilinearInterpolate(colors, size, vertices[br]),
    bilinearInterpolate(colors, size, vertices[bl]),
  ] as const;

const rectToPatch =
  (
    vertices: AnimationValue<Vector[]>,
    indices: readonly number[],
    P4H: AnimationValue<Vector>,
    P4V: AnimationValue<Vector>,
    C: number
  ) =>
  () => {
    const tl = vertices.value[indices[0]];
    const tr = vertices.value[indices[1]];
    const br = vertices.value[indices[2]];
    const bl = vertices.value[indices[3]];
    const P4H1 = symmetric(P4H.value, vertices.value[4]);
    const P4V1 = symmetric(P4V.value, vertices.value[4]);
    return [
      {
        pos: tl,
        c1: indices[0] === 4 ? P4V1 : add(tl, vec(0, C)),
        c2: indices[0] === 4 ? P4H1 : add(tl, vec(C, 0)),
      },
      {
        pos: tr,
        c1: indices[1] === 4 ? P4H.value : add(tr, vec(-C, 0)),
        c2: indices[1] === 4 ? P4V1 : add(tr, vec(0, C)),
      },
      {
        pos: br,
        c1: indices[2] === 4 ? P4V.value : add(br, vec(0, -C)),
        c2: indices[2] === 4 ? P4H.value : add(br, vec(-C, 0)),
      },
      {
        pos: bl,
        c1: indices[3] === 4 ? P4H1 : add(bl, vec(C, 0)),
        c2: indices[3] === 4 ? P4V.value : add(bl, vec(0, -C)),
      },
    ] as const;
  };

interface CoonsPatchMeshGradientProps {
  rows: number;
  cols: number;
  colors: string[];
  debug?: boolean;
}

export const CoonsPatchMeshGradient = ({
  rows,
  cols,
  colors: rawColors,
  debug,
}: CoonsPatchMeshGradientProps) => {
  const colors = rawColors.map((color) => processColor(color, 1));
  const dx = width / cols;
  const dy = height / rows;
  const C = dx / 4;

  const P4 = vec(dx, dy);

  const defaultVertices = new Array(cols + 1)
    .fill(0)
    .map((_c, col) =>
      new Array(rows + 1).fill(0).map((_r, row) => {
        return vec(row * dx, col * dy);
      })
    )
    .flat(2);

  const vertices = useValue(defaultVertices);
  const P4H = useValue(add(P4, vec(-C, 0)));
  const P4V = useValue(add(P4, vec(0, -C)));
  const rects = new Array(rows)
    .fill(0)
    .map((_r, row) =>
      new Array(cols).fill(0).map((_c, col) => {
        const l = cols + 1;
        const tl = row * l + col;
        const tr = tl + 1;
        const bl = (row + 1) * l + col;
        const br = bl + 1;
        return [tl, tr, br, bl] as const;
      })
    )
    .flat();
  const onTouch = useTouchHandler({
    onActive: (pt) => {
      const P4H1 = symmetric(P4H.value, vertices.value[4]);
      const P4V1 = symmetric(P4V.value, vertices.value[4]);
      if (inRadius(pt, vertices.value[4])) {
        const delta = sub(vertices.value[4], pt);
        vertices.value[4] = pt;
        P4H.value = sub(P4H.value, delta);
        P4V.value = sub(P4V.value, delta);
      } else if (inRadius(pt, P4H.value)) {
        P4H.value = pt;
      } else if (inRadius(pt, P4H1)) {
        P4H.value = symmetric(pt, vertices.value[4]);
      } else if (inRadius(pt, P4V.value)) {
        P4V.value = pt;
      } else if (inRadius(pt, P4V1)) {
        P4V.value = symmetric(pt, vertices.value[4]);
      }
    },
  });
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Paint>
        <ImageShader
          source={require("../../../assets/debug.png")}
          tx="repeat"
          ty="repeat"
        />
      </Paint>
      {rects.map((r, i) => (
        <Patch
          key={i}
          patch={rectToPatch(vertices, r, P4H, P4V, C)}
          colors={rectToColors(colors, defaultVertices, r)}
          texture={rectToTexture(defaultVertices, r)}
          blendMode={debug ? "srcOver" : "dstOver"}
          debug={debug}
        />
      ))}
      <Cubic
        vertices={vertices}
        index={4}
        c1={P4V}
        c2={P4H}
        colors={colors}
        size={size}
      />
    </Canvas>
  );
};
