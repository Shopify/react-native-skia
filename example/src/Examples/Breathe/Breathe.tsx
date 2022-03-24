import type { SkiaValue } from "@shopify/react-native-skia";
import {
  Rect,
  runTiming,
  mix,
  useDerivedValue,
  Canvas,
  Fill,
  Group,
  useValue,
  useTouchHandler,
} from "@shopify/react-native-skia";
import React, { useState, useEffect } from "react";

interface ButtonProps {
  pressed: SkiaValue<number>;
}

const Button = ({ pressed }: ButtonProps) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setDone(true);
    }, 4000);
  }, []);
  const color = useDerivedValue(() => {
    return `rgb(0, 0, ${Math.round(mix(pressed.current, 0, 255))})`;
  }, [pressed]);
  const opacity = useDerivedValue(
    () => mix(pressed.current, 0.5, 1),
    [pressed]
  );
  return (
    <Rect
      x={0}
      y={0}
      width={24}
      height={24}
      opacity={opacity}
      color={done ? "rgb(255, 0, 255)" : color}
    />
  );
};

export const Breathe = () => {
  const pressed = useValue(0);
  const onTouch = useTouchHandler({
    onStart: () => {
      runTiming(pressed, 1, { duration: 1000 });
    },
    onEnd: () => {
      runTiming(pressed, 0, { duration: 1000 });
    },
  });
  return (
    <Canvas style={{ flex: 1 }} debug onTouch={onTouch}>
      <Fill color="#F0F0F3" />
      {/* <Group transform={[{ scale: 4 }, { translateX: 10 }, { translateY: 10 }]}>
        <Button pressed={pressed} />
      </Group> */}
      <Group transform={[{ scale: 4 }, { translateX: 60 }, { translateY: 10 }]}>
        <Button pressed={pressed} />
      </Group>
    </Canvas>
  );
};
