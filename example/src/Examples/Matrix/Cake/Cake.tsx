import React from "react";
import {
  Blur,
  Canvas,
  Fill,
  ImageShader,
  processTransform3d,
  rect,
} from "@shopify/react-native-skia";
import { extrudePolygon } from "geometry-extrude";
import { Dimensions } from "react-native";
import { useSharedValue } from "@shopify/react-native-skia/src/external/reanimated/moduleWrapper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useDerivedValue, withDecay } from "react-native-reanimated";

import { createObject, createCircle, normalizeRadians } from "./Geometry";
import { Object3d } from "./Object3d";
import { useMatrixTexture } from "./Texture";

const { PI } = Math;

const { width, height } = Dimensions.get("window");
const size = 165;
const h = 0.35 * size;
const w = 1 * size;
const l = 1.5 * size;

const triangle = [
  [
    [-w / 2, -l / 2],
    [w / 2, -l / 2],
    [0, l / 2],
  ],
];

const d = height * 0.025;
const textureSize = { width: 400, height: 400 };
const cake = [
  ...createObject(
    extrudePolygon([triangle], {
      depth: h,
      excludeBottom: true,
      // bevelSize: 100,
      // bevelSegments: 10,
      // smoothSide: true,
      // smoothBevel: true,
    }),
    [{ translate: [width / 2, height / 2, -h / 2] }, { rotateX: 0 }],
    textureSize
  ),
];

// replace buggy uvs
const side1 = cake[1];
const side2 = cake[2];
side1.forEach((tri, i) => {
  tri.uv = side2[i].uv;
});

const plate = [
  ...createObject(
    extrudePolygon([[createCircle(width / 2, 25)]], {
      depth: d,
      // excludeBottom: true,
    }),
    [
      { translate: [width / 2, height / 2, -d - h / 2] },
      //  { rotateX: Math.PI / 2 },
    ],
    textureSize
  ),
];

export const Cake = () => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const texture = useMatrixTexture();
  const gesture = Gesture.Pan()
    .onChange((event) => {
      rotateY.value = event.changeX / width;
      rotateX.value -= event.changeY / height;
    })
    .onEnd(({ velocityX, velocityY }) => {
      rotateY.value = withDecay({ velocity: velocityX / width });
      rotateX.value = withDecay({ velocity: -velocityY / height });
    });
  const matrix = useDerivedValue(() => {
    return processTransform3d([
      { translate: [width / 2, height / 2] },
      { rotateY: rotateY.value },
      { rotateX: rotateX.value },
      { translate: [-width / 2, -height / 2] },
    ]);
  });
  const objects = [plate, cake];
  // Default order
  // Logic to dynamically set the objects order based on rotateX and rotateY
  const objectsOrder = useDerivedValue(() => {
    const rotX = normalizeRadians(rotateX.value);
    const rotY = normalizeRadians(rotateY.value);
    let order = [0, 1]; // Default order: [plate, cake]

    // Adjust order based on rotateX
    if (rotX > Math.PI / 2 && rotX < (3 * Math.PI) / 2) {
      order = [1, 0]; // [cake, plate]
    }

    // Additional condition for rotateY, potentially reversing the order
    if (rotY > Math.PI / 2 && rotY < (3 * Math.PI) / 2) {
      order.reverse(); // Reverse whatever the current order is
    }

    return order;
  });

  const index1 = useDerivedValue(() => {
    return objectsOrder.value[0];
  });
  const index2 = useDerivedValue(() => {
    return objectsOrder.value[1];
  });
  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <ImageShader
            image={texture}
            rect={rect(0, 0, width, height)}
            fit="cover"
          />
          <Blur blur={10} />
        </Fill>
        <Fill color="rgba(0, 0, 0, 0.7)" />
        <Object3d
          objects={objects}
          index={index1}
          matrix={matrix}
          texture={texture}
        />
        <Object3d
          objects={objects}
          index={index2}
          matrix={matrix}
          texture={texture}
        />
      </Canvas>
    </GestureDetector>
  );
};
