import React, { useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Button, PixelRatio, StyleSheet, Text, View } from "react-native";
import {
  Canvas,
  Group,
  Image,
  Paint,
  Skia,
  RuntimeShader,
  useImage,
  useTouchHandler,
  vec,
} from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";

import { Slider } from "../SpeedTest/Slider";

const pd = PixelRatio.get();

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 screen;
uniform vec2 touchPos;
uniform float drawing;
uniform float zoomLevel;
uniform float isFixed;

const vec2 magnifier_center = vec2(80);

half4 main(vec2 pos) {
    if (drawing == 0)
        return image.eval(pos);

    // Convert to UV coordinates, accounting for aspect ratio
    vec2 uv = pos / screen.y / ${pd};

    vec2 touch = touchPos.xy;
    if (touch == vec2(0))
        touch = screen.xy / 2 / ${pd};

    // UV coordinates of touch
    vec2 touch_uv = touch / screen.y;

    // Distance to touch
    float touch_dist = distance(uv, touch_uv);

     // UV coordinates of magnifier center
    vec2 magnifier_uv = magnifier_center / screen.y;

    // Distance from magnifier to touch
    float magnifier_touch_dist = distance(magnifier_uv, touch_uv);

    if (magnifier_touch_dist < 0.1)
        magnifier_uv.x = (screen.x / screen.y) - magnifier_uv.x;

    // Distance to magnifier center
    float magnifier_dist = distance(uv, magnifier_uv);

    // Draw the texture
    half4 fragColor = image.eval(uv * screen.y * ${pd});

    if (isFixed == 1) {
        // Draw the outline of the glass
        if (magnifier_dist < 0.102)
            fragColor = half4(0.01, 0.01, 0.01, 1);
    
        // Draw a zoomed-in version of the texture
        if (magnifier_dist < 0.1)
            fragColor = image.eval((touch_uv - ((magnifier_uv - uv) * zoomLevel)) * screen.y * ${pd});
    } else {
        // Draw the outline of the glass
        if (touch_dist < 0.102)
            fragColor = half4(0.01, 0.01, 0.01, 1);
    
        // Draw a zoomed-in version of the texture
        if (touch_dist < 0.1)
            fragColor = image.eval((uv + (touch_uv - uv) * (1 - zoomLevel)) * screen.y * ${pd});
    }

    return fragColor;
}`)!;

export const MagnifyingGlass = () => {
  const canvasWidth = useSharedValue(0);
  const canvasHeight = useSharedValue(0);

  const drawing = useSharedValue(0);
  const touchPosX = useSharedValue(0);
  const touchPosY = useSharedValue(0);

  // 1 means no zoom and 0 max
  const zoomLevel = useSharedValue(0.4);

  const [isFixed, setIsFixed] = useState(true);
  const isFixedSharedValue = useSharedValue(1);

  const image = useImage(require("../../assets/oslo2.jpg"));

  const onTouch = useTouchHandler({
    onStart: ({ x, y }) => {
      touchPosX.value = x;
      touchPosY.value = y;
      drawing.value = 1;
    },
    onActive: ({ x, y }) => {
      touchPosX.value = x;
      touchPosY.value = y;
    },
    onEnd: () => {
      drawing.value = 0;
    },
  });

  const uniforms = useDerivedValue(() => {
    return {
      screen: vec(canvasWidth.value, canvasHeight.value),
      touchPos: vec(touchPosX.value, touchPosY.value),
      drawing: drawing.value,
      zoomLevel: zoomLevel.value,
      isFixed: isFixedSharedValue.value,
    };
  }, [drawing, canvasWidth, canvasHeight, zoomLevel, isFixedSharedValue]);

  if (!image) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading image...</Text>
      </View>
    );
  }

  const handleCanvasLayoutChange = (event: LayoutChangeEvent) => {
    canvasWidth.value = event.nativeEvent.layout.width;
    canvasHeight.value = event.nativeEvent.layout.height;
  };

  return (
    <View style={{ flex: 1, flexDirection: "column-reverse" }}>
      <Canvas
        style={StyleSheet.absoluteFill}
        mode="continuous"
        onTouch={onTouch}
        onLayout={handleCanvasLayoutChange}
      >
        <Group transform={[{ scale: 1 / pd }]}>
          <Group
            layer={
              <Paint>
                <RuntimeShader source={source} uniforms={uniforms} />
              </Paint>
            }
            transform={[{ scale: pd }]}
          >
            <Image
              image={image}
              fit="cover"
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
            />
          </Group>
        </Group>
      </Canvas>
      <View
        style={{
          height: 60,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Slider
          initialValue={0.5}
          minValue={1}
          maxValue={0}
          onValueChange={(value) => (zoomLevel.value = value)}
        />
        <Button
          title={isFixed ? "Fixed" : "Following"}
          onPress={() => {
            setIsFixed((prev) => {
              isFixedSharedValue.value = !prev ? 1 : 0;
              return !prev;
            });
          }}
        />
      </View>
    </View>
  );
};
