import {
  Canvas,
  Group,
  Rect,
  Skia,
  SkiaView,
  useClock,
} from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";

const array = new Array(1).fill(0).map((_, index) => index);
const paint = Skia.Paint();
paint.setColor(Skia.Color("pink"));

export function Breathe() {
  const clock = useClock();
  const offsetTx = useDerivedValue(() => [
    { translateY: 300 + Math.sin(clock.value / 300) * 300 - 300 },
  ]);
  const style = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    transform: [{ translateY: 300 + Math.sin(clock.value / 300) * 300 - 300 }],
  }));
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
      }}
    >
      <View style={{ flex: 1 }}>
        <Animated.View style={style}>
          {array.map((index) => (
            <View
              key={index}
              style={{
                position: "absolute",
                top: 150 * index + 50,
                left: 15,
                width: 100,
                height: 100,
                backgroundColor: "blue",
              }}
            />
          ))}
        </Animated.View>
      </View>
      <SkiaView
        style={StyleSheet.absoluteFill}
        onDraw={(canvas) => {
          canvas.save();
          canvas.translate(0, 300 + Math.sin(clock.value / 300) * 300 - 300);
          array.forEach((index) => {
            canvas.drawRect(
              {
                x: 15,
                y: 150 * index + 50,
                width: 100,
                height: 100,
              },
              paint
            );
          });
          canvas.restore();
        }}
        mode="continuous"
      />
      <Canvas
        mode="continuous"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Group transform={offsetTx}>
          {array.map((index) => (
            <Rect
              key={index}
              x={15}
              y={150 * index + 50}
              width={100}
              height={100}
              color="red"
            />
          ))}
        </Group>
      </Canvas>
    </View>
  );
}
