import React from "react";
import { StyleSheet, Dimensions, ScrollView } from "react-native";
import {
  Rect,
  Paint,
  transformOrigin,
  sub,
  Canvas,
  Circle,
  translate,
  Skia,
  PaintStyle,
  DiscretePathEffect,
  DashPathEffect,
  Defs,
  usePaintRef,
  CornerPathEffect,
  rect,
  Path,
  Group,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";

const { width } = Dimensions.get("window");
const SIZE = width;
const path = Skia.Path.MakeFromSVGString(
  // eslint-disable-next-line max-len
  "M466 91C466 141.258 361.682 182 233 182C104.318 182 0 141.258 0 91C0 40.7421 104.318 0 233 0C361.682 0 466 40.7421 466 91Z"
)!;

const vWidth = 466;
const vHeight = 182;
const vOrigin = { x: vWidth / 2, y: vHeight / 2 };
const scale = (SIZE - 64) / vWidth;
const origin = { x: (vWidth * scale) / 2, y: (vHeight * scale) / 2 };
const center = { x: SIZE / 2, y: SIZE / 2 };
const basePaint = Skia.Paint();
basePaint.setAntiAlias(true);
basePaint.setColor(Skia.Color("#61DAFB"));

const strokePaint = basePaint.copy();
strokePaint.setStyle(PaintStyle.Stroke);
strokePaint.setStrokeWidth(15);
strokePaint.setPathEffect(Skia.PathEffect.MakeDiscrete(10, 4, 0));

const transparentPaint = basePaint.copy();
transparentPaint.setStyle(PaintStyle.Stroke);
transparentPaint.setStrokeWidth(15);
transparentPaint.setAlphaf(0.2);

const Logo = () => {
  return (
    <>
      <Circle c={center} r={30} style="fill" />
      <Group>
        <Group transform={[...translate(sub(center, origin)), { scale }]}>
          <Path path={path} style="stroke" strokeWidth={15} />
        </Group>
        <Group
          transform={[
            ...translate(sub(center, origin)),
            { scale },
            ...transformOrigin(vOrigin, [{ rotate: Math.PI / 3 }]),
          ]}
        >
          <Path path={path} style="stroke" strokeWidth={15} />
        </Group>
        <Group
          transform={[
            ...translate(sub(center, origin)),
            { scale },
            ...transformOrigin(vOrigin, [{ rotate: -Math.PI / 3 }]),
          ]}
        >
          <Path path={path} style="stroke" strokeWidth={15} />
        </Group>
      </Group>
    </>
  );
};

const rect1 = rect(0, 0, vWidth, vHeight);
const SquaredLogo = () => {
  const regularPaint = usePaintRef();
  return (
    <>
      <Defs>
        <Paint
          ref={regularPaint}
          color="#61DAFB"
          opacity={0.5}
          style="stroke"
          strokeWidth={15}
        />
      </Defs>
      <Circle c={center} r={30} style="fill" />
      <Group>
        <Group transform={[...translate(sub(center, origin)), { scale }]}>
          <Rect rect={rect1} paint={regularPaint} />
          <Rect rect={rect1} />
        </Group>
        <Group
          transform={[
            ...translate(sub(center, origin)),
            { scale },
            ...transformOrigin(vOrigin, [{ rotate: Math.PI / 3 }]),
          ]}
        >
          <Rect rect={rect1} paint={regularPaint} />
          <Rect rect={rect1} />
        </Group>
        <Group
          transform={[
            ...translate(sub(center, origin)),
            { scale },
            ...transformOrigin(vOrigin, [{ rotate: -Math.PI / 3 }]),
          ]}
        >
          <Rect rect={rect1} paint={regularPaint} />
          <Rect rect={rect1} />
        </Group>
      </Group>
    </>
  );
};

export const PathEffectDemo = () => {
  return (
    <ScrollView>
      <Title>Discrete</Title>
      <Canvas style={styles.container}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <DiscretePathEffect length={10} deviation={4} />
        </Paint>
        <Logo />
      </Canvas>

      <Title>Dash</Title>
      <Canvas style={styles.container}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <DashPathEffect intervals={[10, 10]} />
        </Paint>
        <Logo />
      </Canvas>

      <Title>Corner</Title>
      <Canvas style={styles.container}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <CornerPathEffect r={200} />
        </Paint>
        <SquaredLogo />
      </Canvas>

      <Title>Compose</Title>
      <Canvas style={styles.container}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <DashPathEffect intervals={[10, 10]}>
            <DiscretePathEffect length={10} deviation={10} />
          </DashPathEffect>
        </Paint>
        <Logo />
      </Canvas>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
  },
});
