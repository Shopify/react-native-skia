import { Rect } from "@shopify/react-native-skia";
import type { DrawingContext } from "@shopify/react-native-skia/src/renderer/DrawingContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const Size = 20;
export const Padding = 10;

export const AnimationElement: React.FC<{
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

export const AnimationDemo: React.FC<{ title: string }> = ({
  title,
  children,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: Padding / 2,
  },
  text: {
    fontWeight: "bold",
    marginBottom: 8,
  },
});
