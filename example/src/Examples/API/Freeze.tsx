import React from "react";
import {
  Canvas,
  Group,
  Rect,
  Text,
  useClockValue,
  useDerivedValue,
  ImageDrawing,
  rect,
} from "@shopify/react-native-skia";

const size = 200;
const n = 91;

export const FreezeExample = () => {
  const clock = useClockValue();
  const transform = useDerivedValue(
    () => [{ translateY: 100 }, { rotate: (Math.PI * clock.current) / 4000 }],
    [clock]
  );
  return (
    <Canvas style={{ flex: 1, margin: 50 }} debug>
      <Group origin={{ x: size / 2, y: size / 2 }} transform={transform}>
        <ImageDrawing rect={rect(0, 0, 200, 200)}>
          <Checkerboard />
        </ImageDrawing>
      </Group>
      <Text
        x={20}
        y={size + 100}
        text={`n = ${n}`}
        familyName="serif"
        size={32}
      />
    </Canvas>
  );
};

const Checkerboard = () => {
  // draw a n * n checkerboard
  return (
    <>
      {[...Array(n * n)].map((_, i) => (
        <Rect
          key={i}
          x={((i % n) * size) / n}
          y={(Math.floor(i / n) * size) / n}
          width={size / n}
          height={size / n}
          color={i % 2 ? "#000" : "#ddd"}
        />
      ))}
    </>
  );
};
