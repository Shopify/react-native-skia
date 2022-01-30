import React from "react";
import type Vector from "@shopify/react-native-skia";
import {
  Canvas,
  ImageShader,
  Patch,
  rect,
  vec,
  Paint,
} from "@shopify/react-native-skia";
import { Dimensions } from "react-native";

//interface PatchMeshGradientProps {}

const rectToPatch = ([tl, tr, br, bl]: readonly [
  Vector,
  Vector,
  Vector,
  Vector
]) => [tl, tl, tr, tr, tr, br, br, br, bl, bl, bl, tl] as const;

const { width, height } = Dimensions.get("window");
const dx = width / 2;
const dy = height / 2;

const P0 = vec(0, 0);
const P1 = vec(dx, 0);
const P2 = vec(dx * 2, 0);

const P3 = vec(0, dy);
const P4 = vec(dx, dy);
const P5 = vec(dx * 2, dy);

const P6 = vec(0, 2 * dy);
const P7 = vec(dx, 2 * dy);
const P8 = vec(dx * 2, 2 * dy);

const r1 = [P0, P1, P4, P3] as const;
const r2 = [P1, P2, P5, P4] as const;
const r3 = [P3, P4, P7, P6] as const;
const r4 = [P4, P5, P8, P7] as const;

export const PatchMeshGradient = () => {
  return (
    <Canvas style={{ width, height }}>
      <Paint>
        <ImageShader
          source={require("../../../assets/oslo.jpg")}
          fit="cover"
          rect={rect(0, 0, width, height)}
        />
      </Paint>
      <Patch
        patch={rectToPatch(r1)}
        // colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r2)}
        //        colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r3)}
        //         colors={["red", "green", "yellow", "blue"]}
      />
      <Patch
        patch={rectToPatch(r4)}
        //        colors={["red", "green", "yellow", "blue"]}
      />
    </Canvas>
  );
};
