import React, { useMemo } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  Canvas,
  mix,
  Rect,
  Spring,
  Timing,
  useProgress,
  useTouchHandler,
  useValue,
  Value,
  useLoop,
  Timeline,
} from "@shopify/react-native-skia";
import type { DrawingContext } from "@shopify/react-native-skia/src/renderer/DrawingContext";

const Size = 20;
const Padding = 20;
const { width } = Dimensions.get("window");

export const AnimationExample: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.scrollview}>
      <SimpleValueOverTime />
      <InterpolatingValueOverTime />
      <InterpolatingValueOverTimeWithEasings />
      <InterpolatingValueOverTimeWithSpring />
      <AnimationWithTouchHandler />
      <SimpleTimelineAnimation />
      <StaggeredTimelineAnimation />
    </ScrollView>
  );
};

const SimpleValueOverTime = () => {
  const progress = useValue(0);
  useProgress(progress);
  return (
    <AnimationDemo title={"Simple animation of value over time"}>
      <Canvas style={styles.canvas}>
        <AnimationElement
          x={(ctx) => mix(progress.value % 1, 10, ctx.width - 10)}
        />
      </Canvas>
    </AnimationDemo>
  );
};

const InterpolatingValueOverTime = () => {
  const progress = useValue(0);
  useLoop(
    progress,
    Timing.create({
      from: 0,
      to: width - Size,
      durationSeconds: 1,
    }),
    { yoyo: true }
  );
  return (
    <AnimationDemo
      title={"Interpolating value between 0 and width over 1 second."}
    >
      <Canvas style={styles.canvas}>
        <AnimationElement x={() => progress.value} />
      </Canvas>
    </AnimationDemo>
  );
};

const InterpolatingValueOverTimeWithEasings = () => {
  const progress = useValue(0);
  useLoop(
    progress,
    Timing.create({
      from: 10,
      to: width - Size - Padding,
      durationSeconds: 1,
      easing: Timing.Easing.inOut(Timing.Easing.cubic),
    }),
    { yoyo: true }
  );
  return (
    <AnimationDemo title={"Interpolating value using an easing."}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={() => progress.value} />
      </Canvas>
    </AnimationDemo>
  );
};

const InterpolatingValueOverTimeWithSpring = () => {
  const progress = useValue(0);
  useLoop(
    progress,
    Spring.create(
      {
        from: (width - Size - Padding) * 0.25,
        to: (width - Size - Padding) * 0.75,
      },
      Spring.Wobbly()
    ),
    { yoyo: true }
  );
  return (
    <AnimationDemo title={"Interpolating value using a spring."}>
      <Canvas style={styles.canvas}>
        <AnimationElement x={() => progress.value} />
      </Canvas>
    </AnimationDemo>
  );
};

const AnimationWithTouchHandler = () => {
  const translateX = useValue((width - Size - Padding) / 2);
  const diffX = useValue(0);
  const touchHandler = useTouchHandler({
    onStart: ({ x }) => {
      diffX.value = x - translateX.value;
      // Stop any animations by updating the animation value
      translateX.value = translateX.value;
    },
    onActive: ({ x }) => (translateX.value = x - diffX.value),
    onEnd: ({ velocityX }) => {
      Spring.run(
        translateX,
        (width - Size - Padding) / 2,
        Spring.Wobbly({ velocity: velocityX })
      );
    },
  });

  return (
    <AnimationDemo title={"Animation with touch handler."}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <AnimationElement x={() => translateX.value} />
      </Canvas>
    </AnimationDemo>
  );
};

const SimpleTimelineAnimation = () => {
  const progress = useValue(0);
  const x = useValue(0);
  const y = useValue(0);
  useLoop(
    progress,
    Timeline.create((tl) => {
      tl.add(Timing.create({ from: 0, to: 1, durationSeconds: 1 }), x);
      tl.add(Timing.create({ from: 0, to: 1, durationSeconds: 0.3 }), y);
      tl.add(Timing.create({ from: 1, to: 0, durationSeconds: 1 }), x);
      tl.add(Timing.create({ from: 1, to: 0, durationSeconds: 0.4 }), y);
    }),
    { yoyo: false }
  );

  return (
    <AnimationDemo
      title={"Simple timeline animation with sequenced animations"}
    >
      <Canvas style={styles.canvas}>
        <AnimationElement
          x={({ width: w }) => x.value * (w - Size)}
          y={({ height: h }) => y.value * (h - Size)}
        />
      </Canvas>
    </AnimationDemo>
  );
};

const StaggeredTimelineAnimation = () => {
  const progress = useValue(0);
  const values = useMemo(
    () =>
      new Array(Math.round((width - Size) / (Size * 1.5)))
        .fill(0)
        .map(() => Value.create(0)),
    []
  );

  useLoop(
    progress,
    Timeline.create((tl) => {
      tl.stagger(
        values.map(() => Spring.create({ from: 0, to: 1 }, Spring.Wobbly())),
        values,
        {
          each: 50,
          from: "center",
        }
      );
    }),
    { yoyo: true }
  );

  return (
    <AnimationDemo title={"Timeline animation with staggered animations"}>
      <Canvas style={styles.canvas}>
        {values.map((v, i) => (
          <AnimationElement
            key={i}
            x={i * Size * 1.5}
            y={({ height: h }) => v.value * (h - Size)}
          />
        ))}
      </Canvas>
    </AnimationDemo>
  );
};

const AnimationElement: React.FC<{
  x: number | ((ctx: DrawingContext) => number);
  y?: number | ((ctx: DrawingContext) => number);
  w?: number | ((ctx: DrawingContext) => number);
  h?: number | ((ctx: DrawingContext) => number);
  color?: string | number;
}> = ({ x, y, w, h, color = "#7FC8A9" }) => {
  return (
    <Rect
      x={x}
      y={y ? y : (ctx) => ctx.height / 2 - Size / 2}
      height={w ?? Size}
      width={h ?? Size}
      color={color}
    />
  );
};

const AnimationDemo: React.FC<{ title: string }> = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollview: {
    paddingVertical: 20,
    paddingBottom: 80,
  },
  container: {
    marginBottom: 20,
    paddingHorizontal: Padding / 2,
  },
  text: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  canvas: {
    height: 80,
    width: width - Padding,
    backgroundColor: "#FEFEFE",
  },
});
