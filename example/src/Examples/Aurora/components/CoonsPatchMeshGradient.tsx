import React from "react";
import type {
  AnimationValue,
  CubicBezier,
  Vector,
} from "@shopify/react-native-skia";
import {
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

import { bilinearInterpolate, symmetric } from "./Math";

const { width, height } = Dimensions.get("window");
const size = vec(width, height);

const rectToTexture = (
  vertices: CubicBezier[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) =>
  [
    vertices[tl].pos,
    vertices[tr].pos,
    vertices[br].pos,
    vertices[bl].pos,
  ] as const;

const rectToColors = (
  colors: number[],
  vertices: CubicBezier[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) =>
  [
    bilinearInterpolate(colors, size, vertices[tl].pos),
    bilinearInterpolate(colors, size, vertices[tr].pos),
    bilinearInterpolate(colors, size, vertices[br].pos),
    bilinearInterpolate(colors, size, vertices[bl].pos),
  ] as const;

const rectToPatch =
  (mesh: AnimationValue<CubicBezier[]>, indices: readonly number[]) => () => {
    const tl = mesh.value[indices[0]];
    const tr = mesh.value[indices[1]];
    const br = mesh.value[indices[2]];
    const bl = mesh.value[indices[3]];
    return [
      {
        pos: tl.pos,
        c1: tl.c2,
        c2: tl.c1,
      },
      {
        pos: tr.pos,
        c1: symmetric(tr.c1, tr.pos),
        c2: tr.c2,
      },
      {
        pos: br.pos,
        c1: symmetric(br.c2, br.pos),
        c2: symmetric(br.c1, br.pos),
      },
      {
        pos: bl.pos,
        c1: bl.c1,
        c2: symmetric(bl.c2, bl.pos),
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

  const defaultMesh = new Array(cols + 1)
    .fill(0)
    .map((_c, col) =>
      new Array(rows + 1).fill(0).map((_r, row) => {
        const pos = vec(row * dx, col * dy);
        return {
          pos,
          c1: add(pos, vec(C, 0)),
          c2: add(pos, vec(0, C)),
        };
      })
    )
    .flat(2);

  const mesh = useValue(defaultMesh);
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
      // const P4H1 = symmetric(P4H.value, vertices.value[4]);
      // const P4V1 = symmetric(P4V.value, vertices.value[4]);
      // if (inRadius(pt, vertices.value[4])) {
      //   const delta = sub(vertices.value[4], pt);
      //   vertices.value[4] = pt;
      //   P4H.value = sub(P4H.value, delta);
      //   P4V.value = sub(P4V.value, delta);
      // } else if (inRadius(pt, P4H.value)) {
      //   P4H.value = pt;
      // } else if (inRadius(pt, P4H1)) {
      //   P4H.value = symmetric(pt, vertices.value[4]);
      // } else if (inRadius(pt, P4V.value)) {
      //   P4V.value = pt;
      // } else if (inRadius(pt, P4V1)) {
      //   P4V.value = symmetric(pt, vertices.value[4]);
      // }
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
          patch={rectToPatch(mesh, r)}
          colors={rectToColors(colors, defaultMesh, r)}
          texture={rectToTexture(defaultMesh, r)}
          blendMode={debug ? "srcOver" : "dstOver"}
          debug={debug}
        />
      ))}
      {/* <Cubic
        vertices={vertices}
        index={4}
        c1={P4V}
        c2={P4H}
        colors={colors}
        size={size}
      /> */}
    </Canvas>
  );
};
