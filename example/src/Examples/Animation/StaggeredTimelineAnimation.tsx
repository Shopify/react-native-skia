import React, { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import type { IValue } from "@shopify/react-native-skia";
import {
  Canvas,
  Circle,
  Easing,
  RoundedRect,
  Timeline,
  useTimeline,
  useTouchHandler,
  useValue,
  Value,
} from "@shopify/react-native-skia";

import { AnimationElement, AnimationDemo, Size, Padding } from "./Components";

export const StaggeredTimelineAnimation = () => {
  const { width } = useWindowDimensions();
  const shapeYValues = useMemo(
    () =>
      new Array(Math.round((width - Size) / (Size * 1.5)))
        .fill(0)
        .map(() => Value.createValue(0)),
    [width]
  );

  const timeline = useTimeline(
    (tl) =>
      tl
        .stagger(
          shapeYValues.map((v) =>
            Timeline.create(
              { from: 0, to: 60, value: v },
              { duration: 150, easing: Easing.bounce }
            )
          ),
          {
            amount: 150,
            from: "center",
          }
        )
        .stagger(
          shapeYValues.map((v) =>
            Timeline.createBuilder().add(
              { from: 60, to: 0, value: v },
              { duration: 50, easing: Easing.bounce }
            )
          ),
          {
            amount: 150,
            from: "center",
          }
        ),
    { loop: true, immediate: true }
  );

  const x = useValue(0);
  const y = useValue(0);
  useTimeline(
    (tl) => {
      tl.add(
        { to: width - Size * 2, value: x },
        { duration: 5 * (width - Size * 2) }
      )
        .add({ to: 60, value: y }, { duration: 5 * 60 })
        .add({ to: 0, value: x }, { duration: 5 * (width - Size * 2) })
        .add({ to: 0, value: y }, { duration: 5 * 60 });
    },
    { loop: true, yoyo: false, immediate: true }
  );

  const sliderPos = useValue(10);
  useEffect(() => {
    return sliderPos.addListener((value) => {
      const normalized = value / (width - Padding - 10);
      timeline.seek(normalized);
    });
  }, [sliderPos, width, timeline]);

  return (
    <AnimationDemo title={"Timeline animation with staggered animations"}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={x} y={y} color="#4F04E2" />
        {shapeYValues.map((v, i) => (
          <AnimationElement x={i * (Size * 1.5) + Size / 2} y={v} key={i} />
        ))}
      </Canvas>
      <Slider position={sliderPos} />
    </AnimationDemo>
  );
};

const Slider: React.FC<{ position: IValue<number> }> = ({ position }) => {
  const { width } = useWindowDimensions();
  const touchHandler = useTouchHandler({
    onActive: ({ x }) => {
      position.value = Math.max(10, Math.min(width - Padding - 10, x + 10));
    },
  });
  return (
    <Canvas style={styles.slider} onTouch={touchHandler}>
      <RoundedRect
        x={0}
        y={20 - Size / 4}
        width={width - Padding}
        height={Size / 4}
        color="#4F04E2"
        rx={5}
        ry={5}
      />
      <Circle cx={position} cy={17} r={10} color="#8F04E2" />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    height: 80,
    width: "100%",
    backgroundColor: "#FEFEFE",
  },
  slider: {
    width: "100%",
    height: 40,
    backgroundColor: "#FEFEFE",
  },
});
