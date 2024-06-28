import React, { useState } from "react";
import type { LayoutChangeEvent } from "react-native";
import { StyleSheet, Switch, Text, View } from "react-native";
import {
  Canvas,
  Fill,
  ImageShader,
  Skia,
  Shader,
  useImage,
  vec,
} from "@shopify/react-native-skia";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Slider from "@react-native-community/slider";

const source = Skia.RuntimeEffect.Make(`
uniform shader image;
uniform vec2 screen;
uniform vec2 touchPos;
uniform float drawing;
uniform float zoomLevel;
uniform float magnifierDiameter;
uniform float isFixed;

const vec2 magnifier_center = vec2(80);

// unit in percentage relative to the screen width
const float magnifier_offset = 0.025;

// in pixels
const float border_width = 4;

half4 main(vec2 pos) {
    if (drawing == 0)
        return image.eval(pos);

    // Convert to UV coordinates, accounting for aspect ratio
    vec2 uv = pos / screen.y;

    vec2 touch = touchPos.xy;
    if (touch == vec2(0))
        touch = screen.xy / 2;

    // UV coordinates of touch
    vec2 touch_uv = touch / screen.y;

    // Distance to touch
    float touch_dist = distance(uv, touch_uv);

     // UV coordinates of magnifier center
    vec2 magnifier_uv = vec2((screen.x / screen.y) * (magnifierDiameter / 2 + magnifier_offset));
    float magnifier_radius = (screen.x / screen.y) * magnifierDiameter / 2;

    // Distance from magnifier to touch
    float magnifier_touch_dist = distance(magnifier_uv, touch_uv);

    if (magnifier_touch_dist < magnifier_radius)
        magnifier_uv.x = (screen.x / screen.y) - magnifier_uv.x;

    // Distance to magnifier center
    float magnifier_dist = distance(uv, magnifier_uv);

    // Draw the texture
    half4 fragColor = image.eval(uv * screen.y);

    float border = ((screen.x / screen.y) / screen.y) * border_width;

    if (isFixed == 1) {
        // Draw the outline of the glass
        if (magnifier_dist < magnifier_radius + border)
            fragColor = half4(1, 1, 1, 1);
    
        // Draw a zoomed-in version of the texture
        if (magnifier_dist < magnifier_radius)
            fragColor = image.eval((touch_uv - ((magnifier_uv - uv) * zoomLevel)) * screen.y);
    } else {
        // Draw the outline of the glass
        if (touch_dist < magnifier_radius + border)
            fragColor = half4(1, 1, 1, 1);
    
        // Draw a zoomed-in version of the texture
        if (touch_dist < magnifier_radius)
            fragColor = image.eval((uv + (touch_uv - uv) * (1 - zoomLevel)) * screen.y);
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
  // percentage relative to the screen width
  const magnifierDiameter = useSharedValue(0.33);

  const [isFixed, setIsFixed] = useState(true);
  const isFixedSharedValue = useSharedValue(1);

  const image = useImage(require("../../assets/oslo2.jpg"));

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      touchPosX.value = e.x;
      touchPosY.value = e.y;
      drawing.value = 1;
    })
    .onChange((e) => {
      touchPosX.value = e.x;
      touchPosY.value = e.y;
    })
    .onFinalize(() => {
      drawing.value = 0;
    });

  const uniforms = useDerivedValue(() => {
    return {
      screen: vec(canvasWidth.value, canvasHeight.value),
      touchPos: vec(touchPosX.value, touchPosY.value),
      drawing: drawing.value,
      zoomLevel: zoomLevel.value,
      magnifierDiameter: magnifierDiameter.value,
      isFixed: isFixedSharedValue.value,
    };
  }, [
    drawing,
    canvasWidth,
    canvasHeight,
    zoomLevel,
    magnifierDiameter,
    isFixedSharedValue,
  ]);

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
      <GestureDetector gesture={gesture}>
        <Canvas
          style={StyleSheet.absoluteFill}
          mode="continuous"
          onLayout={handleCanvasLayoutChange}
        >
          <Fill>
            <Shader source={source} uniforms={uniforms}>
              <ImageShader
                image={image}
                fit="cover"
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
              />
            </Shader>
          </Fill>
        </Canvas>
      </GestureDetector>
      <View style={styles.controls}>
        <View style={styles.control}>
          <Text style={{ color: "white" }}>Zoom:</Text>
          <Slider
            style={{ width: 200 }}
            value={zoomLevel.value}
            minimumValue={1}
            maximumValue={0}
            onValueChange={(value) => (zoomLevel.value = value)}
            onSlidingStart={() => {
              drawing.value = 1;
              touchPosX.value = canvasWidth.value / 2;
              touchPosY.value = canvasHeight.value / 2;
            }}
            onSlidingComplete={() => {
              drawing.value = 0;
            }}
          />
        </View>
        <View style={styles.control}>
          <Text style={{ color: "white" }}>Size:</Text>
          <Slider
            style={{ width: 200 }}
            value={magnifierDiameter.value}
            minimumValue={0.2}
            maximumValue={0.6}
            onValueChange={(value) => (magnifierDiameter.value = value)}
            onSlidingStart={() => {
              drawing.value = 1;
              touchPosX.value = canvasWidth.value / 2;
              touchPosY.value = canvasHeight.value / 2;
            }}
            onSlidingComplete={() => {
              drawing.value = 0;
            }}
          />
        </View>
        <View style={styles.control}>
          <Text style={{ color: "white" }}>Fixed?</Text>
          <Switch
            value={isFixed}
            onValueChange={() => {
              setIsFixed((prev) => {
                isFixedSharedValue.value = !prev ? 1 : 0;
                return !prev;
              });
            }}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    height: 120,
    paddingHorizontal: "15%",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.5)",
    gap: 12,
  },
  control: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
