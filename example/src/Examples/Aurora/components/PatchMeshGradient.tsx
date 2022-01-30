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

//interface PatchMeshGradientProps {}

const c = (
  pos: AnimationValue<Vector>,
  c1: AnimationValue<Vector>,
  c2: AnimationValue<Vector>
) => ({
  pos: pos.value,
  c1: c1.value,
  c2: c2.value,
});

const rectToTexture = ([tl, tr, br, bl]: readonly [
  AnimationValue<Vector>,
  AnimationValue<Vector>,
  AnimationValue<Vector>,
  AnimationValue<Vector>
]) => [tl.value, tr.value, br.value, bl.value] as const;

const rectToPatch =
  ([tl, tr, br, bl]: readonly [
    AnimationValue<Vector>,
    AnimationValue<Vector>,
    AnimationValue<Vector>,
    AnimationValue<Vector>
  ]) =>
  () =>
    [tl, tl, tr, tr, tr, br, br, br, bl, bl, bl, tl].map((v) => v.value);

const { width, height } = Dimensions.get("window");
const dx = width / 2;
const dy = height / 2;

export const PatchMeshGradient = () => {
  const P0 = useValue(vec(0, 0));
  const P1 = useValue(vec(dx, 0));
  const P2 = useValue(vec(dx * 2, 0));

  const P3 = useValue(vec(0, dy));
  const P4 = useValue(vec(dx, dy));
  const P5 = useValue(vec(dx * 2, dy));

  const P6 = useValue(vec(0, 2 * dy));
  const P7 = useValue(vec(dx, 2 * dy));
  const P8 = useValue(vec(dx * 2, 2 * dy));

  const r1 = [P0, P1, P4, P3] as const;
  const r2 = [P1, P2, P5, P4] as const;
  const r3 = [P3, P4, P7, P6] as const;
  const r4 = [P4, P5, P8, P7] as const;

  const onTouch = useTouchHandler({
    onActive: (pt) => {
      if (inRadius(pt, P4.value)) {
        P4.value = pt;
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
        patch={rectToPatch(r1)}
        textures={rectToTexture(r1)}
        // colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r2)}
        textures={rectToTexture(r2)}
        //        colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r3)}
        textures={rectToTexture(r3)}
        //         colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r4)}
        textures={rectToTexture(r4)}
        //        colors={["red", "green", "yellow", "blue"]}
      />
      <Cubic pos={P4} />
    </Canvas>
  );
};
