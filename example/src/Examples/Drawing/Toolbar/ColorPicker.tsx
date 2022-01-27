import {
  Canvas,
  canvas2Polar,
  Circle,
  LinearGradient,
  Paint,
  RoundedRect,
  Shader,
  ShaderLib,
  Skia,
  useTouchHandler,
  vec,
} from "@shopify/react-native-skia";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { polar2Color } from "../../Hue/Helpers";
import { useDrawContext, useUxContext } from "../Context";

import type { BaseToolbarProps } from "./BaseToolbar";
import { BaseToolbar } from "./BaseToolbar";

type Props = BaseToolbarProps;

export const PickerHeight = 200;
const DarkGrayWidth = 30;

const source = Skia.RuntimeEffect.Make(`
uniform float2 c;
uniform float r;

${ShaderLib.Math}
${ShaderLib.Colors}

half4 main(vec2 uv) { 
  float mag = distance(uv, c);
  float theta = normalizeRad(canvas2Polar(uv, c).x);
  return hsv2rgb(vec3(theta/TAU, mag/r, 1.0));
}`)!;

export const ColorPicker: React.FC<Props> = ({ style, mode }) => {
  const uxContext = useUxContext();

  const [visible, setVisible] = useState(uxContext.state.menu === "color");

  useEffect(
    () =>
      uxContext.addListener((state) => {
        setVisible(state.menu === "color");
      }),
    [uxContext]
  );

  const drawContext = useDrawContext();

  const center = useMemo(() => vec(PickerHeight / 2, PickerHeight / 2), []);
  const r = useMemo(() => PickerHeight / 2, []);

  const colorWheelTouchHandler = useTouchHandler({
    onActive: (pt) => {
      const { theta, radius } = canvas2Polar(pt, center);
      drawContext.commands.setColor(polar2Color(theta, Math.min(radius, r), r));
    },
  });

  const darkGrayTouchHandler = useTouchHandler({
    onActive: (pt) => {
      // calculate percent of pt.y where PickerHeight is 100%
      const gray = (pt.y / PickerHeight) * 0xcc;
      drawContext.commands.setColor(
        Skia.Color(`rgba(${gray},${gray},${gray}, 1.0)`)
      );
    },
  });

  return visible ? (
    <BaseToolbar style={style} mode={mode}>
      {/** Black - Gray */}
      <Canvas style={styles.darkToGray} onTouch={darkGrayTouchHandler}>
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, PickerHeight)}
            colors={["#000000", "#CCCCCC"]}
          />
        </Paint>
        <RoundedRect
          x={0}
          y={0}
          width={DarkGrayWidth}
          height={PickerHeight}
          rx={4}
          ry={4}
        />
      </Canvas>
      <View style={{ width: 24 }} />
      {/** Color wheel */}
      <Canvas style={styles.colorWheel} onTouch={colorWheelTouchHandler}>
        <Paint>
          <Shader source={source} uniforms={{ c: center, r }} />
        </Paint>
        <Circle cx={center.x} cy={center.y} r={r} />
      </Canvas>
    </BaseToolbar>
  ) : null;
};

const styles = StyleSheet.create({
  darkToGray: {
    width: DarkGrayWidth,
    height: PickerHeight,
  },
  colorWheel: {
    width: "100%",
    height: PickerHeight,
  },
});
