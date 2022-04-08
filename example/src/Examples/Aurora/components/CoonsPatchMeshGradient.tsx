import React from "react";
import type {
  CubicBezierHandle,
  SkiaReadonlyValue,
} from "@shopify/react-native-skia";
import {
  useClockValue,
  add,
  useValue,
  Canvas,
  ImageShader,
  Patch,
  vec,
  Paint,
  useImage,
  useDerivedValue,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";
import SimplexNoise from "simplex-noise";

import { symmetric } from "./Math";
import { Cubic } from "./Cubic";
import { Curves } from "./Curves";
import { useHandles } from "./useHandles";

const { width, height } = Dimensions.get("window");

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
  colors: string[],
  [tl, tr, br, bl]: readonly [number, number, number, number]
) => [colors[tl], colors[tr], colors[br], colors[bl]] as const;

const useRectToPatch = (
  mesh: SkiaReadonlyValue<CubicBezierHandle[]>,
  indices: readonly number[]
) =>
  useDerivedValue(() => {
    const tl = mesh.current[indices[0]];
    const tr = mesh.current[indices[1]];
    const br = mesh.current[indices[2]];
    const bl = mesh.current[indices[3]];
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
  }, [mesh]);

interface CoonsPatchMeshGradientProps {
  rows: number;
  cols: number;
  colors: string[];
  debug?: boolean;
  lines?: boolean;
  handles?: boolean;
  play?: boolean;
}

const F = 10000;
const A = 80;

export const CoonsPatchMeshGradient = ({
  rows,
  cols,
  colors,
  debug,
  lines,
  handles,
  play,
}: CoonsPatchMeshGradientProps) => {
  const clock = useClockValue();
  const image = useImage(require("../../../assets/debug.png"));
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
  const meshNoise = useDerivedValue(() => {
    return defaultMesh.map((pt, i) => {
      const isEdge =
        pt.pos.x === 0 ||
        pt.pos.y === 0 ||
        pt.pos.x === width ||
        pt.pos.y === height;
      if (isEdge) {
        return pt;
      }
      const noisePos = new SimplexNoise(`${i}-pos`);
      const noiseC1 = new SimplexNoise(`${i}-c1`);
      const noiseC2 = new SimplexNoise(`${i}-c2`);
      const p = { ...pt };
      p.pos = { ...pt.pos };
      p.c1 = { ...pt.c1 };
      p.c2 = { ...pt.c2 };
      p.pos.x += A * noisePos.noise2D(clock.current / F, 0);
      p.pos.y += A * noisePos.noise2D(0, clock.current / F);
      p.c1.x += A * noiseC1.noise2D(clock.current / F, 0);
      p.c1.y += A * noiseC1.noise2D(0, clock.current / F);
      p.c2.x += A * noiseC2.noise2D(clock.current / F, 0);
      p.c2.y += A * noiseC2.noise2D(0, clock.current / F);
      return p;
    });
  }, [clock]);

  const meshGesture = useValue(defaultMesh);

  const onTouch = useHandles(meshGesture, defaultMesh, width, height);
  const mesh = play ? meshNoise : meshGesture;
  if (image === null) {
    return null;
  }
  return (
    <Canvas style={{ width, height }} onTouch={onTouch}>
      <Paint>
        <ImageShader image={image} tx="repeat" ty="repeat" />
      </Paint>
      {rects.map((r, i) => {
        return (
          <RectPatch
            key={i}
            r={r}
            mesh={mesh}
            debug={debug}
            lines={lines}
            colors={colors}
            defaultMesh={defaultMesh}
          />
        );
      })}
      {defaultMesh.map(({ pos }, index) => {
        const edge =
          pos.x === 0 || pos.y === 0 || pos.x === width || pos.y === height;
        if (edge || !handles) {
          return null;
        }
        return (
          <Cubic key={index} mesh={mesh} index={index} color={colors[index]} />
        );
      })}
    </Canvas>
  );
};

interface RectPatchProps {
  r: readonly [number, number, number, number];
  debug?: boolean;
  lines?: boolean;
  colors: string[];
  mesh: SkiaReadonlyValue<CubicBezierHandle[]>;
  defaultMesh: CubicBezierHandle[];
}

const RectPatch = ({
  r,
  debug,
  lines,
  colors,
  mesh,
  defaultMesh,
}: RectPatchProps) => {
  const patch = useRectToPatch(mesh, r);
  return (
    <>
      <Patch
        patch={patch}
        colors={debug ? undefined : rectToColors(colors, r)}
        texture={rectToTexture(defaultMesh, r)}
      />
      {lines && <Curves patch={patch} />}
    </>
  );
};
