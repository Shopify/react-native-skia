import React from "react";
import type {
  AnimationValue,
  CubicBezierHandle,
} from "@shopify/react-native-skia";
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

import { bilinearInterpolate, symmetric, inRadius } from "./Math";
import { Cubic } from "./Cubic";

const { width, height } = Dimensions.get("window");
const size = vec(width, height);

const rectToTexture = (
  vertices: CubicBezierHandle[],
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
  vertices: CubicBezierHandle[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) =>
  [
    bilinearInterpolate(colors, size, vertices[tl].pos),
    bilinearInterpolate(colors, size, vertices[tr].pos),
    bilinearInterpolate(colors, size, vertices[br].pos),
    bilinearInterpolate(colors, size, vertices[bl].pos),
  ] as const;

const rectToPatch =
  (mesh: AnimationValue<CubicBezierHandle[]>, indices: readonly number[]) =>
  () => {
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
  const C = dx / 3;

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
      defaultMesh.every(({ pos: p }, index) => {
        const edge = p.x === 0 || p.y === 0 || p.x === width || p.y === height;
        if (!edge) {
          const { pos, c1, c2 } = mesh.value[index];
          const c3 = symmetric(c1, pos);
          const c4 = symmetric(c2, pos);
          if (inRadius(pt, pos)) {
            const delta = sub(pos, pt);
            mesh.value[index].pos = pt;
            mesh.value[index].c1 = sub(c1, delta);
            mesh.value[index].c2 = sub(c2, delta);
            return false;
          } else if (inRadius(pt, c1)) {
            mesh.value[index].c1 = pt;
            return false;
          } else if (inRadius(pt, c2)) {
            mesh.value[index].c2 = pt;
            return false;
          } else if (inRadius(pt, c3)) {
            mesh.value[index].c1 = symmetric(pt, mesh.value[index].pos);
            return false;
          } else if (inRadius(pt, c4)) {
            mesh.value[index].c2 = symmetric(pt, mesh.value[index].pos);
            return false;
          }
        }
        return true;
      });
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
        />
      ))}
      {defaultMesh.map(({ pos }, index) => {
        const edge =
          pos.x === 0 || pos.y === 0 || pos.x === width || pos.y === height;
        if (edge) {
          return null;
        }
        return (
          <Cubic
            key={index}
            mesh={mesh}
            index={index}
            colors={colors}
            size={size}
          />
        );
      })}
    </Canvas>
  );
};
